const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Launching Edge for comprehensive Light & Dark mobile journey capture...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const profileDir = `C:\\Users\\Public\\edge-capture-unified-${Date.now()}`;
  const port = 9228;

  const edge = spawn(edgePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=430,932',
    `--user-data-dir=${profileDir}`,
    'http://localhost:8081/?t=' + Date.now(),
  ]);

  await sleep(3500);

  try {
    const listRes = await fetch(`http://localhost:${port}/json`);
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('8081')) || tabs[0];
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    await new Promise(r => { ws.onopen = r; });

    let msgId = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      const timer = setTimeout(() => {
        ws.removeEventListener('message', handler);
        reject(new Error(`Timeout waiting for response to ${method}`));
      }, 15000);

      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          clearTimeout(timer);
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

    // Auto-dismiss dialogs
    await send('Page.enable');
    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.method === 'Page.javascriptDialogOpening') {
          ws.send(JSON.stringify({
            id: msgId++,
            method: 'Page.handleJavaScriptDialog',
            params: { accept: true },
          }));
        }
      } catch {}
    });

    await send('Runtime.evaluate', {
      expression: 'window.alert = function(){}; window.confirm = function(){ return true; };',
    });

    // Mobile device emulation (iPhone 14/15: 393 x 852, scale 2)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 393,
      height: 852,
      deviceScaleFactor: 2,
      mobile: true,
    });

    console.log('Emulation configured: iPhone 14/15 @ 393x852');
    await sleep(1500);

    const capture = async (name) => {
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(OUTPUT_DIR, `${name}.png`);
      fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
      console.log(`✓ Captured ${name} -> ${filePath}`);
    };

    const clickCenter = async (coords) => {
      if (!coords) return false;
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: coords.x, y: coords.y });
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: coords.x, y: coords.y, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: coords.x, y: coords.y, button: 'left', clickCount: 1 });
      return true;
    };

    const evalClick = async (fnString) => {
      const res = await send('Runtime.evaluate', {
        expression: `(${fnString})()`,
        returnByValue: true,
      });
      if (res && res.result && res.result.value) {
        await clickCenter(res.result.value);
        return true;
      }
      return false;
    };

    const setTheme = async (mode) => {
      console.log(`\n>>> Switching theme to: ${mode.toUpperCase()} <<<`);
      await send('Runtime.evaluate', {
        expression: `(() => {
          window.localStorage.setItem('ecoloop_theme_mode_preference', '${mode}');
        })()`,
      });
      // Click header appearance toggle or reload if needed
      await evalClick(`() => {
        const btn = document.querySelector('[aria-label*="Appearance mode"]');
        if (btn) {
          const r = btn.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        return null;
      }`);
      await sleep(1000);
    };

    // ==========================================
    // 1. CAPTURE LIGHT MODE SUITE
    // ==========================================
    console.log('\n--- CAPTURING LIGHT MODE SUITE ---');
    // Ensure light mode is active
    await send('Runtime.evaluate', {
      expression: `(() => {
        window.localStorage.setItem('ecoloop_theme_mode_preference', 'light');
      })()`,
    });
    // Check if currently dark, if so click toggle
    await send('Runtime.evaluate', {
      expression: `(() => {
        const isDark = document.body.style.backgroundColor === 'rgb(0, 0, 0)' ||
                       document.querySelector('[data-theme="dark"]') !== null;
      })()`,
    });
    // Reload once to start cleanly in light mode from storage
    await send('Page.reload');
    await sleep(2500);

    // Light Home Top
    await capture('light_01_home_screen_top');

    // Light Home Scrolled
    await send('Runtime.evaluate', {
      expression: `(() => {
        const divs = Array.from(document.querySelectorAll('div')).filter(d => {
          const s = window.getComputedStyle(d);
          return s.overflowY === 'auto' || s.overflowY === 'scroll';
        });
        if (divs.length > 0) divs[0].scrollTop = 440;
      })()`,
    });
    await sleep(700);
    await capture('light_02_home_screen_scrolled');

    // Reset scroll
    await send('Runtime.evaluate', {
      expression: `(() => {
        const divs = Array.from(document.querySelectorAll('div')).filter(d => {
          const s = window.getComputedStyle(d);
          return s.overflowY === 'auto' || s.overflowY === 'scroll';
        });
        if (divs.length > 0) divs[0].scrollTop = 0;
      })()`,
    });
    await sleep(400);

    // Light Action Detail Sheet (Repair)
    console.log('Opening Light Action Detail Sheet...');
    await evalClick(`() => {
      const el = document.querySelector('[aria-label*="Repair:"]') ||
                 Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Repair');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);
    await capture('light_03_action_detail_sheet');

    // Close action detail sheet
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Close action details"]') ||
                 Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Close');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(700);

    // Light Explore Tab
    console.log('Navigating to Explore tab in Light mode...');
    await evalClick(`() => {
      const tabs = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Explore');
      const el = tabs[tabs.length - 1];
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);
    await capture('light_04_explore_marketplace');

    // Light Filter Modal
    console.log('Opening Explore filter modal in Light mode...');
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Open filters"]');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);
    await capture('light_05_explore_filter_modal');

    // Close Filter Modal
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Close filters modal"]') ||
                 Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Apply');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(700);

    // Light Device Detail Modal
    console.log('Opening Device Detail Modal in Light mode...');
    await evalClick(`() => {
      const card = Array.from(document.querySelectorAll('[role="button"]')).find(e => e.innerText && e.innerText.includes('Sony WH-1000XM4'));
      if (card) {
        const r = card.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(900);
    await capture('light_06_explore_detail_modal');

    // Close Device Detail Modal
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Close device details"]');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return { x: 200, y: 50 };
    }`);
    await sleep(700);

    // Light Post Journey Step 1: Photos
    console.log('Opening Post Modal in Light mode...');
    await evalClick(`() => {
      const postBtn = document.querySelector('[aria-label="Post a device"]');
      if (postBtn) {
        const r = postBtn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);
    await capture('light_07_post_step1_photos');

    // Load sample hardware photos
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Use sample device images"]') ||
                 Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Load Sample Hardware Images (Simulator)');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);
    await capture('light_08_post_step1_photos_loaded');

    // Advance to Step 2
    console.log('Advancing to Step 2 in Light mode...');
    await evalClick(`() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Next: Device Information');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);

    // Fill Step 2 inputs
    await send('Runtime.evaluate', {
      expression: `(() => {
        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        const setValue = (input, val) => {
          const setter = Object.getOwnPropertyDescriptor(input.__proto__, 'value')?.set ||
                         Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (setter) setter.call(input, val);
          else input.value = val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        };

        for (const input of inputs) {
          const ph = (input.placeholder || '').toLowerCase();
          if (ph.includes('iphone')) {
            setValue(input, 'Google Pixel 8 Pro 256GB Obsidian');
          } else if (ph.includes('apple')) {
            setValue(input, 'Google');
          } else if (ph.includes('a2638')) {
            setValue(input, 'G1MNW (2023)');
          }
        }
      })()`,
    });
    await sleep(600);
    await capture('light_09_post_step2_info');

    // Advance to Step 3: Pathway
    console.log('Advancing to Step 3 in Light mode...');
    await evalClick(`() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Next: Select Intended Action');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);

    // Set price for sell action
    await send('Runtime.evaluate', {
      expression: `(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const priceInput = inputs.find(i => (i.placeholder || '').includes('350'));
        if (priceInput) {
          const setter = Object.getOwnPropertyDescriptor(priceInput.__proto__, 'value')?.set ||
                         Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (setter) setter.call(priceInput, '520');
          else priceInput.value = '520';
          priceInput.dispatchEvent(new Event('input', { bubbles: true }));
          priceInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()`,
    });
    await sleep(600);
    await capture('light_10_post_step3_action_sell');

    // Advance to Step 4: Review
    console.log('Advancing to Step 4 in Light mode...');
    await evalClick(`() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Next: Review Listing');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);

    // Toggle accuracy checkbox
    await send('Runtime.evaluate', {
      expression: `(() => {
        const switches = Array.from(document.querySelectorAll('input[type="checkbox"], [role="switch"]'));
        const el = switches[switches.length - 1];
        if (el) {
          el.click();
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()`,
    });
    await sleep(600);
    await capture('light_11_post_step4_review');

    // Submit post
    console.log('Submitting post in Light mode...');
    await evalClick(`() => {
      const btn = Array.from(document.querySelectorAll('[role="button"]')).find(e => e.innerText && e.innerText.includes('Confirm & Post'));
      if (btn) {
        btn.click();
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(2200);
    await capture('light_12_post_step5_success');

    // Finish and return
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('[role="button"]')).find(e => e.innerText && e.innerText.includes('Done & Return Home'));
        if (btn) btn.click();
      })()`,
    });
    await sleep(1000);

    // Profile & Appearance Settings in Light Mode
    console.log('Navigating to Profile tab in Light mode...');
    await evalClick(`() => {
      const tabs = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Profile');
      const el = tabs[tabs.length - 1];
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);
    await capture('light_13_profile_appearance_settings');

    // ==========================================
    // 2. SWITCH TO DARK MODE & CAPTURE SUITE
    // ==========================================
    console.log('\n--- SWITCHING TO DARK MODE VIA PROFILE SETTINGS ---');
    // Click Dark option in Profile Screen
    await evalClick(`() => {
      const darkOption = document.querySelector('[aria-label*="Dark"]') ||
                         Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Dark');
      if (darkOption) {
        const r = darkOption.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1200);

    // Capture Profile & Appearance Settings in Dark Mode
    await capture('dark_13_profile_appearance_settings');

    // Navigate to Home tab in Dark Mode
    console.log('Navigating to Home tab in Dark mode...');
    await evalClick(`() => {
      const tabs = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Home');
      const el = tabs[tabs.length - 1];
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);
    await capture('dark_01_home_screen_top');

    // Dark Home Scrolled
    await send('Runtime.evaluate', {
      expression: `(() => {
        const divs = Array.from(document.querySelectorAll('div')).filter(d => {
          const s = window.getComputedStyle(d);
          return s.overflowY === 'auto' || s.overflowY === 'scroll';
        });
        if (divs.length > 0) divs[0].scrollTop = 440;
      })()`,
    });
    await sleep(700);
    await capture('dark_02_home_screen_scrolled');

    // Reset scroll
    await send('Runtime.evaluate', {
      expression: `(() => {
        const divs = Array.from(document.querySelectorAll('div')).filter(d => {
          const s = window.getComputedStyle(d);
          return s.overflowY === 'auto' || s.overflowY === 'scroll';
        });
        if (divs.length > 0) divs[0].scrollTop = 0;
      })()`,
    });
    await sleep(400);

    // Dark Action Detail Sheet
    console.log('Opening Dark Action Detail Sheet...');
    await evalClick(`() => {
      const el = document.querySelector('[aria-label*="Repair:"]') ||
                 Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Repair');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);
    await capture('dark_03_action_detail_sheet');

    // Close action detail sheet
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Close action details"]') ||
                 Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Close');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(700);

    // Dark Explore Tab
    console.log('Navigating to Explore tab in Dark mode...');
    await evalClick(`() => {
      const tabs = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Explore');
      const el = tabs[tabs.length - 1];
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);
    await capture('dark_04_explore_marketplace');

    // Dark Filter Modal
    console.log('Opening Explore filter modal in Dark mode...');
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Open filters"]');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);
    await capture('dark_05_explore_filter_modal');

    // Close Filter Modal
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Close filters modal"]') ||
                 Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Apply');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(700);

    // Dark Device Detail Modal
    console.log('Opening Device Detail Modal in Dark mode...');
    await evalClick(`() => {
      const card = Array.from(document.querySelectorAll('[role="button"]')).find(e => e.innerText && e.innerText.includes('Sony WH-1000XM4'));
      if (card) {
        const r = card.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(900);
    await capture('dark_06_explore_detail_modal');

    // Close Device Detail Modal
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Close device details"]');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return { x: 200, y: 50 };
    }`);
    await sleep(700);

    // Dark Post Modal Step 1
    console.log('Opening Post Modal in Dark mode...');
    await evalClick(`() => {
      const postBtn = document.querySelector('[aria-label="Post a device"]');
      if (postBtn) {
        const r = postBtn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);
    await capture('dark_07_post_step1_photos');

    // Load sample photos in Dark mode
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Use sample device images"]') ||
                 Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Load Sample Hardware Images (Simulator)');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);
    await capture('dark_08_post_step1_photos_loaded');

    // Advance to Step 2 in Dark mode
    console.log('Advancing to Step 2 in Dark mode...');
    await evalClick(`() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Next: Device Information');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);

    // Fill Step 2 inputs
    await send('Runtime.evaluate', {
      expression: `(() => {
        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        const setValue = (input, val) => {
          const setter = Object.getOwnPropertyDescriptor(input.__proto__, 'value')?.set ||
                         Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (setter) setter.call(input, val);
          else input.value = val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        };

        for (const input of inputs) {
          const ph = (input.placeholder || '').toLowerCase();
          if (ph.includes('iphone')) {
            setValue(input, 'Google Pixel 8 Pro 256GB Obsidian');
          } else if (ph.includes('apple')) {
            setValue(input, 'Google');
          } else if (ph.includes('a2638')) {
            setValue(input, 'G1MNW (2023)');
          }
        }
      })()`,
    });
    await sleep(600);
    await capture('dark_09_post_step2_info');

    // Advance to Step 3 in Dark mode
    console.log('Advancing to Step 3 in Dark mode...');
    await evalClick(`() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Next: Select Intended Action');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);

    // Set price for sell action
    await send('Runtime.evaluate', {
      expression: `(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const priceInput = inputs.find(i => (i.placeholder || '').includes('350'));
        if (priceInput) {
          const setter = Object.getOwnPropertyDescriptor(priceInput.__proto__, 'value')?.set ||
                         Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (setter) setter.call(priceInput, '520');
          else priceInput.value = '520';
          priceInput.dispatchEvent(new Event('input', { bubbles: true }));
          priceInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()`,
    });
    await sleep(600);
    await capture('dark_10_post_step3_action_sell');

    // Advance to Step 4 in Dark mode
    console.log('Advancing to Step 4 in Dark mode...');
    await evalClick(`() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Next: Review Listing');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);

    // Toggle accuracy checkbox
    await send('Runtime.evaluate', {
      expression: `(() => {
        const switches = Array.from(document.querySelectorAll('input[type="checkbox"], [role="switch"]'));
        const el = switches[switches.length - 1];
        if (el) {
          el.click();
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()`,
    });
    await sleep(600);
    await capture('dark_11_post_step4_review');

    // Submit post
    console.log('Submitting post in Dark mode...');
    await evalClick(`() => {
      const btn = Array.from(document.querySelectorAll('[role="button"]')).find(e => e.innerText && e.innerText.includes('Confirm & Post'));
      if (btn) {
        btn.click();
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(2200);
    await capture('dark_12_post_step5_success');

    console.log('\n======================================================');
    console.log('SUCCESS: All 26 paired mobile screens captured in Light & Dark modes!');
    console.log('======================================================\n');
    ws.close();
  } catch (err) {
    console.error('Error during capture workflow:', err);
  } finally {
    edge.kill();
    try {
      fs.rmSync(profileDir, { recursive: true, force: true });
    } catch {}
  }
}

main();

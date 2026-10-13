const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runSession(themeMode, prefix) {
  console.log(`\n======================================================`);
  console.log(`Starting journey capture for: ${themeMode.toUpperCase()} MODE`);
  console.log(`======================================================\n`);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const profileDir = `C:\\Users\\Public\\edge-capture-${themeMode}-${Date.now()}`;
  const port = 9227;

  const edge = spawn(edgePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=430,932',
    `--user-data-dir=${profileDir}`,
    'http://localhost:8081/?mode=' + themeMode,
  ]);

  await sleep(3500);

  try {
    const listRes = await fetch(`http://localhost:${port}/json`);
    const tabs = await listRes.json();
    const tab = tabs.find((t) => t.url.includes('8081')) || tabs[0];
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    await new Promise((r) => {
      ws.onopen = r;
    });

    let msgId = 1;
    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = msgId++;
        const timer = setTimeout(() => {
          ws.removeEventListener('message', handler);
          reject(new Error(`Timeout waiting for response to ${method}`));
        }, 12000);

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
          ws.send(
            JSON.stringify({
              id: msgId++,
              method: 'Page.handleJavaScriptDialog',
              params: { accept: true },
            })
          );
        }
      } catch {}
    });

    await send('Runtime.evaluate', {
      expression: 'window.alert = function(){}; window.confirm = function(){ return true; };',
    });

    // Set mobile device emulation (iPhone 14/15: 393 x 852, scale 2)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 393,
      height: 852,
      deviceScaleFactor: 2,
      mobile: true,
    });

    // Force theme mode in localStorage and reload once to verify cold start persistence
    console.log(`Setting persistent theme to: ${themeMode}...`);
    await send('Runtime.evaluate', {
      expression: `window.localStorage.setItem('ecoloop_theme_mode_preference', '${themeMode}');`,
    });
    await send('Page.reload');
    await sleep(2500);

    const capture = async (name) => {
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(OUTPUT_DIR, `${name}.png`);
      fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
      console.log(`✓ [${themeMode.toUpperCase()}] Captured ${name} -> ${filePath}`);
    };

    const clickCenter = async (coords) => {
      if (!coords) return false;
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: coords.x, y: coords.y });
      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: coords.x,
        y: coords.y,
        button: 'left',
        clickCount: 1,
      });
      await send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: coords.x,
        y: coords.y,
        button: 'left',
        clickCount: 1,
      });
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

    // 1. Home Top
    await capture(`${prefix}_01_home_screen_top`);

    // 2. Home Scrolled
    await send('Runtime.evaluate', {
      expression: `(() => {
        const divs = Array.from(document.querySelectorAll('div')).filter(d => {
          const s = window.getComputedStyle(d);
          return s.overflowY === 'auto' || s.overflowY === 'scroll';
        });
        if (divs.length > 0) divs[0].scrollTop = 420;
      })()`,
    });
    await sleep(600);
    await capture(`${prefix}_02_home_screen_scrolled`);

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

    // 3. Open Pathway Action Detail Sheet (Repair)
    console.log('Opening Action Detail Sheet (Repair)...');
    await evalClick(`() => {
      const el = document.querySelector('[aria-label*="Repair:"]') ||
                 Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Repair');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(900);
    await capture(`${prefix}_03_action_detail_sheet`);

    // Close action detail sheet
    await evalClick(`() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Close');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(600);

    // 4. Navigate to Explore Tab
    console.log('Navigating to Explore tab...');
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
    await capture(`${prefix}_04_explore_marketplace`);

    // 5. Open Explore Filter Modal
    console.log('Opening Explore filter modal...');
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Open filters"]');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);
    await capture(`${prefix}_05_explore_filter_modal`);

    // Close filter modal
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

    // 6. Open Device Detail Modal on first item
    console.log('Opening Device Detail Modal...');
    await evalClick(`() => {
      const card = Array.from(document.querySelectorAll('[role="button"]')).find(e => e.innerText && e.innerText.includes('Sony WH-1000XM4'));
      if (card) {
        const r = card.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);
    await capture(`${prefix}_06_explore_detail_modal`);

    // Close device detail modal
    await evalClick(`() => {
      const btns = Array.from(document.querySelectorAll('[role="button"]'));
      const closeBtn = btns.find(b => b.ariaLabel === 'Close' || (b.innerText && b.innerText.trim() === 'Close'));
      if (closeBtn) {
        const r = closeBtn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      // Click backdrop upper area
      return { x: 200, y: 50 };
    }`);
    await sleep(700);

    // 7. Open Post a Device Modal via + Post button
    console.log('Opening Post a Device modal...');
    await evalClick(`() => {
      const postBtn = document.querySelector('[aria-label="Post a device"]');
      if (postBtn) {
        const r = postBtn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);
    await capture(`${prefix}_07_post_step1_photos`);

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

    // Proceed to Step 2
    console.log('Advancing to Step 2: Information...');
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
    await capture(`${prefix}_08_post_step2_info`);

    // Proceed to Step 3: Action Pathway
    console.log('Advancing to Step 3: Pathway...');
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
    await capture(`${prefix}_09_post_step3_action_sell`);

    // Proceed to Step 4: Review
    console.log('Advancing to Step 4: Review...');
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
    await capture(`${prefix}_10_post_step4_review`);

    // Submit device
    console.log('Submitting post...');
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
    await capture(`${prefix}_11_post_step5_success`);

    // Dismiss success and navigate to Profile / Appearance tab
    console.log('Navigating to Profile tab for Appearance Settings capture...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('[role="button"]')).find(e => e.innerText && e.innerText.includes('Done & Return Home'));
        if (btn) btn.click();
      })()`,
    });
    await sleep(1000);

    // Tap Profile tab
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
    await capture(`${prefix}_12_profile_appearance_settings`);

    console.log(`✓ [${themeMode.toUpperCase()}] All 12 journey screenshots successfully captured!`);
    ws.close();
  } catch (err) {
    console.error(`Error during capture for ${themeMode}:`, err);
  } finally {
    edge.kill();
    try {
      fs.rmSync(profileDir, { recursive: true, force: true });
    } catch {}
  }
}

async function main() {
  // Capture Light Mode first
  await runSession('light', 'light');

  await sleep(1500);

  // Capture Dark Mode second
  await runSession('dark', 'dark');

  console.log('\n======================================================');
  console.log('COMPLETED: Both Light Mode and Dark Mode suites captured!');
  console.log('======================================================\n');
}

main();

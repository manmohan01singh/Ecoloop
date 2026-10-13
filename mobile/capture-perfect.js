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

async function captureMode(mode) {
  console.log(`\n======================================================`);
  console.log(`Starting clean capture for: ${mode.toUpperCase()} MODE`);
  console.log(`======================================================\n`);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const profileDir = `C:\\Users\\Public\\edge-capture-${mode}-${Date.now()}`;
  const port = 9229;

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

    // Mobile device emulation (iPhone 14/15: 393 x 852, scale 2)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 393,
      height: 852,
      deviceScaleFactor: 2,
      mobile: true,
    });

    // Set theme mode in localStorage and reload once
    console.log(`Setting localStorage theme to: ${mode}...`);
    await send('Runtime.evaluate', {
      expression: `window.localStorage.setItem('ecoloop_theme_mode_preference', '${mode}');`,
    });
    await send('Page.reload');
    await sleep(2500);

    // Ensure app is mounted
    await send('Runtime.evaluate', {
      expression: `new Promise((res) => {
        const t = () => document.body.innerText.includes('Give your devices') ? res(true) : setTimeout(t, 100);
        t();
      })`,
      awaitPromise: true,
    });
    await sleep(500);

    const capture = async (name) => {
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(OUTPUT_DIR, `${name}.png`);
      fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
      console.log(`✓ [${mode.toUpperCase()}] Captured ${name} -> ${filePath}`);
    };

    const domClick = async (fnString) => {
      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          let target = (${fnString})();
          if (target) {
            if (target.tagName !== 'BUTTON' && target.closest) {
              const b = target.closest('button, [role="button"]');
              if (b) target = b;
            }
            const opts = { bubbles: true, cancelable: true, view: window };
            target.dispatchEvent(new PointerEvent('pointerdown', opts));
            target.dispatchEvent(new MouseEvent('mousedown', opts));
            target.dispatchEvent(new PointerEvent('pointerup', opts));
            target.dispatchEvent(new MouseEvent('mouseup', opts));
            if (target.click) target.click();
            return true;
          }
          return false;
        })()`,
        returnByValue: true,
      });
      return res && res.result && res.result.value;
    };

    // 1. Home Screen Top
    await capture(`${mode}_01_home_screen_top`);

    // 2. Home Screen Scrolled
    await send('Runtime.evaluate', {
      expression: `(() => {
        const divs = Array.from(document.querySelectorAll('div')).filter(d => {
          const s = window.getComputedStyle(d);
          return s.overflowY === 'auto' || s.overflowY === 'scroll';
        });
        if (divs.length > 0) divs[0].scrollTop = 440;
      })()`,
    });
    await sleep(600);
    await capture(`${mode}_02_home_screen_scrolled`);

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

    // 3. Action Detail Sheet (Repair)
    console.log('Opening Action Detail Sheet (Repair)...');
    await domClick(`() => {
      return document.querySelector('[aria-label*="Repair:"]') ||
             Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Repair');
    }`);
    await sleep(1000);
    await capture(`${mode}_03_action_detail_sheet`);

    // Close Action Detail Sheet
    await domClick(`() => {
      return document.querySelector('[aria-label="Close action details"]') ||
             Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Close');
    }`);
    await sleep(800);

    // 4. Explore Tab
    console.log('Navigating to Explore tab...');
    await domClick(`() => {
      const tabs = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Explore');
      return tabs[tabs.length - 1];
    }`);
    await sleep(1000);
    await capture(`${mode}_04_explore_marketplace`);

    // 5. Explore Filter Modal
    console.log('Opening Explore filter modal...');
    await domClick(`() => document.querySelector('[aria-label="Open filters"]')`);
    await sleep(900);
    await capture(`${mode}_05_explore_filter_modal`);

    // Close Explore Filter Modal
    await domClick(`() => {
      return document.querySelector('[aria-label="Close filters modal"]') ||
             Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Apply');
    }`);
    await sleep(800);

    // 6. Device Detail Modal
    console.log('Opening Device Detail Modal...');
    await domClick(`() => {
      return Array.from(document.querySelectorAll('[role="button"]')).find(e => e.innerText && e.innerText.includes('Sony WH-1000XM4'));
    }`);
    await sleep(1000);
    await capture(`${mode}_06_explore_detail_modal`);

    // Close Device Detail Modal
    await domClick(`() => document.querySelector('[aria-label="Close device details"]')`);
    await sleep(800);

    // 7. Post a Device Modal - Step 1
    console.log('Opening Post a Device modal...');
    await domClick(`() => {
      return document.querySelector('[aria-label="Post a device"]') ||
             Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Post');
    }`);
    await sleep(1000);
    await capture(`${mode}_07_post_step1_photos`);

    // Load sample hardware photos in Step 1
    console.log('Loading sample hardware photos...');
    await domClick(`() => {
      return document.querySelector('[aria-label="Use sample device images"]') ||
             Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('Load Sample Hardware Images'));
    }`);
    await sleep(1000);
    await capture(`${mode}_08_post_step1_photos_loaded`);

    // Advance to Step 2: Information
    console.log('Advancing to Step 2: Information...');
    await domClick(`() => {
      return Array.from(document.querySelectorAll('button, [role="button"]')).find(e => e.innerText && e.innerText.includes('Next: Device Information'));
    }`);
    await sleep(1000);

    // Fill Step 2 inputs
    console.log('Filling Step 2 form...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        const setValue = (input, val) => {
          const proto = input instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
          if (setter) setter.call(input, val);
          else input.value = val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        };

        for (const input of inputs) {
          const ph = (input.placeholder || '').toLowerCase();
          if (ph.includes('iphone') || ph.includes('title')) {
            setValue(input, 'Google Pixel 8 Pro 256GB Obsidian');
          } else if (ph.includes('apple') || ph.includes('dell')) {
            setValue(input, 'Google');
          } else if (ph.includes('a2638')) {
            setValue(input, 'G1MNW (2023)');
          } else if (ph.includes('battery')) {
            setValue(input, 'Flawless condition, original charger, 98% battery health.');
          } else if (ph.includes('vancouver')) {
            setValue(input, 'Vancouver, BC');
          }
        }
      })()`,
    });
    await sleep(600);
    await capture(`${mode}_09_post_step2_info`);

    // Advance to Step 3: Pathway
    console.log('Advancing to Step 3: Pathway...');
    await domClick(`() => {
      return Array.from(document.querySelectorAll('button, [role="button"]')).find(e => e.innerText && e.innerText.includes('Next: Select Intended Action'));
    }`);
    await sleep(1000);

    // Set price for Sell pathway
    await send('Runtime.evaluate', {
      expression: `(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const setValue = (input, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (setter) setter.call(input, val);
          else input.value = val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        };
        for (const input of inputs) {
          if ((input.placeholder || '').includes('350') || input.type === 'number') {
            setValue(input, '520');
          }
        }
      })()`,
    });
    await sleep(600);
    await capture(`${mode}_10_post_step3_action_sell`);

    // Advance to Step 4: Review
    console.log('Advancing to Step 4: Review...');
    await domClick(`() => {
      return Array.from(document.querySelectorAll('button, [role="button"]')).find(e => e.innerText && e.innerText.includes('Next: Review Listing'));
    }`);
    await sleep(1000);

    // Toggle accuracy checkbox
    console.log('Confirming accuracy checkbox...');
    await domClick(`() => {
      return document.querySelector('input[type="checkbox"]') ||
             document.querySelector('[role="checkbox"]') ||
             Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('I confirm that this device belongs to me'));
    }`);
    await sleep(600);
    await capture(`${mode}_11_post_step4_review`);

    // Submit post
    console.log('Submitting post...');
    await domClick(`() => {
      return Array.from(document.querySelectorAll('button, [role="button"]')).find(e => e.innerText && e.innerText.includes('Confirm & Post'));
    }`);
    await sleep(2500);
    await capture(`${mode}_12_post_step5_success`);

    // Dismiss success modal and return home
    console.log('Dismissing success modal...');
    await domClick(`() => {
      return Array.from(document.querySelectorAll('button, [role="button"]')).find(e => e.innerText && e.innerText.includes('Done & Return Home'));
    }`);
    await sleep(1000);

    // 8. Profile & Appearance Settings Tab
    console.log('Navigating to Profile & Appearance Settings tab...');
    await domClick(`() => {
      return Array.from(document.querySelectorAll('button, [role="button"], [role="tab"]')).find(e => e.innerText && e.innerText.includes('Profile'));
    }`);
    await sleep(1200);
    await capture(`${mode}_13_profile_appearance_settings`);

    console.log(`\n✓ Completed all 13 screens for ${mode.toUpperCase()} mode!`);
    ws.close();
  } catch (err) {
    console.error(`Error in ${mode} session:`, err);
  } finally {
    edge.kill();
    try {
      fs.rmSync(profileDir, { recursive: true, force: true });
    } catch {}
  }
}

async function main() {
  await captureMode('light');
  await sleep(2000);
  await captureMode('dark');
  console.log('\n======================================================');
  console.log('ALL LIGHT & DARK SCREENSHOTS SUCCESSFULLY CAPTURED!');
  console.log('======================================================\n');
}

main();

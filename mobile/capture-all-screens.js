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
  console.log('Launching Edge for full application journey capture...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9226',
    '--window-size=430,932',
    '--user-data-dir=C:\\Users\\Public\\edge-capture-profile-v3',
    'http://localhost:8081/?t=' + Date.now()
  ]);

  await sleep(3500);

  try {
    const listRes = await fetch('http://localhost:9226/json');
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
      }, 10000);

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

    // Auto-dismiss all JavaScript dialogs so alerts never freeze execution
    await send('Page.enable');
    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.method === 'Page.javascriptDialogOpening') {
          console.log('Auto-accepting dialog:', data.params.message);
          ws.send(JSON.stringify({
            id: msgId++,
            method: 'Page.handleJavaScriptDialog',
            params: { accept: true }
          }));
        }
      } catch {}
    });

    // Disable blocking window.alert
    await send('Runtime.evaluate', {
      expression: 'window.alert = function(){}; window.confirm = function(){ return true; };'
    });

    // Set mobile device emulation (iPhone 14/15: 393 x 852, scale 2)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 393,
      height: 852,
      deviceScaleFactor: 2,
      mobile: true,
    });

    console.log('Emulation set to 393x852 mobile.');
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
        returnByValue: true
      });
      if (res && res.result && res.result.value) {
        await clickCenter(res.result.value);
        return true;
      }
      return false;
    };

    // 1. Home screen top
    await capture('01_home_screen_top');

    // 2. Home screen scrolled down
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: 380, behavior: 'instant' }); document.querySelector('div[style*="overflow"]')?.scrollBy(0, 380);`
    });
    await sleep(600);
    await capture('02_home_screen_scrolled');

    // Reset scroll
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: 0, behavior: 'instant' }); document.querySelector('div[style*="overflow"]')?.scrollTo(0, 0);`
    });
    await sleep(400);

    // 3. Navigate to Explore Tab
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
    await sleep(1200);
    await capture('03_explore_marketplace');

    // 4. Open Explore Filter Modal
    console.log('Opening Explore filter modal...');
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Open filters"]');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);
    await capture('04_explore_filter_modal');

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
    await sleep(800);

    // 5. Open Post a Device modal (via + Post tab button)
    console.log('Opening Post a Device modal...');
    await evalClick(`() => {
      const postBtn = document.querySelector('[aria-label="Post a device"]');
      if (postBtn) {
        const r = postBtn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      const tabs = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Post');
      const el = tabs[tabs.length - 1];
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1200);
    await capture('05_post_step1_photos');

    // 6. Click "Load Sample Hardware Images (Simulator)"
    console.log('Loading sample photos in Step 1...');
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Use sample device images"]') ||
                 Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Load Sample Hardware Images (Simulator)');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);
    await capture('06_post_step1_photos_loaded');

    // Proceed to Step 2: Device Information
    console.log('Advancing to Step 2: Device Information...');
    await evalClick(`() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Next: Device Information');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);

    // Fill Step 2 fields (Title, Brand, Model)
    console.log('Filling Step 2 form fields...');
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
      })()`
    });
    await sleep(600);
    await capture('07_post_step2_device_info');

    // Advance to Step 3: Circular Pathway
    console.log('Advancing to Step 3: Circular Pathway...');
    await evalClick(`() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Next: Select Intended Action');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);

    // Step 3 with Sell action: set price
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
      })()`
    });
    await sleep(600);
    await capture('08_post_step3_action_sell');

    // Switch to Repair pathway to demonstrate action-specific forms
    console.log('Switching to Repair pathway...');
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Repair"]') ||
                 Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Repair');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);

    // Set repair symptom details
    await send('Runtime.evaluate', {
      expression: `(() => {
        const inputs = Array.from(document.querySelectorAll('textarea, input'));
        const symptom = inputs.find(i => (i.placeholder || '').toLowerCase().includes('symptoms'));
        if (symptom) {
          const setter = Object.getOwnPropertyDescriptor(symptom.__proto__, 'value')?.set ||
                         Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
          if (setter) setter.call(symptom, 'Touch digitizer unresponsive on lower third after 2-foot drop. OLED display intact.');
          else symptom.value = 'Touch digitizer unresponsive on lower third after 2-foot drop. OLED display intact.';
          symptom.dispatchEvent(new Event('input', { bubbles: true }));
          symptom.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()`
    });
    await sleep(600);
    await capture('09_post_step3_action_repair');

    // Switch to Recycle pathway to demonstrate e-waste forms
    console.log('Switching to Recycle pathway...');
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Recycle"]') ||
                 Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Recycle');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);
    await capture('10_post_step3_action_recycle');

    // Switch back to Sell for submission
    console.log('Switching back to Sell pathway for marketplace submission...');
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Sell"]') ||
                 Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Sell');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);

    // Advance to Step 4: Review
    console.log('Advancing to Step 4: Review...');
    await evalClick(`() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Next: Review Listing');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);
    await capture('11_post_step4_review');

    // Toggle confirm ownership & accuracy switch
    console.log('Toggling accuracy confirmation...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const switches = Array.from(document.querySelectorAll('input[type="checkbox"], [role="switch"]'));
        const el = switches[switches.length - 1];
        if (el) {
          el.click();
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()`
    });
    await sleep(800);

    // Submit device
    console.log('Submitting posting...');
    await evalClick(`() => {
      const btn = Array.from(document.querySelectorAll('[role="button"]')).find(e => e.innerText && e.innerText.includes('Confirm & Post'));
      if (btn) {
        btn.click();
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(2500);
    await capture('12_post_step5_success');

    // Click "View in Explore Marketplace"
    console.log('Finishing posting and navigating to Explore...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('[role="button"]')).find(e => e.innerText && e.innerText.includes('View in Explore'));
        if (btn) btn.click();
      })()`
    });
    await sleep(1500);
    await capture('13_explore_with_newly_posted_device');

    // Tap first device card to inspect Device Detail Modal
    console.log('Opening device detail modal...');
    await evalClick(`() => {
      const card = Array.from(document.querySelectorAll('[role="button"]')).find(e => e.innerText && e.innerText.includes('Sony WH-1000XM4'));
      if (card) {
        card.click();
        const r = card.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1000);
    await capture('14_explore_device_detail_modal');

    console.log('All 13 screens successfully captured and saved to mobile/screenshots/ !');
    ws.close();
  } catch (err) {
    console.error('Error during capture workflow:', err);
  } finally {
    edge.kill();
  }
}

main();

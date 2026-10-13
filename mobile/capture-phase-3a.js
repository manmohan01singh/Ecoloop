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
  console.log(`Starting Phase 3A journey capture for: ${themeMode.toUpperCase()} MODE`);
  console.log(`======================================================\n`);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const profileDir = `C:\\Users\\Public\\edge-capture-p3a-${themeMode}-${Date.now()}`;
  const port = themeMode === 'light' ? 9230 : 9231;

  const edge = spawn(edgePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=430,932',
    `--user-data-dir=${profileDir}`,
    'http://localhost:8081',
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

    await send('Page.enable');
    await send('Runtime.evaluate', {
      expression: 'window.alert = function(){}; window.confirm = function(){ return true; };',
    });

    // iPhone 15 Pro resolution: 393 x 852 @ 2x
    await send('Emulation.setDeviceMetricsOverride', {
      width: 393,
      height: 852,
      deviceScaleFactor: 2,
      mobile: true,
    });

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

    const capture = async (filename) => {
      await sleep(1000);
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(OUTPUT_DIR, filename + '.png');
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
      console.log(`Saved screenshot: ${filename}.png`);
    };

    // Prepopulate storage with verified profile and real activity events
    await send('Runtime.evaluate', {
      expression: `
        window.localStorage.setItem('ecoloop_theme_mode_preference', '${themeMode}');
        window.localStorage.setItem('ecoloop_auth_session_v1', JSON.stringify({
          user: { id: 'usr-pioneer-1', email: 'pioneer@ecoloop.org' },
          profile: {
            id: 'usr-pioneer-1',
            email: 'pioneer@ecoloop.org',
            displayName: 'EcoLoop Pioneer',
            username: 'ecopioneer',
            city: 'Metro Vancouver',
            role: 'member',
            karmaPoints: 150,
            co2DivertedKg: 110,
            preferences: { notifications: true, theme: '${themeMode}', emailAlerts: false },
            createdAt: '2026-10-01T00:00:00.000Z',
            updatedAt: new Date().toISOString(),
          }
        }));
        window.localStorage.setItem('ecoloop_activity_events_v1', JSON.stringify([
          {
            id: 'act-01',
            recipientId: 'usr-pioneer-1',
            eventType: 'listing_created',
            entityType: 'device_listing',
            title: 'MacBook Air M2 Listed',
            description: 'Your hardware is active in Explore for circular resale. +50 EcoKarma awarded.',
            metadata: { co2SavedKg: 195 },
            readAt: null,
            createdAt: new Date().toISOString()
          },
          {
            id: 'act-02',
            recipientId: 'usr-pioneer-1',
            eventType: 'account_created',
            entityType: 'profile',
            title: 'Welcome to EcoLoop!',
            description: 'Your circular electronic passport is active. 50 welcome EcoKarma points awarded.',
            metadata: {},
            readAt: new Date().toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
          }
        ]));
      `,
    });
    await send('Page.reload');
    await sleep(2500);

    // 1. Home Screen with Selective Glow on Post Tab Button
    await capture(`${prefix}_01_home_screen`);

    // 2. Activity Tab
    console.log('Navigating to Activity tab...');
    await evalClick(`() => {
      const tabs = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Activity');
      const el = tabs[tabs.length - 1];
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1500);
    await capture(`${prefix}_02_activity_screen`);

    // 3. Profile Tab
    console.log('Navigating to Profile tab...');
    await evalClick(`() => {
      const tabs = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Profile');
      const el = tabs[tabs.length - 1];
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1500);
    await capture(`${prefix}_03_profile_screen`);

    // 4. Open Post a Device Flow & Reach Pathway Selection (Shows Selective Glow on selected pathway)
    console.log('Opening Post Device modal...');
    await evalClick(`() => {
      const el = document.querySelector('[aria-label="Post a device"]');
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1500);

    // Add photo in step 1
    await evalClick(`() => {
      const btn = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('Choose from Library'));
      if (btn) {
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);

    // Click Continue to Info
    await evalClick(`() => {
      const btn = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Continue to Device Info');
      if (btn) {
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(800);

    // Fill Title
    await send('Runtime.evaluate', {
      expression: `(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const titleInput = inputs.find(i => i.placeholder && i.placeholder.includes('MacBook Pro'));
        if (titleInput) {
          titleInput.value = 'Dell XPS 15 9520 OLED';
          titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()`,
    });
    await sleep(500);

    // Click Continue to Pathway
    await evalClick(`() => {
      const btn = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'Continue to Pathway');
      if (btn) {
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    }`);
    await sleep(1200);

    // Step 3: Pathway selection with selective glow
    await capture(`${prefix}_04_post_step3_pathway_glow`);

    console.log(`✓ [${themeMode.toUpperCase()}] Completed screenshots!`);
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
  await runSession('light', 'phase3a_light');
  await sleep(1500);
  await runSession('dark', 'phase3a_dark');
  console.log('\nAll Phase 3A screenshots captured successfully!\n');
}

main();

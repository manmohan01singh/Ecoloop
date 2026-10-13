import { test, describe } from 'node:test';
import assert from 'node:assert';
import { lightColors, darkColors } from '../../design-system/tokens/colors';
import { getCoreActions } from './hooks/useHomeData';

describe('Home Information Architecture & Pathways (Real Codebase)', () => {
  const lightActions = getCoreActions(lightColors);
  const darkActions = getCoreActions(darkColors);

  test('Exactly 4 core actions exist: Repair, Recycle, Sell, Buy', () => {
    assert.strictEqual(lightActions.length, 4);
    const actionIds = lightActions.map(a => a.id);
    assert.deepStrictEqual(actionIds, ['repair', 'recycle', 'sell', 'buy']);
  });

  test('Each action contains clear, unambiguous supporting copy directly from production code', () => {
    for (const action of lightActions) {
      assert.ok(action.title.length > 0, `Action ${action.id} must have a title`);
      assert.ok(action.description.length > 15, `Action ${action.id} must have meaningful description`);
      assert.ok(action.icon.length > 0, `Action ${action.id} must have an icon name`);
      assert.ok(action.tagline.length > 0, `Action ${action.id} must have a tagline`);
      assert.ok(action.tintColor.length > 0, `Action ${action.id} must have a tint color`);
      assert.ok(action.bgColor.length > 0, `Action ${action.id} must have a background color`);
      assert.ok(action.statsLabel.length > 0, `Action ${action.id} must have a stats label`);
    }
  });

  test('Core actions are balanced with distinct semantic icons communicating their intent', () => {
    const icons = lightActions.map(a => a.icon);
    const uniqueIcons = new Set(icons);
    assert.strictEqual(uniqueIcons.size, 4, 'Each action must feature a distinct semantic icon');

    // Expected icons: construct (repair), sync (recycle), pricetag (sell), bag-check (buy)
    const expectedIconMap: Record<string, string> = {
      repair: 'construct',
      recycle: 'sync',
      sell: 'pricetag',
      buy: 'bag-check',
    };
    for (const action of lightActions) {
      assert.strictEqual(action.icon, expectedIconMap[action.id]);
    }
  });

  test('Dark mode correctly updates tint and background tokens for all 4 pathways', () => {
    assert.strictEqual(darkActions.length, 4);
    for (let i = 0; i < 4; i++) {
      const light = lightActions[i];
      const dark = darkActions[i];
      assert.strictEqual(light.id, dark.id);
      assert.ok(dark.tintColor.length > 0, `Dark ${dark.id} must have tint`);
      assert.ok(dark.bgColor.length > 0, `Dark ${dark.id} must have background`);
      assert.notStrictEqual(light.bgColor, dark.bgColor, `Dark background must differ from light for ${dark.id}`);
    }
  });

  test('All 4 pathways have distinct Apple HIG tint colors in both light and dark modes', () => {
    const lightTints = new Set(lightActions.map(a => a.tintColor));
    assert.strictEqual(lightTints.size, 4, 'All 4 light pathways must have distinct tints');

    const darkTints = new Set(darkActions.map(a => a.tintColor));
    assert.strictEqual(darkTints.size, 4, 'All 4 dark pathways must have distinct tints');
  });

  test('RecentDevicesSection renders empty state gracefully when devices array is empty', () => {
    const { RecentDevicesSection } = require('./components/RecentDevicesSection');
    const React = require('react');
    const ReactDOMServer = require('react-dom/server');
    const { ThemeProvider } = require('../../design-system/theme/theme');

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(RecentDevicesSection, { devices: [] })
      )
    );

    assert.ok(html.includes('No Active Listings in This Area'), 'Must render empty state title');
    assert.ok(html.includes('CIRCULAR STREAM'), 'Must retain section header');
  });

  test('RecentDevicesSection renders device cards when devices array is populated', () => {
    const { RecentDevicesSection } = require('./components/RecentDevicesSection');
    const React = require('react');
    const ReactDOMServer = require('react-dom/server');
    const { ThemeProvider } = require('../../design-system/theme/theme');

    const sampleDevice = {
      id: 'test-1',
      title: 'iPhone 13 Pro',
      category: 'smartphone',
      action: 'sell',
      actionLabel: 'For Resale',
      condition: 'good',
      conditionLabel: 'Good (88% Battery)',
      price: 430,
      distanceKm: 2.4,
      city: 'Vancouver',
      imageUrl: 'https://example.com/phone.jpg',
      co2SavedKg: 68,
    };

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(RecentDevicesSection, { devices: [sampleDevice] })
      )
    );

    assert.ok(html.includes('iPhone 13 Pro'), 'Must render device title');
    assert.ok(html.includes('$430'), 'Must render device price');
    assert.ok(html.includes('68kg CO'), 'Must render carbon diversion');
  });

  test('CommunityActivitySection renders empty state when hubs array is empty', () => {
    const { CommunityActivitySection } = require('./components/CommunityActivitySection');
    const React = require('react');
    const ReactDOMServer = require('react-dom/server');
    const { ThemeProvider } = require('../../design-system/theme/theme');

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(CommunityActivitySection, { hubs: [], stats: [] })
      )
    );

    assert.ok(html.includes('Expanding Verified Hubs'), 'Must render empty hub title');
  });

  test('CoreActions component renders all 4 circular cards with Apple touch cards', () => {
    const { CoreActions } = require('./components/CoreActions');
    const React = require('react');
    const ReactDOMServer = require('react-dom/server');
    const { ThemeProvider } = require('../../design-system/theme/theme');

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(CoreActions, {
          actions: lightActions,
          onActionPress: () => {},
        })
      )
    );

    assert.ok(html.includes('Repair'), 'Must render Repair');
    assert.ok(html.includes('Recycle'), 'Must render Recycle');
    assert.ok(html.includes('Sell'), 'Must render Sell');
    assert.ok(html.includes('Buy'), 'Must render Buy');
    assert.ok(html.includes('CORE PATHWAYS'), 'Must render section header');
  });

  test('PostDeviceBanner renders prominent creation action without nested touchables', () => {
    const { PostDeviceBanner } = require('./components/PostDeviceBanner');
    const React = require('react');
    const ReactDOMServer = require('react-dom/server');
    const { ThemeProvider } = require('../../design-system/theme/theme');

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(PostDeviceBanner, {
          onPostPress: () => {},
        })
      )
    );

    assert.ok(html.includes('Post a Device'), 'Must render headline');
    assert.ok(html.includes('Have something to repair, sell, or recycle?'), 'Must render copy');
    assert.ok(html.includes('Snap') && html.includes('Classify'), 'Must render CTA label');
  });

  test('WelcomeSection renders Apple editorial header copy', () => {
    const { WelcomeSection } = require('./components/WelcomeSection');
    const React = require('react');
    const ReactDOMServer = require('react-dom/server');
    const { ThemeProvider } = require('../../design-system/theme/theme');

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(WelcomeSection, null)
      )
    );

    assert.ok(html.includes('Give your devices a second life.'), 'Must render primary heading');
    assert.ok(html.includes('Repair it.'), 'Must render repair supporting copy');
    assert.ok(html.includes('Resell it.'), 'Must render resell supporting copy');
    assert.ok(html.includes('Recycle it.'), 'Must render recycle supporting copy');
  });

  test('ActionDetailSheet renders active circular CTAs without placeholder text', () => {
    const { ActionDetailSheet } = require('./components/ActionDetailSheet');
    const React = require('react');
    const ReactDOMServer = require('react-dom/server');
    const { ThemeProvider } = require('../../design-system/theme/theme');

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(ActionDetailSheet, {
          action: lightActions[0], // repair
          visible: true,
          onClose: () => {},
          onSelectAction: () => {},
        })
      )
    );

    assert.ok(html.includes('Post a Device for Repair'), 'Must render active actionable CTA');
    assert.ok(!html.includes('Phase 2'), 'Must not contain any Phase 2 placeholder text');
    assert.ok(html.includes('Professional Diagnostics'), 'Must render headline');
  });
});

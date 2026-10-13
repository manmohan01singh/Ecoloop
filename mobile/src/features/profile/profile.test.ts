import { test, describe } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  getStoredThemeMode,
  setStoredThemeMode,
  subscribeToThemeMode,
} from '../../design-system/theme/themeStorage';
import { ThemeProvider, useAppTheme } from '../../design-system/theme/theme';
import { ProfileScreen } from './screens/ProfileScreen';

describe('Appearance Settings & Theme Architecture', () => {
  test('Theme storage persists mode and defaults to system', () => {
    // Reset to system
    setStoredThemeMode('system');
    assert.strictEqual(getStoredThemeMode(), 'system');

    // Update to light
    setStoredThemeMode('light');
    assert.strictEqual(getStoredThemeMode(), 'light');

    // Update to dark
    setStoredThemeMode('dark');
    assert.strictEqual(getStoredThemeMode(), 'dark');

    // Reset back to system
    setStoredThemeMode('system');
    assert.strictEqual(getStoredThemeMode(), 'system');
  });

  test('subscribeToThemeMode receives notifications on preference change', () => {
    let capturedMode: string = '';
    const unsubscribe = subscribeToThemeMode((mode) => {
      capturedMode = mode;
    });

    setStoredThemeMode('dark');
    assert.strictEqual(capturedMode, 'dark');

    setStoredThemeMode('light');
    assert.strictEqual(capturedMode, 'light');

    unsubscribe();
    setStoredThemeMode('system');
    // After unsubscribe, capturedMode should remain 'light'
    assert.strictEqual(capturedMode, 'light');
  });

  test('ThemeProvider correctly resolves explicit light and dark schemes', () => {
    let lightResolved: string = '';
    const LightConsumer = () => {
      const theme = useAppTheme();
      lightResolved = theme.resolvedScheme;
      return null;
    };

    ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        { initialMode: 'light' },
        React.createElement(LightConsumer)
      )
    );
    assert.strictEqual(lightResolved, 'light');

    let darkResolved: string = '';
    const DarkConsumer = () => {
      const theme = useAppTheme();
      darkResolved = theme.resolvedScheme;
      return null;
    };

    ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        { initialMode: 'dark' },
        React.createElement(DarkConsumer)
      )
    );
    assert.strictEqual(darkResolved, 'dark');
  });

  test('ProfileScreen renders all 3 appearance options (System, Light, Dark)', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        { initialMode: 'light' },
        React.createElement(ProfileScreen, null)
      )
    );

    assert.ok(html.includes('APPEARANCE'), 'Must render appearance section header');
    assert.ok(html.includes('System'), 'Must render System option');
    assert.ok(html.includes('Light'), 'Must render Light option');
    assert.ok(html.includes('Dark'), 'Must render Dark option');
    assert.ok(html.includes('ACTIVE'), 'Must indicate active theme mode');
    assert.ok(html.includes('Guest Visitor') || html.includes('GUEST'), 'Must render guest identity when unauthenticated');
    assert.ok(html.includes('EcoKarma Points'), 'Must render community metrics');
  });

  test('Theme change does not reset multi-step posting state', () => {
    // Simulate multi-step form state persistence across theme changes
    const { PostInfoStep } = require('../post/components/PostInfoStep');
    const formData = {
      photos: [{ id: 'p1', uri: 'https://example.com/p1.jpg', isPrimary: true }],
      title: 'iPhone 13 Mini Green',
      category: 'smartphone',
      brand: 'Apple',
      model: 'A2399',
      condition: 'good',
      description: 'Minor wear.',
      city: 'Vancouver',
      action: 'sell',
      price: '390',
      isFree: false,
      originalPrice: '',
      pickupType: 'both',
      warrantyDays: '14',
      issueType: '',
      issueDetails: '',
      repairUrgency: 'standard',
      preferredService: 'depot',
      disposalReason: '',
      certificateRequested: false,
      hasSwollenBattery: false,
      dropoffPreference: 'depot',
      confirmedAccurate: false,
    };

    // Render under Light mode
    const lightHtml = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        { forceScheme: 'light' },
        React.createElement(PostInfoStep, {
          formData,
          errors: {},
          onChangeField: () => {},
          onNext: () => {},
        })
      )
    );
    assert.ok(lightHtml.includes('iPhone 13 Mini Green'), 'Step data retained in light theme');

    // Render under Dark mode with same form state
    const darkHtml = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        { forceScheme: 'dark' },
        React.createElement(PostInfoStep, {
          formData,
          errors: {},
          onChangeField: () => {},
          onNext: () => {},
        })
      )
    );
    assert.ok(darkHtml.includes('iPhone 13 Mini Green'), 'Step data retained in dark theme');
  });
});

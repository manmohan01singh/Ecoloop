import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getGlowStyle } from './glow';
import { lightColors, darkColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radii } from './radii';
import { shadows } from './shadows';
import { AppTheme } from '../theme/theme';

describe('Selective Glow & Lighting Effects Architecture (Phase 3A)', () => {
  const createMockTheme = (isDark: boolean): AppTheme => {
    const baseTheme = {
      isDark,
      themeMode: isDark ? ('dark' as const) : ('light' as const),
      resolvedScheme: isDark ? ('dark' as const) : ('light' as const),
      setThemeMode: () => {},
      colors: isDark ? darkColors : lightColors,
      typography,
      spacing,
      radii,
      shadows,
      hairlineWidth: 0.5,
    };
    return {
      ...baseTheme,
      getGlow: (type, active) => getGlowStyle({ ...baseTheme, getGlow: () => ({}) }, type, active),
    };
  };

  const darkTheme = createMockTheme(true);
  const lightTheme = createMockTheme(false);

  test('Primary action glow: Dark mode uses emerald halo; Light mode uses subtle tinted shadow', () => {
    const darkGlow = darkTheme.getGlow('primaryAction');
    assert.strictEqual(darkGlow.shadowColor, '#10B981', 'Dark mode primary glow must use calibrated emerald');
    assert.strictEqual(darkGlow.shadowOpacity, 0.38);

    const lightGlow = lightTheme.getGlow('primaryAction');
    assert.strictEqual(lightGlow.shadowColor, '#007A5E', 'Light mode primary glow must use forest emerald');
    assert.strictEqual(lightGlow.shadowOpacity, 0.22, 'Light mode glow must be more restrained than dark mode');
  });

  test('Selected pathway glow: Highlights border and adds accent shadow only when active', () => {
    const darkSelected = darkTheme.getGlow('selectedPathway', true);
    assert.ok(darkSelected.borderWidth && darkSelected.borderWidth > 0);
    assert.strictEqual(darkSelected.shadowColor, '#10B981');

    const inactiveGlow = darkTheme.getGlow('selectedPathway', false);
    assert.deepStrictEqual(inactiveGlow, {}, 'When inactive, no glow style is returned');
  });

  test('Unread indicator glow: Subtle ambient lighting around unread notification pill', () => {
    const unreadDark = darkTheme.getGlow('unreadIndicator');
    assert.strictEqual(unreadDark.shadowColor, '#10B981');
    assert.ok((unreadDark.shadowRadius || 0) <= 8, 'Unread indicator glow must be restrained, not neon');

    const unreadLight = lightTheme.getGlow('unreadIndicator');
    assert.strictEqual(unreadLight.shadowColor, '#007A5E');
  });

  test('Success celebration glow: Radiant halo for genuine confirmation hero state', () => {
    const darkSuccess = darkTheme.getGlow('successCelebration');
    assert.strictEqual(darkSuccess.shadowColor, '#10B981');
    assert.ok((darkSuccess.shadowRadius || 0) >= 14);

    const lightSuccess = lightTheme.getGlow('successCelebration');
    assert.strictEqual(lightSuccess.shadowColor, '#34C759');
  });
});

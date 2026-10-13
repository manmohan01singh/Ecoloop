import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  lightColors,
  darkColors,
  typography,
  spacing,
  radii,
  shadows,
} from './tokens';

describe('Design Tokens Architecture', () => {
  test('Light and Dark color palettes have complete matching token keys', () => {
    const lightKeys = Object.keys(lightColors).sort();
    const darkKeys = Object.keys(darkColors).sort();
    assert.deepStrictEqual(lightKeys, darkKeys, 'Color keys must match between light and dark palettes');
  });

  test('All 4 core circular pathways have dedicated action color palettes', () => {
    const actions = ['actionRepair', 'actionRecycle', 'actionSell', 'actionBuy'] as const;
    for (const act of actions) {
      assert.ok(lightColors[act], `lightColors must have ${act}`);
      assert.ok(lightColors[act].tint, `${act} must have tint`);
      assert.ok(lightColors[act].background, `${act} must have background`);
      assert.ok(lightColors[act].badgeText, `${act} must have badgeText`);

      assert.ok(darkColors[act], `darkColors must have ${act}`);
      assert.ok(darkColors[act].tint, `darkColors ${act} must have tint`);
    }

    // Verify distinct tints for each action to ensure instant recognizability
    const lightTints = new Set(actions.map(a => lightColors[a].tint));
    assert.strictEqual(lightTints.size, 4, 'All 4 pathways must have distinct visual tints');
  });

  test('Typography scale implements full Apple HIG specification', () => {
    const expectedVariants = [
      'largeTitle',
      'title1',
      'title2',
      'title3',
      'headline',
      'body',
      'callout',
      'subheadline',
      'footnote',
      'caption1',
      'caption2',
    ] as const;

    for (const variant of expectedVariants) {
      const style = typography[variant];
      assert.ok(style, `Variant ${variant} must exist`);
      assert.ok(typeof style.fontSize === 'number' && style.fontSize > 0, `${variant} must have fontSize`);
      assert.ok(typeof style.lineHeight === 'number' && style.lineHeight > 0, `${variant} must have lineHeight`);
      assert.ok(style.fontWeight, `${variant} must have fontWeight`);
    }

    // Check size hierarchy
    assert.ok(typography.largeTitle.fontSize! > typography.title1.fontSize!);
    assert.ok(typography.title1.fontSize! > typography.title2.fontSize!);
    assert.ok(typography.title2.fontSize! > typography.title3.fontSize!);
    assert.ok(typography.title3.fontSize! > typography.headline.fontSize!);
    assert.ok(typography.headline.fontSize! > typography.subheadline.fontSize!);
    assert.ok(typography.subheadline.fontSize! > typography.footnote.fontSize!);
    assert.ok(typography.footnote.fontSize! > typography.caption1.fontSize!);
    assert.ok(typography.caption1.fontSize! > typography.caption2.fontSize!);
  });

  test('Spacing follows disciplined 4/8pt layout grid', () => {
    assert.strictEqual(spacing.xs, 4);
    assert.strictEqual(spacing.sm, 8);
    assert.strictEqual(spacing.md, 12);
    assert.strictEqual(spacing.base, 16);
    assert.strictEqual(spacing.lg, 20);
    assert.strictEqual(spacing.xl, 24);
    assert.strictEqual(spacing.xxl, 32);
    assert.strictEqual(spacing.xxxl, 40);
  });

  test('Continuous corner radii follow Apple HIG standards', () => {
    assert.strictEqual(radii.xs, 4);
    assert.strictEqual(radii.sm, 8);
    assert.strictEqual(radii.md, 12);
    assert.strictEqual(radii.lg, 16);
    assert.strictEqual(radii.xl, 20);
    assert.strictEqual(radii.xxl, 24);
    assert.strictEqual(radii.full, 9999);
  });

  test('Shadow tokens provide restrained, non-jarring elevations', () => {
    assert.ok(shadows.subtle);
    assert.ok(shadows.card);
    assert.ok(shadows.elevated);
    assert.ok(shadows.modal);
    assert.ok(shadows.none);
  });
});

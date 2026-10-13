import { test, describe } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { calculateEstimatedCo2, submitPostDevice } from './services/postDeviceService';
import { useDeviceVisionHook } from './hooks/useDeviceVisionHook';
import { PostProgressHeader } from './components/PostProgressHeader';
import { PostPhotoStep } from './components/PostPhotoStep';
import { PostInfoStep } from './components/PostInfoStep';
import { PostActionStep } from './components/PostActionStep';
import { PostReviewStep } from './components/PostReviewStep';
import { PostSuccessStep } from './components/PostSuccessStep';
import { ThemeProvider } from '../../design-system/theme/theme';
import { PostFormData } from './types/post.types';

describe('Post a Device Architecture & Complete Journey (Phase 2)', () => {
  test('calculateEstimatedCo2 calculates accurate environmental benchmarks by category and action', () => {
    // Smartphone resale: 68 kg
    const phoneCo2 = calculateEstimatedCo2('smartphone', 'sell');
    assert.strictEqual(phoneCo2, 68);

    // Laptop repair: 195 * 1.1 = 215 kg
    const laptopRepairCo2 = calculateEstimatedCo2('laptop', 'repair');
    assert.strictEqual(laptopRepairCo2, 215);

    // Tablet recycle: 42 * 0.65 = 27 kg
    const tabletRecycleCo2 = calculateEstimatedCo2('tablet', 'recycle');
    assert.strictEqual(tabletRecycleCo2, 27);
  });

  test('useDeviceVisionHook honestly communicates lack of paid AI provider without fabricating analysis', async () => {
    let hookResult: any;
    const TestComponent = () => {
      hookResult = useDeviceVisionHook();
      return null;
    };
    ReactDOMServer.renderToStaticMarkup(React.createElement(TestComponent));

    assert.strictEqual(hookResult.isConfigured, false, 'Must not claim AI vision is configured when no real API key is present');
    assert.strictEqual(hookResult.isAnalyzing, false);
    assert.ok(hookResult.statusMessage.includes('Manual hardware specification is active'));

    const result = await hookResult.analyzeImage('https://example.com/test.jpg');
    assert.strictEqual(result, null, 'Must return null rather than fabricating fake diagnostic claims');
  });

  test('submitPostDevice blocks unauthenticated submissions without active session', async () => {
    const mockPostData: PostFormData = {
      photos: [
        {
          id: 'photo-1',
          uri: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab',
          isPrimary: true,
        },
      ],
      title: 'iPhone 12 Mini 64GB Blue',
      category: 'smartphone',
      brand: 'Apple',
      model: 'A2399',
      condition: 'good',
      description: 'Minor bezel scuffs, 86% battery health.',
      city: 'Vancouver',
      action: 'sell',
      price: '280',
      isFree: false,
      originalPrice: '699',
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
      confirmedAccurate: true,
    };

    // Submitting with no user must fail
    const unauthResult = await submitPostDevice(mockPostData, null, null);
    assert.strictEqual(unauthResult.success, false);
    assert.ok(unauthResult.error?.includes('Authentication is required'));
  });

  test('submitPostDevice creates valid circular listing with RFC 4122 UUID and registers into marketplace', async () => {
    const mockPostData: PostFormData = {
      photos: [
        {
          id: 'photo-1',
          uri: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab',
          isPrimary: true,
        },
      ],
      title: 'iPhone 12 Mini 64GB Blue',
      category: 'smartphone',
      brand: 'Apple',
      model: 'A2399',
      condition: 'good',
      description: 'Minor bezel scuffs, 86% battery health.',
      city: 'Vancouver',
      action: 'sell',
      price: '280',
      isFree: false,
      originalPrice: '699',
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
      confirmedAccurate: true,
    };

    const mockAuthUser = { id: 'usr-tester-101', email: 'tester@ecoloop.test' };
    const mockUserProfile = {
      id: 'usr-tester-101',
      email: 'tester@ecoloop.test',
      displayName: 'Verified Tester',
      username: 'v_tester',
      city: 'Vancouver',
      role: 'member' as const,
      karmaPoints: 50,
      co2DivertedKg: 0,
      preferences: { notifications: true, theme: 'system', emailAlerts: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await submitPostDevice(mockPostData, mockAuthUser, mockUserProfile);
    assert.strictEqual(result.success, true);
    assert.ok(result.createdId, 'Must return createdId');
    // Verify standard RFC 4122 UUID format (compatible with PostgreSQL UUID type)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    assert.match(result.createdId, uuidRegex, 'createdId must strictly adhere to RFC 4122 UUID format');
  });

  test('PostProgressHeader renders step progression and titles', () => {
    const htmlStep1 = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(PostProgressHeader, {
          currentStep: 1,
          totalSteps: 4,
          onBack: () => {},
          onCancel: () => {},
        })
      )
    );

    assert.ok(htmlStep1.includes('Step 1: Device Photos'), 'Must display step 1 title');
    assert.ok(htmlStep1.includes('1 of 4'), 'Must display step counter');

    const htmlStep3 = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(PostProgressHeader, {
          currentStep: 3,
          totalSteps: 4,
          onBack: () => {},
          onCancel: () => {},
        })
      )
    );

    assert.ok(htmlStep3.includes('Step 3: Circular Pathway'), 'Must display step 3 title');
    assert.ok(htmlStep3.includes('Back'), 'Must display Back navigation button');
  });

  test('PostPhotoStep renders capture options and photo requirement notice', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(PostPhotoStep, {
          photos: [],
          onPhotosChange: () => {},
          onNext: () => {},
        })
      )
    );

    assert.ok(html.includes('Take Photo'), 'Must render Take Photo button');
    assert.ok(html.includes('Photo Library'), 'Must render Photo Library button');
    assert.ok(html.includes('At least 1 photo required'), 'Must render requirement notice');
    assert.ok(html.includes('Future AI Vision Interface Ready'), 'Must render vision integration notice');
  });

  test('PostActionStep renders 3 circular pathways with distinct configuration fields', () => {
    const baseFormData: PostFormData = {
      photos: [],
      title: 'iPad Pro 11',
      category: 'tablet',
      brand: 'Apple',
      model: '2020',
      condition: 'good',
      description: 'Clean device.',
      city: 'Vancouver',
      action: 'sell',
      price: '450',
      isFree: false,
      originalPrice: '',
      pickupType: 'both',
      warrantyDays: '30',
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

    // Sell action
    const htmlSell = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(PostActionStep, {
          formData: baseFormData,
          errors: {},
          onChangeField: () => {},
          onNext: () => {},
        })
      )
    );
    assert.ok(htmlSell.includes('RESALE CONFIGURATION'), 'Must render resale configuration');
    assert.ok(htmlSell.includes('Asking Price'), 'Must render price field');

    // Repair action
    const htmlRepair = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(PostActionStep, {
          formData: { ...baseFormData, action: 'repair' },
          errors: {},
          onChangeField: () => {},
          onNext: () => {},
        })
      )
    );
    assert.ok(htmlRepair.includes('DIAGNOSTIC SERVICE REQUEST'), 'Must render repair configuration');
    assert.ok(htmlRepair.includes('Primary Fault Category'), 'Must render fault category');

    // Recycle action
    const htmlRecycle = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(PostActionStep, {
          formData: { ...baseFormData, action: 'recycle' },
          errors: {},
          onChangeField: () => {},
          onNext: () => {},
        })
      )
    );
    assert.ok(htmlRecycle.includes('RESPONSIBLE E-WASTE RECOVERY'), 'Must render recycle configuration');
    assert.ok(htmlRecycle.includes('Certified Data Destruction'), 'Must render data wipe option');
  });

  test('PostReviewStep renders CO2 diversion estimate and accuracy declaration', () => {
    const sampleFormData: PostFormData = {
      photos: [{ id: 'p1', uri: 'https://example.com/p.jpg', isPrimary: true }],
      title: 'MacBook Pro 14 M1 Pro',
      category: 'laptop',
      brand: 'Apple',
      model: '2021',
      condition: 'like_new',
      description: 'Flawless condition.',
      city: 'Vancouver',
      action: 'sell',
      price: '1100',
      isFree: false,
      originalPrice: '1999',
      pickupType: 'both',
      warrantyDays: '30',
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

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(PostReviewStep, {
          formData: sampleFormData,
          submitting: false,
          errors: {},
          onChangeField: () => {},
          onSubmit: () => {},
          onBack: () => {},
        })
      )
    );

    assert.ok(html.includes('Review your posting'), 'Must render review heading');
    assert.ok(html.includes('MacBook Pro 14 M1 Pro'), 'Must render item title');
    assert.ok(html.includes('Brand: Apple'), 'Must render brand in summary');
    assert.ok(html.includes('Model: 2021'), 'Must render model in summary');
    assert.ok(html.includes('Estimated Environmental Diversion'), 'Must render CO2 header');
    assert.ok(html.includes('Confirm Ownership') && html.includes('Accuracy'), 'Must render ownership declaration');
  });

  test('PostSuccessStep renders celebration badge and navigation buttons', () => {
    const sampleFormData: PostFormData = {
      photos: [],
      title: 'iPhone 13',
      category: 'smartphone',
      brand: 'Apple',
      model: '2021',
      condition: 'good',
      description: '',
      city: 'Vancouver',
      action: 'sell',
      price: '400',
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
      confirmedAccurate: true,
    };

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(PostSuccessStep, {
          formData: sampleFormData,
          onViewInExplore: () => {},
          onDone: () => {},
        })
      )
    );

    assert.ok(html.includes('Device Listed on Marketplace!'), 'Must render success headline');
    assert.ok(html.includes('+50 EcoKarma Points Earned'), 'Must render EcoKarma reward');
    assert.ok(html.includes('View in Explore Marketplace'), 'Must render explore CTA');
    assert.ok(html.includes('Done') && html.includes('Return Home'), 'Must render return home CTA');
  });
});

import { test, describe } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { EXPLORE_DEV_FIXTURES } from './fixtures/exploreFixtures';
import { registerSessionPostedItem, getSessionPostedItems, subscribeToSessionItems } from './hooks/useExploreData';
import { ExploreProductCard } from './components/ExploreProductCard';
import { ExploreHeader } from './components/ExploreHeader';
import { DeviceDetailModal } from './components/DeviceDetailModal';
import { ThemeProvider } from '../../design-system/theme/theme';
import { ExploreItem } from './types/explore.types';

describe('Explore & Marketplace Architecture (Phase 2)', () => {
  test('All development fixtures have valid circular data and are flagged as dev fixtures', () => {
    assert.ok(EXPLORE_DEV_FIXTURES.length >= 8, 'Must provide comprehensive sample categories');

    for (const item of EXPLORE_DEV_FIXTURES) {
      assert.ok(item.id.length > 0, 'Item must have an id');
      assert.ok(item.title.length > 0, 'Item must have a title');
      assert.ok(item.category.length > 0, 'Item must have a category');
      assert.ok(item.condition.length > 0, 'Item must have a condition');
      assert.ok(item.conditionLabel.length > 0, 'Item must have a condition label');
      assert.ok(item.action.length > 0, 'Item must have an action pathway');
      assert.ok(item.co2SavedKg > 0, 'Item must have estimated CO2 diversion');
      assert.ok(item.imageUrl.length > 0, 'Item must have an image');
      assert.ok(item.city.length > 0, 'Item must have a location');
      assert.strictEqual(item.isDevFixture, true, 'Must be explicitly identified as dev fixture');
    }
  });

  test('Fixtures span all required core electronics categories', () => {
    const categories = new Set(EXPLORE_DEV_FIXTURES.map((item) => item.category));
    assert.ok(categories.has('smartphone'), 'Must include smartphones');
    assert.ok(categories.has('laptop'), 'Must include laptops');
    assert.ok(categories.has('tablet'), 'Must include tablets');
    assert.ok(categories.has('audio'), 'Must include audio gear');
    assert.ok(categories.has('parts'), 'Must include spare parts');
    assert.ok(categories.has('gaming'), 'Must include gaming hardware');
  });

  test('Fixtures span multiple circular pathways: sell, repair, recycle, buy', () => {
    const actions = new Set(EXPLORE_DEV_FIXTURES.map((item) => item.action));
    assert.ok(actions.has('sell'), 'Must include resale listings');
    assert.ok(actions.has('repair'), 'Must include repair diagnostic requests');
    assert.ok(actions.has('recycle'), 'Must include e-waste recovery dropoffs');
    assert.ok(actions.has('buy'), 'Must include buy / refurbished items');
  });

  test('Dynamic session registration allows newly posted devices to appear in marketplace', () => {
    const initialCount = getSessionPostedItems().length;

    const newDevice: ExploreItem = {
      id: `test-session-${Date.now()}`,
      title: 'Pixel 8 128GB Hazel',
      category: 'smartphone',
      categoryLabel: 'SMARTPHONES',
      action: 'sell',
      actionLabel: 'For Resale',
      condition: 'like_new',
      conditionLabel: 'Like New',
      price: 499,
      city: 'Vancouver',
      distanceKm: 1.1,
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab',
      co2SavedKg: 68,
      description: 'Mint condition Hazel Pixel 8.',
      pickupType: 'both',
      createdAt: new Date().toISOString(),
      isDevFixture: false,
    };

    registerSessionPostedItem(newDevice);

    const afterItems = getSessionPostedItems();
    assert.strictEqual(afterItems.length, initialCount + 1);
    assert.strictEqual(afterItems[0].title, 'Pixel 8 128GB Hazel');
    assert.strictEqual(afterItems[0].isDevFixture, false);
  });

  test('ExploreProductCard renders condition badge, price, and CO2 diversion', () => {
    const sampleItem = EXPLORE_DEV_FIXTURES[0];

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(ExploreProductCard, {
          item: sampleItem,
          onPress: () => {},
        })
      )
    );

    assert.ok(html.includes(sampleItem.title), 'Must render item title');
    assert.ok(html.includes(sampleItem.conditionLabel), 'Must render condition label');
    assert.ok(html.includes(sampleItem.city), 'Must render city');
    assert.ok(html.includes(String(sampleItem.co2SavedKg)), 'Must render CO2 diversion');
    assert.ok(html.includes('DEV FIXTURE'), 'Must display dev fixture indicator pill');
  });

  test('ExploreHeader renders Apple large title and search input placeholder', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(ExploreHeader, {
          query: '',
          onChangeQuery: () => {},
          activeFiltersCount: 2,
          onOpenFilterModal: () => {},
          totalItems: 8,
        })
      )
    );

    assert.ok(html.includes('Marketplace'), 'Must render large title');
    assert.ok(html.includes('Search devices, brands, models'), 'Must render search bar placeholder');
  });

  test('DeviceDetailModal renders technical specifications and environmental highlight', () => {
    const sampleItem = EXPLORE_DEV_FIXTURES[0];

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(DeviceDetailModal, {
          item: sampleItem,
          visible: true,
          onClose: () => {},
        })
      )
    );

    assert.ok(html.includes(sampleItem.title), 'Must render modal title');
    assert.ok(html.includes('Hardware Specifications'), 'Must render specs section header');
    assert.ok(html.includes('CO₂ Diversion'), 'Must render environmental highlight');
    assert.ok(html.includes('DEMO FIXTURE'), 'Must render demo fixture tag');
  });

  test('subscribeToSessionItems receives reactive updates when new item is posted', () => {
    let notified = false;
    const unsubscribe = subscribeToSessionItems(() => {
      notified = true;
    });

    const testItem: ExploreItem = {
      id: `test-sub-${Date.now()}`,
      title: 'iPad Pro 11 M2',
      category: 'tablet',
      categoryLabel: 'TABLETS',
      action: 'sell',
      actionLabel: 'For Resale',
      condition: 'like_new',
      conditionLabel: 'Like New',
      price: 650,
      city: 'Vancouver',
      distanceKm: 0.5,
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0',
      co2SavedKg: 42,
      description: 'M2 iPad Pro.',
      pickupType: 'both',
      createdAt: new Date().toISOString(),
      isDevFixture: false,
    };

    registerSessionPostedItem(testItem);
    unsubscribe();

    assert.strictEqual(notified, true, 'Subscriber must be notified when new item is registered');
  });

  test('listingRecordToExploreItem converts persistent database record to marketplace format', () => {
    const { listingRecordToExploreItem } = require('./hooks/useExploreData');
    const record = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      ownerId: 'usr-persisted-1',
      title: 'Sony WH-1000XM5 Black',
      deviceCategory: 'audio',
      brand: 'Sony',
      model: 'WH-1000XM5',
      condition: 'like_new',
      description: 'Noise cancelling headphones in original box.',
      pathway: 'sell',
      status: 'active',
      price: 279,
      isFree: false,
      city: 'Vancouver',
      pickupType: 'dropoff',
      certificateRequested: false,
      co2SavedKg: 24,
      photos: ['https://images.unsplash.com/headphones.jpg'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const item = listingRecordToExploreItem(record);
    assert.strictEqual(item.id, record.id);
    assert.strictEqual(item.title, record.title);
    assert.strictEqual(item.category, 'audio');
    assert.strictEqual(item.action, 'sell');
    assert.strictEqual(item.price, 279);
    assert.strictEqual(item.co2SavedKg, 24);
    assert.strictEqual(item.isDevFixture, false);
  });
});

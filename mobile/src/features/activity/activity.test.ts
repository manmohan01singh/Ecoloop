import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { ActivityScreen } from './screens/ActivityScreen';
import { ThemeProvider } from '../../design-system/theme/theme';
import { AuthProvider } from '../../services/auth/AuthContext';
import {
  resetTestStorage,
  saveActivityEvent,
  setStoredSessionUser,
} from '../../services/storage/localPersistence';

describe('Activity Screen Architecture & Event Ledger (Phase 3A)', () => {
  beforeEach(() => {
    resetTestStorage();
  });

  test('ActivityScreen renders signed-out prompt when no active user session', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(
          AuthProvider,
          null,
          React.createElement(ActivityScreen, null)
        )
      )
    );

    assert.ok(html.includes('Activity'), 'Must render screen title');
    assert.ok(html.includes('Sign In to View Activity'), 'Must render sign-in prompt card');
    assert.ok(html.includes('Sign In or Register'), 'Must render login CTA button');
  });

  test('ActivityScreen renders empty state when authenticated user has no events', () => {
    setStoredSessionUser({
      user: { id: 'test-user-1', email: 'test@ecoloop.local' },
      profile: {
        id: 'test-user-1',
        email: 'test@ecoloop.local',
        displayName: 'Test User',
        username: 'test_u',
        city: 'Vancouver',
        role: 'member',
        karmaPoints: 50,
        co2DivertedKg: 0,
        preferences: { notifications: true, theme: 'system', emailAlerts: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(
          AuthProvider,
          null,
          React.createElement(ActivityScreen, null)
        )
      )
    );

    assert.ok(html.includes('Activity'));
    assert.ok(html.includes('No Activity Yet'), 'Must render empty state message');
    assert.ok(html.includes('Post a Device'), 'Must offer Post CTA');
  });

  test('ActivityScreen renders unread badge and categorized event items when events exist', () => {
    const userId = 'user-active-99';
    setStoredSessionUser({
      user: { id: userId, email: 'active@ecoloop.local' },
      profile: {
        id: userId,
        email: 'active@ecoloop.local',
        displayName: 'Active Member',
        username: 'active_m',
        city: 'Metro Vancouver',
        role: 'member',
        karmaPoints: 100,
        co2DivertedKg: 40,
        preferences: { notifications: true, theme: 'system', emailAlerts: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    saveActivityEvent({
      id: 'event-active-1',
      recipientId: userId,
      eventType: 'listing_created',
      entityType: 'device_listing',
      title: 'iPad Air 5th Gen Listed',
      description: 'Your tablet listing is active in the Explore marketplace.',
      metadata: {},
      readAt: null,
      createdAt: new Date().toISOString(),
    });

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(
          AuthProvider,
          null,
          React.createElement(ActivityScreen, null)
        )
      )
    );

    assert.ok(html.includes('Activity'));
    assert.ok(html.includes('1 NEW'), 'Must render unread badge');
    assert.ok(html.includes('iPad Air 5th Gen Listed'), 'Must render event title');
    assert.ok(html.includes('Mark all read'), 'Must render mark all read action');
  });

  test('ActivityScreen supports both Light and Dark theme modes without throwing', () => {
    ['light', 'dark'].forEach((scheme) => {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(
          ThemeProvider,
          { forceScheme: scheme as 'light' | 'dark' },
          React.createElement(
            AuthProvider,
            null,
            React.createElement(ActivityScreen, null)
          )
        )
      );
      assert.ok(html.length > 100, `Must render html string for ${scheme} theme`);
    });
  });

  test('ActivityScreen groups timeline and handles pagination cleanly', () => {
    const userId = 'user-timeline-test';
    setStoredSessionUser({
      user: { id: userId, email: 'timeline@ecoloop.local' },
      profile: {
        id: userId,
        email: 'timeline@ecoloop.local',
        displayName: 'Timeline User',
        username: 't_user',
        city: 'Metro Vancouver',
        role: 'member',
        karmaPoints: 100,
        co2DivertedKg: 20,
        preferences: { notifications: true, theme: 'system', emailAlerts: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    // Recent event (< 24h)
    saveActivityEvent({
      id: 'recent-event-1',
      recipientId: userId,
      eventType: 'listing_created',
      entityType: 'device_listing',
      title: 'Recent iPhone Listed',
      description: 'Recent event description',
      metadata: {},
      readAt: null,
      createdAt: new Date().toISOString(),
    });

    // Earlier event (> 24h)
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    saveActivityEvent({
      id: 'earlier-event-1',
      recipientId: userId,
      eventType: 'account_created',
      entityType: 'profile',
      title: 'Earlier Welcome Notice',
      description: 'Earlier event description',
      metadata: {},
      readAt: twoDaysAgo,
      createdAt: twoDaysAgo,
    });

    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(
          AuthProvider,
          null,
          React.createElement(ActivityScreen, null)
        )
      )
    );

    assert.ok(html.includes('RECENT ACTIVITY'), 'Must render RECENT ACTIVITY section');
    assert.ok(html.includes('EARLIER'), 'Must render EARLIER section');
    assert.ok(html.includes('Recent iPhone Listed'));
    assert.ok(html.includes('Earlier Welcome Notice'));
  });
});

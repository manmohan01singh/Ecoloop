import { describe, test } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  getPosts,
  createPost,
  togglePostLike,
  togglePostBookmark,
  addComment,
} from './services/communityStorage';
import { CommunityScreen } from './screens/CommunityScreen';
import { ThemeProvider } from '../../design-system/theme/theme';
import { AuthProvider } from '../../services/auth/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

describe('Community & @repair Broadcast Architecture', () => {
  test('getPosts returns community posts and filters by feed type', () => {
    const forYou = getPosts('for_you');
    assert.ok(forYou.length >= 4, 'Must return at least 4 seeded community posts');

    const repairHelp = getPosts('repair_help');
    assert.ok(repairHelp.length >= 2, 'Must return repair help posts');
    assert.ok(
      repairHelp.every((p) => p.hasRepairBroadcast || p.feedType === 'repair_help'),
      'All repair help posts must have repair broadcast active'
    );
  });

  test('createPost detects @repair and triggers specialist broadcast', () => {
    const post = createPost('Need technician to inspect Lenovo ThinkPad battery @repair in Indiranagar', {
      tags: ['BatterySwap'],
      deviceModel: 'Lenovo ThinkPad T14',
    });

    assert.ok(post.id.startsWith('post-'), 'Must generate unique post ID');
    assert.strictEqual(post.hasRepairBroadcast, true, 'Must detect @repair tag in content');
    assert.ok(
      (post.repairSpecialistsNotifiedCount || 0) > 0,
      'Must record notified specialist count'
    );
    assert.strictEqual(post.feedType, 'repair_help', 'Must route to repair_help feed');
  });

  test('togglePostLike and togglePostBookmark operate idempotently', () => {
    const post = getPosts('for_you')[0];
    const initialLikes = post.likesCount;
    const initialLikedState = !!post.isLiked;

    const newLiked = togglePostLike(post.id);
    assert.strictEqual(newLiked, !initialLikedState);
    assert.strictEqual(post.likesCount, initialLikedState ? initialLikes - 1 : initialLikes + 1);

    const initialBookmarked = !!post.isBookmarked;
    const newBookmarked = togglePostBookmark(post.id);
    assert.strictEqual(newBookmarked, !initialBookmarked);
  });

  test('addComment appends discussion response and increments counter', () => {
    const post = getPosts('for_you')[0];
    const initialCount = post.commentsCount;

    const comment = addComment(post.id, 'I can verify this logic board repair works well!', 'Specialist Dave', 'dave_repair');
    assert.ok(comment, 'Must create comment record');
    assert.strictEqual(post.commentsCount, initialCount + 1, 'Must increment comments counter');
  });

  test('CommunityScreen renders static markup without crashing', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        SafeAreaProvider,
        null,
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(
            AuthProvider,
            null,
            React.createElement(CommunityScreen, null)
          )
        )
      )
    );

    assert.ok(html.includes('Community'), 'Must render Community title');
    assert.ok(html.includes('For You'), 'Must render For You feed tab');
    assert.ok(html.includes('Repair Help'), 'Must render Repair Help feed tab');
  });
});

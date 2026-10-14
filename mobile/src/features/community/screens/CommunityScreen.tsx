import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import {
  CommunityPost,
  CommunityFeedTab,
} from '../types/community.types';
import {
  getPosts,
  createPost,
  togglePostLike,
  togglePostBookmark,
  addComment,
} from '../services/communityStorage';
import { useAuth } from '../../../services/auth/AuthContext';

export interface CommunityScreenProps {
  onReturnHome?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = () => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [activeFeed, setActiveFeed] = useState<CommunityFeedTab>('for_you');
  const [refreshing, setRefreshing] = useState(false);
  const [composerVisible, setComposerVisible] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [selectedDeviceTag, setSelectedDeviceTag] = useState('');
  const [selectedHashTag, setSelectedHashTag] = useState('RightToRepair');

  // Comment Modal State
  const [activePostForComments, setActivePostForComments] = useState<CommunityPost | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Local state update trigger
  const [revision, setRevision] = useState(0);

  const posts = useMemo(() => {
    return getPosts(activeFeed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFeed, revision]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRevision((r) => r + 1);
      setRefreshing(false);
    }, 400);
  };

  const handleLike = (postId: string) => {
    togglePostLike(postId);
    setRevision((r) => r + 1);
  };

  const handleBookmark = (postId: string) => {
    togglePostBookmark(postId);
    setRevision((r) => r + 1);
  };

  const handleCreatePost = () => {
    if (!composerText.trim()) return;
    createPost(composerText.trim(), {
      tags: selectedHashTag ? [selectedHashTag] : ['Circuvio'],
      deviceModel: selectedDeviceTag || undefined,
      currentUser: {
        name: profile?.displayName || user?.email?.split('@')[0] || 'Community Member',
        username: profile?.username || user?.email?.split('@')[0] || 'citizen',
        role: profile?.role || 'user',
      },
    });
    setComposerText('');
    setSelectedDeviceTag('');
    setComposerVisible(false);
    setRevision((r) => r + 1);
  };

  const handleAddComment = () => {
    if (!activePostForComments || !newCommentText.trim()) return;
    const authorName = profile?.displayName || user?.email?.split('@')[0] || 'You';
    const authorUsername = profile?.username || user?.email?.split('@')[0] || 'current_user';
    addComment(activePostForComments.id, newCommentText.trim(), authorName, authorUsername);
    setNewCommentText('');
    setRevision((r) => r + 1);
  };

  const isRepairBroadcastActive = composerText.toLowerCase().includes('@repair');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Header */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: Math.max(insets.top, 12),
            backgroundColor: theme.colors.secondaryBackground,
            borderBottomColor: theme.colors.separator,
            borderBottomWidth: theme.hairlineWidth,
          },
        ]}
      >
        <View style={styles.headerTitleRow}>
          <View>
            <AppText variant="title2" weight="800" color="primary" style={{ letterSpacing: -0.4 }}>
              Community
            </AppText>
            <AppText variant="caption2" color="secondary" weight="600">
              Discussions, Advice & Verified Outcomes
            </AppText>
          </View>

          {/* New Post Header Trigger */}
          <TouchableOpacity
            onPress={() => setComposerVisible(true)}
            activeOpacity={0.8}
            style={[styles.composeHeaderButton, { backgroundColor: theme.colors.tint }]}
          >
            <AppIcon name="add" size={18} color="#FFFFFF" />
            <AppText variant="caption1" weight="700" customColor="#FFFFFF" style={{ marginLeft: 3 }}>
              Post
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Twitter / iOS Segmented Feed Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setActiveFeed('for_you')}
            activeOpacity={0.7}
            style={[styles.tabButton, activeFeed === 'for_you' && styles.tabButtonActive]}
          >
            <AppText
              variant="subheadline"
              weight={activeFeed === 'for_you' ? '800' : '500'}
              color={activeFeed === 'for_you' ? 'primary' : 'secondary'}
            >
              For You
            </AppText>
            {activeFeed === 'for_you' && (
              <View style={[styles.activeTabIndicator, { backgroundColor: theme.colors.tint }]} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFeed('following')}
            activeOpacity={0.7}
            style={[styles.tabButton, activeFeed === 'following' && styles.tabButtonActive]}
          >
            <AppText
              variant="subheadline"
              weight={activeFeed === 'following' ? '800' : '500'}
              color={activeFeed === 'following' ? 'primary' : 'secondary'}
            >
              Following
            </AppText>
            {activeFeed === 'following' && (
              <View style={[styles.activeTabIndicator, { backgroundColor: theme.colors.tint }]} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFeed('repair_help')}
            activeOpacity={0.7}
            style={[styles.tabButton, activeFeed === 'repair_help' && styles.tabButtonActive]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText
                variant="subheadline"
                weight={activeFeed === 'repair_help' ? '800' : '500'}
                customColor={activeFeed === 'repair_help' ? '#0071E3' : theme.colors.labelSecondary}
              >
                Repair Help
              </AppText>
              <View style={[styles.repairHelpBadge, { backgroundColor: '#0071E3' }]}>
                <AppText variant="caption2" weight="800" customColor="#FFFFFF" style={{ fontSize: 9 }}>
                  @REPAIR
                </AppText>
              </View>
            </View>
            {activeFeed === 'repair_help' && (
              <View style={[styles.activeTabIndicator, { backgroundColor: '#0071E3' }]} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.feedScroll, { paddingBottom: 120 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.tint}
          />
        }
      >
        {/* Banner for Repair Help Filter */}
        {activeFeed === 'repair_help' && (
          <View
            style={[
              styles.repairBannerCard,
              {
                backgroundColor: theme.isDark ? 'rgba(0, 113, 227, 0.12)' : 'rgba(0, 113, 227, 0.06)',
                borderColor: theme.isDark ? 'rgba(0, 113, 227, 0.28)' : 'rgba(0, 113, 227, 0.16)',
                borderWidth: theme.hairlineWidth,
              },
            ]}
          >
            <AppIcon name="construct" size={18} color="#0071E3" style={{ marginRight: 8, marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <AppText variant="footnote" weight="700" customColor="#0071E3">
                @repair Broadcast Channel
              </AppText>
              <AppText variant="caption2" color="secondary" style={{ marginTop: 2 }}>
                Posts tagging @repair trigger immediate notifications to verified technician workshops in your city.
              </AppText>
            </View>
          </View>
        )}

        {/* Post List */}
        {posts.map((post) => {
          const isRepair = post.hasRepairBroadcast;

          return (
            <View
              key={post.id}
              style={[
                styles.postCard,
                {
                  backgroundColor: theme.colors.secondaryBackground,
                  borderBottomColor: theme.colors.separator,
                  borderBottomWidth: theme.hairlineWidth,
                },
              ]}
            >
              <View style={styles.postRow}>
                {/* Avatar Column */}
                <View style={styles.avatarColumn}>
                  <View
                    style={[
                      styles.avatarBox,
                      {
                        backgroundColor:
                          post.author.role === 'repair_pro'
                            ? '#0071E3'
                            : post.author.role === 'recycler'
                            ? '#007A5E'
                            : post.author.role === 'business'
                            ? '#AF52DE'
                            : theme.colors.tint,
                      },
                    ]}
                  >
                    <AppText variant="caption1" weight="800" customColor="#FFFFFF">
                      {post.author.avatarInitials}
                    </AppText>
                  </View>
                </View>

                {/* Content Column */}
                <View style={styles.contentColumn}>
                  {/* Author Header */}
                  <View style={styles.authorHeader}>
                    <View style={styles.authorNameRow}>
                      <AppText variant="subheadline" weight="700" color="primary" numberOfLines={1}>
                        {post.author.name}
                      </AppText>
                      {post.author.isVerified && (
                        <AppIcon
                          name="checkmark-circle"
                          size={14}
                          color="#0071E3"
                          style={{ marginLeft: 3, marginRight: 4 }}
                        />
                      )}
                      <AppText variant="caption1" color="tertiary" numberOfLines={1}>
                        @{post.author.username} · {post.createdAt}
                      </AppText>
                    </View>

                    {/* Role Tag */}
                    <View
                      style={[
                        styles.rolePill,
                        {
                          backgroundColor:
                            post.author.role === 'repair_pro'
                              ? 'rgba(0, 113, 227, 0.1)'
                              : post.author.role === 'recycler'
                              ? 'rgba(0, 122, 94, 0.1)'
                              : 'rgba(120, 120, 128, 0.08)',
                        },
                      ]}
                    >
                      <AppText
                        variant="caption2"
                        weight="700"
                        customColor={
                          post.author.role === 'repair_pro'
                            ? '#0071E3'
                            : post.author.role === 'recycler'
                            ? '#007A5E'
                            : theme.colors.labelSecondary
                        }
                      >
                        {post.author.roleLabel}
                      </AppText>
                    </View>
                  </View>

                  {/* @repair Broadcast Callout */}
                  {isRepair && (
                    <View
                      style={[
                        styles.broadcastCallout,
                        {
                          backgroundColor: theme.isDark
                            ? 'rgba(0, 113, 227, 0.16)'
                            : 'rgba(0, 113, 227, 0.08)',
                          borderColor: theme.isDark ? 'rgba(0, 113, 227, 0.3)' : 'rgba(0, 113, 227, 0.18)',
                          borderWidth: theme.hairlineWidth,
                        },
                      ]}
                    >
                      <AppIcon name="radio-outline" size={13} color="#0071E3" style={{ marginRight: 5 }} />
                      <AppText variant="caption2" weight="700" customColor="#0071E3">
                        Broadcast to {post.repairSpecialistsNotifiedCount || 42} certified repair specialists
                      </AppText>
                    </View>
                  )}

                  {/* Device Tag */}
                  {post.deviceModel && (
                    <View
                      style={[
                        styles.deviceModelPill,
                        { backgroundColor: theme.colors.fillSecondary },
                      ]}
                    >
                      <AppIcon name="phone-portrait-outline" size={11} color={theme.colors.labelSecondary} style={{ marginRight: 4 }} />
                      <AppText variant="caption2" weight="600" color="secondary">
                        {post.deviceModel}
                      </AppText>
                    </View>
                  )}

                  {/* Post Body Text */}
                  <AppText variant="body" color="primary" style={styles.postBodyText}>
                    {post.content}
                  </AppText>

                  {/* Hashtags */}
                  {post.tags && post.tags.length > 0 && (
                    <View style={styles.hashtagRow}>
                      {post.tags.map((tag) => (
                        <AppText key={tag} variant="caption1" weight="600" customColor={theme.colors.tint} style={{ marginRight: 8 }}>
                          #{tag}
                        </AppText>
                      ))}
                    </View>
                  )}

                  {/* Twitter / iOS Action Bar */}
                  <View style={styles.actionBar}>
                    {/* Comments */}
                    <TouchableOpacity
                      onPress={() => setActivePostForComments(post)}
                      activeOpacity={0.7}
                      style={styles.actionButton}
                    >
                      <AppIcon name="chatbubble-outline" size={16} color={theme.colors.labelSecondary} />
                      <AppText variant="caption1" color="secondary" style={styles.actionCount}>
                        {post.commentsCount || 0}
                      </AppText>
                    </TouchableOpacity>

                    {/* Reposts */}
                    <TouchableOpacity activeOpacity={0.7} style={styles.actionButton}>
                      <AppIcon name="repeat-outline" size={17} color={theme.colors.labelSecondary} />
                      <AppText variant="caption1" color="secondary" style={styles.actionCount}>
                        {post.repostsCount || 0}
                      </AppText>
                    </TouchableOpacity>

                    {/* Likes */}
                    <TouchableOpacity
                      onPress={() => handleLike(post.id)}
                      activeOpacity={0.7}
                      style={styles.actionButton}
                    >
                      <AppIcon
                        name={post.isLiked ? 'heart' : 'heart-outline'}
                        size={17}
                        color={post.isLiked ? '#FF3B30' : theme.colors.labelSecondary}
                      />
                      <AppText
                        variant="caption1"
                        customColor={post.isLiked ? '#FF3B30' : theme.colors.labelSecondary}
                        style={styles.actionCount}
                      >
                        {post.likesCount || 0}
                      </AppText>
                    </TouchableOpacity>

                    {/* Bookmarks */}
                    <TouchableOpacity
                      onPress={() => handleBookmark(post.id)}
                      activeOpacity={0.7}
                      style={styles.actionButton}
                    >
                      <AppIcon
                        name={post.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                        size={16}
                        color={post.isBookmarked ? theme.colors.tint : theme.colors.labelSecondary}
                      />
                    </TouchableOpacity>

                    {/* Share */}
                    <TouchableOpacity activeOpacity={0.7} style={styles.actionButton}>
                      <AppIcon name="share-outline" size={16} color={theme.colors.labelSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Floating Compose Button */}
      <TouchableOpacity
        onPress={() => setComposerVisible(true)}
        activeOpacity={0.88}
        style={[
          styles.fabButton,
          {
            backgroundColor: theme.colors.tint,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          },
        ]}
      >
        <AppIcon name="create-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Tweet / Post Composer Modal */}
      <Modal visible={composerVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setComposerVisible(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            {/* Header */}
            <View style={[styles.composerHeader, { borderBottomColor: theme.colors.separator, borderBottomWidth: theme.hairlineWidth }]}>
              <TouchableOpacity onPress={() => setComposerVisible(false)} activeOpacity={0.7}>
                <AppText variant="body" customColor={theme.colors.tint}>
                  Cancel
                </AppText>
              </TouchableOpacity>

              <AppText variant="headline" weight="700" color="primary">
                New Discussion
              </AppText>

              <TouchableOpacity
                onPress={handleCreatePost}
                disabled={!composerText.trim()}
                activeOpacity={0.8}
                style={[
                  styles.submitPostButton,
                  {
                    backgroundColor: composerText.trim() ? theme.colors.tint : theme.colors.fill,
                  },
                ]}
              >
                <AppText
                  variant="subheadline"
                  weight="700"
                  customColor={composerText.trim() ? '#FFFFFF' : theme.colors.labelTertiary}
                >
                  Publish
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Composer Body */}
            <View style={styles.composerBody}>
              <TextInput
                multiline
                placeholder="Ask repair questions, tag @repair for specialist bids, or share verified circular outcomes..."
                placeholderTextColor={theme.colors.labelTertiary}
                value={composerText}
                onChangeText={setComposerText}
                maxLength={280}
                autoFocus
                style={[
                  styles.composerTextInput,
                  { color: theme.colors.labelPrimary },
                ]}
              />

              {/* Tag @repair helper pill */}
              <View style={styles.helperRow}>
                <TouchableOpacity
                  onPress={() => {
                    if (!composerText.includes('@repair')) {
                      setComposerText((prev) => (prev ? `${prev} @repair ` : '@repair '));
                    }
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.tagHelperPill,
                    {
                      backgroundColor: isRepairBroadcastActive
                        ? 'rgba(0, 113, 227, 0.15)'
                        : theme.colors.fillSecondary,
                      borderColor: isRepairBroadcastActive ? '#0071E3' : 'transparent',
                      borderWidth: 1,
                    },
                  ]}
                >
                  <AppIcon name="construct" size={13} color={isRepairBroadcastActive ? '#0071E3' : theme.colors.labelSecondary} style={{ marginRight: 4 }} />
                  <AppText
                    variant="caption1"
                    weight="700"
                    customColor={isRepairBroadcastActive ? '#0071E3' : theme.colors.labelSecondary}
                  >
                    + Tag @repair
                  </AppText>
                </TouchableOpacity>

                <AppText variant="caption2" color="tertiary">
                  {280 - composerText.length} characters left
                </AppText>
              </View>

              {/* Broadcast Alert Box if @repair is present */}
              {isRepairBroadcastActive && (
                <View style={[styles.broadcastNoticeBox, { backgroundColor: 'rgba(0, 113, 227, 0.1)' }]}>
                  <AppIcon name="radio" size={16} color="#0071E3" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="footnote" weight="700" customColor="#0071E3">
                      Specialist Broadcast Active
                    </AppText>
                    <AppText variant="caption2" color="secondary" style={{ marginTop: 2 }}>
                      Tagging @repair will alert 48 verified electronics technicians in your region with this request.
                    </AppText>
                  </View>
                </View>
              )}

              {/* Hashtag options */}
              <View style={styles.tagOptionsRow}>
                {['RightToRepair', 'BatterySwap', 'ScreenFix', 'ZeroLandfill', 'Refurbished'].map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => setSelectedHashTag(tag)}
                    activeOpacity={0.7}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: selectedHashTag === tag ? theme.colors.tint : theme.colors.fillSecondary,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption2"
                      weight={selectedHashTag === tag ? '700' : '500'}
                      customColor={selectedHashTag === tag ? '#FFFFFF' : theme.colors.labelSecondary}
                    >
                      #{tag}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Comments Bottom Sheet / Modal */}
      <Modal visible={!!activePostForComments} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setActivePostForComments(null)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={[styles.composerHeader, { borderBottomColor: theme.colors.separator, borderBottomWidth: theme.hairlineWidth }]}>
              <TouchableOpacity onPress={() => setActivePostForComments(null)} activeOpacity={0.7}>
                <AppText variant="body" customColor={theme.colors.tint}>
                  Close
                </AppText>
              </TouchableOpacity>
              <AppText variant="headline" weight="700" color="primary">
                Responses ({activePostForComments?.comments?.length || 0})
              </AppText>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {/* Original Post Snippet */}
              {activePostForComments && (
                <View
                  style={[
                    styles.postSnippet,
                    {
                      backgroundColor: theme.colors.secondaryBackground,
                      borderColor: theme.colors.separator,
                      borderWidth: theme.hairlineWidth,
                    },
                  ]}
                >
                  <AppText variant="subheadline" weight="700" color="primary">
                    {activePostForComments.author.name}
                  </AppText>
                  <AppText variant="footnote" color="secondary" style={{ marginTop: 4 }}>
                    {activePostForComments.content}
                  </AppText>
                </View>
              )}

              {/* Comment Thread */}
              {activePostForComments?.comments && activePostForComments.comments.length > 0 ? (
                activePostForComments.comments.map((comment) => (
                  <View
                    key={comment.id}
                    style={[
                      styles.commentCard,
                      {
                        backgroundColor: theme.colors.secondaryBackground,
                        borderColor: theme.colors.separator,
                        borderWidth: theme.hairlineWidth,
                      },
                    ]}
                  >
                    <View style={styles.commentHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AppText variant="footnote" weight="700" color="primary">
                          {comment.author.name}
                        </AppText>
                        {comment.author.isVerified && (
                          <AppIcon name="checkmark-circle" size={13} color="#0071E3" style={{ marginLeft: 3 }} />
                        )}
                        <AppText variant="caption2" color="tertiary" style={{ marginLeft: 6 }}>
                          {comment.createdAt}
                        </AppText>
                      </View>
                      <AppText variant="caption2" weight="700" customColor="#0071E3">
                        {comment.author.roleLabel}
                      </AppText>
                    </View>
                    <AppText variant="footnote" color="primary" style={{ marginTop: 6, lineHeight: 19 }}>
                      {comment.content}
                    </AppText>
                  </View>
                ))
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <AppIcon name="chatbubbles-outline" size={32} color={theme.colors.labelTertiary} />
                  <AppText variant="footnote" color="secondary" style={{ marginTop: 8 }}>
                    No responses yet. Be the first to share advice!
                  </AppText>
                </View>
              )}
            </ScrollView>

            {/* Comment Input Footer */}
            <View
              style={[
                styles.commentInputRow,
                {
                  backgroundColor: theme.colors.secondaryBackground,
                  borderTopColor: theme.colors.separator,
                  borderTopWidth: theme.hairlineWidth,
                },
              ]}
            >
              <TextInput
                placeholder="Write a response or quote..."
                placeholderTextColor={theme.colors.labelTertiary}
                value={newCommentText}
                onChangeText={setNewCommentText}
                style={[
                  styles.commentTextInput,
                  {
                    backgroundColor: theme.colors.fillSecondary,
                    color: theme.colors.labelPrimary,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!newCommentText.trim()}
                activeOpacity={0.8}
                style={[
                  styles.commentSendButton,
                  {
                    backgroundColor: newCommentText.trim() ? theme.colors.tint : theme.colors.fill,
                  },
                ]}
              >
                <AppIcon
                  name="send"
                  size={16}
                  color={newCommentText.trim() ? '#FFFFFF' : theme.colors.labelTertiary}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  composeHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  tabBar: {
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabButtonActive: {},
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '60%',
    borderRadius: 1.5,
  },
  repairHelpBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 4,
  },
  feedScroll: {
    paddingTop: 8,
  },
  repairBannerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    padding: 12,
  },
  postCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  postRow: {
    flexDirection: 'row',
  },
  avatarColumn: {
    marginRight: 12,
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentColumn: {
    flex: 1,
  },
  authorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  rolePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  broadcastCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  deviceModelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  postBodyText: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
  },
  hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
    paddingTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionCount: {
    marginLeft: 5,
    fontSize: 12,
  },
  fabButton: {
    position: 'absolute',
    bottom: 96,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  composerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  submitPostButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  composerBody: {
    padding: 16,
    flex: 1,
  },
  composerTextInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tagHelperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  broadcastNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  tagOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  postSnippet: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  commentCard: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  commentTextInput: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  commentSendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { CommunityPost, CommunityFeedTab, CommunityComment } from '../types/community.types';

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: {
      id: 'usr-1',
      name: 'Aditi Sharma',
      username: 'aditi_circ',
      role: 'user',
      roleLabel: 'Citizen Member',
      isVerified: true,
      avatarInitials: 'AS',
    },
    content: 'My MacBook Air M1 screen has backlight bleed and won\'t wake after a fall. @repair technicians, what are my options in Indiranagar before I consider buying a replacement? #RightToRepair',
    createdAt: '12m ago',
    feedType: 'repair_help',
    tags: ['RightToRepair', 'MacBook', 'DisplayFix'],
    deviceModel: 'Apple MacBook Air M1 (2020)',
    hasRepairBroadcast: true,
    repairSpecialistsNotifiedCount: 42,
    likesCount: 18,
    commentsCount: 3,
    repostsCount: 5,
    isLiked: false,
    isBookmarked: true,
    comments: [
      {
        id: 'c-1',
        postId: 'post-1',
        author: {
          id: 'pro-1',
          name: 'ElectroFix Hub',
          username: 'electrofix_blr',
          role: 'repair_pro',
          roleLabel: 'Verified Repair Specialist',
          isVerified: true,
          avatarInitials: 'EF',
        },
        content: 'Hi Aditi! Received the @repair broadcast. Backlight inverter cable fault is common on M1s. We can repair the flex cable without replacing the entire display panel (approx ₹3,500 vs ₹18,000 for full panel). Drop by our Indiranagar workshop!',
        createdAt: '8m ago',
        likesCount: 12,
      },
      {
        id: 'c-2',
        postId: 'post-1',
        author: {
          id: 'pro-2',
          name: 'Suresh Kumar',
          username: 'suresh_repairs',
          role: 'repair_pro',
          roleLabel: 'Accredited Board Specialist',
          isVerified: true,
          avatarInitials: 'SK',
        },
        content: 'We also carry OEM Grade A panels with 6-month warranty if the panel digitizer is cracked. Check our verified Circuvio profile for customer reviews.',
        createdAt: '4m ago',
        likesCount: 6,
      },
    ],
  },
  {
    id: 'post-2',
    author: {
      id: 'pro-1',
      name: 'ElectroFix Hub',
      username: 'electrofix_blr',
      role: 'repair_pro',
      roleLabel: 'Verified Repair Specialist',
      isVerified: true,
      avatarInitials: 'EF',
    },
    content: 'Microscope level repair completed today on an iPhone 12 logic board that suffered water ingress. Cleaned ultrasonic corrosion, re-soldered power IC, saved 128GB of family photos. Don\'t discard wet devices—prompt rescue works! 🔬📱',
    createdAt: '1h ago',
    feedType: 'for_you',
    tags: ['MicroSoldering', 'BoardRepair', 'ZeroLandfill'],
    deviceModel: 'iPhone 12 Pro (Pacific Blue)',
    hasRepairBroadcast: false,
    likesCount: 84,
    commentsCount: 12,
    repostsCount: 22,
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: 'post-3',
    author: {
      id: 'rec-1',
      name: 'GreenEarth Recyclers',
      username: 'greenearth_ewaste',
      role: 'recycler',
      roleLabel: 'Authorized Zero-Landfill Recycler',
      isVerified: true,
      avatarInitials: 'GE',
    },
    content: 'Weekly milestone: 620 kg of end-of-life laptops and battery packs neutralized this week in Bangalore. Extracted 82g of gold, 14kg of high-purity copper, and zero hazardous slag to landfill. Track your batch on Circuvio passports! 🌿',
    createdAt: '3h ago',
    feedType: 'for_you',
    tags: ['EwasteRecycling', 'UrbanMining', 'CarbonOffset'],
    hasRepairBroadcast: false,
    likesCount: 142,
    commentsCount: 9,
    repostsCount: 38,
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: 'post-4',
    author: {
      id: 'biz-1',
      name: 'RenewTech Solutions',
      username: 'renewtech_official',
      role: 'business',
      roleLabel: 'Certified Refurbisher',
      isVerified: true,
      avatarInitials: 'RT',
    },
    content: 'Just listed 25 corporate lease return ThinkPad T14 Gen 2 units in the Circuvio Explore marketplace. Fully serviced with new thermal paste, 100% battery test certificates, and 1-year warranty. 65% cheaper than brand new! 💻⚡',
    createdAt: '5h ago',
    feedType: 'following',
    tags: ['Refurbished', 'ThinkPad', 'CircularEconomy'],
    deviceModel: 'Lenovo ThinkPad T14 Gen 2',
    hasRepairBroadcast: false,
    likesCount: 67,
    commentsCount: 5,
    repostsCount: 14,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 'post-5',
    author: {
      id: 'usr-2',
      name: 'Rohan Mehta',
      username: 'rohan_tech',
      role: 'user',
      roleLabel: 'Citizen Member',
      isVerified: false,
      avatarInitials: 'RM',
    },
    content: 'Need guidance: My Galaxy S20 battery health is down to 68%. The Circuvio valuation terminal suggested battery replacement (₹1,800) vs selling as-is (₹8,500). Anyone know a trusted specialist in Koramangala? @repair',
    createdAt: '6h ago',
    feedType: 'repair_help',
    tags: ['GalaxyS20', 'BatteryHealth', 'Advice'],
    deviceModel: 'Samsung Galaxy S20 5G',
    hasRepairBroadcast: true,
    repairSpecialistsNotifiedCount: 38,
    likesCount: 29,
    commentsCount: 7,
    repostsCount: 3,
    isLiked: false,
    isBookmarked: false,
  },
];

let postsState: CommunityPost[] = [...INITIAL_POSTS];

export function getPosts(feed: CommunityFeedTab): CommunityPost[] {
  if (feed === 'repair_help') {
    return postsState.filter((p) => p.hasRepairBroadcast || p.feedType === 'repair_help');
  }
  if (feed === 'following') {
    return postsState.filter((p) => p.feedType === 'following' || p.author.isVerified);
  }
  return postsState;
}

export function createPost(
  content: string,
  options?: {
    tags?: string[];
    deviceModel?: string;
    currentUser?: { name: string; username: string; role?: any };
  }
): CommunityPost {
  const hasRepairTag = Boolean(
    content.toLowerCase().includes('@repair') ||
      options?.tags?.some((t) => t.toLowerCase().includes('repair'))
  );

  const newPost: CommunityPost = {
    id: `post-${Date.now()}`,
    author: {
      id: 'current-user',
      name: options?.currentUser?.name || 'You',
      username: options?.currentUser?.username || 'current_user',
      role: (options?.currentUser?.role as any) || 'user',
      roleLabel: 'Citizen Member',
      isVerified: true,
      avatarInitials: (options?.currentUser?.name || 'ME').substring(0, 2).toUpperCase(),
    },
    content,
    createdAt: 'Just now',
    feedType: hasRepairTag ? 'repair_help' : 'for_you',
    tags: options?.tags || ['Circuvio'],
    deviceModel: options?.deviceModel,
    hasRepairBroadcast: hasRepairTag,
    repairSpecialistsNotifiedCount: hasRepairTag ? 48 : 0,
    likesCount: 0,
    commentsCount: 0,
    repostsCount: 0,
    isLiked: false,
    isBookmarked: false,
    comments: [],
  };

  postsState = [newPost, ...postsState];
  return newPost;
}

export function togglePostLike(postId: string): boolean {
  const post = postsState.find((p) => p.id === postId);
  if (!post) return false;
  post.isLiked = !post.isLiked;
  post.likesCount += post.isLiked ? 1 : -1;
  return post.isLiked;
}

export function togglePostBookmark(postId: string): boolean {
  const post = postsState.find((p) => p.id === postId);
  if (!post) return false;
  post.isBookmarked = !post.isBookmarked;
  return !!post.isBookmarked;
}

export function addComment(
  postId: string,
  content: string,
  authorName: string = 'You',
  authorUsername: string = 'current_user'
): CommunityComment | null {
  const post = postsState.find((p) => p.id === postId);
  if (!post) return null;

  const comment: CommunityComment = {
    id: `c-${Date.now()}`,
    postId,
    author: {
      id: 'usr-me',
      name: authorName,
      username: authorUsername,
      role: 'user',
      roleLabel: 'Citizen Member',
      isVerified: true,
      avatarInitials: authorName.substring(0, 2).toUpperCase(),
    },
    content,
    createdAt: 'Just now',
    likesCount: 0,
  };

  if (!post.comments) {
    post.comments = [];
  }
  post.comments.push(comment);
  post.commentsCount = post.comments.length;
  return comment;
}

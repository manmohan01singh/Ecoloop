import sequelize from '../config/database.js';
import User from './User.js';
import Device from './Device.js';
import Community from './Community.js';
import CommunityMember from './CommunityMember.js';
import Post from './Post.js';
import PostVote from './PostVote.js';
import Comment from './Comment.js';
import Listing from './Listing.js';
import ListingRequest from './ListingRequest.js';
import Location from './Location.js';
import Provider from './Provider.js';
import RepairRequest from './RepairRequest.js';
import Challenge from './Challenge.js';
import ChallengeParticipant from './ChallengeParticipant.js';
import Event from './Event.js';
import EventParticipant from './EventParticipant.js';
import Report from './Report.js';
import Notification from './Notification.js';
import EcoKarma from './EcoKarma.js';
import WasteDeposit from './WasteDeposit.js';
import BusinessMaterial from './BusinessMaterial.js';
import MaterialRequest from './MaterialRequest.js';
import Review from './Review.js';

// ── User ↔ Device ──────────────────────────────────────────────
User.hasMany(Device, { foreignKey: 'userId', as: 'devices' });
Device.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Community ──────────────────────────────────────────────────
User.hasMany(Community, { foreignKey: 'createdById', as: 'createdCommunities' });
Community.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

Community.hasMany(CommunityMember, { foreignKey: 'communityId', as: 'members' });
CommunityMember.belongsTo(Community, { foreignKey: 'communityId', as: 'community' });
User.hasMany(CommunityMember, { foreignKey: 'userId', as: 'communityMemberships' });
CommunityMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Posts ──────────────────────────────────────────────────────
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Community.hasMany(Post, { foreignKey: 'communityId', as: 'posts' });
Post.belongsTo(Community, { foreignKey: 'communityId', as: 'community' });

Post.hasMany(PostVote, { foreignKey: 'postId', as: 'votes' });
PostVote.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
User.hasMany(PostVote, { foreignKey: 'userId', as: 'postVotes' });
PostVote.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Comments ───────────────────────────────────────────────────
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });

// ── Listings ───────────────────────────────────────────────────
User.hasMany(Listing, { foreignKey: 'userId', as: 'listings' });
Listing.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Listing.hasMany(ListingRequest, { foreignKey: 'listingId', as: 'requests' });
ListingRequest.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });
User.hasMany(ListingRequest, { foreignKey: 'requesterId', as: 'listingRequests' });
ListingRequest.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });

// ── Locations ──────────────────────────────────────────────────
User.hasMany(Location, { foreignKey: 'submittedById', as: 'submittedLocations' });
Location.belongsTo(User, { foreignKey: 'submittedById', as: 'submittedBy' });

// ── Providers ──────────────────────────────────────────────────
User.hasOne(Provider, { foreignKey: 'userId', as: 'provider' });
Provider.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Repair Requests ────────────────────────────────────────────
User.hasMany(RepairRequest, { foreignKey: 'userId', as: 'repairRequests' });
RepairRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Provider.hasMany(RepairRequest, { foreignKey: 'providerId', as: 'repairJobs' });
RepairRequest.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });

// ── Challenges ─────────────────────────────────────────────────
User.hasMany(Challenge, { foreignKey: 'createdById', as: 'createdChallenges' });
Challenge.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });
Challenge.hasMany(ChallengeParticipant, { foreignKey: 'challengeId', as: 'participants' });
ChallengeParticipant.belongsTo(Challenge, { foreignKey: 'challengeId', as: 'challenge' });
User.hasMany(ChallengeParticipant, { foreignKey: 'userId', as: 'challengeParticipations' });
ChallengeParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Events ─────────────────────────────────────────────────────
User.hasMany(Event, { foreignKey: 'createdById', as: 'createdEvents' });
Event.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });
Community.hasMany(Event, { foreignKey: 'communityId', as: 'events' });
Event.belongsTo(Community, { foreignKey: 'communityId', as: 'community' });
Event.hasMany(EventParticipant, { foreignKey: 'eventId', as: 'participants' });
EventParticipant.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
User.hasMany(EventParticipant, { foreignKey: 'userId', as: 'eventParticipations' });
EventParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Reports ────────────────────────────────────────────────────
User.hasMany(Report, { foreignKey: 'reporterId', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });

// ── Notifications ──────────────────────────────────────────────
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── EcoKarma ───────────────────────────────────────────────────
User.hasMany(EcoKarma, { foreignKey: 'userId', as: 'karmaLogs' });
EcoKarma.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Waste Deposits ─────────────────────────────────────────────
User.hasMany(WasteDeposit, { foreignKey: 'userId', as: 'wasteDeposits' });
WasteDeposit.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Provider.hasMany(WasteDeposit, { foreignKey: 'providerId', as: 'deposits' });
WasteDeposit.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });

// ── Business Materials ─────────────────────────────────────────
User.hasMany(BusinessMaterial, { foreignKey: 'userId', as: 'businessMaterials' });
BusinessMaterial.belongsTo(User, { foreignKey: 'userId', as: 'user' });
BusinessMaterial.hasMany(MaterialRequest, { foreignKey: 'materialId', as: 'requests' });
MaterialRequest.belongsTo(BusinessMaterial, { foreignKey: 'materialId', as: 'material' });
User.hasMany(MaterialRequest, { foreignKey: 'requesterId', as: 'materialRequests' });
MaterialRequest.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });

// ── Reviews ────────────────────────────────────────────────────
User.hasMany(Review, { foreignKey: 'reviewerId', as: 'givenReviews' });
Review.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });
User.hasMany(Review, { foreignKey: 'revieweeId', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'revieweeId', as: 'reviewee' });

export {
  User, Device,
  Community, CommunityMember,
  Post, PostVote, Comment,
  Listing, ListingRequest,
  Location, Provider, RepairRequest,
  Challenge, ChallengeParticipant,
  Event, EventParticipant,
  Report, Notification, EcoKarma,
  WasteDeposit, BusinessMaterial, MaterialRequest,
  Review,
};
export default sequelize;

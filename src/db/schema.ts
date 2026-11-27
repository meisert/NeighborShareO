import { boolean, integer, pgTable, text, timestamp, serial } from 'drizzle-orm/pg-core';

// Users table (identifying Firebase Auth UID as unique string)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  neighborhood: text('neighborhood').notNull(),
  zipCode: text('zip_code').notNull(),
  avatar: text('avatar').notNull(),
  bio: text('bio'),
  trustScore: integer('trust_score').default(100).notNull(),
  totalLends: integer('total_lends').default(0).notNull(),
  isVerifiedNeighbor: boolean('is_verified_neighbor').default(true).notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  isDemo: boolean('is_demo').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Community items listed for borrowing
export const items = pgTable('items', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  condition: text('condition').notNull(),
  description: text('description').notNull(),
  rules: text('rules'),
  dailyFee: integer('daily_fee').default(0).notNull(),
  refundableDeposit: integer('refundable_deposit').default(0).notNull(),
  depositNote: text('deposit_note'),
  neighborhood: text('neighborhood').notNull(),
  zipCode: text('zip_code').notNull(),
  imageUrl: text('image_url').notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  isDemo: boolean('is_demo').default(false).notNull(),
  lenderId: text('lender_id').notNull(),
  lenderName: text('lender_name').notNull(),
  lenderAvatar: text('lender_avatar').notNull(),
  lenderTrustScore: integer('lender_trust_score').default(100).notNull(),
  lenderTotalLends: integer('lender_total_lends').default(0).notNull(),
  lenderResponseTime: text('lender_response_time').default('within 15 mins').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Borrow and lending requests
export const borrowRequests = pgTable('borrow_requests', {
  id: text('id').primaryKey(),
  itemId: text('item_id').notNull(),
  itemTitle: text('item_title').notNull(),
  itemCategory: text('item_category').notNull(),
  itemImageUrl: text('item_image_url').notNull(),
  lenderId: text('lender_id').notNull(),
  lenderName: text('lender_name').notNull(),
  borrowerId: text('borrower_id').notNull(),
  borrowerName: text('borrower_name').notNull(),
  borrowerNeighborhood: text('borrower_neighborhood').notNull(),
  borrowerTrustScore: integer('borrower_trust_score').default(100).notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalDays: integer('total_days').notNull(),
  dailyFee: integer('daily_fee').default(0).notNull(),
  deposit: integer('deposit').default(0).notNull(),
  message: text('message').notNull(),
  pickupPreference: text('pickup_preference').notNull(),
  status: text('status').default('pending').notNull(),
  isDemo: boolean('is_demo').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Real-time coordination messages for item pickup / return
export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull(),
  senderId: text('sender_id').notNull(),
  senderName: text('sender_name').notNull(),
  senderRole: text('sender_role').notNull(),
  text: text('text').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Neighbor ISO (In Search Of) requests
export const isoRequests = pgTable('iso_requests', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  neededByDate: text('needed_by_date').notNull(),
  neighborhood: text('neighborhood').notNull(),
  zipCode: text('zip_code').notNull(),
  posterId: text('poster_id').notNull(),
  posterName: text('poster_name').notNull(),
  posterTrustScore: integer('poster_trust_score').default(100).notNull(),
  posterAvatar: text('poster_avatar').notNull(),
  responsesCount: integer('responses_count').default(0).notNull(),
  status: text('status').default('open').notNull(),
  isDemo: boolean('is_demo').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

import { pgTable, serial, text, timestamp, boolean, integer, decimal, varchar, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
    nonce: text("nonce"),
    name: text("name"),
    bio: text("bio"),
    website: text("website"),
    twitter: text("twitter"),
    spotify: text("spotify"),
    youtube: text("youtube"),
    tiktok: text("tiktok"),
    instagram: text("instagram"),
    profileImage: text("profile_image"),
    headerImage: text("header_image"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const follows = pgTable("follows", {
    id: serial("id").primaryKey(),
    followerId: integer("follower_id").references(() => users.id),
    followingId: integer("following_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    token: text("token").notNull(),
    isValid: boolean("is_valid").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const assets = pgTable("assets", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    thumbnail: text("thumbnail"),
    video: text("video"),
    tags: text("tags"), // Comma separated or JSON? Let's use text for now as per MD
    type: text("type").notNull(), // Music, Art, Video, Game Model
    licenseId: integer("license_id"), // Can be null if not yet set? Or references licenses table
    isRemixed: boolean("is_remixed").default(false),
    remixOf: integer("remix_of"), // References parent asset ID
    creationStatus: text("creation_status").default("draft"), // draft, live
    assetStatus: text("asset_status").default("new"), // buy now, auction, new
    tokenId: text("token_id"),
    // Bidding fields
    biddingEnabled: boolean("bidding_enabled").default(false),
    biddingStartPrice: decimal("bidding_start_price", { precision: 18, scale: 8 }),
    biddingDuration: integer("bidding_duration"), // Duration in seconds after first bid
    biddingStartedAt: timestamp("bidding_started_at"),
    biddingEndsAt: timestamp("bidding_ends_at"),
    biddingWinnerId: integer("bidding_winner_id").references(() => users.id),
    biddingStatus: text("bidding_status").default("pending"), // pending, active, ended, completed
    ownershipAccepted: boolean("ownership_accepted").default(false),
    deletionRequested: boolean("deletion_requested").default(false),
    // Agent status fields
    status: varchar("status", { length: 50 }).default("active"), // active, flagged, under_review
    flaggedAt: timestamp("flagged_at"),
    flaggedReason: text("flagged_reason"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const assetFiles = pgTable("asset_files", {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id").references(() => assets.id).notNull(),
    file: text("file").notNull(), // Encrypted URL
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const assetMetadata = pgTable("asset_metadata", {
    id: serial("id").primaryKey(),
    assetFileId: integer("asset_file_id").references(() => assetFiles.id).notNull(),
    fileType: text("file_type"),
    size: text("size"),
    contentHash: text("content_hash"),
    mimeType: text("mime_type"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const licenses = pgTable("licenses", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    price: decimal("price", { precision: 18, scale: 8 }).notNull(),
    royalty: integer("royalty").notNull(), // Percentage
    royaltyDuration: text("royalty_duration"), // e.g., "30 days", "unlimited"
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    assetId: integer("asset_id").references(() => assets.id).notNull(),
    transactionType: text("transaction_type").notNull(), // minted, remixed, sold, bought
    amount: decimal("amount", { precision: 18, scale: 8 }),
    tnxhash: text("tnxhash"),
    status: text("status").default("pending"), // pending, success, failed
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const bids = pgTable("bids", {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id").references(() => assets.id).notNull(),
    userId: integer("user_id").references(() => users.id).notNull(),
    amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
    tnxhash: text("tnxhash"),
    status: text("status").default("active"), // active, outbid, won, cancelled
    createdAt: timestamp("created_at").defaultNow(),
});

// Agent System Tables
export const assetFingerprints = pgTable("asset_fingerprints", {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id").references(() => assets.id).notNull(),
    fingerprint: varchar("fingerprint", { length: 255 }).notNull(),
    algorithm: varchar("algorithm", { length: 50 }).notNull(), // sha256, perceptual-hash
    fileSize: text("file_size"),
    mimeType: varchar("mime_type", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow(),
});

export const uploadMetadata = pgTable("upload_metadata", {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id").references(() => assets.id).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }), // IPv6 compatible
    country: varchar("country", { length: 2 }), // ISO country code
    city: varchar("city", { length: 100 }),
    userAgent: text("user_agent"),
    uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const agentScans = pgTable("agent_scans", {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id").references(() => assets.id).notNull(),
    scanType: varchar("scan_type", { length: 50 }).notNull(), // fingerprint, metadata
    status: varchar("status", { length: 50 }).notNull(), // pending, scanning, completed, flagged
    matchedAssetId: integer("matched_asset_id").references(() => assets.id),
    similarity: decimal("similarity", { precision: 5, scale: 2 }), // 0-100%
    flagReason: text("flag_reason"),
    scannedAt: timestamp("scanned_at").defaultNow(),
    completedAt: timestamp("completed_at"),
});

export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // flagged_content, duplicate_found, scan_complete
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    assetId: integer("asset_id").references(() => assets.id),
    read: boolean("read").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    assets: many(assets),
    followers: many(follows, { relationName: "followers" }),
    following: many(follows, { relationName: "following" }),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
    creator: one(users, {
        fields: [assets.userId],
        references: [users.id],
    }),
    files: many(assetFiles),
    transactions: many(transactions),
}));

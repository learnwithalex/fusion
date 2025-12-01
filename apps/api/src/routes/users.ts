import { Router } from "express";
import { db } from "../db";
import { users, follows, assets, transactions } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const router = Router();

// Search Users
router.get("/", async (req, res) => {
    const { search } = req.query;

    try {
        let query = db.select().from(users);

        if (search) {
            // @ts-ignore
            query = query.where(
                sql`${users.name} ILIKE ${`%${search}%`} OR ${users.walletAddress} ILIKE ${`%${search}%`}`
            );
        }

        const results = await query.limit(10);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to search users" });
    }
});

// Get current user's profile
router.get("/me", authenticate, async (req, res) => {
    const userId = req.user!.id;

    try {
        const user = await db.select().from(users).where(eq(users.id, userId));

        if (!user[0]) {
            return res.status(404).json({ error: "User not found" });
        }

        // Don't send nonce to client
        const { nonce, ...userData } = user[0];
        res.json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
});

// Update current user's profile
router.put("/me", authenticate, async (req, res) => {
    const userId = req.user!.id;
    const { name, bio, website, twitter, spotify, youtube, tiktok, instagram, profileImage, headerImage } = req.body;

    try {
        const updateData: any = { updatedAt: new Date() };

        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (website !== undefined) updateData.website = website;
        if (twitter !== undefined) updateData.twitter = twitter;
        if (spotify !== undefined) updateData.spotify = spotify;
        if (youtube !== undefined) updateData.youtube = youtube;
        if (tiktok !== undefined) updateData.tiktok = tiktok;
        if (instagram !== undefined) updateData.instagram = instagram;
        if (profileImage !== undefined) updateData.profileImage = profileImage;
        if (headerImage !== undefined) updateData.headerImage = headerImage;

        const [updatedUser] = await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning();

        const { nonce, ...userData } = updatedUser;
        res.json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update user profile" });
    }
});

// Get current user's statistics
router.get("/me/stats", authenticate, async (req, res) => {
    const userId = req.user!.id;

    try {
        // Count uploads
        const uploadsResult = await db.select({ count: sql<number>`count(*)` })
            .from(assets)
            .where(eq(assets.userId, userId));
        const uploads = Number(uploadsResult[0]?.count || 0);

        // Count licenses sold (transactions where user is the seller)
        const licensesResult = await db.select({ count: sql<number>`count(*)` })
            .from(transactions)
            .innerJoin(assets, eq(transactions.assetId, assets.id))
            .where(and(
                eq(assets.userId, userId),
                eq(transactions.transactionType, "bought")
            ));
        const licenses = Number(licensesResult[0]?.count || 0);

        // Calculate total earnings
        const earningsResult = await db.select({
            total: sql<string>`COALESCE(SUM(${transactions.amount}), '0')`
        })
            .from(transactions)
            .innerJoin(assets, eq(transactions.assetId, assets.id))
            .where(and(
                eq(assets.userId, userId),
                eq(transactions.transactionType, "bought")
            ));
        const earnings = earningsResult[0]?.total || "0";

        // TODO: Implement followers count when follower system is added
        const followers = 0;

        res.json({
            uploads,
            licenses,
            earnings: `${earnings} CAMP`,
            followers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch user statistics" });
    }
});

// Get current user's sales history
router.get("/me/sales", authenticate, async (req, res) => {
    const userId = req.user!.id;

    try {
        // Get all transactions where user sold something (their assets were bought)
        const salesData = await db.select({
            id: transactions.id,
            assetId: assets.id,
            assetName: assets.name,
            buyerAddress: users.walletAddress,
            amount: transactions.amount,
            transactionHash: transactions.tnxhash,
            createdAt: transactions.createdAt
        })
            .from(transactions)
            .innerJoin(assets, eq(transactions.assetId, assets.id))
            .leftJoin(users, eq(transactions.userId, users.id))
            .where(and(
                eq(assets.userId, userId),
                eq(transactions.transactionType, "bought")
            ))
            .orderBy(desc(transactions.createdAt));

        res.json({
            sales: salesData,
            total: salesData.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch sales history" });
    }
});

// Get current user's activity (all transactions)
router.get("/me/activity", authenticate, async (req, res) => {
    const userId = req.user!.id;
    const { limit = "20", offset = "0", type } = req.query;

    try {
        // Build query for user's transactions
        let query = db.select({
            id: transactions.id,
            transactionType: transactions.transactionType,
            assetId: assets.id,
            assetName: assets.name,
            amount: transactions.amount,
            from: sql<string>`COALESCE(${assets.userId}::text, 'system')`,
            to: users.walletAddress,
            transactionHash: transactions.tnxhash,
            blockNumber: sql<number>`0`, // Add when you have this field
            status: transactions.status,
            createdAt: transactions.createdAt
        })
            .from(transactions)
            .leftJoin(assets, eq(transactions.assetId, assets.id))
            .leftJoin(users, eq(transactions.userId, users.id))
            .where(eq(transactions.userId, userId));

        // Filter by type if specified
        if (type && typeof type === 'string') {
            // @ts-ignore
            query = query.where(eq(transactions.transactionType, type));
        }

        const activities = await query
            .orderBy(desc(transactions.createdAt))
            .limit(parseInt(limit as string))
            .offset(parseInt(offset as string));

        // Get total count
        const countResult = await db.select({ count: sql<number>`count(*)` })
            .from(transactions)
            .where(eq(transactions.userId, userId));

        const total = Number(countResult[0]?.count || 0);

        res.json({
            activities,
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch activity" });
    }
});


// Get Public Profile by Wallet Address
router.get("/:walletAddress", async (req, res) => {
    const { walletAddress } = req.params;

    try {
        const userResult = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
        const user = userResult[0];

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get stats
        const uploadsCount = await db.$count(assets, eq(assets.userId, user.id));

        // Real query for licenses sold
        const licensesSoldResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(transactions)
            .innerJoin(assets, eq(transactions.assetId, assets.id))
            .where(and(
                eq(assets.userId, user.id),
                eq(transactions.transactionType, 'bought')
            ));

        const licensesSold = Number(licensesSoldResult[0]?.count || 0);

        res.json({ ...user, stats: { uploads: uploadsCount, licensesSold } });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// Update Profile
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, bio, website, twitter, spotify, youtube, tiktok, instagram, profileImage, headerImage } = req.body;

    try {
        await db.update(users)
            .set({ name, bio, website, twitter, spotify, youtube, tiktok, instagram, profileImage, headerImage, updatedAt: new Date() })
            .where(eq(users.id, parseInt(id)));

        const updatedUser = await db.select().from(users).where(eq(users.id, parseInt(id)));
        res.json(updatedUser[0]);
    } catch (error) {
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// Follow User
// Follow User
router.post("/:id/follow", authenticate, async (req, res) => {
    const { id } = req.params; // User to follow
    const followerId = req.user!.id;

    if (parseInt(id) === followerId) {
        return res.status(400).json({ error: "Cannot follow yourself" });
    }

    try {
        // Check if already following
        const existingFollow = await db.select().from(follows).where(
            and(
                eq(follows.followerId, followerId),
                eq(follows.followingId, parseInt(id))
            )
        );

        if (existingFollow.length > 0) {
            return res.json({ success: true, message: "Already following" });
        }

        await db.insert(follows).values({
            followerId: followerId,
            followingId: parseInt(id),
        });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to follow user" });
    }
});

// Unfollow User
// Unfollow User
router.delete("/:id/follow", authenticate, async (req, res) => {
    const { id } = req.params;
    const followerId = req.user!.id;

    try {
        await db.delete(follows).where(
            and(
                eq(follows.followerId, followerId),
                eq(follows.followingId, parseInt(id))
            )
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to unfollow user" });
    }
});

// Check if following
router.get("/:id/is-following", authenticate, async (req, res) => {
    const { id } = req.params;
    const followerId = req.user!.id;

    try {
        const follow = await db.select().from(follows).where(
            and(
                eq(follows.followerId, followerId),
                eq(follows.followingId, parseInt(id))
            )
        );

        res.json({ isFollowing: follow.length > 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to check follow status" });
    }
});

// Get Created Assets
router.get("/:id/assets/created", async (req, res) => {
    const { id } = req.params;
    try {
        const userAssets = await db.select().from(assets)
            .where(and(
                eq(assets.userId, parseInt(id)),
                eq(assets.creationStatus, "live") // Only show live assets
            ));
        res.json(userAssets);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch created assets" });
    }
});

// Get Licensed Assets (Assets bought by user)
router.get("/:id/assets/licensed", async (req, res) => {
    const { id } = req.params;
    try {
        // Join transactions and assets to find assets bought by user
        const licensedAssets = await db
            .select({
                id: assets.id,
                userId: assets.userId,
                name: assets.name,
                description: assets.description,
                thumbnail: assets.thumbnail,
                video: assets.video,
                tags: assets.tags,
                type: assets.type,
                licenseId: assets.licenseId,
                isRemixed: assets.isRemixed,
                remixOf: assets.remixOf,
                creationStatus: assets.creationStatus,
                assetStatus: assets.assetStatus,
                tokenId: assets.tokenId,
                createdAt: assets.createdAt,
                updatedAt: assets.updatedAt
            })
            .from(assets)
            .innerJoin(transactions, eq(assets.id, transactions.assetId))
            .where(and(
                eq(transactions.userId, parseInt(id)),
                eq(transactions.transactionType, 'bought')
            ));

        res.json(licensedAssets);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch licensed assets" });
    }
});

// Get Activity
router.get("/:id/activity", async (req, res) => {
    const { id } = req.params;
    try {
        const activity = await db.select().from(transactions)
            .where(eq(transactions.userId, parseInt(id)))
            .orderBy(desc(transactions.createdAt));
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch activity" });
    }
});

export default router;

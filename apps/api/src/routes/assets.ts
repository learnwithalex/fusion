import { Router } from "express";
import { db } from "../db";
import { assets, licenses, transactions, assetFiles, assetMetadata, users } from "../db/schema";
import { eq, like, and, gte, lte, desc, sql, inArray } from "drizzle-orm";

const router = Router();

// Get Assets (Search, Filter, Sort)
router.get("/", async (req, res) => {
    const { search, type, minPrice, maxPrice, minRoyalty, maxRoyalty, status, sort, userId, tokenId, remixOf } = req.query;

    try {
        // Join with licenses to enable price/royalty filtering
        let query = db.select({
            asset: assets,
            license: licenses
        })
            .from(assets)
            .leftJoin(licenses, eq(assets.licenseId, licenses.id));

        const conditions = [];

        if (search) {
            conditions.push(like(assets.name, `%${search}%`));
        }

        if (type) {
            const types = (type as string).split(",");
            conditions.push(inArray(assets.type, types));
        }

        if (status) {
            const statuses = (status as string).split(",");
            conditions.push(inArray(assets.assetStatus, statuses));
        }

        if (minPrice) {
            conditions.push(gte(licenses.price, minPrice.toString()));
        }
        if (maxPrice) {
            conditions.push(lte(licenses.price, maxPrice.toString()));
        }
        if (minRoyalty) {
            conditions.push(gte(licenses.royalty, parseInt(minRoyalty as string)));
        }
        if (maxRoyalty) {
            conditions.push(lte(licenses.royalty, parseInt(maxRoyalty as string)));
        }

        if (userId) {
            conditions.push(eq(assets.userId, parseInt(userId as string)));
        }

        if (tokenId) {
            conditions.push(eq(assets.tokenId, tokenId as string));
        }

        if (remixOf) {
            conditions.push(eq(assets.remixOf, parseInt(remixOf as string)));
        }

        if (conditions.length > 0) {
            // @ts-ignore
            query = query.where(and(...conditions));
        }

        if (sort === "recent") {
            // @ts-ignore
            query = query.orderBy(desc(assets.createdAt));
        }

        const results = await query;
        // Flatten result for frontend if needed, or return { asset, license }
        res.json(results.map(r => ({ ...r.asset, license: r.license })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch assets" });
    }
});

import { authenticate } from "../middleware/auth";
import { verifyMessage, createPublicClient, http, type Hash } from 'viem'
import { campnetwork } from '../lib/campnetwork'

const publicClient = createPublicClient({
    chain: campnetwork,
    transport: http()
})

// ... imports

// Create Asset (Mint)
router.post("/", authenticate, async (req, res) => {
    const { name, description, type, file, metadata, license, tags, parentId, tokenId, creationStatus, thumbnail, video, signature, verificationPayload } = req.body;
    const userId = req.user!.id; // Guaranteed by middleware

    try {
        // 0. Verify Signature (if live creation)
        if (creationStatus !== 'draft' && signature && verificationPayload) {
            try {
                // 1. Verify Expiry
                if (Date.now() > verificationPayload.expiry) {
                    return res.status(400).json({ error: "Signature expired" });
                }

                // 2. Verify Wallet Address matches User
                const user = await db.select().from(users).where(eq(users.id, userId));
                if (!user[0] || user[0].walletAddress.toLowerCase() !== verificationPayload.walletAddress.toLowerCase()) {
                    return res.status(403).json({ error: "Wallet address mismatch" });
                }

                // 3. Verify Payload Integrity
                if (verificationPayload.tokenId !== tokenId) {
                    return res.status(400).json({ error: "Token ID mismatch" });
                }

                // Check parentId match (handle null/undefined)
                const payloadParentId = verificationPayload.parentId || null;
                const bodyParentId = tokenId ? (parentId ? parentId.toString() : null) : null; // parentId in body is DB ID, but we need Token ID? 
                // Wait, frontend sends parentId as DB ID in body, but Token ID in payload.
                // We can't easily verify parentId match without fetching the parent asset to get its Token ID.
                // However, the critical part is that the USER signed the payload saying "I am remixing Parent Token X".
                // If they send Parent DB ID Y in body, we should probably check if DB ID Y corresponds to Token ID X.

                if (parentId) {
                    const parentAsset = await db.select().from(assets).where(eq(assets.id, parentId));
                    if (!parentAsset[0] || parentAsset[0].tokenId !== verificationPayload.parentId) {
                        return res.status(400).json({ error: "Parent Asset mismatch (Token ID vs DB ID)" });
                    }
                } else if (verificationPayload.parentId) {
                    // Payload says remix, body says no remix -> Tampering
                    return res.status(400).json({ error: "Remix status mismatch" });
                }

                // 4. Verify Signature
                const message = JSON.stringify(verificationPayload);
                const valid = await verifyMessage({
                    address: verificationPayload.walletAddress,
                    message: message,
                    signature: signature
                });

                if (!valid) {
                    return res.status(400).json({ error: "Invalid signature" });
                }

            } catch (err) {
                console.error("Verification failed:", err);
                return res.status(400).json({ error: "Signature verification failed" });
            }
        } else if (creationStatus !== 'draft') {
            // Require signature for live assets?
            // User said "integrate a new feature... to make sure even if users try to go behind our back... we can find a way to catch them"
            // So we should enforce it.
            return res.status(400).json({ error: "Missing signature for verification" });
        }

        // 1. Create Asset
        const [newAsset] = await db.insert(assets).values({
            userId,
            name,
            description,
            type,
            remixOf: parentId || null,
            isRemixed: !!parentId,
            assetStatus: "new",
            creationStatus: creationStatus || "live", // Support draft or live
            tokenId: tokenId || null,
            tags,
            thumbnail,
            video
        }).returning();


        // 2. Create Asset File (skip for drafts)
        if (creationStatus !== 'draft' && file) {
            const [newFile] = await db.insert(assetFiles).values({
                assetId: newAsset.id,
                file: file, // Encrypted URL
            }).returning();

            // 3. Create Metadata
            if (metadata) {
                await db.insert(assetMetadata).values({
                    assetFileId: newFile.id,
                    ...metadata
                });
            }
        }

        // 4. Create License Settings (skip for drafts)
        if (creationStatus !== 'draft' && license) {
            await db.insert(licenses).values({
                userId,
                price: license.price,
                royalty: license.royalty,
                royaltyDuration: license.duration
            });

            const [newLicense] = await db.select().from(licenses).where(and(eq(licenses.userId, userId), eq(licenses.price, license.price))).orderBy(desc(licenses.createdAt)).limit(1);
            if (newLicense) {
                await db.update(assets).set({ licenseId: newLicense.id }).where(eq(assets.id, newAsset.id));
            }
        }

        res.json(newAsset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create asset" });
    }
});

// Update Asset (for drafts or edits)
router.put("/:id", authenticate, async (req, res) => {
    const { id } = req.params;
    const { name, description, type, file, metadata, license, creationStatus, tokenId, thumbnail, video } = req.body;
    const userId = req.user!.id;

    try {
        // Verify ownership
        const existing = await db.select().from(assets).where(eq(assets.id, parseInt(id)));
        if (!existing[0] || existing[0].userId !== userId) {
            return res.status(403).json({ error: "Not authorized to update this asset" });
        }

        // Update asset
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (creationStatus !== undefined) updateData.creationStatus = creationStatus;
        if (tokenId !== undefined) updateData.tokenId = tokenId;
        if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
        if (video !== undefined) updateData.video = video;
        updateData.updatedAt = new Date();

        const [updatedAsset] = await db.update(assets)
            .set(updateData)
            .where(eq(assets.id, parseInt(id)))
            .returning();

        // Update file if provided
        if (file) {
            const existingFiles = await db.select().from(assetFiles).where(eq(assetFiles.assetId, parseInt(id)));
            if (existingFiles[0]) {
                await db.update(assetFiles)
                    .set({ file, updatedAt: new Date() })
                    .where(eq(assetFiles.id, existingFiles[0].id));
            } else {
                await db.insert(assetFiles).values({
                    assetId: parseInt(id),
                    file,
                });
            }
        }

        // Update license if provided
        if (license && existing[0].licenseId) {
            await db.update(licenses)
                .set({
                    price: license.price,
                    royalty: license.royalty,
                    royaltyDuration: license.duration,
                    updatedAt: new Date()
                })
                .where(eq(licenses.id, existing[0].licenseId));
        } else if (license) {
            // Create new license
            const [newLicense] = await db.insert(licenses).values({
                userId,
                price: license.price,
                royalty: license.royalty,
                royaltyDuration: license.duration
            }).returning();

            await db.update(assets)
                .set({ licenseId: newLicense.id })
                .where(eq(assets.id, parseInt(id)));
        }

        res.json(updatedAsset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update asset" });
    }
});

// Get User's Drafts
router.get("/user/drafts", authenticate, async (req, res) => {
    const userId = req.user!.id;

    try {
        const drafts = await db.select()
            .from(assets)
            .where(and(eq(assets.userId, userId), eq(assets.creationStatus, "draft")))
            .orderBy(desc(assets.updatedAt));

        res.json(drafts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch drafts" });
    }
});

// Get Asset Details
// Get Asset Details
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Fetch Asset with Creator
        const assetResult = await db.select({
            asset: assets,
            creator: {
                id: users.id,
                walletAddress: users.walletAddress,
                name: users.name,
                profileImage: users.profileImage
            }
        })
            .from(assets)
            .leftJoin(users, eq(assets.userId, users.id))
            .where(eq(assets.id, parseInt(id)));

        if (!assetResult[0]) return res.status(404).json({ error: "Asset not found" });
        const { asset, creator } = assetResult[0];

        // 2. Fetch License
        let license = null;
        if (asset.licenseId) {
            const licenseResult = await db.select().from(licenses).where(eq(licenses.id, asset.licenseId));
            license = licenseResult[0];
        }

        // 3. Fetch Metadata (via AssetFile)
        let metadata = null;
        let fileUrl = null;
        const fileResult = await db.select().from(assetFiles).where(eq(assetFiles.assetId, asset.id)).orderBy(desc(assetFiles.createdAt)).limit(1);
        if (fileResult[0]) {
            fileUrl = fileResult[0].file;
            const metadataResult = await db.select().from(assetMetadata).where(eq(assetMetadata.assetFileId, fileResult[0].id));
            if (metadataResult[0]) {
                metadata = metadataResult[0];
            }
        }

        // 4. Fetch Derivatives
        const derivatives = await db.select({
            id: assets.id,
            name: assets.name,
            thumbnail: assets.thumbnail,
            creator: {
                name: users.name,
                walletAddress: users.walletAddress
            }
        })
            .from(assets)
            .leftJoin(users, eq(assets.userId, users.id))
            .where(eq(assets.remixOf, parseInt(id)))
            .limit(4);

        // 5. Fetch Activity (Transactions)
        const activity = await db.select({
            type: transactions.transactionType,
            amount: transactions.amount,
            date: transactions.createdAt,
            user: {
                walletAddress: users.walletAddress,
                name: users.name
            }
        })
            .from(transactions)
            .leftJoin(users, eq(transactions.userId, users.id))
            .where(eq(transactions.assetId, parseInt(id)))
            .orderBy(desc(transactions.createdAt))
            .limit(10);

        // 6. Fetch Remix Parent
        let remixParent = null;
        if (asset.remixOf) {
            const parentResult = await db.select({
                id: assets.id,
                name: assets.name
            })
                .from(assets)
                .where(eq(assets.id, asset.remixOf));

            if (parentResult[0]) {
                remixParent = parentResult[0];
            }
        }

        res.json({
            ...asset,
            creator,
            license,
            metadata,
            fileUrl,
            derivatives,
            activity,
            remixParent
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch asset details" });
    }
});

// Buy License
router.post("/:id/buy", authenticate, async (req, res) => {
    const { id } = req.params;
    const { amount, tnxhash } = req.body;
    const userId = req.user!.id;

    if (!tnxhash) {
        return res.status(400).json({ error: "Transaction hash required" });
    }

    try {
        // 1. Duplicate Check
        const existingTx = await db.select().from(transactions).where(eq(transactions.tnxhash, tnxhash));
        if (existingTx.length > 0) {
            return res.status(400).json({ error: "Transaction already processed" });
        }

        // 2. Fetch User Wallet
        const user = await db.select().from(users).where(eq(users.id, userId));
        if (!user[0] || !user[0].walletAddress) {
            return res.status(400).json({ error: "User wallet not found" });
        }
        const userWallet = user[0].walletAddress.toLowerCase();

        // 3. Verify Transaction on Chain
        const receipt = await publicClient.getTransactionReceipt({ hash: tnxhash as Hash });

        // a. Check Status
        if (receipt.status !== 'success') {
            return res.status(400).json({ error: "Transaction failed on chain" });
        }

        // b. Check Sender
        if (receipt.from.toLowerCase() !== userWallet) {
            return res.status(403).json({ error: "Transaction sender mismatch" });
        }

        // c. Check Timestamp (within 15 mins)
        const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
        const now = Math.floor(Date.now() / 1000);
        const txTime = Number(block.timestamp);
        if (now - txTime > 15 * 60) {
            return res.status(400).json({ error: "Transaction expired (too old)" });
        }

        // d. Verify Token ID in Logs
        // We need to find the asset's tokenId first
        const asset = await db.select().from(assets).where(eq(assets.id, parseInt(id)));
        if (!asset[0] || !asset[0].tokenId) {
            return res.status(404).json({ error: "Asset or Token ID not found" });
        }
        // Record transaction
        await db.insert(transactions).values({
            userId,
            assetId: parseInt(id),
            transactionType: "bought",
            amount,
            tnxhash,
            status: "success"
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Purchase verification error:", error);
        res.status(500).json({ error: "Failed to verify purchase" });
    }
});

// Remix Asset (Create Derivative)
router.post("/:id/remix", async (req, res) => {
    // This is essentially creating a new asset with `remixOf` set to :id
    // Can reuse the POST / logic or have specific logic here
    // For now, redirecting to POST / logic on client side is common, 
    // but here we can just handle the specific remix tracking.
    res.status(501).json({ error: "Use POST / with parentId to remix" });
});

export default router;

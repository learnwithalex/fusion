import { Router } from "express";
import { db } from "../db";
import { assets, licenses, transactions, assetFiles, assetMetadata } from "../db/schema";
import { eq, like, and, gte, lte, desc, sql, inArray } from "drizzle-orm";

const router = Router();

// Get Assets (Search, Filter, Sort)
router.get("/", async (req, res) => {
    const { search, type, minPrice, maxPrice, minRoyalty, maxRoyalty, status, sort } = req.query;

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

// ... imports

// Create Asset (Mint)
router.post("/", authenticate, async (req, res) => {
    const { name, description, type, file, metadata, license, parentId, tokenId, creationStatus } = req.body;
    const userId = req.user!.id; // Guaranteed by middleware

    try {
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
    const { name, description, type, file, metadata, license, creationStatus, tokenId } = req.body;
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
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const asset = await db.select().from(assets).where(eq(assets.id, parseInt(id)));
        if (!asset[0]) return res.status(404).json({ error: "Asset not found" });

        // Fetch license
        let license = null;
        if (asset[0].licenseId) {
            const licenseResult = await db.select().from(licenses).where(eq(licenses.id, asset[0].licenseId));
            license = licenseResult[0];
        }

        // Fetch derivatives
        const derivatives = await db.select().from(assets).where(eq(assets.remixOf, parseInt(id)));

        res.json({ ...asset[0], license, derivatives });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch asset details" });
    }
});

// Buy License
router.post("/:id/buy", async (req, res) => {
    const { id } = req.params;
    const { userId, amount, tnxhash } = req.body;

    try {
        // TODO: Request signature from frontend and verify it here

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
        res.status(500).json({ error: "Failed to process purchase" });
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

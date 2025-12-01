import { Router, Request, Response } from 'express';
import { db } from '../db';
import { agentScans, assetFingerprints, uploadMetadata, assets, users } from '../db/schema';
import { eq, desc, sql, and, count } from 'drizzle-orm';

const router = Router();

// Get agent dashboard stats
router.get('/stats', async (req: Request, res: Response) => {
    try {
        // Total scans performed
        const totalScansResult = await db.select({ count: count() })
            .from(agentScans);
        const totalScans = totalScansResult[0]?.count || 0;

        // Active scans (pending or scanning)
        const activeScansResult = await db.select({ count: count() })
            .from(agentScans)
            .where(sql`${agentScans.status} IN ('pending', 'scanning')`);
        const activeScans = activeScansResult[0]?.count || 0;

        // Flagged assets
        const flaggedAssetsResult = await db.select({ count: count() })
            .from(assets)
            .where(eq(assets.status, 'flagged'));
        const flaggedAssets = flaggedAssetsResult[0]?.count || 0;

        // Recent scans (last 10)
        const recentScans = await db.select({
            id: agentScans.id,
            assetId: agentScans.assetId,
            assetName: assets.name,
            scanType: agentScans.scanType,
            status: agentScans.status,
            similarity: agentScans.similarity,
            scannedAt: agentScans.scannedAt,
            completedAt: agentScans.completedAt,
        })
            .from(agentScans)
            .leftJoin(assets, eq(agentScans.assetId, assets.id))
            .orderBy(desc(agentScans.scannedAt))
            .limit(10);

        // Scans by country
        const scansByCountry = await db.select({
            country: uploadMetadata.country,
            count: count(),
        })
            .from(uploadMetadata)
            .groupBy(uploadMetadata.country)
            .orderBy(desc(count()));

        res.json({
            totalScans,
            activeScans,
            flaggedAssets,
            recentScans,
            scansByCountry,
        });
    } catch (error) {
        console.error('Error fetching agent stats:', error);
        res.status(500).json({ error: 'Failed to fetch agent stats' });
    }
});

// Get scanning activity (for real-time updates)
router.get('/activity', async (req: Request, res: Response) => {
    try {
        // Ongoing scans
        const ongoingScans = await db.select({
            id: agentScans.id,
            assetId: agentScans.assetId,
            assetName: assets.name,
            scanType: agentScans.scanType,
            status: agentScans.status,
            scannedAt: agentScans.scannedAt,
        })
            .from(agentScans)
            .leftJoin(assets, eq(agentScans.assetId, assets.id))
            .where(sql`${agentScans.status} IN ('pending', 'scanning')`)
            .orderBy(desc(agentScans.scannedAt))
            .limit(20);

        // Recent flags
        const recentFlags = await db.select({
            id: agentScans.id,
            assetId: agentScans.assetId,
            assetName: assets.name,
            matchedAssetId: agentScans.matchedAssetId,
            similarity: agentScans.similarity,
            flagReason: agentScans.flagReason,
            scannedAt: agentScans.scannedAt,
        })
            .from(agentScans)
            .leftJoin(assets, eq(agentScans.assetId, assets.id))
            .where(eq(agentScans.status, 'flagged'))
            .orderBy(desc(agentScans.scannedAt))
            .limit(10);

        // Scan queue (assets without fingerprints)
        const scanQueueResult = await db.select({ count: count() })
            .from(assets)
            .leftJoin(assetFingerprints, eq(assets.id, assetFingerprints.assetId))
            .where(sql`${assetFingerprints.id} IS NULL`);
        const scanQueue = scanQueueResult[0]?.count || 0;

        res.json({
            ongoingScans,
            recentFlags,
            scanQueue,
        });
    } catch (error) {
        console.error('Error fetching agent activity:', error);
        res.status(500).json({ error: 'Failed to fetch agent activity' });
    }
});

// Get asset scan history
router.get('/scans/:assetId', async (req: Request, res: Response) => {
    try {
        const { assetId } = req.params;

        const scans = await db.select()
            .from(agentScans)
            .where(eq(agentScans.assetId, parseInt(assetId)))
            .orderBy(desc(agentScans.scannedAt));

        res.json(scans);
    } catch (error) {
        console.error('Error fetching asset scans:', error);
        res.status(500).json({ error: 'Failed to fetch asset scans' });
    }
});

// Manual trigger scan for asset
router.post('/scan/:assetId', async (req: Request, res: Response) => {
    try {
        const { assetId } = req.params;

        // Create a new scan entry
        const newScan = await db.insert(agentScans).values({
            assetId: parseInt(assetId),
            scanType: 'fingerprint',
            status: 'pending',
        }).returning();

        res.json({
            scanId: newScan[0].id,
            status: 'pending',
            message: 'Scan queued successfully',
        });
    } catch (error) {
        console.error('Error triggering scan:', error);
        res.status(500).json({ error: 'Failed to trigger scan' });
    }
});

export default router;

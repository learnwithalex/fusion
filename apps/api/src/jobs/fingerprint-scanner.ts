import cron from 'node-cron';
import crypto from 'crypto';
import { db } from '../db';
import { assets, assetFingerprints, assetFiles, agentScans, uploadMetadata, notifications } from '../db/schema';
import { eq, isNull, and, ne, sql } from 'drizzle-orm';

// Generate SHA256 fingerprint from file URL
async function generateFingerprint(fileUrl: string): Promise<string> {
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');

        return hash;
    } catch (error) {
        console.error('Error generating fingerprint:', error);
        throw error;
    }
}

// Scan asset for duplicates
async function scanAssetForDuplicates(asset: any, fileUrl: string) {
    try {
        console.log(`Scanning asset ${asset.id}: ${asset.name}`);

        // Generate fingerprint
        const fingerprint = await generateFingerprint(fileUrl);

        // Get file size from metadata if available
        const assetFile = await db.select()
            .from(assetFiles)
            .where(eq(assetFiles.assetId, asset.id))
            .limit(1);

        // Save fingerprint
        await db.insert(assetFingerprints).values({
            assetId: asset.id,
            fingerprint,
            algorithm: 'sha256',
            fileSize: assetFile[0]?.file ? String(assetFile[0].file.length) : null,
            mimeType: asset.type,
        });

        console.log(`Fingerprint saved for asset ${asset.id}`);

        // Check for duplicates
        const duplicates = await db.select()
            .from(assetFingerprints)
            .leftJoin(assets, eq(assetFingerprints.assetId, assets.id))
            .where(and(
                eq(assetFingerprints.fingerprint, fingerprint),
                ne(assetFingerprints.assetId, asset.id)
            ));

        if (duplicates.length > 0) {
            console.log(`Found ${duplicates.length} duplicate(s) for asset ${asset.id}`);

            // Check if it's a derivative
            const isDerivative = asset.remixOf !== null;

            if (!isDerivative) {
                // Flag as potential duplicate
                const matchedAsset = duplicates[0];
                await flagAsset(asset.id, matchedAsset.asset_fingerprints?.assetId || 0, 'duplicate_fingerprint');

                // Record scan as flagged
                await db.insert(agentScans).values({
                    assetId: asset.id,
                    scanType: 'fingerprint',
                    status: 'flagged',
                    matchedAssetId: matchedAsset.asset_fingerprints?.assetId,
                    similarity: '100.00',
                    flagReason: 'Exact duplicate detected',
                    completedAt: new Date(),
                });

                console.log(`Asset ${asset.id} flagged as duplicate`);
            } else {
                console.log(`Asset ${asset.id} is a derivative, not flagging`);

                // Record scan as completed (derivative)
                await db.insert(agentScans).values({
                    assetId: asset.id,
                    scanType: 'fingerprint',
                    status: 'completed',
                    matchedAssetId: duplicates[0].asset_fingerprints?.assetId,
                    similarity: '100.00',
                    flagReason: 'Derivative content',
                    completedAt: new Date(),
                });
            }
        } else {
            console.log(`No duplicates found for asset ${asset.id}`);

            // Record scan as completed
            await db.insert(agentScans).values({
                assetId: asset.id,
                scanType: 'fingerprint',
                status: 'completed',
                similarity: '0.00',
                completedAt: new Date(),
            });
        }
    } catch (error) {
        console.error(`Error scanning asset ${asset.id}:`, error);

        // Record scan as failed
        await db.insert(agentScans).values({
            assetId: asset.id,
            scanType: 'fingerprint',
            status: 'completed',
            flagReason: `Scan failed: ${(error as Error).message}`,
            completedAt: new Date(),
        });
    }
}

// Flag asset as duplicate
async function flagAsset(assetId: number, matchedAssetId: number, reason: string) {
    try {
        // Update asset status
        await db.update(assets)
            .set({
                status: 'flagged',
                flaggedAt: new Date(),
                flaggedReason: reason,
            })
            .where(eq(assets.id, assetId));

        // Get asset details for notification
        const asset = await db.select()
            .from(assets)
            .where(eq(assets.id, assetId))
            .limit(1);

        if (asset.length > 0) {
            // Notify asset owner
            await db.insert(notifications).values({
                userId: asset[0].userId,
                type: 'flagged_content',
                title: 'Content Flagged by Agent',
                message: `Your asset "${asset[0].name}" has been flagged as a potential duplicate.`,
                assetId,
            });

            console.log(`Notification sent to user ${asset[0].userId}`);
        }
    } catch (error) {
        console.error('Error flagging asset:', error);
    }
}

// Cron job to scan assets
export function startFingerprintScannerCron() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.log('Running fingerprint scanner cron job...');

        try {
            // Get assets without fingerprints (limit to 10 per run)
            const pendingAssets = await db.select({
                id: assets.id,
                name: assets.name,
                userId: assets.userId,
                type: assets.type,
                remixOf: assets.remixOf,
                fileUrl: assetFiles.file,
            })
                .from(assets)
                .leftJoin(assetFingerprints, eq(assets.id, assetFingerprints.assetId))
                .leftJoin(assetFiles, eq(assets.id, assetFiles.assetId))
                .where(and(
                    isNull(assetFingerprints.id),
                    sql`${assetFiles.file} IS NOT NULL`
                ))
                .limit(10);

            console.log(`Found ${pendingAssets.length} assets to scan`);

            for (const asset of pendingAssets) {
                if (asset.fileUrl) {
                    await scanAssetForDuplicates(asset, asset.fileUrl);
                }
            }

            console.log('Fingerprint scanner cron job completed');
        } catch (error) {
            console.error('Error in fingerprint scanner cron:', error);
        }
    });

    console.log('Fingerprint scanner cron job started (runs every 5 minutes)');
}

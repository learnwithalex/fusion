import cron from 'node-cron';
import { db } from '../db';
import { assets, bids, transactions, users } from '../db/schema';
import { eq, and, lt, desc } from 'drizzle-orm';

/**
 * Cron job to automatically finalize ended auctions
 * Runs every 5 minutes
 */
export function startAuctionFinalizationCron() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.log('[Cron] Checking for ended auctions...');

        try {
            // Find all active auctions that have ended
            const now = new Date();
            const endedAuctions = await db.select()
                .from(assets)
                .where(
                    and(
                        eq(assets.biddingEnabled, true),
                        eq(assets.biddingStatus, 'active'),
                        lt(assets.biddingEndsAt, now)
                    )
                );

            console.log(`[Cron] Found ${endedAuctions.length} ended auctions`);

            for (const auction of endedAuctions) {
                try {
                    await finalizeAuction(auction.id);
                    console.log(`[Cron] Successfully finalized auction for asset ${auction.id}`);
                } catch (error) {
                    console.error(`[Cron] Failed to finalize auction for asset ${auction.id}:`, error);
                }
            }
        } catch (error) {
            console.error('[Cron] Error in auction finalization job:', error);
        }
    });

    console.log('[Cron] Auction finalization cron job started (runs every 5 minutes)');
}

/**
 * Finalize a single auction
 */
async function finalizeAuction(assetId: number) {
    // Get asset
    const asset = await db.select().from(assets).where(eq(assets.id, assetId));
    if (!asset[0]) {
        throw new Error('Asset not found');
    }

    // Verify auction has ended
    if (asset[0].biddingStatus !== 'active') {
        throw new Error('Auction is not active');
    }

    if (!asset[0].biddingEndsAt || new Date() < asset[0].biddingEndsAt) {
        throw new Error('Auction has not ended yet');
    }

    // Get winning bid
    const winningBid = await db.select({
        bid: bids,
        user: users
    })
        .from(bids)
        .leftJoin(users, eq(bids.userId, users.id))
        .where(and(eq(bids.assetId, assetId), eq(bids.status, 'active')))
        .orderBy(desc(bids.amount))
        .limit(1);

    if (!winningBid[0]) {
        // No bids - mark as ended but not completed
        await db.update(assets)
            .set({ biddingStatus: 'ended' })
            .where(eq(assets.id, assetId));
        return;
    }

    // Call smart contract to finalize auction (transfers NFT and funds)
    try {
        const { walletClient, FUSION_MARKETPLACE_ABI, FUSION_MARKETPLACE_ADDRESS } = await import('../lib/fusionMarketplace');

        if (walletClient) {
            await walletClient.writeContract({
                address: FUSION_MARKETPLACE_ADDRESS,
                abi: FUSION_MARKETPLACE_ABI,
                functionName: 'finalizeAuction',
                args: [BigInt(assetId)]
            });
            console.log(`[Cron] Contract finalizeAuction called for asset ${assetId}`);
        }
    } catch (error) {
        console.error(`[Cron] Contract finalization failed for asset ${assetId}:`, error);
        // Continue with database updates even if contract call fails
    }

    // Update asset
    await db.update(assets)
        .set({
            biddingStatus: 'completed',
            biddingWinnerId: winningBid[0].user!.id
        })
        .where(eq(assets.id, assetId));

    // Update winning bid
    await db.update(bids)
        .set({ status: 'won' })
        .where(eq(bids.id, winningBid[0].bid.id));

    // Record transaction
    await db.insert(transactions).values({
        userId: winningBid[0].user!.id,
        assetId: assetId,
        transactionType: 'bought',
        amount: winningBid[0].bid.amount,
        tnxhash: winningBid[0].bid.tnxhash || '',
        status: 'success'
    });

    console.log(`[Cron] Finalized auction ${assetId} - Winner: ${winningBid[0].user!.walletAddress}, Amount: ${winningBid[0].bid.amount} CAMP`);
}

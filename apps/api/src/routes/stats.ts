import { Router } from "express";
import { db } from "../db";
import { assets, users, transactions } from "../db/schema";
import { sql, eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const [assetCount] = await db.select({ count: sql<number>`count(*)` }).from(assets);
        const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
        const [txCount] = await db.select({ count: sql<number>`count(*)` }).from(transactions);
        const [volume] = await db.select({ sum: sql<string>`sum(${transactions.amount})` })
            .from(transactions)
            .where(eq(transactions.status, 'success'));

        res.json({
            totalAssets: Number(assetCount.count),
            totalUsers: Number(userCount.count),
            totalTransactions: Number(txCount.count),
            totalVolume: volume.sum || "0"
        });
    } catch (error) {
        console.error("Failed to fetch stats:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

export default router;

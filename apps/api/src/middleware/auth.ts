import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { sessions, users } from "../db/schema";
import { eq, and } from "drizzle-orm";

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                walletAddress: string;
            };
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Find session
        const sessionResult = await db.select({
            session: sessions,
            user: users
        })
            .from(sessions)
            .innerJoin(users, eq(sessions.userId, users.id))
            .where(and(eq(sessions.token, token), eq(sessions.isValid, true)));

        if (sessionResult.length === 0) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }

        const { user } = sessionResult[0];

        // Attach user to request
        req.user = {
            id: user.id,
            walletAddress: user.walletAddress,
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { notifications } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

const router = Router();

// Get user notifications
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId; // From auth middleware

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userNotifications = await db.select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(50);

        res.json(userNotifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.put('/:id/read', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await db.update(notifications)
            .set({ read: true })
            .where(and(
                eq(notifications.id, parseInt(id)),
                eq(notifications.userId, userId)
            ));

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark all as read
router.put('/read-all', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await db.update(notifications)
            .set({ read: true })
            .where(and(
                eq(notifications.userId, userId),
                eq(notifications.read, false)
            ));

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

export default router;

import express from 'express';
import db from '../models/index.js';
import authenticateToken from '../middlewares/auth.middleware.js';

const router = express.Router();
const User = db.User;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get list of all users (Protected)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: No token provided
 *       403:
 *         description: Invalid token
 */

router.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email']
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;

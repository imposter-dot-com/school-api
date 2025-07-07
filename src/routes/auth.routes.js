/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

import express from 'express';
import bycrpt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import authenticateToken from '../middlewares/auth.middleware.js';

const router = express.Router();
const User = db.User;
/**{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "mypassword123"
}

 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 */

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try{
        if(!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        const hashedPassword = await bycrpt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: 'User registered successfully.', user: { id: newUser.id, name: newUser.name, email: newUser.email } });
    }catch(error){
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message || 'Internal server error.' });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */


router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isPasswordValid = await bycrpt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ message: 'Login successful.', token });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }

})

export default router;
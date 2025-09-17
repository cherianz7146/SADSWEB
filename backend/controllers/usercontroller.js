const bcrypt = require('bcryptjs');
const User = require('../models/user');

// GET /api/users
async function listUsers(req, res) {
	try {
		const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(100);
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: 'Failed to list users' });
	}
}

// POST /api/users
async function createUser(req, res) {
	try {
		const { name, email, password, role, avatar } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ message: 'name, email, and password are required' });
		}
		const existing = await User.findOne({ email });
		if (existing) {
			return res.status(409).json({ message: 'Email already exists' });
		}
		const hashed = await bcrypt.hash(password, 10);
		const user = await User.create({ name, email, password: hashed, role: role || 'user', avatar: avatar || null });
		const { password: _, ...safe } = user.toObject();
		res.status(201).json(safe);
	} catch (err) {
		res.status(500).json({ message: 'Failed to create user' });
	}
}

// POST /api/users/seed
async function seedUsers(req, res) {
	try {
		const seed = [
			{ name: 'Admin User', email: 'admin@sads.local', password: 'Admin#123', role: 'admin', avatar: null },
			{ name: 'Alice Johnson', email: 'alice@sads.local', password: 'Password#1', role: 'user', avatar: null },
			{ name: 'Bob Smith', email: 'bob@sads.local', password: 'Password#1', role: 'user', avatar: null },
			{ name: 'Carol Garcia', email: 'carol@sads.local', password: 'Password#1', role: 'user', avatar: null }
		];
		const emails = seed.map(u => u.email);
		const existing = await User.find({ email: { $in: emails } }).select('email');
		const existingSet = new Set(existing.map(u => u.email));
		const toInsert = await Promise.all(seed
			.filter(u => !existingSet.has(u.email))
			.map(async u => ({
				...u,
				password: await bcrypt.hash(u.password, 10)
			}))
		);
		let inserted = [];
		if (toInsert.length > 0) {
			inserted = await User.insertMany(toInsert);
		}
		res.json({ inserted: inserted.length, skipped: existingSet.size, total: seed.length });
	} catch (err) {
		res.status(500).json({ message: 'Failed to seed users' });
	}
}

module.exports = { listUsers, createUser, seedUsers };

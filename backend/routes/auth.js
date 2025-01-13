const router = require('express').Router();
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
require('dotenv').config();

const JWT_SECRET = 'shhhhh';

router.post('/createuser', [
    check('name', 'Please enter a valid name').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
], async (req, res) => {
    let success = false;

    console.log('Incoming Request Body:', req.body); // Debugging log

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation Errors:', errors.array()); // Debugging log
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            console.log('Email already exists:', req.body.email); // Debugging log
            return res.status(400).json({ success, msg: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });

        console.log('User Created:', user); // Debugging log

        const jwtData = jwt.sign(
            { user: { id: user._id } },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        success = true;
        res.status(201).json({ success, jwtData });
    } catch (error) {
        console.error('Error creating user:', error); // Debugging log
        res.status(500).json({ success, msg: 'Failed to create user. Please try again later.' });
    }
});


router.post('/login', [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter a valid password').isLength({ min: 6 }),
], async (req, res) => {
    let success = false;
    if (!req.body) {
        return res.status(400).json({success, msg: 'Request body is required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }

    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ success, msg: 'Invalid credentials' });
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ success, msg: 'Invalid credentials' });
        }

        const authtoken = jwt.sign({ user: user.id }, JWT_SECRET, { expiresIn: '1h' });

        success = true;
        res.json({ success, authtoken });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({success, msg: 'Failed to authenticate user. Please try again later.' });
    }
});

router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({success, msg: 'Failed to fetch user details. Please try again later.' });
    }
});

module.exports = router;


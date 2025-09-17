const express = require('express');
const router = express.Router();

const { verifyGoogleIdToken, getGoogleClientId, register, login, me } = require('../controllers/authcontroller');
const { authRequired } = require('../middleware/auth');

router.post('/google', verifyGoogleIdToken);
router.get('/google-client-id', getGoogleClientId);

router.post('/register', register);
router.post('/login', login);
router.get('/me', authRequired, me);

module.exports = router;




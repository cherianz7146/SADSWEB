const express = require('express');
const router = express.Router();
const { listDetections, createDetection } = require('../controllers/detectioncontroller');
const { authRequired } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorhandler');

router.get('/', authRequired, asyncHandler(listDetections));
router.post('/', authRequired, asyncHandler(createDetection));

module.exports = router;









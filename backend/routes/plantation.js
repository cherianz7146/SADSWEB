const express = require('express');
const router = express.Router();
const { 
  getPlantations, 
  assignManagerToPlantation, 
  getUnassignedManagers,
  getManagerPlantations 
} = require('../controllers/plantationcontroller');
const { authRequired } = require('../middleware/auth');

// All routes require authentication
router.use(authRequired);

// GET /api/plantations - Get all plantations with assigned managers
router.get('/', getPlantations);

// GET /api/plantations/unassigned - Get managers without plantations
router.get('/unassigned', getUnassignedManagers);

// GET /api/plantations/manager/:managerId - Get plantations assigned to specific manager
router.get('/manager/:managerId', getManagerPlantations);

// POST /api/plantations/assign - Assign manager to plantation (admin only)
router.post('/assign', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, assignManagerToPlantation);

module.exports = router;

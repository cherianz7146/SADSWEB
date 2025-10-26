const User = require('../models/user');
const Property = require('../models/property');
const Detection = require('../models/detection');

// GET /api/stats/admin - Admin dashboard statistics
async function getAdminStats(req, res) {
  try {
    const [
      totalUsers,
      adminUsers,
      managerUsers,
      totalProperties,
      activeProperties,
      totalCameras,
      todayDetections,
      last24hDetections,
      totalDetections
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'manager' }),
      Property.countDocuments({}),
      Property.countDocuments({ status: 'active' }),
      Property.aggregate([
        { $group: { _id: null, total: { $sum: '$cameraCount' } } }
      ]).then(result => result[0]?.total || 0),
      Detection.countDocuments({
        detectedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      Detection.countDocuments({
        detectedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      Detection.estimatedDocumentCount()
    ]);

    // Get recent detections for activity feed
    const recentDetections = await Detection.find({})
      .sort({ detectedAt: -1 })
      .limit(10)
      .select('label probability detectedAt source');

    res.json({
      users: {
        total: totalUsers,
        admins: adminUsers,
        managers: managerUsers
      },
      properties: {
        total: totalProperties,
        active: activeProperties,
        totalCameras: totalCameras
      },
      detections: {
        today: todayDetections,
        last24h: last24hDetections,
        total: totalDetections
      },
      recentActivity: recentDetections
    });
  } catch (err) {
    console.error('Error getting admin stats:', err);
    res.status(500).json({ message: 'Failed to get admin stats', error: err.message });
  }
}

// GET /api/stats/manager - Manager dashboard statistics
async function getManagerStats(req, res) {
  try {
    const managerId = req.user.id;
    
    const [
      managerProperties,
      activeProperties,
      totalCameras,
      todayDetections,
      last24hDetections,
      totalDetections
    ] = await Promise.all([
      Property.countDocuments({ managerId }),
      Property.countDocuments({ managerId, status: 'active' }),
      Property.aggregate([
        { $match: { managerId: managerId } },
        { $group: { _id: null, total: { $sum: '$cameraCount' } } }
      ]).then(result => result[0]?.total || 0),
      Detection.countDocuments({
        userId: managerId,
        detectedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      Detection.countDocuments({
        userId: managerId,
        detectedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      Detection.countDocuments({ userId: managerId })
    ]);

    // Get recent detections for this manager's properties
    const recentDetections = await Detection.find({ userId: managerId })
      .sort({ detectedAt: -1 })
      .limit(10)
      .select('label probability detectedAt source');

    res.json({
      properties: {
        total: managerProperties,
        active: activeProperties,
        totalCameras: totalCameras
      },
      detections: {
        today: todayDetections,
        last24h: last24hDetections,
        total: totalDetections
      },
      recentActivity: recentDetections
    });
  } catch (err) {
    console.error('Error getting manager stats:', err);
    res.status(500).json({ message: 'Failed to get manager stats', error: err.message });
  }
}

// GET /api/stats/detection-report - Detection report
async function getDetectionReport(req, res) {
  try {
    const { startDate, endDate, propertyId } = req.query;
    const userId = req.user.id;
    
    let matchQuery = {};
    
    // If user is manager, only show their detections
    if (req.user.role === 'manager') {
      matchQuery.userId = userId;
    }
    
    // Filter by date range
    if (startDate && endDate) {
      matchQuery.detectedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Filter by property (if implemented in detection model)
    if (propertyId) {
      matchQuery.propertyId = propertyId;
    }
    
    const [
      totalDetections,
      detectionsByLabel,
      detectionsByDay,
      highConfidenceDetections
    ] = await Promise.all([
      Detection.countDocuments(matchQuery),
      Detection.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$label', count: { $sum: 1 }, avgConfidence: { $avg: '$probability' } } },
        { $sort: { count: -1 } }
      ]),
      Detection.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$detectedAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Detection.countDocuments({ ...matchQuery, probability: { $gte: 0.8 } })
    ]);
    
    res.json({
      summary: {
        totalDetections,
        highConfidenceDetections,
        // effectiveness removed for pure detection reporting
        dateRange: { startDate, endDate }
      },
      detectionsByLabel,
      detectionsByDay
    });
  } catch (err) {
    console.error('Error getting detection report:', err);
    res.status(500).json({ message: 'Failed to get detection report', error: err.message });
  }
}

module.exports = {
  getAdminStats,
  getManagerStats,
  getDetectionReport
};


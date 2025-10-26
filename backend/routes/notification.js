const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { 
  sendEmailToManagers,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationcontroller');

// Get all notifications for the authenticated user
router.get('/', authRequired, getNotifications);

// Get unread notifications count
router.get('/unread-count', authRequired, getUnreadCount);

// Mark notification as read
router.patch('/:id/read', authRequired, markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', authRequired, markAllAsRead);

// Get notification templates (admin only)
router.get('/templates', authRequired, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const templates = [
      {
        id: '1',
        name: 'System Maintenance',
        subject: 'Scheduled System Maintenance',
        message: 'We will be performing scheduled maintenance on {{date}} from {{start_time}} to {{end_time}}. During this time, some features may be temporarily unavailable.',
        type: 'info',
        priority: 'medium'
      },
      {
        id: '2',
        name: 'Device Offline Alert',
        subject: 'Device Offline Notification',
        message: 'Device {{device_name}} in {{location}} has gone offline. Please check the connection and restart if necessary.',
        type: 'error',
        priority: 'high'
      },
      {
        id: '3',
        name: 'Weekly Report',
        subject: 'Weekly Detection Activity Report',
        message: 'Your weekly detection activity report for {{date_range}} is now available. Log in to view detailed analytics and insights.',
        type: 'info',
        priority: 'low'
      }
    ];
    
    res.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Failed to fetch templates' });
  }
});

// Get notification integrations (admin only)
router.get('/integrations', authRequired, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const integrations = [
      {
        id: '1',
        name: 'Slack',
        status: 'connected',
        icon: 'slack',
        lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      },
      {
        id: '2',
        name: 'Microsoft Teams',
        status: 'disconnected',
        icon: 'teams',
        lastSync: null
      },
      {
        id: '3',
        name: 'Webhooks',
        status: 'connected',
        icon: 'webhook',
        lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
      }
    ];
    
    res.json({ integrations });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ message: 'Failed to fetch integrations' });
  }
});

// Send email to managers (admin only)
router.post('/send-email', authRequired, sendEmailToManagers);

module.exports = router;


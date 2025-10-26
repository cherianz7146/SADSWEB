const User = require('../models/user');
const Notification = require('../models/notification');
const { sendManagerNotification } = require('../services/emailservices');

exports.sendEmailToManagers = async (req, res) => {
  try {
    const { managerIds, subject, message } = req.body;

    // Validate input
    if (!managerIds || !Array.isArray(managerIds) || managerIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one manager' });
    }

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    // Fetch managers
    const managers = await User.find({ _id: { $in: managerIds } });

    if (managers.length === 0) {
      return res.status(404).json({ message: 'No managers found' });
    }

    // Create notifications in database for each manager
    const notificationPromises = managers.map(async (manager) => {
      // Create notification in database
      const notification = await Notification.create({
        recipientId: manager._id,
        senderId: req.user.id,
        title: subject,
        message: message,
        type: 'admin',
        priority: 'high',
        emailSent: false
      });

      // Send email
      try {
        await sendManagerNotification(manager.email, manager.name, subject, message);
        notification.emailSent = true;
        await notification.save();
      } catch (emailError) {
        console.error(`Failed to send email to ${manager.email}:`, emailError);
      }

      return notification;
    });

    await Promise.all(notificationPromises);

    console.log(`Notifications created and emails sent to ${managers.length} managers`);

    return res.json({ 
      message: `Notification sent successfully to ${managers.length} manager(s)`,
      count: managers.length
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return res.status(500).json({ message: 'Failed to send notifications', error: error.message });
  }
};

// Get all notifications for a user (manager)
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.id })
      .populate('senderId', 'name email role')
      .sort({ createdAt: -1 });

    return res.json({ 
      success: true,
      data: notifications 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

// Get unread notifications count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipientId: req.user.id,
      read: false 
    });

    return res.json({ 
      success: true,
      count 
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return res.status(500).json({ message: 'Failed to fetch unread count', error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      recipientId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    return res.json({ 
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipientId: req.user.id, read: false },
      { read: true, readAt: new Date() }
    );

    return res.json({ 
      success: true,
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
  }
};





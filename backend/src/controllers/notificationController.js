import { Notification } from '../models/Notification.js';

/**
 * Get notifications for current user (Therapist or Client)
 */
export const getNotifications = async (req, res, next) => {
  try {
    const sessionUser = req.session.user;
    const { unreadOnly } = req.query;

    const filter = { user: sessionUser.id };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: sessionUser.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionUser = req.session.user;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: sessionUser.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read for current user
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const sessionUser = req.session.user;

    await Notification.updateMany({ user: sessionUser.id, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionUser = req.session.user;

    await Notification.findOneAndDelete({ _id: id, user: sessionUser.id });

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
};

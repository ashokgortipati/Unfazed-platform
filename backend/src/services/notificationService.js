import { Notification } from '../models/Notification.js';

/**
 * Creates and persists an in-app notification
 */
export const createNotification = async ({
  userId,
  userModel,
  title,
  message,
  type = 'system',
  link = '',
}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      userModel,
      title,
      message,
      type,
      link,
    });
    return notification;
  } catch (error) {
    console.error('[Notification Service Error]:', error.message);
    return null;
  }
};

import { Notification } from '../models/index.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    const unreadCount = notifications.filter(n => !n.isRead).length;
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (e) { next(e); }
};

export const markRead = async (req, res, next) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
    res.json({ success: true, message: 'All marked as read' });
  } catch (e) { next(e); }
};

export const markOneRead = async (req, res, next) => {
  try {
    await Notification.update({ isRead: true }, { where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true });
  } catch (e) { next(e); }
};

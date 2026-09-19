import { Report, User, Notification } from '../models/index.js';
import { Op } from 'sequelize';

export const getReports = async (req, res, next) => {
  try {
    const { status, category, city, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (city) where.city = { [Op.iLike]: `%${city}%` };

    const { rows, count } = await Report.findAndCountAll({
      where,
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'avatar'] }],
      order: [['upvotes', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({ success: true, data: { items: rows, total: count } });
  } catch (e) { next(e); }
};

export const createReport = async (req, res, next) => {
  try {
    const { title, description, category, address, city, lat, lng, images } = req.body;
    const report = await Report.create({
      reporterId: req.user.id, title, description, category,
      address, city, lat, lng, images: images || [],
    });
    res.status(201).json({ success: true, data: report, message: 'Report submitted. Note: reports are reviewed by platform moderators, not government authorities.' });
  } catch (e) { next(e); }
};

export const upvoteReport = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    await report.increment('upvotes');
    res.json({ success: true, data: { upvotes: report.upvotes + 1 } });
  } catch (e) { next(e); }
};

export const updateReportStatus = async (req, res, next) => {
  try {
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ success: false, error: { message: 'Not found' } });

    await report.update({
      status: req.body.status,
      adminNote: req.body.adminNote,
      resolvedAt: req.body.status === 'resolved' ? new Date() : null,
    });

    await Notification.create({
      userId: report.reporterId, type: 'report_status',
      title: `Report status updated: ${req.body.status}`,
      body: req.body.adminNote || `Your report "${report.title}" status changed to ${req.body.status}`,
      link: `/reports/${report.id}`,
    });

    res.json({ success: true, data: report });
  } catch (e) { next(e); }
};

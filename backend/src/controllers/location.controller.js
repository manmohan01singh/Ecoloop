import { Location, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getLocations = async (req, res, next) => {
  try {
    const { category, city, verified, lat, lng, radius = 50 } = req.query;
    const where = { isActive: true };
    if (category) where.category = category;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (verified === 'true') where.verificationStatus = { [Op.in]: ['community_verified', 'admin_verified'] };

    const locations = await Location.findAll({
      where,
      include: [{ model: User, as: 'submittedBy', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: locations });
  } catch (e) { next(e); }
};

export const getLocation = async (req, res, next) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    res.json({ success: true, data: location });
  } catch (e) { next(e); }
};

export const submitLocation = async (req, res, next) => {
  try {
    const { name, category, address, city, province, lat, lng, openingHours, acceptedMaterials, contact, website } = req.body;
    const location = await Location.create({
      name, category, address, city, province, lat, lng,
      openingHours, acceptedMaterials: acceptedMaterials || [],
      contact, website, submittedById: req.user.id,
      verificationStatus: 'unverified',
    });
    res.status(201).json({ success: true, data: location, message: 'Location submitted for review' });
  } catch (e) { next(e); }
};

export const verifyLocation = async (req, res, next) => {
  try {
    const { status } = req.body;
    const location = await Location.findByPk(req.params.id);
    if (!location) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    await location.update({ verificationStatus: status, verifiedById: req.user.id });
    res.json({ success: true, data: location });
  } catch (e) { next(e); }
};

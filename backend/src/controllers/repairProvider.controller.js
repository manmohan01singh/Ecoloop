import { Op } from 'sequelize';
import { User, Provider, RepairRequest, Review, Notification, WasteDeposit } from '../models/index.js';

// Dashboard Overview
export const getDashboard = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Provider profile not found' },
      });
    }

    // Get statistics
    const newRequests = await RepairRequest.count({
      where: { providerId: null, status: 'requested' }
    });

    const activeRepairs = await RepairRequest.count({
      where: { providerId: provider.id, status: ['accepted', 'in_progress'] }
    });

    const completedRepairs = await RepairRequest.count({
      where: { providerId: provider.id, status: 'completed' }
    });

    // Today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAppointments = await RepairRequest.count({
      where: {
        providerId: provider.id,
        status: ['accepted', 'in_progress'],
        createdAt: { [Op.between]: [today, tomorrow] }
      }
    });

    // Recent activity
    const recentRequests = await RepairRequest.findAll({
      where: { providerId: provider.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] }],
      order: [['updatedAt', 'DESC']],
      limit: 5
    });

    // Revenue this month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const completedThisMonth = await RepairRequest.findAll({
      where: {
        providerId: provider.id,
        status: 'completed',
        completedAt: { [Op.gte]: monthStart }
      },
      attributes: ['estimatedCost']
    });

    const monthlyRevenue = completedThisMonth.reduce((sum, r) => sum + (parseFloat(r.estimatedCost) || 0), 0);

    res.json({
      success: true,
      data: {
        stats: {
          newRequests,
          activeRepairs,
          completedRepairs,
          todaysAppointments,
          monthlyRevenue: monthlyRevenue.toFixed(2),
          rating: provider.ratingCount > 0 ? (provider.ratingSum / provider.ratingCount).toFixed(1) : '0.0',
          totalReviews: provider.ratingCount
        },
        recentActivity: recentRequests,
        provider
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all repair requests (with filters)
export const getRepairRequests = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Provider profile not found' },
      });
    }

    const { status, category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Filter by status
    if (status === 'new') {
      where.providerId = null;
      where.status = 'requested';
    } else if (status === 'mine') {
      where.providerId = provider.id;
    } else if (status) {
      where.status = status;
      where.providerId = provider.id;
    }

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Search
    if (search) {
      where[Op.or] = [
        { itemName: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { rows: requests, count } = await RepairRequest.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'city'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        items: requests,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single repair request details
export const getRepairRequestDetails = async (req, res, next) => {
  try {
    const request = await RepairRequest.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'city', 'address'] },
        { model: Provider, as: 'provider', attributes: ['id', 'businessName', 'phone', 'email'] }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Repair request not found' },
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// Accept repair request
export const acceptRepairRequest = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Provider profile not found' },
      });
    }

    const request = await RepairRequest.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Repair request not found' },
      });
    }

    if (request.providerId && request.providerId !== provider.id) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Request already assigned to another provider' },
      });
    }

    await request.update({
      providerId: provider.id,
      status: 'accepted'
    });

    // Create notification for user
    await Notification.create({
      userId: request.userId,
      type: 'repair_accepted',
      title: 'Repair Request Accepted',
      message: `Your repair request for "${request.itemName}" has been accepted by ${provider.businessName}`,
      relatedId: request.id,
      relatedType: 'repair_request'
    });

    res.json({
      success: true,
      data: request,
      message: 'Repair request accepted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Reject repair request
export const rejectRepairRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await RepairRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Repair request not found' },
      });
    }

    await request.update({
      status: 'cancelled',
      providerId: null
    });

    // Create notification for user
    await Notification.create({
      userId: request.userId,
      type: 'repair_rejected',
      title: 'Repair Request Declined',
      message: reason || 'Your repair request has been declined. Please try another provider.',
      relatedId: request.id,
      relatedType: 'repair_request'
    });

    res.json({
      success: true,
      message: 'Repair request rejected'
    });
  } catch (error) {
    next(error);
  }
};

// Update repair status
export const updateRepairStatus = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    const { status, diagnosis, estimatedCost, estimatedCompletion, beforePhotos, afterPhotos, partsReplaced } = req.body;

    const request = await RepairRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Repair request not found' },
      });
    }

    if (request.providerId !== provider.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to update this request' },
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (diagnosis) updateData.diagnosis = diagnosis;
    if (estimatedCost) updateData.estimatedCost = estimatedCost;
    if (estimatedCompletion) updateData.estimatedCompletion = estimatedCompletion;
    if (beforePhotos) updateData.beforePhotos = beforePhotos;
    if (afterPhotos) updateData.afterPhotos = afterPhotos;
    if (partsReplaced) updateData.partsReplaced = partsReplaced;

    if (status === 'completed') {
      updateData.completedAt = new Date();
      
      // Update provider stats
      await provider.increment('completedJobs');
    }

    await request.update(updateData);

    // Create notification for user
    const statusMessages = {
      in_progress: `Your repair for "${request.itemName}" is now in progress`,
      completed: `Your repair for "${request.itemName}" has been completed!`,
    };

    if (statusMessages[status]) {
      await Notification.create({
        userId: request.userId,
        type: 'repair_update',
        title: 'Repair Status Update',
        message: statusMessages[status],
        relatedId: request.id,
        relatedType: 'repair_request'
      });
    }

    res.json({
      success: true,
      data: request,
      message: 'Repair status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Add diagnosis
export const addDiagnosis = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    const { diagnosis, estimatedCost, estimatedTime, requiredParts } = req.body;

    const request = await RepairRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Repair request not found' },
      });
    }

    if (request.providerId !== provider.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' },
      });
    }

    await request.update({
      diagnosis,
      estimatedCost,
      estimatedTime,
      requiredParts: requiredParts || []
    });

    // Notify user
    await Notification.create({
      userId: request.userId,
      type: 'repair_diagnosis',
      title: 'Diagnosis Complete',
      message: `Diagnosis for "${request.itemName}" is ready. Estimated cost: $${estimatedCost}`,
      relatedId: request.id,
      relatedType: 'repair_request'
    });

    res.json({
      success: true,
      data: request,
      message: 'Diagnosis added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Record e-waste from repair
export const recordEWaste = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    const { repairRequestId, items, totalWeight, notes } = req.body;

    // Verify repair request belongs to this provider
    const request = await RepairRequest.findByPk(repairRequestId);
    if (!request || request.providerId !== provider.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' },
      });
    }

    // Create waste deposit record
    const wasteDeposit = await WasteDeposit.create({
      userId: req.user.id,
      providerId: provider.id,
      deviceType: items[0]?.type || 'parts',
      quantity: items.length,
      weight: totalWeight,
      condition: 'parts',
      verificationStatus: 'verified',
      ecoKarmaEarned: Math.floor(totalWeight * 10), // 10 karma per kg
      items: items,
      notes: notes,
      source: 'repair'
    });

    // Link to repair request
    await request.update({
      eWasteRecorded: true,
      eWasteDepositId: wasteDeposit.id
    });

    res.json({
      success: true,
      data: wasteDeposit,
      message: 'E-waste recorded successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get provider's services
export const getServices = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Provider profile not found' },
      });
    }

    res.json({
      success: true,
      data: {
        specializations: provider.specializations || [],
        acceptedMaterials: provider.acceptedMaterials || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update provider's services
export const updateServices = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    const { specializations, acceptedMaterials } = req.body;

    if (!provider) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Provider profile not found' },
      });
    }

    await provider.update({
      specializations: specializations || provider.specializations,
      acceptedMaterials: acceptedMaterials || provider.acceptedMaterials
    });

    res.json({
      success: true,
      data: provider,
      message: 'Services updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get repair history with a customer
export const getCustomerHistory = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    const { userId } = req.params;

    const repairs = await RepairRequest.findAll({
      where: {
        providerId: provider.id,
        userId: userId
      },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] }],
      order: [['createdAt', 'DESC']]
    });

    const customer = repairs.length > 0 ? repairs[0].user : await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'phone', 'avatar', 'city']
    });

    res.json({
      success: true,
      data: {
        customer,
        repairs,
        totalRepairs: repairs.length,
        completedRepairs: repairs.filter(r => r.status === 'completed').length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all customers
export const getCustomers = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ where: { userId: req.user.id } });

    const repairs = await RepairRequest.findAll({
      where: { providerId: provider.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'city'] }],
      order: [['updatedAt', 'DESC']]
    });

    // Group by customer
    const customersMap = new Map();
    repairs.forEach(repair => {
      if (repair.user) {
        if (!customersMap.has(repair.userId)) {
          customersMap.set(repair.userId, {
            ...repair.user.toJSON(),
            totalRepairs: 0,
            completedRepairs: 0,
            lastRepairDate: repair.updatedAt
          });
        }
        const customer = customersMap.get(repair.userId);
        customer.totalRepairs++;
        if (repair.status === 'completed') customer.completedRepairs++;
      }
    });

    const customers = Array.from(customersMap.values());

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    next(error);
  }
};

// Update provider profile
export const updateProfile = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    const { businessName, description, address, city, province, phone, whatsapp, email, website, serviceRadius } = req.body;

    if (!provider) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Provider profile not found' },
      });
    }

    await provider.update({
      businessName: businessName || provider.businessName,
      description: description || provider.description,
      address: address || provider.address,
      city: city || provider.city,
      province: province || provider.province,
      phone: phone || provider.phone,
      whatsapp: whatsapp || provider.whatsapp,
      email: email || provider.email,
      website: website || provider.website,
      serviceRadius: serviceRadius || provider.serviceRadius
    });

    res.json({
      success: true,
      data: provider,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get provider reviews
export const getReviews = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ where: { userId: req.user.id } });

    const reviews = await Review.findAll({
      where: {
        referenceId: provider.id,
        referenceType: 'provider'
      },
      include: [{ model: User, as: 'reviewer', attributes: ['id', 'name', 'avatar'] }],
      order: [['createdAt', 'DESC']]
    });

    const avgRating = provider.ratingCount > 0 ? (provider.ratingSum / provider.ratingCount).toFixed(1) : '0.0';

    res.json({
      success: true,
      data: {
        reviews,
        averageRating: parseFloat(avgRating),
        totalReviews: provider.ratingCount
      }
    });
  } catch (error) {
    next(error);
  }
};

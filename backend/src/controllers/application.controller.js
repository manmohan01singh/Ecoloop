import { Op } from 'sequelize';
import { ProfessionalApplication, User, Provider, Notification } from '../models/index.js';

const VALID_OPERATIONAL_ROLES = ['repair_provider', 'recycler', 'business', 'organization'];
const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// Submit a new application for professional role
export const submitApplication = async (req, res, next) => {
  try {
    const {
      requestedRole,
      businessName,
      contactName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      experienceYears,
      specializations,
      servicesOffered,
      documents,
      website,
      description,
      details,
    } = req.body;

    if (!requestedRole || !VALID_OPERATIONAL_ROLES.includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: `Role must be one of: ${VALID_OPERATIONAL_ROLES.join(', ')}`,
        },
      });
    }

    const resolvedBusinessName = businessName ? businessName.trim() : null;
    const resolvedContactName = (contactName || req.body.contactPerson || req.user?.name || '').trim();
    const resolvedEmail = (email || req.body.contactEmail || req.user?.email || '').trim().toLowerCase();
    const resolvedPhone = (phone || req.body.contactPhone || '')?.trim() || null;
    const resolvedAddress = address || req.body.streetAddress || null;
    const resolvedPincode = pincode || req.body.postalCode || null;

    if (!resolvedBusinessName || !resolvedContactName || !resolvedEmail) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Business name, contact name, and email are required',
        },
      });
    }

    if (req.user.role === requestedRole) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_HAS_ROLE',
          message: `You are already verified with the role of ${requestedRole.replace('_', ' ')}.`,
        },
      });
    }

    // Check if user already has an active pending/under_review application for this role
    const existing = await ProfessionalApplication.findOne({
      where: {
        userId: req.user.id,
        requestedRole,
        status: { [Op.in]: ['pending', 'under_review', 'more_info_required', 'information_requested'] },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'APPLICATION_EXISTS',
          message: `An active application for ${requestedRole.replace('_', ' ')} is already in progress.`,
        },
      });
    }

    const application = await ProfessionalApplication.create({
      userId: req.user.id,
      requestedRole,
      status: 'pending',
      businessName: resolvedBusinessName,
      contactName: resolvedContactName,
      email: resolvedEmail,
      phone: resolvedPhone,
      address: resolvedAddress,
      city: city || null,
      state: state || null,
      pincode: resolvedPincode,
      experienceYears: experienceYears || null,
      specializations: specializations || [],
      servicesOffered: servicesOffered || [],
      documents: documents || [],
      website: website || null,
      description: description || null,
      details: details || {},
      submittedAt: new Date(),
      auditLog: [
        {
          action: 'submitted',
          actorId: req.user.id,
          actorName: req.user.name,
          actorRole: req.user.role,
          timestamp: new Date().toISOString(),
          note: 'Application submitted by user',
        },
      ],
    });

    // Notify user
    await Notification.create({
      userId: req.user.id,
      type: 'application_submitted',
      title: 'Application Received',
      body: `Your application for ${requestedRole.replace('_', ' ')} has been submitted and is pending review.`,
      link: '/profile',
    });

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's applications
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await ProfessionalApplication.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// Get specific application by ID (applicant or admin/moderator only)
export const getApplicationById = async (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' },
      });
    }

    const application = await ProfessionalApplication.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'name', 'email', 'avatar', 'city', 'role', 'createdAt'],
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'role'],
        },
      ],
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' },
      });
    }

    const isApplicant = application.userId === req.user.id;
    const isStaff = ['admin', 'moderator'].includes(req.user.role);

    if (!isApplicant && !isStaff) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not authorized to view this application' },
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// Update application (e.g. providing requested information)
export const updateMyApplication = async (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' },
      });
    }

    const application = await ProfessionalApplication.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' },
      });
    }

    if (application.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You cannot update this application' },
      });
    }

    if (!['draft', 'more_info_required', 'information_requested'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'IMMUTABLE_STATUS',
          message: `Application in '${application.status}' state cannot be edited`,
        },
      });
    }

    const {
      businessName,
      contactName,
      phone,
      address,
      city,
      state,
      pincode,
      experienceYears,
      specializations,
      servicesOffered,
      documents,
      website,
      description,
      applicantNote,
    } = req.body;

    const resolvedContactName = contactName || req.body.contactPerson;
    const resolvedPhone = phone || req.body.contactPhone;
    const resolvedAddress = address !== undefined ? address : req.body.streetAddress;
    const resolvedPincode = pincode !== undefined ? pincode : req.body.postalCode;
    const noteText = applicantNote || req.body.applicantNotes || 'Applicant provided updated information';

    const updates = {};
    if (businessName) updates.businessName = businessName.trim();
    if (resolvedContactName) updates.contactName = resolvedContactName.trim();
    if (resolvedPhone) updates.phone = resolvedPhone.trim();
    if (resolvedAddress !== undefined) updates.address = resolvedAddress;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (resolvedPincode !== undefined) updates.pincode = resolvedPincode;
    if (experienceYears !== undefined) updates.experienceYears = experienceYears;
    if (specializations !== undefined) updates.specializations = specializations;
    if (servicesOffered !== undefined) updates.servicesOffered = servicesOffered;
    if (documents !== undefined) updates.documents = documents;
    if (website !== undefined) updates.website = website;
    if (description !== undefined) updates.description = description;

    // Transition back to pending review
    updates.status = 'pending';
    const auditLog = [...(application.auditLog || [])];
    auditLog.push({
      action: 'info_provided',
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      timestamp: new Date().toISOString(),
      note: noteText,
    });
    updates.auditLog = auditLog;

    await application.update(updates);

    res.json({
      success: true,
      data: application,
      message: 'Application updated and submitted for review',
    });
  } catch (error) {
    next(error);
  }
};

// ── Admin & Moderator Review Queue ─────────────────────────────

export const getAdminApplicationsQueue = async (req, res, next) => {
  try {
    const { status, role, requestedRole, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }
    const targetRole = role || requestedRole;
    if (targetRole && targetRole !== 'all') {
      where.requestedRole = targetRole;
    }
    if (search) {
      where[Op.or] = [
        { businessName: { [Op.like]: `%${search}%` } },
        { contactName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows: applications, count } = await ProfessionalApplication.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'name', 'email', 'avatar', 'city', 'role', 'createdAt'],
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'role'],
        },
      ],
      order: [
        ['createdAt', 'DESC'],
      ],
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    });

    res.json({
      success: true,
      data: {
        items: applications,
        total: count,
        page: parseInt(page, 10),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const startApplicationReview = async (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    const application = await ProfessionalApplication.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    // SECURITY CHECK: Applicant cannot review their own application
    if (application.userId === req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'SELF_REVIEW_FORBIDDEN', message: 'You cannot review your own application' },
      });
    }

    const applicant = await User.findByPk(application.userId);
    if (applicant && ['admin', 'moderator'].includes(applicant.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Moderators cannot alter administrative accounts' },
      });
    }

    const auditLog = [...(application.auditLog || [])];
    auditLog.push({
      action: 'under_review',
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      timestamp: new Date().toISOString(),
      note: req.body.note || 'Review started by staff',
    });

    await application.update({
      status: 'under_review',
      reviewerId: req.user.id,
      auditLog,
    });

    res.json({
      success: true,
      data: application,
      message: 'Application marked as under review',
    });
  } catch (error) {
    next(error);
  }
};

export const approveApplication = async (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    const application = await ProfessionalApplication.findByPk(req.params.id, {
      include: [{ model: User, as: 'applicant' }],
    });
    if (!application) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    // SECURITY CHECK: Applicant cannot approve their own application
    if (application.userId === req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'SELF_APPROVAL_FORBIDDEN', message: 'You cannot approve your own application' },
      });
    }

    const requestedRole = application.requestedRole;

    // SECURITY CHECK: Must be a legitimate operational role.
    // Moderators and admins CANNOT grant admin or moderator roles through applications!
    if (!VALID_OPERATIONAL_ROLES.includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TARGET_ROLE', message: 'Target role is not an operational role' },
      });
    }

    const applicant = await User.findByPk(application.userId);
    if (!applicant) {
      return res.status(404).json({ success: false, error: { message: 'Applicant user account not found' } });
    }

    // Only an authorized administrator can appoint or alter administrative roles.
    // Moderators cannot alter accounts that hold administrative roles.
    if (['admin', 'moderator'].includes(applicant.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Moderators cannot alter roles on administrative accounts' },
      });
    }

    const auditLog = [...(application.auditLog || [])];
    auditLog.push({
      action: 'approved',
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      timestamp: new Date().toISOString(),
      note: req.body.reviewNotes || 'Approved after review',
    });

    // 1. Update application status
    await application.update({
      status: 'approved',
      reviewerId: req.user.id,
      reviewedAt: new Date(),
      reviewNotes: req.body.reviewNotes || 'Approved',
      auditLog,
    });

    // 2. Grant ONLY the requested operational role to the applicant
    await applicant.update({
      role: requestedRole,
      verificationStatus: 'admin_verified',
    });

    // 3. Create or update Provider record if repair_provider or recycler
    if (requestedRole === 'repair_provider') {
      const existingProvider = await Provider.findOne({ where: { userId: applicant.id } });
      if (existingProvider) {
        await existingProvider.update({
          businessName: application.businessName || existingProvider.businessName,
          type: 'repair',
          verificationStatus: 'admin_verified',
          isActive: true,
          specializations: application.specializations || existingProvider.specializations,
          city: application.city || existingProvider.city,
        });
      } else {
        await Provider.create({
          userId: applicant.id,
          businessName: application.businessName || applicant.name,
          type: 'repair',
          verificationStatus: 'admin_verified',
          isActive: true,
          specializations: application.specializations || [],
          address: application.address,
          city: application.city,
          phone: application.phone,
          email: application.email,
          website: application.website,
        });
      }
    } else if (requestedRole === 'recycler') {
      const existingProvider = await Provider.findOne({ where: { userId: applicant.id } });
      if (existingProvider) {
        await existingProvider.update({
          businessName: application.businessName || existingProvider.businessName,
          type: 'recycler',
          verificationStatus: 'admin_verified',
          isActive: true,
          acceptedMaterials: application.servicesOffered || existingProvider.acceptedMaterials,
          city: application.city || existingProvider.city,
        });
      } else {
        await Provider.create({
          userId: applicant.id,
          businessName: application.businessName || applicant.name,
          type: 'recycler',
          verificationStatus: 'admin_verified',
          isActive: true,
          acceptedMaterials: application.servicesOffered || [],
          address: application.address,
          city: application.city,
          phone: application.phone,
          email: application.email,
          website: application.website,
        });
      }
    }

    // 4. Send notification to applicant
    await Notification.create({
      userId: applicant.id,
      type: 'application_approved',
      title: 'Professional Role Approved! 🎉',
      body: `Congratulations! Your application to become a verified ${requestedRole.replace('_', ' ')} has been approved.`,
      link: requestedRole === 'repair_provider' ? '/repair-provider' : requestedRole === 'recycler' ? '/recycler' : '/dashboard',
    });

    res.json({
      success: true,
      data: application,
      userRole: requestedRole,
      message: `Application approved. User granted ${requestedRole} role.`,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectApplication = async (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    const { rejectionReason, reviewNotes } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'REASON_REQUIRED', message: 'A rejection reason is required.' },
      });
    }

    const application = await ProfessionalApplication.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    // SECURITY CHECK: Applicant cannot reject their own application
    if (application.userId === req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'SELF_REJECTION_FORBIDDEN', message: 'You cannot reject your own application' },
      });
    }

    const applicant = await User.findByPk(application.userId);
    if (applicant && ['admin', 'moderator'].includes(applicant.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Moderators cannot alter administrative accounts' },
      });
    }

    const auditLog = [...(application.auditLog || [])];
    auditLog.push({
      action: 'rejected',
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      timestamp: new Date().toISOString(),
      note: rejectionReason.trim(),
    });

    await application.update({
      status: 'rejected',
      rejectionReason: rejectionReason.trim(),
      reviewNotes: reviewNotes ? reviewNotes.trim() : null,
      reviewerId: req.user.id,
      reviewedAt: new Date(),
      auditLog,
    });

    await Notification.create({
      userId: application.userId,
      type: 'application_rejected',
      title: 'Application Update',
      body: `Your application for ${application.requestedRole.replace('_', ' ')} was not approved: ${rejectionReason.trim()}`,
      link: '/profile',
    });

    res.json({
      success: true,
      data: application,
      message: 'Application rejected',
    });
  } catch (error) {
    next(error);
  }
};

export const requestMoreInformation = async (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    const note = req.body.notes || req.body.note || req.body.reviewNotes;

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'NOTE_REQUIRED', message: 'Please specify what additional information is required.' },
      });
    }

    const application = await ProfessionalApplication.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, error: { message: 'Application not found' } });
    }

    // SECURITY CHECK: Applicant cannot request info on their own application
    if (application.userId === req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'SELF_ACTION_FORBIDDEN', message: 'You cannot request information on your own application' },
      });
    }

    const applicant = await User.findByPk(application.userId);
    if (applicant && ['admin', 'moderator'].includes(applicant.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Moderators cannot alter administrative accounts' },
      });
    }

    const auditLog = [...(application.auditLog || [])];
    auditLog.push({
      action: 'information_requested',
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      timestamp: new Date().toISOString(),
      note: note.trim(),
    });

    await application.update({
      status: 'information_requested',
      reviewNotes: note.trim(),
      reviewerId: req.user.id,
      reviewedAt: new Date(),
      auditLog,
    });

    await Notification.create({
      userId: application.userId,
      type: 'application_more_info',
      title: 'More Information Needed',
      body: `Action needed on your ${application.requestedRole.replace('_', ' ')} application: ${note.trim()}`,
      link: '/profile',
    });

    res.json({
      success: true,
      data: application,
      message: 'Applicant notified for more information',
    });
  } catch (error) {
    next(error);
  }
};

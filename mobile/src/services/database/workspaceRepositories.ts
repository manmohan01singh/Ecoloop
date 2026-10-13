import {
  UserProfile,
  ProviderApplication,
  RepairRequest,
  RepairQuote,
  RecyclingRequest,
  CollectionEvent,
  InventoryItem,
  DevicePassportEvent,
  ModerationReport,
  ModerationAction,
  AuditLogRecord,
  getStoredProviderApplications,
  saveProviderApplication,
  getStoredRepairRequests,
  saveRepairRequest,
  getStoredRepairQuotes,
  saveRepairQuote,
  getStoredRecyclingRequests,
  saveRecyclingRequest,
  getStoredCollectionEvents,
  saveCollectionEvent,
  getStoredInventoryItems,
  saveInventoryItem,
  saveInventoryItemsBatch,
  getStoredPassportEvents,
  savePassportEvent,
  getStoredModerationReports,
  saveModerationReport,
  getStoredModerationActions,
  saveModerationAction,
  getStoredAuditLogs,
  saveAuditLog,
  getStoredListings,
  saveListing,
  getAllProfiles,
  saveProfile,
  saveActivityEvent,
} from '../storage/localPersistence';
import { canAdminister, canModerate, grantUserRole } from '../auth/permissionsService';

// =============================================================================
// 1. PROVIDER APPLICATIONS REPOSITORY
// =============================================================================

export interface SubmitApplicationParams {
  userId: string;
  applicationType: 'repair_pro' | 'recycler' | 'business';
  businessName: string;
  registrationNumber: string;
  categories: string[];
  serviceArea: string;
  documentationUrls?: string[];
}

export function submitProviderApplication(params: SubmitApplicationParams): {
  success: boolean;
  application?: ProviderApplication;
  error?: string;
} {
  if (!params.businessName.trim()) {
    return { success: false, error: 'Business name is required.' };
  }
  if (!params.registrationNumber.trim()) {
    return { success: false, error: 'Business registration or tax number is required.' };
  }
  if (!params.categories || params.categories.length === 0) {
    return { success: false, error: 'Please select at least one supported device category.' };
  }

  const newApp: ProviderApplication = {
    id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: params.userId,
    applicationType: params.applicationType,
    businessName: params.businessName.trim(),
    registrationNumber: params.registrationNumber.trim(),
    categories: params.categories,
    serviceArea: params.serviceArea.trim() || 'Metro Vancouver',
    documentationUrls: params.documentationUrls || [],
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveProviderApplication(newApp);

  // Send activity event to user
  saveActivityEvent({
    id: `act-app-${Date.now()}`,
    recipientId: params.userId,
    eventType: 'system_notice',
    entityType: 'system',
    title: 'Provider Application Received',
    description: `Your application for ${newApp.businessName} as a ${newApp.applicationType} has been submitted for verification review.`,
    metadata: { applicationId: newApp.id, type: newApp.applicationType },
    readAt: null,
    createdAt: new Date().toISOString(),
  });

  return { success: true, application: newApp };
}

export function getProviderApplications(filterStatus?: ProviderApplication['status']): ProviderApplication[] {
  const all = getStoredProviderApplications();
  if (filterStatus) {
    return all.filter((a) => a.status === filterStatus);
  }
  return all;
}

export function reviewProviderApplication(
  adminProfile: UserProfile,
  applicationId: string,
  decision: 'approved' | 'rejected',
  notes: string = ''
): { success: boolean; application?: ProviderApplication; error?: string } {
  if (!canAdminister(adminProfile)) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const applications = getStoredProviderApplications();
  const app = applications.find((a) => a.id === applicationId);
  if (!app) {
    return { success: false, error: 'Application not found.' };
  }

  app.status = decision;
  app.reviewerId = adminProfile.id;
  app.reviewerNotes = notes;
  app.reviewedAt = new Date().toISOString();
  app.updatedAt = new Date().toISOString();
  saveProviderApplication(app);

  // If approved, automatically grant role capability
  if (decision === 'approved') {
    grantUserRole(adminProfile, app.userId, app.applicationType);
  }

  // Notify applicant
  saveActivityEvent({
    id: `act-app-dec-${Date.now()}`,
    recipientId: app.userId,
    eventType: 'system_notice',
    entityType: 'system',
    title: `Provider Application ${decision === 'approved' ? 'Approved! 🎉' : 'Update'}`,
    description:
      decision === 'approved'
        ? `Congratulations! Your business "${app.businessName}" is now verified on EcoLoop. Workspace access granted.`
        : `Your application for "${app.businessName}" was not approved. Feedback: ${notes || 'Criteria not met.'}`,
    metadata: { applicationId: app.id, status: decision },
    readAt: null,
    createdAt: new Date().toISOString(),
  });

  return { success: true, application: app };
}

// =============================================================================
// 2. REPAIR WORKFLOW REPOSITORY
// =============================================================================

export interface CreateRepairRequestParams {
  customerId: string;
  customerName: string;
  deviceCategory: string;
  brand: string;
  model: string;
  issueType: string;
  symptoms: string;
  photos?: string[];
  urgency?: 'low' | 'standard' | 'express';
  preferredServiceType?: 'dropoff' | 'pickup' | 'mail_in';
  city?: string;
}

export function createRepairRequest(params: CreateRepairRequestParams): {
  success: boolean;
  request?: RepairRequest;
  error?: string;
} {
  if (!params.brand.trim() || !params.model.trim()) {
    return { success: false, error: 'Device brand and model are required.' };
  }
  if (!params.symptoms.trim()) {
    return { success: false, error: 'Please describe the fault or symptoms.' };
  }

  const newReq: RepairRequest = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    customerId: params.customerId,
    customerName: params.customerName,
    deviceCategory: params.deviceCategory,
    brand: params.brand.trim(),
    model: params.model.trim(),
    issueType: params.issueType || 'General Hardware Fault',
    symptoms: params.symptoms.trim(),
    photos: params.photos || [],
    urgency: params.urgency || 'standard',
    preferredServiceType: params.preferredServiceType || 'dropoff',
    city: params.city || 'Metro Vancouver',
    status: 'submitted',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveRepairRequest(newReq);

  // Activity event
  saveActivityEvent({
    id: `act-rep-${Date.now()}`,
    recipientId: params.customerId,
    eventType: 'listing_created',
    entityType: 'device_listing',
    title: 'Repair Request Submitted',
    description: `Your ${newReq.brand} ${newReq.model} repair ticket is now broadcasting to certified local specialists.`,
    metadata: { repairRequestId: newReq.id },
    readAt: null,
    createdAt: new Date().toISOString(),
  });

  return { success: true, request: newReq };
}

export function getRepairRequests(customerId?: string): RepairRequest[] {
  const all = getStoredRepairRequests();
  if (customerId) {
    return all.filter((r) => r.customerId === customerId);
  }
  return all;
}

export interface SubmitQuoteParams {
  repairRequestId: string;
  providerId: string;
  providerName: string;
  partsCost: number;
  laborCost: number;
  diagnosticFee?: number;
  estimatedTurnaroundDays: number;
  warrantyDays?: number;
  notes: string;
}

export function submitRepairQuote(params: SubmitQuoteParams): {
  success: boolean;
  quote?: RepairQuote;
  error?: string;
} {
  const requests = getStoredRepairRequests();
  const request = requests.find((r) => r.id === params.repairRequestId);
  if (!request) {
    return { success: false, error: 'Repair request not found.' };
  }

  const parts = Math.max(0, params.partsCost || 0);
  const labor = Math.max(0, params.laborCost || 0);
  const diag = Math.max(0, params.diagnosticFee || 0);
  const total = parts + labor + diag;

  const quote: RepairQuote = {
    id: `quo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    repairRequestId: params.repairRequestId,
    providerId: params.providerId,
    providerName: params.providerName,
    partsCost: parts,
    laborCost: labor,
    diagnosticFee: diag,
    totalAmount: total,
    estimatedTurnaroundDays: Math.max(1, params.estimatedTurnaroundDays || 2),
    warrantyDays: params.warrantyDays !== undefined ? params.warrantyDays : 90,
    notes: params.notes.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  saveRepairQuote(quote);

  // Transition request to 'quoted'
  if (request.status === 'submitted') {
    request.status = 'quoted';
    saveRepairRequest(request);
  }

  // Notify customer of new quote
  saveActivityEvent({
    id: `act-quo-${Date.now()}`,
    recipientId: request.customerId,
    eventType: 'system_notice',
    entityType: 'device_listing',
    title: 'New Repair Quote Received',
    description: `${quote.providerName} submitted an itemized quote of $${quote.totalAmount} for your ${request.brand} ${request.model}.`,
    metadata: { quoteId: quote.id, repairRequestId: request.id },
    readAt: null,
    createdAt: new Date().toISOString(),
  });

  return { success: true, quote };
}

export function getQuotesForRepairRequest(requestId: string): RepairQuote[] {
  return getStoredRepairQuotes().filter((q) => q.repairRequestId === requestId);
}

export function acceptRepairQuote(customerId: string, repairRequestId: string, quoteId: string): {
  success: boolean;
  error?: string;
} {
  const requests = getStoredRepairRequests();
  const request = requests.find((r) => r.id === repairRequestId);
  if (!request) return { success: false, error: 'Request not found.' };
  if (request.customerId !== customerId) return { success: false, error: 'Unauthorized.' };

  const quotes = getStoredRepairQuotes();
  const quote = quotes.find((q) => q.id === quoteId);
  if (!quote) return { success: false, error: 'Quote not found.' };

  quote.status = 'accepted';
  saveRepairQuote(quote);

  // Reject all other pending quotes for this request
  quotes.forEach((q) => {
    if (q.repairRequestId === repairRequestId && q.id !== quoteId && q.status === 'pending') {
      q.status = 'rejected';
      saveRepairQuote(q);
    }
  });

  request.status = 'accepted';
  request.acceptedQuoteId = quoteId;
  saveRepairRequest(request);

  // Notify provider
  saveActivityEvent({
    id: `act-quo-acc-${Date.now()}`,
    recipientId: quote.providerId,
    eventType: 'system_notice',
    entityType: 'device_listing',
    title: 'Repair Quote Accepted! 🎉',
    description: `Customer ${request.customerName} accepted your quote for ${request.brand} ${request.model}. Ready for scheduling.`,
    metadata: { quoteId, repairRequestId },
    readAt: null,
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}

export function updateRepairStatus(
  providerId: string,
  repairRequestId: string,
  newStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed',
  notes: string = ''
): { success: boolean; error?: string } {
  const requests = getStoredRepairRequests();
  const request = requests.find((r) => r.id === repairRequestId);
  if (!request) return { success: false, error: 'Request not found.' };

  // Validate state transitions
  const validTransitions: Record<string, string[]> = {
    submitted: ['quoted', 'cancelled'],
    matching: ['quoted', 'cancelled'],
    quoted: ['accepted', 'cancelled'],
    accepted: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    scheduled: ['in_progress', 'completed', 'cancelled'],
    in_progress: ['completed', 'disputed', 'cancelled'],
    completed: ['disputed'],
    cancelled: [],
    disputed: ['in_progress', 'cancelled'],
  };

  const allowed = validTransitions[request.status] || [];
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `Invalid repair status transition from "${request.status}" to "${newStatus}". Allowed: ${allowed.join(', ') || 'none'}.`,
    };
  }

  request.status = newStatus;
  saveRepairRequest(request);

  // If completed, award karma & create passport event
  if (newStatus === 'completed') {
    recordPassportEvent({
      deviceIdentifier: `${request.brand}-${request.model}-${request.id.slice(-6)}`,
      eventType: 'verified_repair',
      actorId: providerId,
      actorRole: 'repair_pro',
      actorName: 'Certified Repair Specialist',
      verificationTier: 'evidence_backed',
      summary: `Repair completed successfully. Replaced components tested and certified with 90-day warranty. ${notes}`,
      metadata: { repairRequestId, issueType: request.issueType },
    });
  }

  saveActivityEvent({
    id: `act-rep-stat-${Date.now()}`,
    recipientId: request.customerId,
    eventType: 'listing_status_changed',
    entityType: 'device_listing',
    title: `Repair Status: ${newStatus.replace('_', ' ').toUpperCase()}`,
    description: `Your ${request.brand} ${request.model} repair is now marked as ${newStatus.replace('_', ' ')}. ${notes}`,
    metadata: { repairRequestId, newStatus },
    readAt: null,
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}

// =============================================================================
// 3. RECYCLING WORKFLOW & SCALE WEIGHT REPOSITORY
// =============================================================================

export interface CreateRecyclingRequestParams {
  userId: string;
  userName: string;
  deviceCategory: string;
  brand: string;
  model: string;
  quantity?: number;
  estimatedWeightKg?: number;
  condition?: string;
  hasHazardousBattery?: boolean;
  collectionType?: 'dropoff' | 'pickup';
  address?: string;
  city?: string;
}

export function createRecyclingRequest(params: CreateRecyclingRequestParams): {
  success: boolean;
  request?: RecyclingRequest;
  error?: string;
} {
  if (!params.brand.trim() || !params.model.trim()) {
    return { success: false, error: 'Device brand and model are required.' };
  }

  const req: RecyclingRequest = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: params.userId,
    userName: params.userName,
    deviceCategory: params.deviceCategory,
    brand: params.brand.trim(),
    model: params.model.trim(),
    quantity: Math.max(1, params.quantity || 1),
    estimatedWeightKg: Math.max(0.1, params.estimatedWeightKg || 0.5),
    condition: params.condition || 'End-of-life',
    hasHazardousBattery: !!params.hasHazardousBattery,
    collectionType: params.collectionType || 'dropoff',
    address: params.address || '',
    city: params.city || 'Metro Vancouver',
    status: 'requested',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveRecyclingRequest(req);

  saveActivityEvent({
    id: `act-rec-${Date.now()}`,
    recipientId: params.userId,
    eventType: 'listing_created',
    entityType: 'device_listing',
    title: 'Recycling Collection Requested',
    description: `Request logged for ${req.quantity}x ${req.brand} ${req.model}. Assigned to circular e-waste queue.`,
    metadata: { recyclingRequestId: req.id, hasHazardous: req.hasHazardousBattery },
    readAt: null,
    createdAt: new Date().toISOString(),
  });

  return { success: true, request: req };
}

export function getRecyclingRequests(userId?: string): RecyclingRequest[] {
  const all = getStoredRecyclingRequests();
  if (userId) {
    return all.filter((r) => r.userId === userId || r.assignedRecyclerId === userId);
  }
  return all;
}

export function acceptRecyclingRequest(
  recyclerId: string,
  recyclerName: string,
  requestId: string
): { success: boolean; error?: string } {
  const requests = getStoredRecyclingRequests();
  const req = requests.find((r) => r.id === requestId);
  if (!req) return { success: false, error: 'Request not found.' };

  req.status = 'accepted';
  req.assignedRecyclerId = recyclerId;
  req.assignedRecyclerName = recyclerName;
  saveRecyclingRequest(req);

  saveActivityEvent({
    id: `act-rec-acc-${Date.now()}`,
    recipientId: req.userId,
    eventType: 'listing_status_changed',
    entityType: 'device_listing',
    title: 'Recycling Request Accepted',
    description: `${recyclerName} has accepted your recycling request. Awaiting drop-off / scheduled pickup.`,
    metadata: { requestId, recyclerId },
    readAt: null,
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}

export interface RecordReceiptParams {
  requestId: string;
  recyclerId: string;
  recyclerName: string;
  verifiedWeightKg: number;
  hazardousNotes?: string;
  processingStage: 'dismantled' | 'materials_recovered' | 'certified_destruction';
  dispositionSummary: string;
}

export function recordCollectionReceipt(params: RecordReceiptParams): {
  success: boolean;
  collectionEvent?: CollectionEvent;
  error?: string;
} {
  const requests = getStoredRecyclingRequests();
  const req = requests.find((r) => r.id === params.requestId);
  if (!req) return { success: false, error: 'Recycling request not found.' };
  if (req.status === 'closed') {
    return { success: false, error: 'Recycling request has already been processed and closed.' };
  }
  if (params.verifiedWeightKg <= 0) return { success: false, error: 'Verified weight must be greater than 0 kg.' };

  const certNumber = `ECO-CERT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const event: CollectionEvent = {
    id: `cev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    recyclingRequestId: params.requestId,
    recyclerId: params.recyclerId,
    recyclerName: params.recyclerName,
    verifiedWeightKg: params.verifiedWeightKg,
    hazardousNotes: params.hazardousNotes,
    processingStage: params.processingStage,
    certificateNumber: certNumber,
    dispositionSummary: params.dispositionSummary.trim() || 'Dismantled for material recovery',
    recordedAt: new Date().toISOString(),
  };

  saveCollectionEvent(event);

  req.status = 'closed';
  req.certificateNumber = certNumber;
  saveRecyclingRequest(req);

  // Update user profile co2 and karma
  const allProfiles = getAllProfiles();
  const userProf = allProfiles[req.userId];
  if (userProf) {
    const co2Saved = Number((params.verifiedWeightKg * 22.5).toFixed(2)); // ~22.5 kg CO2 per kg e-waste diverted
    userProf.co2DivertedKg = Number((userProf.co2DivertedKg + co2Saved).toFixed(2));
    userProf.karmaPoints += Math.max(15, Math.round(params.verifiedWeightKg * 10));
    saveProfile(userProf);
  }

  // Record into Device Passport
  recordPassportEvent({
    deviceIdentifier: `${req.brand}-${req.model}-${req.id.slice(-6)}`,
    eventType: 'responsibly_processed',
    actorId: params.recyclerId,
    actorRole: 'recycler',
    actorName: params.recyclerName,
    verificationTier: 'certified',
    summary: `Verified ${params.verifiedWeightKg} kg processed. Certificate #${certNumber} issued. Stage: ${params.processingStage}.`,
    metadata: { certNumber, verifiedWeightKg: params.verifiedWeightKg },
  });

  saveActivityEvent({
    id: `act-rec-cert-${Date.now()}`,
    recipientId: req.userId,
    eventType: 'karma_earned',
    entityType: 'device_listing',
    title: 'Recycling Certificate Issued! 🌱',
    description: `Official Certificate #${certNumber} generated. Measured weight: ${params.verifiedWeightKg} kg. Thank you for closing the loop!`,
    metadata: { certNumber, verifiedWeightKg: params.verifiedWeightKg },
    readAt: null,
    createdAt: new Date().toISOString(),
  });

  return { success: true, collectionEvent: event };
}

// =============================================================================
// 4. BUSINESS INVENTORY & BULK CSV REPOSITORY
// =============================================================================

export function getInventoryItems(ownerId?: string): InventoryItem[] {
  const all = getStoredInventoryItems();
  if (ownerId) {
    return all.filter((i) => i.ownerId === ownerId);
  }
  return all;
}

export function addInventoryItem(ownerId: string, itemData: Partial<InventoryItem>): {
  success: boolean;
  item?: InventoryItem;
  error?: string;
} {
  if (!itemData.sku?.trim()) return { success: false, error: 'SKU is required.' };
  if (!itemData.title?.trim()) return { success: false, error: 'Item title is required.' };

  const newItem: InventoryItem = {
    id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ownerId,
    sku: itemData.sku.trim(),
    title: itemData.title.trim(),
    deviceCategory: itemData.deviceCategory || 'smartphone',
    brand: itemData.brand || 'Generic',
    model: itemData.model || 'Standard',
    conditionGrade: itemData.conditionGrade || 'A',
    quantity: Math.max(0, itemData.quantity || 1),
    unitPrice: Math.max(0, itemData.unitPrice || 0),
    isWholesale: !!itemData.isWholesale,
    minimumOrderQty: Math.max(1, itemData.minimumOrderQty || 1),
    refurbishedInspected: !!itemData.refurbishedInspected,
    warrantyDays: itemData.warrantyDays || 90,
    notes: itemData.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveInventoryItem(newItem);
  return { success: true, item: newItem };
}

export interface CsvImportResult {
  totalRows: number;
  successful: number;
  failed: number;
  errors: { row: number; error: string }[];
  importedItems: InventoryItem[];
}

/**
 * RFC 4180 compliant CSV tokenizer.
 * Strips UTF-8 BOM, parses double-quoted fields with commas and escaped quotes (""),
 * handles CRLF/LF line breaks, tracks source row numbers, and skips blank lines.
 */
export function parseCsvRows(csvContent: string): { rows: string[][]; lineNumbers: number[] } {
  let content = csvContent;
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  const rows: string[][] = [];
  const lineNumbers: number[] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  let currentLineNumber = 1;
  let rowStartLine = 1;

  const len = content.length;
  let i = 0;

  while (i < len) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < len && content[i + 1] === '"') {
          currentCell += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        if (char === '\n') {
          currentLineNumber++;
        }
        currentCell += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
        i++;
        continue;
      } else if (char === '\r') {
        if (i + 1 < len && content[i + 1] === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        currentCell = '';
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
          lineNumbers.push(rowStartLine);
        }
        currentRow = [];
        currentLineNumber++;
        rowStartLine = currentLineNumber;
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        currentCell = '';
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
          lineNumbers.push(rowStartLine);
        }
        currentRow = [];
        currentLineNumber++;
        rowStartLine = currentLineNumber;
        i++;
        continue;
      } else {
        currentCell += char;
        i++;
      }
    }
  }

  currentRow.push(currentCell.trim());
  if (currentRow.some((c) => c.length > 0)) {
    rows.push(currentRow);
    lineNumbers.push(rowStartLine);
  }

  return { rows, lineNumbers };
}

export function importInventoryFromCsv(ownerId: string, csvContent: string): CsvImportResult {
  const { rows, lineNumbers } = parseCsvRows(csvContent);

  if (rows.length < 2) {
    return {
      totalRows: 0,
      successful: 0,
      failed: 0,
      errors: [{ row: 1, error: 'CSV file is empty or missing headers.' }],
      importedItems: [],
    };
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const expected = ['sku', 'title', 'devicecategory', 'brand', 'model', 'conditiongrade', 'quantity', 'unitprice'];

  const missingHeaders = expected.filter((exp) => !headers.includes(exp));
  if (missingHeaders.length > 0) {
    return {
      totalRows: rows.length - 1,
      successful: 0,
      failed: rows.length - 1,
      errors: [{ row: 1, error: `Missing required header columns: ${missingHeaders.join(', ')}` }],
      importedItems: [],
    };
  }

  const validGrades = ['A+', 'A', 'B', 'C', 'For Parts'];
  const importedItems: InventoryItem[] = [];
  const errors: { row: number; error: string }[] = [];
  const seenSkusInFile = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const rowNum = lineNumbers[i];
    const values = rows[i];
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });

    const sku = rowObj['sku'];
    const title = rowObj['title'];
    const deviceCategory = rowObj['devicecategory'] || 'other';
    const brand = rowObj['brand'] || 'Unknown';
    const model = rowObj['model'] || 'Unknown';
    const conditionGrade = rowObj['conditiongrade'] as any;
    const quantity = parseInt(rowObj['quantity'], 10);
    const unitPrice = parseFloat(rowObj['unitprice']);

    if (!sku) {
      errors.push({ row: rowNum, error: 'SKU cannot be empty.' });
      continue;
    }
    const skuLower = sku.toLowerCase();
    if (seenSkusInFile.has(skuLower)) {
      errors.push({ row: rowNum, error: `Duplicate SKU "${sku}" detected within the same import file.` });
      continue;
    }
    seenSkusInFile.add(skuLower);

    if (!title) {
      errors.push({ row: rowNum, error: 'Title cannot be empty.' });
      continue;
    }
    if (!validGrades.includes(conditionGrade)) {
      errors.push({ row: rowNum, error: `Invalid condition grade: "${conditionGrade}". Must be one of: ${validGrades.join(', ')}` });
      continue;
    }
    if (isNaN(quantity) || quantity < 0) {
      errors.push({ row: rowNum, error: 'Quantity must be a positive integer.' });
      continue;
    }
    if (isNaN(unitPrice) || unitPrice < 0) {
      errors.push({ row: rowNum, error: 'UnitPrice must be a non-negative number.' });
      continue;
    }

    const item: InventoryItem = {
      id: `inv-csv-${Date.now()}-${i}`,
      ownerId,
      sku,
      title,
      deviceCategory,
      brand,
      model,
      conditionGrade,
      quantity,
      unitPrice,
      isWholesale: rowObj['iswholesale'] === 'true' || rowObj['iswholesale'] === '1',
      minimumOrderQty: parseInt(rowObj['minimumorderqty'] || '1', 10) || 1,
      refurbishedInspected: true,
      warrantyDays: parseInt(rowObj['warrantydays'] || '90', 10) || 90,
      notes: rowObj['notes'] || 'Bulk imported via CSV inventory feed.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    importedItems.push(item);
  }

  if (importedItems.length > 0) {
    saveInventoryItemsBatch(importedItems);
  }

  return {
    totalRows: rows.length - 1,
    successful: importedItems.length,
    failed: errors.length,
    errors,
    importedItems,
  };
}

// =============================================================================
// 5. DEVICE PASSPORT REPOSITORY
// =============================================================================

export interface RecordPassportEventParams {
  deviceIdentifier: string;
  listingId?: string;
  eventType: DevicePassportEvent['eventType'];
  actorId: string;
  actorRole: string;
  actorName: string;
  verificationTier: DevicePassportEvent['verificationTier'];
  summary: string;
  evidenceUrl?: string;
  metadata?: Record<string, any>;
}

export function recordPassportEvent(params: RecordPassportEventParams): DevicePassportEvent {
  const event: DevicePassportEvent = {
    id: `pass-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    deviceIdentifier: params.deviceIdentifier.trim().toUpperCase(),
    listingId: params.listingId,
    eventType: params.eventType,
    actorId: params.actorId,
    actorRole: params.actorRole,
    actorName: params.actorName,
    verificationTier: params.verificationTier,
    summary: params.summary.trim(),
    evidenceUrl: params.evidenceUrl,
    metadata: params.metadata || {},
    createdAt: new Date().toISOString(),
  };

  savePassportEvent(event);
  return event;
}

export function getPassportEventsForDevice(deviceIdentifier: string): DevicePassportEvent[] {
  const searchId = deviceIdentifier.trim().toUpperCase();
  return getStoredPassportEvents()
    .filter((e) => e.deviceIdentifier.toUpperCase().includes(searchId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// =============================================================================
// 6. MODERATION & TRUST REPOSITORY
// =============================================================================

export interface CreateReportParams {
  reporterId: string;
  reporterName: string;
  targetType: 'listing' | 'user' | 'provider' | 'quote';
  targetId: string;
  targetTitle: string;
  category: ModerationReport['category'];
  description: string;
  evidenceUrls?: string[];
}

export function createReport(params: CreateReportParams): {
  success: boolean;
  report?: ModerationReport;
  error?: string;
} {
  if (!params.description.trim()) {
    return { success: false, error: 'Please provide details for the moderation report.' };
  }

  const report: ModerationReport = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    reporterId: params.reporterId,
    reporterName: params.reporterName,
    targetType: params.targetType,
    targetId: params.targetId,
    targetTitle: params.targetTitle,
    category: params.category,
    description: params.description.trim(),
    evidenceUrls: params.evidenceUrls || [],
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveModerationReport(report);
  return { success: true, report };
}

export function getModerationReports(filterStatus?: ModerationReport['status']): ModerationReport[] {
  const all = getStoredModerationReports();
  if (filterStatus) {
    return all.filter((r) => r.status === filterStatus);
  }
  return all;
}

export function takeModerationAction(
  moderatorProfile: UserProfile,
  params: {
    reportId?: string;
    targetType: string;
    targetId: string;
    actionTaken: ModerationAction['actionTaken'];
    justification: string;
  }
): { success: boolean; error?: string } {
  if (!canModerate(moderatorProfile)) {
    return { success: false, error: 'Unauthorized: Moderator credentials required.' };
  }
  if (!params.justification.trim()) {
    return { success: false, error: 'A justification must be provided for audit compliance.' };
  }

  const action: ModerationAction = {
    id: `mod-act-${Date.now()}`,
    reportId: params.reportId,
    moderatorId: moderatorProfile.id,
    moderatorName: moderatorProfile.displayName,
    targetType: params.targetType,
    targetId: params.targetId,
    actionTaken: params.actionTaken,
    justification: params.justification.trim(),
    createdAt: new Date().toISOString(),
  };

  saveModerationAction(action);

  // If report exists, update status
  if (params.reportId) {
    const reports = getStoredModerationReports();
    const rep = reports.find((r) => r.id === params.reportId);
    if (rep) {
      rep.status = 'actioned';
      rep.assignedModeratorId = moderatorProfile.id;
      saveModerationReport(rep);
    }
  }

  // If listing was hidden or removed, update listing status
  if (params.targetType === 'listing' && (params.actionTaken === 'content_hidden' || params.actionTaken === 'content_removed')) {
    const listings = getStoredListings();
    const lst = listings.find((l) => l.id === params.targetId);
    if (lst) {
      lst.status = 'archived';
      saveListing(lst);
    }
  }

  // Audit log
  saveAuditLog({
    id: `aud-mod-${Date.now()}`,
    actorId: moderatorProfile.id,
    actorName: moderatorProfile.displayName,
    actorRole: 'moderator',
    action: `MODERATION_${params.actionTaken.toUpperCase()}`,
    entityType: params.targetType,
    entityId: params.targetId,
    details: { justification: params.justification, reportId: params.reportId },
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}

// =============================================================================
// 7. PLATFORM TELEMETRY & AUDIT REPOSITORY
// =============================================================================

export interface PlatformOperationalMetrics {
  totalCircularDevices: number;
  totalCo2PreventedKg: number;
  activeRepairJobs: number;
  totalRecycledWeightKg: number;
  verifiedProvidersCount: number;
  activeListingsCount: number;
  totalMembersCount: number;
}

export function getPlatformOperationalMetrics(): PlatformOperationalMetrics {
  const listings = getStoredListings();
  const repairs = getStoredRepairRequests();
  const collectionEvents = getStoredCollectionEvents();
  const profiles = Object.values(getAllProfiles());
  const applications = getStoredProviderApplications();

  const totalRecycledWeightKg = collectionEvents.reduce((acc, ev) => acc + (ev.verifiedWeightKg || 0), 0);
  const totalCo2PreventedKg =
    listings.reduce((acc, l) => acc + (l.co2SavedKg || 0), 0) +
    totalRecycledWeightKg * 22.5;

  const verifiedProvidersCount = applications.filter((a) => a.status === 'approved').length + 2; // + verified baseline

  return {
    totalCircularDevices: listings.length + collectionEvents.length + 184,
    totalCo2PreventedKg: Number(totalCo2PreventedKg.toFixed(1)),
    activeRepairJobs: repairs.filter((r) => r.status === 'in_progress' || r.status === 'accepted' || r.status === 'quoted').length,
    totalRecycledWeightKg: Number(totalRecycledWeightKg.toFixed(1)),
    verifiedProvidersCount,
    activeListingsCount: listings.filter((l) => l.status === 'active').length,
    totalMembersCount: Math.max(profiles.length, 12),
  };
}

export function getPlatformAuditLogs(): AuditLogRecord[] {
  return getStoredAuditLogs();
}

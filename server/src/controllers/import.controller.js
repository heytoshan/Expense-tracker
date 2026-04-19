const multer = require('multer');
const XLSX = require('xlsx');
const Expense = require('../models/Expense');
const { CATEGORIES } = require('../models/Expense');
const { catchAsync, ApiError } = require('../utils/helpers');

// Configure multer for memory storage (no files saved to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv',
      'application/csv',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only Excel (.xlsx, .xls) and CSV files are allowed'), false);
    }
  },
});

/**
 * Normalize a column header to a known field name
 */
const normalizeHeader = (header) => {
  const h = String(header).toLowerCase().trim();
  if (['title', 'name', 'description', 'item', 'items', 'expense', 'expense name', 'expense title', 'note', 'notes', 'remarks', 'subcategory', 'account'].includes(h)) return 'title';
  if (['amount', 'price', 'cost', 'value', 'total', 'sum', 'outflow', 'debit', 'spent'].includes(h)) return 'amount';
  if (['category', 'type', 'group', 'tag', 'main category'].includes(h)) return 'category';
  if (['date', 'expense date', 'transaction date', 'when', 'day', 'time'].includes(h)) return 'date';
  if (['memo', 'comment', 'comments', 'remarks', 'details', 'extra'].includes(h)) return 'notes';
  return null;
};

/**
 * Try to match a raw category string to one of the valid categories
 */
const matchCategory = (raw) => {
  if (!raw) return 'other';
  const lower = String(raw).toLowerCase().trim();

  // Direct match
  if (CATEGORIES.includes(lower)) return lower;

  // Fuzzy matching
  const aliases = {
    food: ['food', 'dining', 'restaurant', 'meal', 'lunch', 'dinner', 'breakfast', 'cafe', 'eat', 'food & dining'],
    travel: ['travel', 'trip', 'vacation', 'flight', 'hotel', 'accommodation'],
    shopping: ['shopping', 'shop', 'buy', 'purchase', 'retail', 'clothes', 'clothing'],
    entertainment: ['entertainment', 'fun', 'movie', 'game', 'games', 'concert', 'show', 'netflix', 'streaming'],
    bills: ['bills', 'bill', 'utility', 'utilities', 'electricity', 'water', 'gas', 'internet', 'phone', 'rent', 'bills & utilities'],
    health: ['health', 'medical', 'medicine', 'doctor', 'hospital', 'pharmacy', 'gym', 'fitness'],
    education: ['education', 'school', 'college', 'course', 'book', 'books', 'tuition', 'learning'],
    transport: ['transport', 'transportation', 'fuel', 'petrol', 'gas', 'uber', 'taxi', 'bus', 'metro', 'commute'],
    groceries: ['groceries', 'grocery', 'supermarket', 'market'],
    subscriptions: ['subscription', 'subscriptions', 'recurring', 'membership', 'premium'],
  };

  for (const [category, keywords] of Object.entries(aliases)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }

  return 'other';
};

/**
 * Parse a date from various formats
 */
const parseDate = (raw) => {
  if (!raw) return new Date();

  // If it's already a Date object (from xlsx)
  if (raw instanceof Date && !isNaN(raw)) return raw;

  // If it's a number (Excel serial date)
  if (typeof raw === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + raw * 86400000);
  }

  // Try standard parsing
  const parsed = new Date(raw);
  if (!isNaN(parsed)) return parsed;

  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = String(raw).split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    // If first part > 12, assume DD/MM/YYYY
    if (a > 12) return new Date(c, b - 1, a);
    // Otherwise try MM/DD/YYYY
    return new Date(c, a - 1, b);
  }

  return new Date();
};

/**
 * POST /api/expenses/import
 */
const importExpenses = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a file');
  }

  // Parse the file
  const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!rawData.length) {
    throw new ApiError(400, 'The file is empty or has no readable data');
  }

  // Map headers
  const originalHeaders = Object.keys(rawData[0]);
  const headerMap = {};
  originalHeaders.forEach((h) => {
    const normalized = normalizeHeader(h);
    if (normalized) headerMap[h] = normalized;
  });

  // Check that we have at least title and amount
  const mappedFields = Object.values(headerMap);
  if (!mappedFields.includes('title') || !mappedFields.includes('amount')) {
    throw new ApiError(400,
      `Could not find required columns. Found: [${originalHeaders.join(', ')}]. ` +
      'Need at least "Title" (or Name/Description) and "Amount" (or Price/Cost) columns.'
    );
  }

  // Process rows
  const expenses = [];
  const errors = [];

  rawData.forEach((row, index) => {
    const mapped = {};
    for (const [original, normalized] of Object.entries(headerMap)) {
      mapped[normalized] = row[original];
    }

    const title = String(mapped.title || '').trim();
    const amount = parseFloat(mapped.amount);

    if (!title) {
      errors.push(`Row ${index + 2}: Missing title, skipped`);
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      errors.push(`Row ${index + 2}: Invalid amount "${mapped.amount}", skipped`);
      return;
    }

    expenses.push({
      user: req.user.id,
      title: title.substring(0, 100),
      amount,
      category: matchCategory(mapped.category),
      date: parseDate(mapped.date),
      notes: mapped.notes ? String(mapped.notes).substring(0, 500) : '',
    });
  });

  if (expenses.length === 0) {
    throw new ApiError(400, `No valid expenses found. ${errors.length} rows had errors.`);
  }

  // Bulk insert
  const inserted = await Expense.insertMany(expenses);

  res.status(201).json({
    success: true,
    message: `Successfully imported ${inserted.length} expenses`,
    data: {
      imported: inserted.length,
      skipped: errors.length,
      errors: errors.slice(0, 10), // Return first 10 errors only
      total: rawData.length,
    },
  });
});

module.exports = { importExpenses, upload };

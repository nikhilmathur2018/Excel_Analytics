const express = require('express');
const upload = require('../middleware/upload'); // Assuming this is your multer setup
const {
    uploadExcel,
    getUploadHistory,
    getParsedData,
    deleteUploadedFile, // This was already there
    deleteSheetFromFile // <-- NEW: This needs to be added here!
} = require('../controllers/excelController'); // Import all necessary functions
const { protect } = require('../middleware/authMiddleware'); // Your authentication middleware
const router = express.Router();

// @desc    Upload an Excel file
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('excelFile'), uploadExcel);

// @desc    Get user's upload history (list of uploaded files)
// @route   GET /api/upload/history
// @access  Private
router.get('/history', protect, getUploadHistory);

// @desc    Get parsed data for a specific uploaded file
// @route   GET /api/upload/:id/data
// @access  Private
router.get('/:id/data', protect, getParsedData);

// @desc    Delete an uploaded file by ID
// @route   DELETE /api/upload/:id
// @access  Private
router.delete('/:id', protect, deleteUploadedFile);

// @desc    Delete a specific sheet from an uploaded file
// @route   PUT /api/upload/:fileId/sheet/:sheetName
// @access  Private
router.put('/:fileId/sheet/:sheetName', protect, deleteSheetFromFile); // This line now has deleteSheetFromFile defined

module.exports = router;

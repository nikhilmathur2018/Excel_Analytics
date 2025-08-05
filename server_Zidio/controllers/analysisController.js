const asyncHandler=require('express-async-handler');
const AnalysisSession=require('../models/AnalysisSession');
const UploadedFile=require('../models/UploadedFile');

// @desc    Save an analysis session
// @route   POST /api/analysis
// @access  Private

const saveAnalysisSession = asyncHandler(async (req, res) => {
    const { fileId, sheetName, xAxis, yAxis, chartType, aiSummarySnippet } = req.body;

    // Basic validation
    if (!fileId || !sheetName || !xAxis || !yAxis || !chartType) {
        res.status(400);
        throw new Error('Please provide all required analysis details (fileId, sheetName, xAxis, yAxis, chartType)');
    }

    // Optional: Verify if the fileId belongs to the user
    const uploadedFile = await UploadedFile.findById(fileId);
    if (!uploadedFile || uploadedFile.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to save analysis for this file');
    }

    const analysisSession = await AnalysisSession.create({
        userId: req.user.id, // Comes from the protect middleware
        fileId,
        sheetName,
        xAxis,
        yAxis,
        chartType,
        aiSummarySnippet: aiSummarySnippet || null, // Save snippet if provided
    });

    res.status(201).json({ message: 'Analysis session saved successfully', analysisSession });
});

// @desc    Get all analysis sessions for a user
// @route   GET /api/analysis
// @access  Private
const getUserAnalysisHistory = asyncHandler(async (req, res) => {
    const analysisSessions = await AnalysisSession.find({ userId: req.user.id })
        .populate('fileId', 'originalFileName') // Populate with original file name
        .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(analysisSessions);
});

module.exports = {
    saveAnalysisSession,
    getUserAnalysisHistory,
};



const xlsx = require('xlsx');
const UploadedFile = require('../models/UploadedFile');
const fs = require('fs');
const asyncHandler = require('express-async-handler');

const uploadExcel = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    try {
        const workbook = xlsx.readFile(req.file.path);
        const sheetNames = workbook.SheetNames;

        const allSheetsData = {};
        const columnHeaders = {};

        sheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(sheet);
            allSheetsData[sheetName] = jsonData;

            if (jsonData.length > 0) {
                columnHeaders[sheetName] = Object.keys(jsonData[0]);
            }
        });

        fs.unlinkSync(req.file.path);

        const newUpload = await UploadedFile.create({
            user: req.user._id,
            originalFileName: req.file.originalname, // This is correct
            parsedData: allSheetsData,
            sheetNames: sheetNames,
            columnHeaders: columnHeaders,
        });

        res.status(201).json({ message: 'File uploaded and processed successfully', file: newUpload });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        throw new Error(`Error processing file: ${error.message}`);
    }
});

const getUploadHistory = asyncHandler(async (req, res) => {
    const history = await UploadedFile.find({ user: req.user._id })
        // CORRECTED LINE: Changed 'uploadDate' to 'createdAt'
        .select('originalFileName createdAt sheetNames')
        .sort({ createdAt: -1 }); // Also sort by createdAt for consistency

    res.json(history);
});

const getParsedData = asyncHandler(async (req, res) => {
    const file = await UploadedFile.findOne({ _id: req.params.id, user: req.user._id });
    if (!file) {
        res.status(404);
        throw new Error('File not found or unauthorized');
    }
    res.json({
        originalFileName: file.originalFileName,
        parsedData: file.parsedData,
        sheetNames: file.sheetNames,
        columnHeaders: file.columnHeaders,
    });
});

const deleteUploadedFile = asyncHandler(async (req, res) => {
    const fileId = req.params.id;
    const file = await UploadedFile.findById(fileId);
    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }
    if (file.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this file');
    }
    await file.deleteOne();
    res.status(200).json({ message: 'File deleted successfully', id: fileId });
});

const deleteSheetFromFile = asyncHandler(async (req, res) => {
    const { fileId, sheetName } = req.params;
    const file = await UploadedFile.findById(fileId);
    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }
    if (file.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to modify this file');
    }
    if (!file.sheetNames.includes(sheetName)) {
        res.status(404);
        throw new Error(`Sheet "${sheetName}" not found in this file.`);
    }

    const newParsedData = { ...file.parsedData };
    delete newParsedData[sheetName];

    const newSheetNames = file.sheetNames.filter(name => name !== sheetName);

    const newColumnHeaders = { ...file.columnHeaders };
    delete newColumnHeaders[sheetName];

    if (newSheetNames.length === 0) {
        await file.deleteOne();
        return res.status(200).json({ message: `Last sheet "${sheetName}" deleted. File ${file.originalFileName} removed.` });
    }

    file.parsedData = newParsedData;
    file.sheetNames = newSheetNames;
    file.columnHeaders = newColumnHeaders;
    await file.save();

    res.status(200).json({ message: `Sheet "${sheetName}" deleted successfully from ${file.originalFileName}.`, file });
});

module.exports = {
    uploadExcel,
    getUploadHistory,
    getParsedData,
    deleteUploadedFile,
    deleteSheetFromFile
};
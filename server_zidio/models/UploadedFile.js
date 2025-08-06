const mongoose = require('mongoose');
const uploadedFileSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        originalFileName: { type: String, required: true },
        parsedData: { type: mongoose.Schema.Types.Mixed, required: true }, // Array of objects
        sheetNames: { type: [String], required: true },
        columnHeaders: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true } // This will add createdAt and updatedAt
);

const UploadedFile = mongoose.model('UploadedFile', uploadedFileSchema);
module.exports = UploadedFile;
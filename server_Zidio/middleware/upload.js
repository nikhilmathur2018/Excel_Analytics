// server/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import the file system module

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        const uploadDir = 'uploads'; // Define the directory name
        // Check if the directory exists, and create it if it doesn't
        if (!fs.existsSync(uploadDir)) {
            // This is the CRUCIAL FIX for ENOENT errors if the directory doesn't exist
            fs.mkdirSync(uploadDir, { recursive: true }); // `recursive: true` ensures parent directories are also created if needed
        }
        cb(null, uploadDir); // Use the correct directory name
    },
    filename: function(req, file, cb){
        // Ensure filenames are unique and include original extension
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    console.log('--- File Filter Debug Info ---');
    console.log('File Original Name:', file.originalname);
    console.log('File MIME Type (received by server):', file.mimetype);
    console.log('File Extension (extracted by server):', path.extname(file.originalname).toLowerCase());
    console.log('------------------------------');

    // Corrected logic for allowed types
    const allowedExtensions = /\.(xls|xlsx|xlsm|xlsb|xltx)$/i; // More specific regex for extensions
    // Updated MIME types for broader compatibility, including .xlsm, .xlsb, .xltx, etc.
    const allowedMimeTypes = /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|application\/vnd\.ms-excel|application\/msexcel|application\/x-msexcel|application\/x-ms-excel|application\/x-excel|application\/x-dos_ms_excel|application\/xls|application\/x-xls|application\/vnd\.ms-excel\.sheet\.macroenabled\.12|application\/vnd\.ms-excel\.template\.macroenabled\.12|application\/vnd\.ms-excel\.addin\.macroenabled\.12|application\/vnd\.ms-excel\.sheet\.binary\.macroenabled\.12/;


    const extname = allowedExtensions.test(path.extname(file.originalname)); // Removed .toLowerCase() here as regex handles case-insensitivity with /i
    const mimetype = allowedMimeTypes.test(file.mimetype);

    console.log('Result of Extname check:', extname);
    console.log('Result of Mimetype check:', mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Excel files only!'), false); // Pass an Error object for better handling
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;
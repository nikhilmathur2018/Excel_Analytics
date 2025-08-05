// server/middleware/errorMiddleware.js
const errorHandler = (err, req, res, next) => {
    // Determine the status code: use the one set on the error, or default to 500 (Internal Server Error)
    const statusCode = res.statusCode ? res.statusCode : 500;

    res.status(statusCode);

    res.json({
        message: err.message,
        // In development, send the stack trace for debugging. In production, omit it for security.
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    errorHandler,
};
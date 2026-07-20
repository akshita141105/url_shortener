/**
 * Custom API Error class for consistent error handling
 * @class ApiError
 * @extends Error
 */
class ApiError extends Error {
    /**
     * Create an API error
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     */
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
    }
}

export default ApiError;

/**
 * Standardized API Response class for consistent response formatting
 * @class ApiResponse
 */
class ApiResponse {
    /**
     * Create an API response
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Response message
     * @param {*} data - Response data (optional)
     */
    constructor(statusCode, message, data = null) {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}

export default ApiResponse;

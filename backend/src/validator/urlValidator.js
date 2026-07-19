import validator from 'validator';
import ApiError from '../utils/ApiError.js';

const validateUrl = (url) => {
    if(!validator.isURL(url)){
        throw new ApiError(400,"Invalid URL");
    };
};

export default validateUrl;
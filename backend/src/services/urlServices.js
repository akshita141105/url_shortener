import Url from "../models/Url.js";
import crypto from 'crypto';
import validator from 'validator';
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const Base62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function generateShortCode(length = 7){
    const bytes = crypto.randomBytes(length);
    let code = '';
    
    for(let i=0;i<length;i++){
        code+= Base62[bytes[i] % Base62.length];
    }
    return code;
}

export const createShortUrlService = async (userId, originalUrl,customAlias) => {
    if(!validator.isURL(originalUrl)){
        throw new ApiError(400,"Invalid URL");
    }

    const existingUrl = await Url.findOne({
        user: userId,
        originalUrl,
    });

    if (existingUrl) {
        return existingUrl;
    }

    if (customAlias) {
        const aliasExists = await Url.findOne({
            shortCode: customAlias,
        });

        if (aliasExists) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Custom alias already exists"
            );
        }

        const url = await Url.create({
            user: userId,
            originalUrl,
            shortCode: customAlias,
        });

        return url;
    }

    let shortCode;

    do{
        shortCode = generateShortCode();
    } while(await Url.exists({shortCode}));

    const url = await Url.create({
        user: userId,
        originalUrl,
        shortCode,
    });

    return url;
}

export const getAllUrlsService = async (userId) => {
    return await Url.find({
        user: userId,
    }).sort({
        createdAt: -1,
    });
};

export const deleteUrlService = async (userId, shortCode) => {

    const url = await Url.findOneAndDelete({
        shortCode,
        user: userId,
    });

    if(!url){
        throw new ApiError(StatusCodes.NOT_FOUND,"Short URL not found");
    }
    return url;
}

// export const getUrlAnalyticsService = async (userId, shortCode) => {
    
//     const url = await Url.findOne({
//         shortCode,
//         user: userId,
//     });

//     if(!url){
//         throw new ApiError(
//             StatusCodes.NOT_FOUND,
//             "Short URL not found"
//         );
//     }
//     return url;
// };
import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { createShortUrlService, deleteUrlService, getAllUrlsService } from '../services/urlServices.js';
import Url from '../models/Url.js';
import ApiError from '../utils/ApiError.js';

export const createShortUrl = asyncHandler(async (req, res) => {
    const { originalUrl, customAlias } = req.body;
    const url = await createShortUrlService(req.user._id, originalUrl, customAlias);

    return res.status(StatusCodes.CREATED).json(
        new ApiResponse(
            StatusCodes.CREATED,
            "Short URL created successfully",
            {
                originalUrl: url.originalUrl,
                shortCode: url.shortCode,
                shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
            }
        )
    );
});

export const redirectToOriginalUrl = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    const url = await Url.findOneAndUpdate(
        { shortCode },
        { $inc: { clicks: 1 } },
        { new: true }
    );

    if (!url) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Short URL not found");
    }

    return res.redirect(302, url.originalUrl);
});

export const getAllUrls = asyncHandler(async (req, res) => {
    const urls = await getAllUrlsService(
        req.user._id
    );

    return res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK,
            "URLs fetched successfully",
            urls
        )
    );
});

export const deleteUrl = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    // NOTE: service signature is (userId, shortCode) - order matters
    await deleteUrlService(
        req.user._id,
        shortCode
    );

    return res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK,
            "URL deleted successfully",
            null
        )
    );
});

// export const getUrlAnalytics = asyncHandler(async (req, res) => {
//     const { shortCode } = req.params;

//     // NOTE: service signature is (userId, shortCode) - order matters
//     const url =
//         await getUrlAnalyticsService(
//             req.user._id,
//             shortCode
//         );

//     return res.status(StatusCodes.OK).json(
//         new ApiResponse(
//             StatusCodes.OK,
//             "Analytics fetched successfully",
//             {
//                 originalUrl: url.originalUrl,
//                 shortCode: url.shortCode,
//                 shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
//                 clicks: url.clicks,
//                 createdAt: url.createdAt,
//             }
//         )
//     );
// });
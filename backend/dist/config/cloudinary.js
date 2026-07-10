"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.uploadMedia = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const logger_1 = require("./logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);
if (useCloudinary) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    logger_1.logger.info('Cloudinary initialized successfully.');
}
else {
    logger_1.logger.info('Cloudinary credentials missing. Falling back to local workspace disk storage at /uploads.');
}
const uploadMedia = async (file) => {
    if (useCloudinary) {
        try {
            const result = await cloudinary_1.v2.uploader.upload(file.path, {
                resource_type: 'auto',
                folder: 'online-exam-portal',
            });
            // Delete temporary local file
            fs_1.default.unlinkSync(file.path);
            return result.secure_url;
        }
        catch (e) {
            logger_1.logger.error(`Cloudinary upload failed: ${e.message}. Returning local mock path.`);
        }
    }
    // Local storage fallback
    const uploadDir = path_1.default.join(__dirname, '../../../uploads');
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
    const fileExt = path_1.default.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExt}`;
    const targetPath = path_1.default.join(uploadDir, fileName);
    fs_1.default.copyFileSync(file.path, targetPath);
    fs_1.default.unlinkSync(file.path);
    // Return local asset path
    return `/uploads/${fileName}`;
};
exports.uploadMedia = uploadMedia;

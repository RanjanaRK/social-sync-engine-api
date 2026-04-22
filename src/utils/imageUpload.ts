import { imagekit } from "../config/imagekit.js";

export const uploadImage = async (file: Express.Multer.File) => {
  const response = await imagekit.files.upload({
    file: file.buffer.toString("base64"),
    fileName: file.originalname,
  });
  return response.url;
};

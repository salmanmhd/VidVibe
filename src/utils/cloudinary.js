import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localPath) => {
  try {
    if (!localPath) {
      console.log("Upload failed: file path not provided");
      return null;
    }

    const response = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });
    console.log("File is uploaded on cloudinary", response);
    fs.unlinkSync(localPath);
    return response;
  } catch (error) {
    fs.unlinkSync(localPath);
    console.log("file upload failed: ", error);
    return null;
  }
};

export { uploadOnCloudinary };

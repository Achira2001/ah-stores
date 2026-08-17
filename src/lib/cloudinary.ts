import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file: string, folder: string = "ah-store") {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    })
    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw new Error("Failed to upload image")
  }
}

export async function deleteImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error("Cloudinary delete error:", error)
  }
}

export default cloudinary
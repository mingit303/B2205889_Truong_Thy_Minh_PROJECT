const cloudinary = require("../config/cloudinary");
const { success, error } = require("../utils/response");
const streamifier = require("streamifier");

// Upload ảnh lên Cloudinary
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, "Vui lòng chọn file ảnh", 400);
    }

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "library/books",
          transformation: [
            { width: 400, height: 600, crop: "fill" },
            { quality: "auto" }
          ]
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const result = await uploadPromise;

    return success(res, {
      url: result.secure_url,
      public_id: result.public_id
    }, "Upload ảnh thành công");

  } catch (err) {
    console.error(err);
    return error(res, "Lỗi upload ảnh", 500);
  }
};

// Xóa ảnh từ Cloudinary
const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return error(res, "Vui lòng cung cấp public_id", 400);
    }

    await cloudinary.uploader.destroy(public_id);

    return success(res, null, "Xóa ảnh thành công");
  } catch (err) {
    console.error(err);
    return error(res, "Lỗi xóa ảnh", 500);
  }
};

module.exports = {
  uploadImage,
  deleteImage
};

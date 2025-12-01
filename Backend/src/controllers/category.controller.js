const categoryService = require("../services/category.service");
const { success, error, paginate } = require("../utils/response");

// Lấy danh sách thể loại
exports.getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const result = await categoryService.getCategories(page, limit, search);
    return paginate(res, result.categories, result.page, result.limit, result.total, "Lấy danh sách thể loại thành công");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// Lấy tất cả thể loại (không phân trang - cho dropdown)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    return success(res, categories);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// Lấy chi tiết thể loại
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({ MaTheLoai: req.params.id });
    if (!category) {
      return error(res, "Không tìm thấy thể loại", 404);
    }
    return success(res, category);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// Tạo thể loại mới
exports.createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return success(res, category, "Tạo thể loại thành công", 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// Cập nhật thể loại
exports.updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return success(res, category, "Cập nhật thể loại thành công");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// Xóa thể loại
exports.deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    return success(res, null, "Xóa thể loại thành công");
  } catch (err) {
    return error(res, err.message, 500);
  }
};



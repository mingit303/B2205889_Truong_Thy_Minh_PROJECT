const Category = require("../models/Category");

class CategoryService {
  async getCategories(page = 1, limit = 10, search = "") {
    const skip = (page - 1) * limit;
    
    let query = {};
    if (search) {
      query.$or = [
        { TenTheLoai: { $regex: search, $options: "i" } },
        { MaTheLoai: { $regex: search, $options: "i" } }
      ];
    }

    const categories = await Category.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ TenTheLoai: 1 });

    const total = await Category.countDocuments(query);

    return { categories, total, page, limit };
  }

  async getAllCategories() {
    const categories = await Category.find({}).sort({ TenTheLoai: 1 });
    return categories;
  }

  async createCategory(data) {
    const { MaTheLoai, TenTheLoai } = data;

    if (!MaTheLoai || !TenTheLoai) {
      throw new Error("Mã thể loại và tên thể loại là bắt buộc");
    }

    const existingCategory = await Category.findOne({ MaTheLoai });
    if (existingCategory) {
      throw new Error("Mã thể loại đã tồn tại");
    }

    const newCategory = new Category({ MaTheLoai, TenTheLoai });
    await newCategory.save();

    return newCategory;
  }

  async updateCategory(id, data) {
    const { TenTheLoai } = data;

    const category = await Category.findOne({ MaTheLoai: id });
    if (!category) {
      throw new Error("Không tìm thấy thể loại");
    }

    if (TenTheLoai) category.TenTheLoai = TenTheLoai;
    await category.save();

    return category;
  }

  async deleteCategory(id) {
    const category = await Category.findOne({ MaTheLoai: id });
    if (!category) {
      throw new Error("Không tìm thấy thể loại");
    }

    await Category.deleteOne({ MaTheLoai: id });
    return true;
  }
}

module.exports = new CategoryService();

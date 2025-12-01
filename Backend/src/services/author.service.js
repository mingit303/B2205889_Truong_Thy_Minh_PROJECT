const Author = require("../models/Author");

class AuthorService {
  async getAuthors(page = 1, limit = 10, search = "") {
    const skip = (page - 1) * limit;
    
    let query = {};
    if (search) {
      query.TenTacGia = { $regex: search, $options: "i" };
    }

    const authors = await Author.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ TenTacGia: 1 });

    const total = await Author.countDocuments(query);

    return { authors, total, page, limit };
  }

  async createAuthor(data) {
    const { MaTacGia, TenTacGia } = data;

    if (!MaTacGia || !TenTacGia) {
      throw new Error("Mã tác giả và tên tác giả là bắt buộc");
    }

    const newAuthor = new Author({ MaTacGia, TenTacGia });
    await newAuthor.save();

    return newAuthor;
  }

  async updateAuthor(id, data) {
    const { TenTacGia } = data;

    const author = await Author.findOne({ MaTacGia: id });
    if (!author) {
      throw new Error("Không tìm thấy tác giả");
    }

    if (TenTacGia) author.TenTacGia = TenTacGia;
    await author.save();

    return author;
  }

  async deleteAuthor(id) {
    const author = await Author.findOne({ MaTacGia: id });
    if (!author) {
      throw new Error("Không tìm thấy tác giả");
    }

    await Author.deleteOne({ MaTacGia: id });
    return true;
  }
}

module.exports = new AuthorService();

const Book = require("../models/Book");

class BookService {
  async getBooks(queryParams) {
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      publisher = "",
      author = "",
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryParams;

    const skip = (page - 1) * limit;
    const query = {};

    // SEARCH theo mã + tên sách
    if (search && search.trim() !== "") {
      const kw = search.trim();
      query.$or = [
        { MaSach: { $regex: kw, $options: "i" } },
        { TenSach: { $regex: kw, $options: "i" } },
      ];
    }

    // FILTER theo id (FE đang gửi _id)
    if (category) {
      query.MaTheLoai = category;
    }
    if (publisher) {
      query.MaNXB = publisher;
    }
    if (author) {
      query.MaTacGia = author;
    }

    // PRICE RANGE
    if (minPrice || maxPrice) {
      query.DonGia = {};
      if (minPrice) query.DonGia.$gte = Number(minPrice);
      if (maxPrice) query.DonGia.$lte = Number(maxPrice);
    }

    // YEAR RANGE
    if (minYear || maxYear) {
      query.NamXuatBan = {};
      if (minYear) query.NamXuatBan.$gte = Number(minYear);
      if (maxYear) query.NamXuatBan.$lte = Number(maxYear);
    }

    const sortFields = {
      createdAt: "createdAt",
      price: "DonGia",
      year: "NamXuatBan",
      name: "TenSach",
    };
    const sortKey = sortFields[sortBy] || "createdAt";

    const books = await Book.find(query)
      .populate("MaTheLoai", "MaTheLoai TenTheLoai")
      .populate("MaNXB", "MaNXB TenNXB DiaChi")
      .populate("MaTacGia", "MaTacGia TenTacGia")
      .skip(Number(skip))
      .limit(Number(limit))
      .sort({ [sortKey]: sortOrder === "asc" ? 1 : -1 });

    const total = await Book.countDocuments(query);

    return { books, total, page: Number(page), limit: Number(limit) };
  }

  async getBookById(id) {
    return Book.findById(id)
      .populate("MaTheLoai", "MaTheLoai TenTheLoai")
      .populate("MaNXB", "MaNXB TenNXB DiaChi")
      .populate("MaTacGia", "MaTacGia TenTacGia");
  }

  async createBook(data) {
    const book = new Book(data);
    await book.save();
    return book;
  }

  async updateBook(id, data) {
    const book = await Book.findById(id);
    if (!book) throw new Error("Không tìm thấy sách");

    Object.assign(book, data);
    await book.save();
    return book;
  }

  async deleteBook(id) {
    const deleted = await Book.findByIdAndDelete(id);
    return deleted;
  }
}

module.exports = new BookService();

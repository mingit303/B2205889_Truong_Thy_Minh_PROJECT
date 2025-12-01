const Publisher = require("../models/Publisher");

class PublisherService {
  async getPublishers(page = 1, limit = 10, search = "") {
    const skip = (page - 1) * limit;
    
    let query = {};
    if (search) {
      query.$or = [
        { TenNXB: { $regex: search, $options: "i" } },
        { MaNXB: { $regex: search, $options: "i" } }
      ];
    }

    const publishers = await Publisher.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ TenNXB: 1 });

    const total = await Publisher.countDocuments(query);

    return { publishers, total, page, limit };
  }

  async createPublisher(data) {
    const { MaNXB, TenNXB, DiaChi } = data;

    if (!MaNXB || !TenNXB) {
      throw new Error("Mã NXB và tên NXB là bắt buộc");
    }

    const newPublisher = new Publisher({ MaNXB, TenNXB, DiaChi });
    await newPublisher.save();

    return newPublisher;
  }

  async updatePublisher(id, data) {
    const { TenNXB, DiaChi } = data;

    const publisher = await Publisher.findOne({ MaNXB: id });
    if (!publisher) {
      throw new Error("Không tìm thấy nhà xuất bản");
    }

    if (TenNXB) publisher.TenNXB = TenNXB;
    if (DiaChi) publisher.DiaChi = DiaChi;
    await publisher.save();

    return publisher;
  }

  async deletePublisher(id) {
    const publisher = await Publisher.findOne({ MaNXB: id });
    if (!publisher) {
      throw new Error("Không tìm thấy nhà xuất bản");
    }

    await Publisher.deleteOne({ MaNXB: id });
    return true;
  }
}

module.exports = new PublisherService();

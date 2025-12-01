const Config = require("../models/Config");
const { success, error } = require("../utils/response");

// Lấy tất cả cấu hình
const getConfigs = async (req, res) => {
  try {
    const configs = await Config.find();
    
    // Convert sang object dễ sử dụng
    const configObj = {};
    configs.forEach(config => {
      configObj[config.Ten] = config.GiaTri;
    });

    return success(res, configObj, "Lấy cấu hình thành công");
  } catch (err) {
    console.error(err);
    return error(res, "Lỗi lấy cấu hình", 500);
  }
};

// Cập nhật cấu hình (chỉ SuperAdmin)
const updateConfig = async (req, res) => {
  try {
    const { Ten, GiaTri } = req.body;

    if (!Ten || !GiaTri) {
      return error(res, "Tên và giá trị cấu hình là bắt buộc", 400);
    }

    let config = await Config.findOne({ Ten });
    
    if (config) {
      config.GiaTri = GiaTri;
      await config.save();
    } else {
      config = new Config({ Ten, GiaTri });
      await config.save();
    }

    return success(res, config, "Cập nhật cấu hình thành công");
  } catch (err) {
    console.error(err);
    return error(res, "Lỗi cập nhật cấu hình", 500);
  }
};

// Khởi tạo cấu hình mặc định
const initDefaultConfigs = async (req, res) => {
  try {
    const defaultConfigs = [
      { Ten: "SO_SACH_MUON_TOI_DA", GiaTri: "5" },
      { Ten: "SO_NGAY_MUON", GiaTri: "30" },
      { Ten: "SO_NGAY_GIA_HAN", GiaTri: "15" },
      { Ten: "TIEN_PHAT_MOI_NGAY", GiaTri: "5000" }
    ];

    for (const config of defaultConfigs) {
      const existing = await Config.findOne({ Ten: config.Ten });
      if (!existing) {
        await Config.create(config);
      }
    }

    return success(res, null, "Khởi tạo cấu hình mặc định thành công");
  } catch (err) {
    console.error(err);
    return error(res, "Lỗi khởi tạo cấu hình", 500);
  }
};

module.exports = {
  getConfigs,
  updateConfig,
  initDefaultConfigs
};

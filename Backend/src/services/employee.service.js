const Employee = require("../models/Employee");
const bcrypt = require("bcrypt");

class EmployeeService {

  async getEmployees({ page = 1, limit = 10, search = "", role, gender, status }) {
    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;
    const query = {};

    // SEARCH
    if (search) {
      query.$or = [
        { MSNV: { $regex: search, $options: "i" } },
        { HoTenNV: { $regex: search, $options: "i" } },
        { SoDienThoai: { $regex: search, $options: "i" } },
      ];
    }

    // FILTER GENDER
    if (gender) {
      query.Phai = gender;
    }

    // FILTER ROLE
    if (role) {
      query.VaiTro = role;
    }

    // FILTER STATUS
    if (status !== "" && status !== undefined) {
      query.TrangThai = Number(status);
    }

    const employees = await Employee.find(query)
      .select("-Password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(query);

    return { employees, total, page, limit };
  }

  async createEmployee(data) {
    const existing = await Employee.findOne({ MSNV: data.MSNV });
    if (existing) throw new Error("MSNV đã tồn tại");

    data.Password = await bcrypt.hash(data.Password, 10);
    data.TrangThai = 1;

    const created = await Employee.create(data);
    const result = created.toObject();
    delete result.Password;

    return result;
  }

  async updateEmployee(id, data) {
    const employee = await Employee.findOne({ MSNV: id });
    if (!employee) throw new Error("Không tìm thấy nhân viên");

    const fields = ["HoTenNV", "ChucVu", "DiaChi", "SoDienThoai", "PhamVi", "Phai", "VaiTro"];
    fields.forEach(f => {
      if (data[f] !== undefined) employee[f] = data[f];
    });

    await employee.save();

    const result = employee.toObject();
    delete result.Password;
    return result;
  }

  async toggleStatus(id) {
    const emp = await Employee.findOne({ MSNV: id });
    if (!emp) return null;

    emp.TrangThai = emp.TrangThai === 1 ? 0 : 1;
    await emp.save();

    const result = emp.toObject();
    delete result.Password;
    return result;
  }

  async deleteEmployee(id) {
    const emp = await Employee.findOne({ MSNV: id });
    if (!emp) throw new Error("Không tìm thấy nhân viên");

    await Employee.deleteOne({ MSNV: id });
    return true;
  }
}

module.exports = new EmployeeService();

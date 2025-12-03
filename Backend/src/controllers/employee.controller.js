const employeeService = require("../services/employee.service");
const { success, error, paginate } = require("../utils/response");

exports.getEmployees = async (req, res) => {
  try {
    const result = await employeeService.getEmployees(req.query);
    return paginate(res, result.employees, result.page, result.limit, result.total, "Lấy danh sách nhân viên thành công");
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const created = await employeeService.createEmployee(req.body);
    return success(res, created, "Tạo nhân viên thành công", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const updated = await employeeService.updateEmployee(req.params.id, req.body);
    return success(res, updated, "Cập nhật nhân viên thành công");
  } catch (err) {
    return error(res, err.message);
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const updated = await employeeService.toggleStatus(req.params.id);
    if (!updated) return error(res, "Không tìm thấy nhân viên", 404);

    return success(res, updated, "Đã đổi trạng thái");
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    await employeeService.deleteEmployee(req.params.id);
    return success(res, null, "Xóa nhân viên thành công");
  } catch (err) {
    return error(res, err.message);
  }
};

// ===============================
// EMPLOYEE PROFILE
// ===============================
exports.getProfile = async (req, res) => {
  try {
    const employee = await employeeService.getEmployeeById(req.user.id);
    if (!employee) return error(res, "Không tìm thấy nhân viên", 404);
    return success(res, employee, "Lấy thông tin thành công");
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updated = await employeeService.updateEmployee(req.user.id, req.body);
    return success(res, updated, "Cập nhật thông tin thành công");
  } catch (err) {
    return error(res, err.message);
  }
};

exports.changePassword = async (req, res) => {
  try {
    await employeeService.changePassword(req.user.id, req.body);
    return success(res, null, "Đổi mật khẩu thành công");
  } catch (err) {
    return error(res, err.message);
  }
};

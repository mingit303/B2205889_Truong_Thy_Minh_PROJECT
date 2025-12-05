<template>
  <div class="container-fluid py-4">
    <!-- HEADER -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <div class="header-icon-wrapper me-3">
            <font-awesome-icon icon="user-tie" class="header-icon" />
          </div>
          <div>
            <h3 class="header-title mb-1">Quản lý nhân viên</h3>
            <p class="header-subtitle mb-0">Quản lý tài khoản và phân quyền</p>
          </div>
        </div>
        <button class="btn btn-success" @click="openCreate">
          <font-awesome-icon icon="plus" class="me-1" /> Thêm nhân viên
        </button>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Tìm kiếm</label>
            <input
              class="form-control"
              placeholder="Tên, mã NV, số điện thoại..."
              v-model="store.search"
              @input="applyFilters"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label">Vai trò</label>
            <select class="form-select" v-model="store.role" @change="applyFilters">
              <option value="">Tất cả</option>
              <option value="SUPERADMIN">SuperAdmin</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label">Trạng thái</label>
            <select class="form-select" v-model="store.status" @change="applyFilters">
              <option value="">Tất cả</option>
              <option value="1">Đang hoạt động</option>
              <option value="0">Đã khóa</option>
            </select>
          </div>

          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              Xóa lọc
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="card">
      <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="text-center" style="width:60px">#</th>
              <th>Mã NV</th>
              <th>Họ tên</th>
              <th>Chức vụ</th>
              <th>SDT</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th class="text-center" style="width:180px">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="store.loading">
              <td colspan="8" class="text-center py-3">Đang tải dữ liệu...</td>
            </tr>

            <tr v-for="(nv, idx) in store.items" :key="nv.MSNV">
              <td class="text-center">
                {{ (store.page - 1) * store.limit + idx + 1 }}
              </td>

              <td>{{ nv.MSNV }}</td>

              <td>{{ nv.HoTenNV }}</td>

              <td>{{ nv.ChucVu }}</td>

              <td>{{ nv.SoDienThoai }}</td>

              <td>
                <span class="badge bg-dark">{{ nv.VaiTro }}</span>
              </td>

              <td>
                <span
                  class="badge"
                  :class="nv.TrangThai === 1 ? 'bg-success' : 'bg-danger'"
                >
                  {{ nv.TrangThai === 1 ? 'Hoạt động' : 'Khóa' }}
                </span>
              </td>

              <td class="text-center">
                <div class="btn-group btn-group-sm">

                  <!-- EDIT luôn được phép -->
                  <button class="btn btn-outline-primary" @click="openEdit(nv)">
                    <font-awesome-icon icon="pen" />
                  </button>

                  <!-- KHÓA / MỞ KHÓA — chỉ cho Admin/Employee -->
                  <button
                    class="btn btn-outline-warning"
                    @click="toggleStatus(nv)"
                    v-if="nv.VaiTro !== 'SUPERADMIN'"
                  >
                    <font-awesome-icon icon="lock-open" v-if="nv.TrangThai === 1" />
                    <font-awesome-icon icon="lock" v-else />
                  </button>

                  <!-- XÓA — cũng chỉ cho Admin/Employee -->
                  <button
                    class="btn btn-outline-danger"
                    @click="remove(nv)"
                    v-if="nv.VaiTro !== 'SUPERADMIN'"
                  >
                    <font-awesome-icon icon="trash" />
                  </button>

                </div>
              </td>

            </tr>

            <tr v-if="!store.items.length && !store.loading">
              <td colspan="8" class="text-center py-3">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="card-footer">
        <Pagination
          :page="store.page"
          :limit="store.limit"
          :total="store.total"
          @change="changePage"
        />
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal fade" id="employeeModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">{{ editing ? "Cập nhật" : "Thêm" }} nhân viên</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Mã nhân viên *</label>
                  <input
                    v-model="form.MSNV"
                    type="text"
                    class="form-control"
                    :disabled="editing"
                    required
                    minlength="3"
                    maxlength="20"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Họ tên *</label>
                  <input 
                    v-model="form.HoTenNV" 
                    type="text"
                    class="form-control" 
                    
                    minlength="2"
                    maxlength="100"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Chức vụ</label>
                  <input 
                    v-model="form.ChucVu" 
                    type="text"
                    class="form-control" 
                    maxlength="50"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Số điện thoại</label>
                  <input 
                    v-model="form.SoDienThoai" 
                    type="tel"
                    class="form-control" 
                    pattern="[0-9]{10,11}"
                    title="Số điện thoại phải có 10-11 chữ số"
                  />
                </div>

                <div class="col-12">
                  <label class="form-label">Địa chỉ</label>
                  <textarea 
                    v-model="form.DiaChi" 
                    class="form-control" 
                    rows="2"
                    maxlength="200"
                  ></textarea>
                </div>

                <div class="col-12" v-if="!editing">
                  <label class="form-label">Mật khẩu *</label>
                  <input
                    type="password"
                    v-model="form.Password"
                    class="form-control"
                    required
                    minlength="6"
                  />
                </div>
              </div>

            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
              <button class="btn btn-primary">
                {{ editing ? "Lưu" : "Thêm" }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import * as bootstrap from "bootstrap";
import { useEmployeeStore } from "../../stores/employee";
import { useConfirm } from "../../composables/useConfirm";
import { useToast } from "../../composables/useToast";
import Pagination from "../../components/Pagination.vue";

const store = useEmployeeStore();
const { confirm } = useConfirm();
const toast = useToast();

const modalRef = ref(null);
let modal = null;

const form = reactive({
  MSNV: "",
  HoTenNV: "",
  ChucVu: "",
  SoDienThoai: "",
  DiaChi: "",
  Password: "",
  VaiTro: "ADMIN",
});

const editing = ref(false);
const originalData = ref(null);

onMounted(() => {
  store.fetch();
  modal = new bootstrap.Modal(modalRef.value);
  
  // Reset form khi đóng modal
  modalRef.value.addEventListener('hidden.bs.modal', resetForm);
});

const applyFilters = () => {
  store.page = 1;
  store.fetch();
};

const resetFilters = () => {
  store.search = "";
  store.gender = "";
  store.role = "";
  store.status = "";
  store.page = 1;
  store.fetch();
};

const changePage = (p) => {
  const maxPage = Math.ceil(store.total / store.limit) || 1;
  if (p < 1 || p > maxPage) return;
  store.page = p;
  store.fetch();
};

const openCreate = () => {
  editing.value = false;
  Object.assign(form, {
    MSNV: "",
    HoTenNV: "",
    ChucVu: "",
    SoDienThoai: "",
    DiaChi: "",
    Password: "",
    VaiTro: "ADMIN",
  });
  modal.show();
};

const openEdit = (nv) => {
  editing.value = true;

  Object.assign(form, {
    MSNV: nv.MSNV,
    HoTenNV: nv.HoTenNV,
    ChucVu: nv.ChucVu,
    SoDienThoai: nv.SoDienThoai,
    DiaChi: nv.DiaChi,
    Password: "",
    VaiTro: nv.VaiTro,
  });

  originalData.value = {
    HoTenNV: nv.HoTenNV,
    ChucVu: nv.ChucVu,
    SoDienThoai: nv.SoDienThoai,
    DiaChi: nv.DiaChi,
    VaiTro: nv.VaiTro,
  };

  modal.show();
};

const resetForm = () => {
  Object.assign(form, {
    MSNV: "",
    HoTenNV: "",
    ChucVu: "",
    SoDienThoai: "",
    DiaChi: "",
    Password: "",
    VaiTro: "ADMIN",
  });
  editing.value = false;
  originalData.value = null;
};

const submitForm = async () => {
  if (editing.value && originalData.value) {
    const hasChanges = 
      form.HoTenNV !== originalData.value.HoTenNV ||
      form.ChucVu !== originalData.value.ChucVu ||
      form.SoDienThoai !== originalData.value.SoDienThoai ||
      form.DiaChi !== originalData.value.DiaChi ||
      form.VaiTro !== originalData.value.VaiTro ||
      form.Password !== "";
    if (!hasChanges) {
      modal.hide();
      return;
    }
  }

  // Kiểm tra trùng MSNV khi thêm mới
  if (!editing.value) {
    const exists = store.items.some(e => 
      e.MSNV.toLowerCase().trim() === form.MSNV.toLowerCase().trim()
    );
    if (exists) {
      toast.error('Mã số nhân viên đã tồn tại!');
      return;
    }
  }

  try {
    if (editing.value) {
      await store.update(form.MSNV, form);
      toast.success('Đã cập nhật nhân viên');
    } else {
      await store.create(form);
      toast.success('Đã thêm nhân viên mới');
    }
    modal.hide();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi lưu nhân viên');
  }
};

const toggleStatus = async (nv) => {
  try {
    await store.toggleStatus(nv.MSNV);
    toast.success('Đã đổi trạng thái tài khoản');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi đổi trạng thái');
  }
};

const remove = async (nv) => {
  try {
    await confirm(`Xóa nhân viên ${nv.HoTenNV}?`);
    await store.remove(nv.MSNV);
    toast.success('Đã xóa nhân viên');
  } catch (err) {
    if (err && err.response) {
      toast.error(err.response?.data?.message || 'Lỗi xóa nhân viên');
    }
  }
};
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(25, 118, 210, 0.3);
  color: white;
}

.header-icon-wrapper {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.header-icon {
  font-size: 1.8rem;
}

.header-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.header-subtitle {
  font-size: 0.95rem;
  opacity: 0.9;
  margin: 0;
}
</style>

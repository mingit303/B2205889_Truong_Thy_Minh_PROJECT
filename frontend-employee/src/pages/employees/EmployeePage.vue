<template>
  <div class="container-fluid py-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">
        <i class="fa-solid fa-user-tie me-2"></i>
        Quản lý nhân viên
      </h3>

      <button class="btn btn-success" @click="openCreate">
        <i class="fa-solid fa-plus me-1"></i> Thêm nhân viên
      </button>
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
                    <i class="fa-solid fa-pen"></i>
                  </button>

                  <!-- KHÓA / MỞ KHÓA — chỉ cho Admin/Employee -->
                  <button
                    class="btn btn-outline-warning"
                    @click="toggleStatus(nv)"
                    v-if="nv.VaiTro !== 'SUPERADMIN'"
                  >
                    <i class="fa-solid fa-lock-open" v-if="nv.TrangThai === 1"></i>
                    <i class="fa-solid fa-lock" v-else></i>
                  </button>

                  <!-- XÓA — cũng chỉ cho Admin/Employee -->
                  <button
                    class="btn btn-outline-danger"
                    @click="remove(nv)"
                    v-if="nv.VaiTro !== 'SUPERADMIN'"
                  >
                    <i class="fa-solid fa-trash"></i>
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
      <div class="card-footer d-flex justify-content-end">
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: store.page === 1 }">
            <button class="page-link" @click="changePage(store.page - 1)">«</button>
          </li>

          <li class="page-item disabled">
            <span class="page-link">Trang {{ store.page }}</span>
          </li>

          <li
            class="page-item"
            :class="{ disabled: store.page * store.limit >= store.total }"
          >
            <button class="page-link" @click="changePage(store.page + 1)">»</button>
          </li>
        </ul>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal fade" id="employeeModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">{{ editing ? "Cập nhật" : "Thêm" }} nhân viên</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">

              <div class="mb-3">
                <label class="form-label">Mã nhân viên *</label>
                <input
                  v-model="form.MSNV"
                  class="form-control"
                  :disabled="editing"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Họ tên *</label>
                <input v-model="form.HoTenNV" class="form-control" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Chức vụ</label>
                <input v-model="form.ChucVu" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label">Số điện thoại</label>
                <input v-model="form.SoDienThoai" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <input v-model="form.DiaChi" class="form-control" />
              </div>

              <div class="mb-3" v-if="!editing">
                <label class="form-label">Mật khẩu *</label>
                <input
                  type="password"
                  v-model="form.Password"
                  class="form-control"
                  required
                />
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

const store = useEmployeeStore();

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

onMounted(() => {
  store.fetch();
  modal = new bootstrap.Modal(modalRef.value);
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
  if (p < 1) return;
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

  modal.show();
};

const submitForm = async () => {
  if (editing.value) {
    await store.update(form.MSNV, form);
  } else {
    await store.create(form);
  }

  modal.hide();
};

const toggleStatus = async (nv) => {
  await store.toggleStatus(nv.MSNV);
};

const remove = async (nv) => {
  if (!confirm(`Xóa nhân viên ${nv.HoTenNV}?`)) return;
  await store.remove(nv.MSNV);
};
</script>

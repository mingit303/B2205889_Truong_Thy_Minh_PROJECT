<template>
  <div class="container-fluid py-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">
        <i class="fa-solid fa-users me-2"></i> Quản lý độc giả
      </h3>

      <button class="btn btn-success" @click="openCreate">
        <i class="fa-solid fa-plus me-1"></i> Thêm độc giả
      </button>
    </div>

    <!-- FILTER -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-3 align-items-end">

          <div class="col-md-3">
            <label class="form-label">Tìm kiếm</label>
            <input
              v-model="store.search"
              @input="applyFilters"
              class="form-control"
              placeholder="Tên, mã độc giả, email..."
            />
          </div>

          <div class="col-md-2">
            <label class="form-label">Giới tính</label>
            <select v-model="store.gender" class="form-select" @change="applyFilters">
              <option value="">Tất cả</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label">Trạng thái</label>
            <select v-model="store.status" class="form-select" @change="applyFilters">
              <option value="">Tất cả</option>
              <option value="1">Hoạt động</option>
              <option value="0">Khóa</option>
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
              <th>Mã độc giả</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Giới tính</th>
              <th>Trạng thái</th>
              <th class="text-center" style="width:180px">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="store.loading">
              <td colspan="8" class="text-center py-3">Đang tải...</td>
            </tr>

            <tr v-for="(d, idx) in store.items" :key="d.MaDocGia">
              <td class="text-center">{{ (store.page - 1) * store.limit + idx + 1 }}</td>

              <td>{{ d.MaDocGia }}</td>
              <td>{{ d.HoLot }} {{ d.Ten }}</td>
              <td>{{ d.Email }}</td>
              <td>{{ d.DienThoai }}</td>
              <td>{{ d.Phai }}</td>

              <td>
                <span :class="d.TrangThai === 1 ? 'badge bg-success' : 'badge bg-danger'">
                  {{ d.TrangThai === 1 ? "Hoạt động" : "Khóa" }}
                </span>
              </td>

              <td class="text-center">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-primary" @click="openEdit(d)">
                    <i class="fa-solid fa-pen"></i>
                  </button>

                  <button class="btn btn-outline-warning" @click="toggleStatus(d)">
                    <i v-if="d.TrangThai === 1" class="fa-solid fa-lock-open"></i>
                    <i v-else class="fa-solid fa-lock"></i>
                  </button>

                  <button class="btn btn-outline-danger" @click="remove(d)">
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

          <li class="page-item" :class="{ disabled: store.page * store.limit >= store.total }">
            <button class="page-link" @click="changePage(store.page + 1)">»</button>
          </li>
        </ul>
      </div>

    </div>

    <!-- MODAL -->
    <div class="modal fade" id="readerModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">

          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">{{ editing ? "Cập nhật" : "Thêm" }} độc giả</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">

              <label class="form-label">Mã độc giả *</label>
              <input v-model="form.MaDocGia" class="form-control" :disabled="editing" required />

              <label class="form-label mt-3">Họ lót *</label>
              <input v-model="form.HoLot" class="form-control" required />

              <label class="form-label mt-3">Tên *</label>
              <input v-model="form.Ten" class="form-control" required />

              <label class="form-label mt-3">Ngày sinh</label>
              <input type="date" v-model="form.NgaySinh" class="form-control" />

              <label class="form-label mt-3">Email *</label>
              <input type="email" v-model="form.Email" class="form-control" required />

              <label class="form-label mt-3">Điện thoại</label>
              <input v-model="form.DienThoai" class="form-control" />

              <label class="form-label mt-3">Giới tính</label>
              <select v-model="form.Phai" class="form-select">
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>

              <label class="form-label mt-3">Địa chỉ</label>
              <input v-model="form.DiaChi" class="form-control" />

              <div v-if="!editing" class="mt-3">
                <label class="form-label">Mật khẩu *</label>
                <input type="password" v-model="form.MatKhau" class="form-control" required />
              </div>

            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
              <button class="btn btn-primary">{{ editing ? "Lưu" : "Thêm" }}</button>
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
import { useReaderStore } from "../../stores/reader";

const store = useReaderStore();
const modalRef = ref(null);
let modal = null;

const editing = ref(false);

const form = reactive({
  MaDocGia: "",
  HoLot: "",
  Ten: "",
  NgaySinh: "",
  Phai: "Nam",
  DiaChi: "",
  DienThoai: "",
  Email: "",
  MatKhau: "",
});

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
    MaDocGia: "",
    HoLot: "",
    Ten: "",
    NgaySinh: "",
    Phai: "Nam",
    DiaChi: "",
    DienThoai: "",
    Email: "",
    MatKhau: "",
  });
  modal.show();
};

const openEdit = (d) => {
  editing.value = true;
  Object.assign(form, {
    MaDocGia: d.MaDocGia,
    HoLot: d.HoLot,
    Ten: d.Ten,
    NgaySinh: d.NgaySinh ? d.NgaySinh.substring(0, 10) : "",
    Phai: d.Phai,
    DiaChi: d.DiaChi,
    DienThoai: d.DienThoai,
    Email: d.Email,
    MatKhau: "",
  });
  modal.show();
};

const submitForm = async () => {
  if (editing.value) {
    await store.update(form.MaDocGia, form);
  } else {
    await store.create(form);
  }
  modal.hide();
};

const toggleStatus = async (d) => {
  await store.toggleStatus(d.MaDocGia);
};

const remove = async (d) => {
  if (!confirm(`Xóa độc giả "${d.HoLot} ${d.Ten}"?`)) return;
  await store.remove(d.MaDocGia);
};
</script>

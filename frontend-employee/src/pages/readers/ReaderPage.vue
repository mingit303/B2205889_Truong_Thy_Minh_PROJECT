<template>
  <div class="container-fluid py-4">
    <!-- HEADER -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <div class="header-icon-wrapper me-3">
            <font-awesome-icon icon="users" class="header-icon" />
          </div>
          <div>
            <h3 class="header-title mb-1">Quản lý độc giả</h3>
            <p class="header-subtitle mb-0">Quản lý thông tin thành viên thư viện</p>
          </div>
        </div>
        <button class="btn btn-success" @click="openCreate">
          <font-awesome-icon icon="plus" class="me-1" /> Thêm độc giả
        </button>
      </div>
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
                    <font-awesome-icon icon="pen" />
                  </button>

                  <button class="btn btn-outline-warning" @click="toggleStatus(d)">
                    <i v-if="d.TrangThai === 1" class="fa-solid fa-lock-open"></i>
                    <i v-else class="fa-solid fa-lock"></i>
                  </button>

                  <button class="btn btn-outline-danger" @click="remove(d)">
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
    <div class="modal fade" id="readerModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">

          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">{{ editing ? "Cập nhật" : "Thêm" }} độc giả</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Mã độc giả *</label>
                  <input 
                    v-model="form.MaDocGia" 
                    type="text"
                    class="form-control" 
                    :disabled="editing" 
                    
                    minlength="3"
                    maxlength="20"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Email *</label>
                  <input type="email" v-model="form.Email" class="form-control" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Họ lót *</label>
                  <input 
                    v-model="form.HoLot" 
                    type="text"
                    class="form-control" 
                    
                    minlength="1"
                    maxlength="50"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Tên *</label>
                  <input 
                    v-model="form.Ten" 
                    type="text"
                    class="form-control" 
                    
                    minlength="1"
                    maxlength="20"
                  />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Ngày sinh</label>
                  <input type="date" v-model="form.NgaySinh" class="form-control" />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Giới tính</label>
                  <select v-model="form.Phai" class="form-select">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Điện thoại</label>
                  <input 
                    v-model="form.DienThoai" 
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
                    v-model="form.MatKhau" 
                    class="form-control" 
                    
                    minlength="6"
                  />
                </div>
              </div>

            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
              <button type="submit" class="btn btn-primary">{{ editing ? "Lưu" : "Thêm" }}</button>
            </div>

          </form>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from "vue";
import * as bootstrap from "bootstrap";
import { useReaderStore } from "../../stores/reader";
import { useConfirm } from "../../composables/useConfirm";
import { useToast } from "../../composables/useToast";
import { useSocket, SOCKET_EVENTS } from "../../composables/useSocket";
import Pagination from "../../components/Pagination.vue";

const store = useReaderStore();
const { confirm } = useConfirm();
const toast = useToast();
const { connect, disconnect, on, off } = useSocket();
const modalRef = ref(null);
let modal = null;

const editing = ref(false);
const originalData = ref(null);

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
  
  // Reset form khi đóng modal
  modalRef.value.addEventListener('hidden.bs.modal', resetForm);
  
  connect();
  on(SOCKET_EVENTS.READER_ADDED, () => store.fetch());
  on(SOCKET_EVENTS.READER_UPDATED, () => store.fetch());
  on(SOCKET_EVENTS.READER_DELETED, () => store.fetch());
});

onUnmounted(() => {
  off(SOCKET_EVENTS.READER_ADDED);
  off(SOCKET_EVENTS.READER_UPDATED);
  off(SOCKET_EVENTS.READER_DELETED);
  disconnect();
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
  const maxPage = Math.ceil(store.total / store.limit) || 1;
  if (p < 1 || p > maxPage) return;
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
  originalData.value = {
    HoLot: d.HoLot,
    Ten: d.Ten,
    NgaySinh: d.NgaySinh ? d.NgaySinh.substring(0, 10) : "",
    Phai: d.Phai,
    DiaChi: d.DiaChi,
    DienThoai: d.DienThoai,
    Email: d.Email,
  };
  modal.show();
};

const resetForm = () => {
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
  editing.value = false;
  originalData.value = null;
};

const submitForm = async () => {
  if (editing.value && originalData.value) {
    const hasChanges = 
      form.HoLot !== originalData.value.HoLot ||
      form.Ten !== originalData.value.Ten ||
      form.NgaySinh !== originalData.value.NgaySinh ||
      form.Phai !== originalData.value.Phai ||
      form.DiaChi !== originalData.value.DiaChi ||
      form.DienThoai !== originalData.value.DienThoai ||
      form.Email !== originalData.value.Email ||
      form.MatKhau !== "";
    if (!hasChanges) {
      modal.hide();
      return;
    }
  }

  // Kiểm tra trùng mã độc giả và email khi thêm mới
  if (!editing.value) {
    const existsCode = store.items.some(r => 
      r.MaDocGia.toLowerCase().trim() === form.MaDocGia.toLowerCase().trim()
    );
    if (existsCode) {
      toast.error('Mã độc giả đã tồn tại!');
      return;
    }
    
    const existsEmail = store.items.some(r => 
      r.Email.toLowerCase().trim() === form.Email.toLowerCase().trim()
    );
    if (existsEmail) {
      toast.error('Email đã được sử dụng!');
      return;
    }
  }

  try {
    if (editing.value) {
      await store.update(form.MaDocGia, form);
      toast.success('Đã cập nhật độc giả');
    } else {
      await store.create(form);
      toast.success('Đã thêm độc giả mới');
    }
    modal.hide();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi lưu độc giả');
  }
};

const toggleStatus = async (d) => {
  try {
    await store.toggleStatus(d.MaDocGia);
    toast.success('Đã đổi trạng thái');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi đổi trạng thái');
  }
};

const remove = async (d) => {
  try {
    await confirm(`Xóa độc giả "${d.HoLot} ${d.Ten}"?`);
    await store.remove(d.MaDocGia);
    toast.success('Đã xóa độc giả');
  } catch (err) {
    if (err && err.response) {
      toast.error(err.response?.data?.message || 'Lỗi xóa độc giả');
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
  font-size: 28px;
  color: white;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-subtitle {
  font-size: 0.95rem;
  opacity: 0.9;
  font-weight: 400;
}
</style>

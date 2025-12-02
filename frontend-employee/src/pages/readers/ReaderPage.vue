<template>
  <div class="container-fluid py-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">
        <font-awesome-icon icon="users" class="me-2" /> Quản lý độc giả
      </h3>

      <button class="btn btn-success" @click="openCreate">
        <font-awesome-icon icon="plus" class="me-1" /> Thêm độc giả
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
              <button class="btn-close" data-bs-dismiss="modal"></button>
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
                    required 
                    minlength="3"
                    maxlength="20"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Email *</label>
                  <input type="email" v-model="form.Email" class="form-control" required />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Họ lót *</label>
                  <input 
                    v-model="form.HoLot" 
                    type="text"
                    class="form-control" 
                    required 
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
                    required 
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
                    required 
                    minlength="6"
                  />
                </div>
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
import { useConfirm } from "../../composables/useConfirm";
import { useToast } from "../../composables/useToast";
import Pagination from "../../components/Pagination.vue";

const store = useReaderStore();
const { confirm } = useConfirm();
const toast = useToast();
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
  modal.show();
};

const submitForm = async () => {
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

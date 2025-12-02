<template>
  <div class="container-fluid py-3">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">
        <font-awesome-icon icon="book" class="me-2" /> Quản lý sách
      </h3>
      <button class="btn btn-success" @click="openCreate">
        <font-awesome-icon icon="plus" class="me-1" /> Thêm sách
      </button>
    </div>

    <!-- FILTER -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label">Tìm kiếm</label>
            <input
              v-model="store.search"
              class="form-control"
              placeholder="Mã sách, tên sách..."
              @input="handleSearch"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label">Thể loại</label>
            <select
              v-model="store.category"
              class="form-select"
              @change="store.fetch"
            >
              <option value="">Tất cả</option>
              <option v-for="c in categories" :key="c._id" :value="c._id">
                {{ c.TenTheLoai }}
              </option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label">NXB</label>
            <select
              v-model="store.publisher"
              class="form-select"
              @change="store.fetch"
            >
              <option value="">Tất cả</option>
              <option v-for="p in publishers" :key="p._id" :value="p._id">
                {{ p.TenNXB }}
              </option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label">Tác giả</label>
            <select
              v-model="store.author"
              class="form-select"
              @change="store.fetch"
            >
              <option value="">Tất cả</option>
              <option v-for="a in authors" :key="a._id" :value="a._id">
                {{ a.TenTacGia }}
              </option>
            </select>
          </div>

          <div class="col-md-3 text-end">
            <button class="btn btn-outline-secondary me-2" @click="resetFilter">
              <font-awesome-icon icon="rotate-left" class="me-1" /> Reset
            </button>
            <button class="btn btn-primary" @click="store.fetch">
              <font-awesome-icon icon="magnifying-glass" class="me-1" /> Lọc
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="card">
      <div class="card-body p-0">
        <div v-if="store.loading" class="p-3 text-center">Đang tải...</div>

        <table v-else class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="text-center" style="width: 50px">#</th>
              <th style="width: 70px">Ảnh</th>
              <th>Mã sách</th>
              <th>Tên sách</th>
              <th>Thể loại</th>
              <th>Tác giả</th>
              <th>NXB</th>
              <th class="text-end">Đơn giá</th>
              <th class="text-center">Số quyển</th>
              <th class="text-center" style="width: 140px">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="store.items.length === 0">
              <td colspan="10" class="text-center py-3">Không có dữ liệu</td>
            </tr>

            <tr v-for="(b, idx) in store.items" :key="b._id">
              <td class="text-center">
                {{ (store.page - 1) * store.limit + idx + 1 }}
              </td>

              <td>
                <img
                  :src="b.AnhBia || placeholderImg"
                  style="width: 55px; height: 75px; object-fit: cover"
                  class="rounded border"
                />
              </td>

              <td>{{ b.MaSach }}</td>
              <td>{{ b.TenSach }}</td>
              <td>{{ b.MaTheLoai?.TenTheLoai }}</td>
              <td>{{ b.MaTacGia?.TenTacGia }}</td>
              <td>{{ b.MaNXB?.TenNXB }}</td>

              <td class="text-end">{{ formatPrice(b.DonGia) }}</td>
              <td class="text-center">{{ b.SoQuyen }}</td>

              <td class="text-center">
                <button
                  class="btn btn-sm btn-outline-primary me-1"
                  @click="openEdit(b)"
                >
                  <font-awesome-icon icon="pen" />
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="confirmDelete(b)"
                >
                  <font-awesome-icon icon="trash" />
                </button>
              </td>
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
    <div class="modal fade" id="bookModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ editing ? "Cập nhật sách" : "Thêm sách mới" }}
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div class="modal-body">
              <div class="row g-3">

                <div class="col-md-4">
                  <label class="form-label">Mã sách *</label>
                  <input
                    v-model="form.MaSach"
                    type="text"
                    class="form-control"
                    :disabled="editing"
                    required
                    minlength="2"
                    maxlength="20"
                  />
                </div>

                <div class="col-md-8">
                  <label class="form-label">Tên sách *</label>
                  <input 
                    v-model="form.TenSach" 
                    type="text"
                    class="form-control" 
                    required 
                    minlength="2"
                    maxlength="200"
                  />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Thể loại *</label>
                  <select v-model="form.MaTheLoai" class="form-select" required>
                    <option value="">-- Chọn --</option>
                    <option v-for="c in categories" :key="c._id" :value="c._id">
                      {{ c.TenTheLoai }}
                    </option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Tác giả *</label>
                  <select v-model="form.MaTacGia" class="form-select" required>
                    <option value="">-- Chọn --</option>
                    <option v-for="a in authors" :key="a._id" :value="a._id">
                      {{ a.TenTacGia }}
                    </option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label">NXB *</label>
                  <select v-model="form.MaNXB" class="form-select" required>
                    <option value="">-- Chọn --</option>
                    <option v-for="p in publishers" :key="p._id" :value="p._id">
                      {{ p.TenNXB }}
                    </option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Đơn giá</label>
                  <input
                    type="number"
                    v-model.number="form.DonGia"
                    class="form-control"
                    min="0"
                  />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Số quyển</label>
                  <input
                    type="number"
                    v-model.number="form.SoQuyen"
                    class="form-control"
                    min="0"
                  />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Năm xuất bản</label>
                  <input
                    type="number"
                    v-model.number="form.NamXuatBan"
                    class="form-control"
                    min="0"
                  />
                </div>

                <div class="col-12">
                  <label class="form-label">Mô tả</label>
                  <textarea
                    v-model="form.MoTa"
                    rows="3"
                    class="form-control"
                  ></textarea>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Ảnh bìa</label>
                  <input
                    type="file"
                    accept="image/*"
                    class="form-control"
                    ref="fileInputRef"
                    @change="onFileChange"
                  />
                </div>

                <div class="col-md-6" v-if="previewImg">
                  <label class="form-label d-block">Xem trước</label>
                  <img
                    :src="previewImg"
                    class="img-thumbnail"
                    style="max-height: 160px"
                  />
                </div>

              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Đóng
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editing ? "Lưu thay đổi" : "Thêm mới" }}
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
import { useBookStore } from "../../stores/book";
import { useConfirm } from "../../composables/useConfirm";
import { useToast } from "../../composables/useToast";
import { categoryApi } from "../../api/categoryApi";
import { publisherApi } from "../../api/publisherApi";
import { authorApi } from "../../api/authorApi";
import Pagination from "../../components/Pagination.vue";
import * as bootstrap from "bootstrap";

const store = useBookStore();
const { confirm } = useConfirm();
const toast = useToast();
const categories = ref([]);
const publishers = ref([]);
const authors = ref([]);

const editing = ref(false);
const previewImg = ref("");
const fileInputRef = ref(null);

const placeholderImg = "https://via.placeholder.com/70x90?text=No+Image";

const form = reactive({
  _id: "",
  MaSach: "",
  TenSach: "",
  MaTheLoai: "",
  MaTacGia: "",
  MaNXB: "",
  DonGia: null,
  SoQuyen: null,
  NamXuatBan: null,
  MoTa: "",
  AnhBia: null,
});

const modalRef = ref(null);
let modalInstance = null;

onMounted(async () => {
  await Promise.all([store.fetch(), loadCombos()]);
  modalInstance = new bootstrap.Modal(modalRef.value);
});

const loadCombos = async () => {
  const [cRes, pRes, aRes] = await Promise.all([
    categoryApi.getAll(),
    publisherApi.getAll(),
    authorApi.getAll(),
  ]);

  categories.value = cRes.data.data;
  publishers.value = pRes.data.data;
  authors.value = aRes.data.data;
};

let debounce = null;
const handleSearch = () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    store.page = 1;
    store.fetch();
  }, 500);
};

const resetFilter = () => {
  store.search = "";
  store.category = "";
  store.publisher = "";
  store.author = "";
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
    _id: "",
    MaSach: "",
    TenSach: "",
    MaTheLoai: "",
    MaTacGia: "",
    MaNXB: "",
    DonGia: null,
    SoQuyen: null,
    NamXuatBan: null,
    MoTa: "",
    AnhBia: null,
  });

  // RESET file input
  if (fileInputRef.value) fileInputRef.value.value = null;
  previewImg.value = "";

  modalInstance.show();
};

const openEdit = (book) => {
  editing.value = true;

  Object.assign(form, {
    _id: book._id,
    MaSach: book.MaSach,
    TenSach: book.TenSach,
    MaTheLoai: book.MaTheLoai?._id || "",
    MaTacGia: book.MaTacGia?._id || "",
    MaNXB: book.MaNXB?._id || "",
    DonGia: book.DonGia,
    SoQuyen: book.SoQuyen,
    NamXuatBan: book.NamXuatBan,
    MoTa: book.MoTa || "",
    AnhBia: null,
  });

  // Reset input file
  if (fileInputRef.value) fileInputRef.value.value = null;

  previewImg.value = book.AnhBia || "";

  modalInstance.show();
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  form.AnhBia = file;
  previewImg.value = URL.createObjectURL(file);
};

const submitForm = async () => {
  const fd = new FormData();

  const plain = { ...form };
  delete plain._id;

  Object.entries(plain).forEach(([key, value]) => {
    if (key === "AnhBia") {
      if (value instanceof File) fd.append("AnhBia", value);
      return;
    }

    if (value === null || value === "") return;
    fd.append(key, value);
  });

  try {
    if (editing.value) {
      await store.update(form._id, fd, true);
      toast.success('Đã cập nhật sách');
    } else {
      await store.create(fd, true);
      toast.success('Đã thêm sách mới');
    }

    // 🔥 Reset input file sau submit
    if (fileInputRef.value) fileInputRef.value.value = null;
    form.AnhBia = null;
    previewImg.value = "";

    modalInstance.hide();
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Không thể lưu sách");
  }
};

const confirmDelete = async (book) => {
  try {
    await confirm(`Xóa sách "${book.TenSach}"?`);
    await store.remove(book._id);
    toast.success('Đã xóa sách');
  } catch (err) {
    if (err && err.response) {
      toast.error(err.response?.data?.message || 'Lỗi xóa sách');
    }
  }
};

const formatPrice = (v) => {
  if (!v && v !== 0) return "";
  return v.toLocaleString("vi-VN") + " đ";
};
</script>

<style scoped>
.table tbody tr:hover {
  background: #f3f6ff;
}
</style>

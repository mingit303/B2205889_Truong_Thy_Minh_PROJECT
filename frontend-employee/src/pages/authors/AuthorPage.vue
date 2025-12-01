<template>
  <div class="container-fluid py-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">
        <i class="fa-solid fa-pen-nib me-2"></i>
        Tác giả
      </h3>

      <button class="btn btn-success" @click="openCreate">
        <i class="fa-solid fa-plus me-1"></i> Thêm tác giả
      </button>
    </div>

    <!-- SEARCH -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row align-items-end">
          <div class="col-md-4">
            <label class="form-label">Tìm kiếm</label>
            <input
              class="form-control"
              v-model="store.search"
              @input="handleSearch"
              placeholder="Tên tác giả..."
            />
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
              <th style="width:60px" class="text-center">#</th>
              <th>Mã tác giả</th>
              <th>Tên tác giả</th>
              <th class="text-center" style="width:150px">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.loading">
              <td colspan="4" class="text-center py-3">Đang tải dữ liệu...</td>
            </tr>

            <tr v-for="(a, idx) in store.items" :key="a.MaTacGia">
              <td class="text-center">{{ (store.page - 1) * store.limit + idx + 1 }}</td>
              <td>{{ a.MaTacGia }}</td>
              <td>{{ a.TenTacGia }}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(a)">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="remove(a)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>

            <tr v-if="!store.items.length && !store.loading">
              <td colspan="4" class="text-center py-3">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="card-footer d-flex justify-content-end">
        <nav>
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
        </nav>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal fade" id="authorModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">{{ editing ? "Cập nhật" : "Thêm" }} tác giả</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
              <label class="form-label">Mã tác giả *</label>
              <input v-model="form.MaTacGia" class="form-control" :disabled="editing" required />

              <label class="form-label mt-3">Tên tác giả *</label>
              <input v-model="form.TenTacGia" class="form-control" required />
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
import { ref, reactive, onMounted } from "vue";
import { useAuthorStore } from "../../stores/author";
import * as bootstrap from "bootstrap";

const store = useAuthorStore();
const modalRef = ref(null);
let modal = null;

const form = reactive({
  MaTacGia: "",
  TenTacGia: "",
});

const editing = ref(false);

onMounted(() => {
  store.fetch();
  modal = new bootstrap.Modal(modalRef.value);
});

const handleSearch = () => {
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
  form.MaTacGia = "";
  form.TenTacGia = "";
  modal.show();
};

const openEdit = (a) => {
  editing.value = true;
  form.MaTacGia = a.MaTacGia;
  form.TenTacGia = a.TenTacGia;
  modal.show();
};

const submitForm = async () => {
  if (editing.value) {
    await store.update(form.MaTacGia, form);
  } else {
    await store.create(form);
  }

  modal.hide();
};

const remove = async (a) => {
  if (confirm(`Xóa tác giả "${a.TenTacGia}"?`)) {
    await store.remove(a.MaTacGia);
  }
};
</script>

<template>
  <div class="container-fluid py-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">
        <font-awesome-icon icon="pen-nib" class="me-2" />
        Tác giả
      </h3>

      <button class="btn btn-success" @click="openCreate">
        <font-awesome-icon icon="plus" class="me-1" /> Thêm tác giả
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
                  <font-awesome-icon icon="pen" />
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="remove(a)">
                  <font-awesome-icon icon="trash" />
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
              <input 
                v-model="form.MaTacGia" 
                type="text"
                class="form-control" 
                :disabled="editing" 
                required 
                minlength="2"
                maxlength="20"
              />

              <label class="form-label mt-3">Tên tác giả *</label>
              <input 
                v-model="form.TenTacGia" 
                type="text"
                class="form-control" 
                required 
                minlength="2"
                maxlength="100"
              />
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
import { useConfirm } from "../../composables/useConfirm";
import { useToast } from "../../composables/useToast";
import Pagination from "../../components/Pagination.vue";
import * as bootstrap from "bootstrap";

const store = useAuthorStore();
const { confirm } = useConfirm();
const toast = useToast();
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
  const maxPage = Math.ceil(store.total / store.limit) || 1;
  if (p < 1 || p > maxPage) return;
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
  try {
    if (editing.value) {
      await store.update(form.MaTacGia, form);
      toast.success('Đã cập nhật tác giả');
    } else {
      await store.create(form);
      toast.success('Đã thêm tác giả mới');
    }
    modal.hide();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi lưu tác giả');
  }
};

const remove = async (a) => {
  try {
    await confirm(`Xóa tác giả "${a.TenTacGia}"?`);
    await store.remove(a.MaTacGia);
    toast.success('Đã xóa tác giả');
  } catch (err) {
    if (err && err.response) {
      toast.error(err.response?.data?.message || 'Lỗi xóa tác giả');
    }
  }
};
</script>

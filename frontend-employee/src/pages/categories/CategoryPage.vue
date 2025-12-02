<template>
  <div class="container-fluid py-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">
        <font-awesome-icon icon="tags" class="me-2" />
        Thể loại
      </h3>

      <button class="btn btn-success" @click="openCreate">
        <font-awesome-icon icon="plus" class="me-1" /> Thêm thể loại
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
              placeholder="Mã hoặc tên thể loại..."
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
              <th>Mã thể loại</th>
              <th>Tên thể loại</th>
              <th class="text-center" style="width:150px">Thao tác</th>
            </tr>
          </thead>
          <tbody>

            <tr v-for="(c, idx) in store.items" :key="c.MaTheLoai">
              <td class="text-center">{{ (store.page - 1) * store.limit + idx + 1 }}</td>
              <td>{{ c.MaTheLoai }}</td>
              <td>{{ c.TenTheLoai }}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(c)">
                  <font-awesome-icon icon="pen" />
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="remove(c)">
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
    <div class="modal fade" id="categoryModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">{{ editing ? "Cập nhật" : "Thêm" }} thể loại</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Mã thể loại *</label>
                <input 
                  v-model="form.MaTheLoai" 
                  type="text"
                  class="form-control" 
                  :disabled="editing" 
                  required 
                  minlength="2"
                  maxlength="20"
                />
              </div>

              <div class="mb-0">
                <label class="form-label">Tên thể loại *</label>
                <input 
                  v-model="form.TenTheLoai" 
                  type="text"
                  class="form-control" 
                  required 
                  minlength="2"
                  maxlength="100"
                />
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
import { ref, reactive, onMounted } from "vue";
import { useCategoryStore } from "../../stores/category";
import { useConfirm } from "../../composables/useConfirm";
import { useToast } from "../../composables/useToast";
import Pagination from "../../components/Pagination.vue";
import * as bootstrap from "bootstrap";

const store = useCategoryStore();
const { confirm } = useConfirm();
const toast = useToast();
const modalRef = ref(null);
let modal = null;

const form = reactive({
  MaTheLoai: "",
  TenTheLoai: "",
});

const editing = ref(false);

onMounted(() => {
  store.fetch();
  store.fetchAll();
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
  form.MaTheLoai = "";
  form.TenTheLoai = "";
  modal.show();
};

const openEdit = (c) => {
  editing.value = true;
  form.MaTheLoai = c.MaTheLoai;
  form.TenTheLoai = c.TenTheLoai;
  modal.show();
};

const submitForm = async () => {
  try {
    if (editing.value) {
      await store.update(form.MaTheLoai, form);
      toast.success('Đã cập nhật thể loại');
    } else {
      await store.create(form);
      toast.success('Đã thêm thể loại mới');
    }
    modal.hide();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi lưu thể loại');
  }
};

const remove = async (c) => {
  try {
    await confirm(`Xóa thể loại "${c.TenTheLoai}"?`);
    await store.remove(c.MaTheLoai);
    toast.success('Đã xóa thể loại');
  } catch (err) {
    if (err && err.response) {
      toast.error(err.response?.data?.message || 'Lỗi xóa thể loại');
    }
  }
};
</script>

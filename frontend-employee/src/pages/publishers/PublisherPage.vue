<template>
  <div class="container-fluid py-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">
        <font-awesome-icon icon="building-columns" class="me-2" />
        Nhà xuất bản
      </h3>

      <button class="btn btn-success" @click="openCreate">
        <font-awesome-icon icon="plus" class="me-1" /> Thêm NXB
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
              placeholder="Mã hoặc tên NXB..."
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
              <th>Mã NXB</th>
              <th>Tên NXB</th>
              <th>Địa chỉ</th>
              <th class="text-center" style="width:150px">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.loading">
              <td colspan="5" class="text-center py-3">Đang tải dữ liệu...</td>
            </tr>

            <tr v-for="(p, idx) in store.items" :key="p.MaNXB">
              <td class="text-center">{{ (store.page - 1) * store.limit + idx + 1 }}</td>
              <td>{{ p.MaNXB }}</td>
              <td>{{ p.TenNXB }}</td>
              <td>{{ p.DiaChi }}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(p)">
                  <font-awesome-icon icon="pen" />
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="remove(p)">
                  <font-awesome-icon icon="trash" />
                </button>
              </td>
            </tr>

            <tr v-if="!store.items.length && !store.loading">
              <td colspan="5" class="text-center py-3">Không có dữ liệu</td>
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
    <div class="modal fade" id="publisherModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="submitForm">
            <div class="modal-header">
              <h5 class="modal-title">{{ editing ? "Cập nhật" : "Thêm" }} NXB</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Mã NXB *</label>
                <input 
                  v-model="form.MaNXB" 
                  type="text"
                  class="form-control" 
                  :disabled="editing" 
                  required 
                  minlength="2"
                  maxlength="20"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Tên NXB *</label>
                <input 
                  v-model="form.TenNXB" 
                  type="text"
                  class="form-control" 
                  required 
                  minlength="2"
                  maxlength="100"
                />
              </div>

              <div class="mb-0">
                <label class="form-label">Địa chỉ</label>
                <textarea 
                  v-model="form.DiaChi" 
                  class="form-control" 
                  rows="2"
                  maxlength="200"
                ></textarea>
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
import { usePublisherStore } from "../../stores/publisher";
import { useConfirm } from "../../composables/useConfirm";
import { useToast } from "../../composables/useToast";
import Pagination from "../../components/Pagination.vue";
import * as bootstrap from "bootstrap";

const store = usePublisherStore();
const { confirm } = useConfirm();
const toast = useToast();
const modalRef = ref(null);
let modal = null;

const form = reactive({
  MaNXB: "",
  TenNXB: "",
  DiaChi: "",
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
  form.MaNXB = "";
  form.TenNXB = "";
  form.DiaChi = "";
  modal.show();
};

const openEdit = (p) => {
  editing.value = true;
  form.MaNXB = p.MaNXB;
  form.TenNXB = p.TenNXB;
  form.DiaChi = p.DiaChi || "";
  modal.show();
};

const submitForm = async () => {
  try {
    if (editing.value) {
      await store.update(form.MaNXB, form);
      toast.success('Đã cập nhật nhà xuất bản');
    } else {
      await store.create(form);
      toast.success('Đã thêm nhà xuất bản mới');
    }
    modal.hide();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi lưu nhà xuất bản');
  }
};

const remove = async (p) => {
  try {
    await confirm(`Xóa NXB "${p.TenNXB}"?`);
    await store.remove(p.MaNXB);
    toast.success('Đã xóa nhà xuất bản');
  } catch (err) {
    if (err && err.response) {
      toast.error(err.response?.data?.message || 'Lỗi xóa nhà xuất bản');
    }
  }
};
</script>

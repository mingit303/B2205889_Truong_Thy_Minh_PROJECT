<template>
  <div class="container-fluid py-4">
    <!-- HEADER -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <div class="header-icon-wrapper me-3">
            <font-awesome-icon icon="tags" class="header-icon" />
          </div>
          <div>
            <h3 class="header-title mb-1">Thể loại</h3>
            <p class="header-subtitle mb-0">Quản lý thể loại sách</p>
          </div>
        </div>
        <button class="btn btn-success" @click="openCreate">
          <font-awesome-icon icon="plus" class="me-1" /> Thêm thể loại
        </button>
      </div>
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
const originalData = ref(null);

onMounted(() => {
  store.fetch();
  store.fetchAll();
  modal = new bootstrap.Modal(modalRef.value);
  
  // Reset form khi đóng modal
  modalRef.value.addEventListener('hidden.bs.modal', resetForm);
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
  originalData.value = { TenTheLoai: c.TenTheLoai };
  modal.show();
};

const resetForm = () => {
  form.MaTheLoai = "";
  form.TenTheLoai = "";
  editing.value = false;
  originalData.value = null;
};

const submitForm = async () => {
  if (editing.value && originalData.value) {
    const hasChanges = form.TenTheLoai !== originalData.value.TenTheLoai;
    if (!hasChanges) {
      modal.hide();
      return;
    }
  }

  // Kiểm tra trùng tên thể loại khi thêm mới
  if (!editing.value) {
    const existsCode = store.items.some(c => 
      c.MaTheLoai.toLowerCase().trim() === form.MaTheLoai.toLowerCase().trim()
    );
    if (existsCode) {
      toast.error('Mã thể loại đã tồn tại!');
      return;
    }
    
    const existsName = store.items.some(c => 
      c.TenTheLoai.toLowerCase().trim() === form.TenTheLoai.toLowerCase().trim()
    );
    if (existsName) {
      toast.error('Tên thể loại đã tồn tại!');
      return;
    }
  }

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

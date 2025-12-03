<template>
  <div class="container-fluid py-4">
    <!-- HEADER -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <div class="header-icon-wrapper me-3">
            <font-awesome-icon icon="pen-nib" class="header-icon" />
          </div>
          <div>
            <h3 class="header-title mb-1">Tác giả</h3>
            <p class="header-subtitle mb-0">Quản lý thông tin tác giả sách</p>
          </div>
        </div>
        <button class="btn btn-success" @click="openCreate">
          <font-awesome-icon icon="plus" class="me-1" /> Thêm tác giả
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
                minlength="2"
                maxlength="20"
              />

              <label class="form-label mt-3">Tên tác giả *</label>
              <input 
                v-model="form.TenTacGia" 
                type="text"
                class="form-control" 
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
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useAuthorStore } from "../../stores/author";
import { useConfirm } from "../../composables/useConfirm";
import { useToast } from "../../composables/useToast";
import { useSocket, SOCKET_EVENTS } from "../../composables/useSocket";
import Pagination from "../../components/Pagination.vue";
import * as bootstrap from "bootstrap";

const store = useAuthorStore();
const { confirm } = useConfirm();
const toast = useToast();
const { connect, disconnect, on, off } = useSocket();
const modalRef = ref(null);
let modal = null;

const form = reactive({
  MaTacGia: "",
  TenTacGia: "",
});

const editing = ref(false);
const originalData = ref(null);

onMounted(() => {
  store.fetch();
  modal = new bootstrap.Modal(modalRef.value);
  
  // Reset form khi đóng modal
  modalRef.value.addEventListener('hidden.bs.modal', resetForm);
  
  connect();
  on(SOCKET_EVENTS.AUTHOR_ADDED, () => store.fetch());
  on(SOCKET_EVENTS.AUTHOR_UPDATED, () => store.fetch());
  on(SOCKET_EVENTS.AUTHOR_DELETED, () => store.fetch());
});

onUnmounted(() => {
  off(SOCKET_EVENTS.AUTHOR_ADDED);
  off(SOCKET_EVENTS.AUTHOR_UPDATED);
  off(SOCKET_EVENTS.AUTHOR_DELETED);
  disconnect();
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
  originalData.value = { TenTacGia: a.TenTacGia };
  modal.show();
};

const resetForm = () => {
  form.MaTacGia = "";
  form.TenTacGia = "";
  editing.value = false;
  originalData.value = null;
};

const submitForm = async () => {
  if (editing.value && originalData.value) {
    const hasChanges = form.TenTacGia !== originalData.value.TenTacGia;
    if (!hasChanges) {
      modal.hide();
      return;
    }
  }

  // Kiểm tra trùng tên tác giả khi thêm mới
  if (!editing.value) {
    const existsCode = store.items.some(a => 
      a.MaTacGia.toLowerCase().trim() === form.MaTacGia.toLowerCase().trim()
    );
    if (existsCode) {
      toast.error('Mã tác giả đã tồn tại!');
      return;
    }
    
    const existsName = store.items.some(a => 
      a.TenTacGia.toLowerCase().trim() === form.TenTacGia.toLowerCase().trim()
    );
    if (existsName) {
      toast.error('Tên tác giả đã tồn tại!');
      return;
    }
  }

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

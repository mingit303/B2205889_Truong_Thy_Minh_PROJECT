<template>
  <div class="container-fluid py-4">
    <!-- HEADER -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <div class="header-icon-wrapper me-3">
            <font-awesome-icon icon="building" class="header-icon" />
          </div>
          <div>
            <h3 class="header-title mb-1">Nhà xuất bản</h3>
            <p class="header-subtitle mb-0">Quản lý thông tin NXB</p>
          </div>
        </div>
        <button class="btn btn-success" @click="openCreate">
          <font-awesome-icon icon="plus" class="me-1" /> Thêm NXB
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
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { usePublisherStore } from "../../stores/publisher";
import { useConfirm } from "../../composables/useConfirm";
import { useToast } from "../../composables/useToast";
import { useSocket, SOCKET_EVENTS } from "../../composables/useSocket";
import Pagination from "../../components/Pagination.vue";
import * as bootstrap from "bootstrap";

const store = usePublisherStore();
const { confirm } = useConfirm();
const toast = useToast();
const { connect, disconnect, on, off } = useSocket();
const modalRef = ref(null);
let modal = null;

const form = reactive({
  MaNXB: "",
  TenNXB: "",
  DiaChi: "",
});

const editing = ref(false);
const originalData = ref(null);

onMounted(() => {
  store.fetch();
  modal = new bootstrap.Modal(modalRef.value);
  
  // Reset form khi đóng modal
  modalRef.value.addEventListener('hidden.bs.modal', resetForm);
  
  connect();
  on(SOCKET_EVENTS.PUBLISHER_ADDED, () => store.fetch());
  on(SOCKET_EVENTS.PUBLISHER_UPDATED, () => store.fetch());
  on(SOCKET_EVENTS.PUBLISHER_DELETED, () => store.fetch());
});

onUnmounted(() => {
  off(SOCKET_EVENTS.PUBLISHER_ADDED);
  off(SOCKET_EVENTS.PUBLISHER_UPDATED);
  off(SOCKET_EVENTS.PUBLISHER_DELETED);
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
  originalData.value = {
    TenNXB: p.TenNXB,
    DiaChi: p.DiaChi || ""
  };
  modal.show();
};

const resetForm = () => {
  form.MaNXB = "";
  form.TenNXB = "";
  form.DiaChi = "";
  editing.value = false;
  originalData.value = null;
};

const submitForm = async () => {
  if (editing.value && originalData.value) {
    const hasChanges = 
      form.TenNXB !== originalData.value.TenNXB ||
      form.DiaChi !== originalData.value.DiaChi;
    if (!hasChanges) {
      modal.hide();
      return;
    }
  }

  // Kiểm tra trùng tên NXB khi thêm mới
  if (!editing.value) {
    const existsCode = store.items.some(p => 
      p.MaNXB.toLowerCase().trim() === form.MaNXB.toLowerCase().trim()
    );
    if (existsCode) {
      toast.error('Mã nhà xuất bản đã tồn tại!');
      return;
    }
    
    const existsName = store.items.some(p => 
      p.TenNXB.toLowerCase().trim() === form.TenNXB.toLowerCase().trim()
    );
    if (existsName) {
      toast.error('Tên nhà xuất bản đã tồn tại!');
      return;
    }
  }

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

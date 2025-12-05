<template>
  <div class="container-fluid py-4">
    <!-- HEADER -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center">
        <div class="header-icon-wrapper me-3">
          <font-awesome-icon icon="envelope-open-text" class="header-icon" />
        </div>
        <div>
          <h3 class="header-title mb-1">Yêu cầu mượn sách</h3>
          <p class="header-subtitle mb-0">Duyệt và quản lý yêu cầu từ độc giả</p>
        </div>
      </div>
    </div>

    <!-- FILTER -->
    <div class="card mb-3 p-3">
      <div class="row g-2">
        <div class="col-md-3">
          <select class="form-select" v-model="store.status" @change="reload">
            <option value="">Tất cả</option>
            <option value="CHO_DUYET">Chờ duyệt</option>
            <option value="DA_DUYET">Đã duyệt</option>
            <option value="TU_CHOI">Từ chối</option>
          </select>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="card">
      <div class="card-body p-0">
        <table class="table mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 50px">#</th>
              <th>Độc giả</th>
              <th>Sách</th>
              <th>Trạng thái</th>
              <th>Ngày yêu cầu</th>
              <th class="text-center" style="width:160px">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(r, idx) in store.items" :key="r._id">
              <td>{{ (store.page - 1) * store.limit + idx + 1 }}</td>
              <td class="fw-bold">{{ r.MaDocGia }}</td>

              <!-- BOOK LIST -->
              <td>
                <button 
                  class="btn btn-sm btn-outline-primary" 
                  @click="showBooks(r)"
                  type="button"
                >
                  <font-awesome-icon icon="eye" class="me-1" />
                  {{ r.Sach.length }} sách
                </button>
              </td>

              <td>
                <span class="badge" :class="badge(r.TrangThai)">
                  {{ convertStatus(r.TrangThai) }}
                </span>
              </td>

              <td>{{ formatDate(r.createdAt) }}</td>

              <td class="text-center">
                <template v-if="r.TrangThai === 'CHO_DUYET'">
                  <button class="btn btn-sm btn-success me-1" @click="approve(r._id)">
                    <font-awesome-icon icon="check" />
                  </button>

                  <button class="btn btn-sm btn-danger" @click="openReject(r._id)">
                    <font-awesome-icon icon="xmark" />
                  </button>
                </template>
                <span v-else class="text-muted">—</span>
              </td>
            </tr>

            <tr v-if="store.items.length === 0">
              <td colspan="6" class="text-center py-3">Không có yêu cầu</td>
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

    <!-- MODAL: Book List -->
    <div class="modal fade" id="bookModal" tabindex="-1" ref="bookModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <font-awesome-icon icon="book" class="me-2" />
              Danh sách sách yêu cầu
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedRequest">
              <p class="mb-2">
                <strong>Độc giả:</strong> {{ selectedRequest.MaDocGia }}
              </p>
              <ul class="list-group">
                <li
                  v-for="book in selectedRequest.Sach"
                  :key="book._id || book.MaSach"
                  class="list-group-item"
                >
                  <div class="fw-bold">{{ book.MaSach }} - {{ book.TenSach }}</div>
                  <small class="text-muted">Tác giả: {{ book.MaTacGia?.TenTacGia }}</small><br>
                  <small class="text-muted">NXB: {{ book.MaNXB?.TenNXB }}</small>
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: Reject Reason -->
    <div class="modal fade" id="rejectModal" tabindex="-1" ref="rejectModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          
          <div class="modal-header">
            <h5 class="modal-title">
              <!-- <font-awesome-icon icon="infor" class="me-2" /> -->
              Lý do từ chối
            </h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <label class="form-label">Nhập lý do *</label>
            <textarea class="form-control" rows="3" v-model="rejectReason"></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Đóng
            </button>
            <button type="button" class="btn btn-danger" @click="confirmReject">
              Từ chối
            </button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useRequestStore } from "../../stores/request";
import { useConfirm } from "../../composables/useConfirm";
import { useToast } from "../../composables/useToast";
import { useSocket, SOCKET_EVENTS } from "../../composables/useSocket";
import Pagination from "../../components/Pagination.vue";
import { Modal } from "bootstrap";

const store = useRequestStore();
const { confirm } = useConfirm();
const toast = useToast();
const { connect, disconnect, on, off } = useSocket();

const bookModal = ref(null);
const selectedRequest = ref(null);
let modalInstance = null;

/* Reject modal */
const rejectModalRef = ref(null);
let rejectModal = null;
const rejectReason = ref("");
const rejectId = ref(null);

onMounted(() => {
  store.fetch();

  modalInstance = new Modal(bookModal.value);
  rejectModal = new Modal(rejectModalRef.value);

  connect();
  on(SOCKET_EVENTS.REQUEST_CREATED, () => store.fetch());
  on(SOCKET_EVENTS.REQUEST_ADDED, () => store.fetch());
  on(SOCKET_EVENTS.REQUEST_UPDATED, () => store.fetch());
  on(SOCKET_EVENTS.REQUEST_DELETED, () => store.fetch());
});

onUnmounted(() => {
  off(SOCKET_EVENTS.REQUEST_CREATED);
  off(SOCKET_EVENTS.REQUEST_ADDED);
  off(SOCKET_EVENTS.REQUEST_UPDATED);
  off(SOCKET_EVENTS.REQUEST_DELETED);
  disconnect();
});

const showBooks = (request) => {
  selectedRequest.value = request;
  modalInstance.show();
};

const reload = () => {
  store.page = 1;
  store.fetch();
};

const changePage = (p) => {
  const max = Math.ceil(store.total / store.limit) || 1;
  if (p < 1 || p > max) return;
  store.page = p;
  store.fetch();
};

const approve = async (id) => {
  try {
    await confirm("Xác nhận duyệt yêu cầu mượn này?");
    await store.approve(id);
    toast.success("Đã duyệt yêu cầu");
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi duyệt yêu cầu");
  }
};

/* OPEN REJECT MODAL */
const openReject = (id) => {
  rejectId.value = id;
  rejectReason.value = "";
  rejectModal.show();
};

/* CONFIRM REJECT */
const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    toast.error("Vui lòng nhập lý do từ chối");
    return;
  }
  try {
    await store.reject(rejectId.value, rejectReason.value);
    toast.success("Đã từ chối yêu cầu");
    rejectModal.hide();
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi từ chối yêu cầu");
  }
};

const badge = (st) => ({
  CHO_DUYET: "bg-warning text-dark",
  DA_DUYET: "bg-success",
  TU_CHOI: "bg-danger",
}[st]);

const convertStatus = (st) => ({
  CHO_DUYET: "Chờ duyệt",
  DA_DUYET: "Đã duyệt",
  TU_CHOI: "Từ chối",
}[st] || st);

const formatDate = (d) =>
  new Date(d).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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
}

.header-title {
  font-size: 1.8rem;
  font-weight: 700;
}

.header-subtitle {
  opacity: 0.9;
}

.badge {
  font-size: 0.85rem;
  padding: 6px 10px;
}
</style>

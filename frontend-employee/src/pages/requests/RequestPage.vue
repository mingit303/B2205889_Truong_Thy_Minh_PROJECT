<template>
  <div class="container-fluid py-3">
    <h3 class="mb-3">
      <font-awesome-icon icon="envelope-open-text" class="me-2" />
      Yêu cầu mượn sách
    </h3>

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

                  <button class="btn btn-sm btn-danger" @click="reject(r._id)">
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
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRequestStore } from "../../stores/request";
import { useConfirm } from "../../composables/useConfirm";
import { useToast } from "../../composables/useToast";
import Pagination from "../../components/Pagination.vue";
import { Modal } from "bootstrap";

const store = useRequestStore();
const { confirm } = useConfirm();
const toast = useToast();
const bookModal = ref(null);
const selectedRequest = ref(null);
let modalInstance = null;

onMounted(() => {
  store.fetch();
  modalInstance = new Modal(bookModal.value);
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
  const maxPage = Math.ceil(store.total / store.limit) || 1;
  if (p < 1 || p > maxPage) return;
  store.page = p;
  store.fetch();
};

/* APPROVE */
const approve = async (id) => {
  try {
    await confirm("Xác nhận duyệt yêu cầu mượn này?");
    await store.approve(id);
    toast.success('Đã duyệt yêu cầu');
  } catch (err) {
    if (err && err.response) {
      toast.error(err.response?.data?.message || 'Lỗi duyệt yêu cầu');
    }
  }
};

/* REJECT */
const reject = async (id) => {
  const reason = prompt("Nhập lý do từ chối:");
  if (!reason) return;
  try {
    await store.reject(id, reason);
    toast.success('Đã từ chối yêu cầu');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi từ chối yêu cầu');
  }
};

/* BADGE COLOR */
const badge = (st) =>
  ({
    CHO_DUYET: "bg-warning text-dark",
    DA_DUYET: "bg-success",
    TU_CHOI: "bg-danger",
  }[st]);

/* STATUS TEXT */
const convertStatus = (st) =>
  ({
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
.table td,
.table th {
  vertical-align: middle;
}

.badge {
  font-size: 0.85rem;
  padding: 6px 10px;
}
</style>

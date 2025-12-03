<template>
  <div class="container-fluid py-4">

    <!-- HEADER -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <div class="header-icon-wrapper me-3">
            <font-awesome-icon icon="book-open" class="header-icon" />
          </div>
          <div>
            <h3 class="header-title mb-1">Phiếu mượn sách</h3>
            <p class="header-subtitle mb-0">Quản lý mượn trả và phạt</p>
          </div>
        </div>
        <button class="btn btn-success" @click="openCreate">
          <font-awesome-icon icon="plus" class="me-1" /> Tạo phiếu mượn
        </button>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-3">

          <div class="col-md-4">
            <label class="form-label">Tìm kiếm độc giả / sách</label>
            <input
              class="form-control"
              placeholder="Mã DG, tên DG, mã sách..."
              v-model="store.search"
              @input="applyFilters"
            />
          </div>

          <div class="col-md-3">
            <label class="form-label">Trạng thái</label>
            <select
              v-model="store.status"
              class="form-select"
              @change="applyFilters"
            >
              <option value="">Tất cả</option>
              <option>Đã mượn</option>
              <option>Đã trả</option>
              <option>Trễ hạn</option>
              <option>Hư hỏng</option>
              <option>Mất sách</option>
              <option>Đã bồi thường</option>
            </select>
          </div>

          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              Xóa lọc
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="card">
      <div class="card-body p-0" style="overflow: visible;">
        <div style="overflow-x: auto;">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-center" style="width:50px">#</th>
                <th>Độc giả</th>
                <th>Sách</th>
                <th>Ngày mượn</th>
                <th>Hạn trả</th>
                <th>Trạng thái</th>
                <th>Tiền phạt</th>
                <th class="text-center" style="width:140px">Thao tác</th>
              </tr>
            </thead>

          <tbody>

            <tr v-if="store.loading">
              <td colspan="8" class="text-center py-3">Đang tải dữ liệu...</td>
            </tr>

            <tr v-for="(b, idx) in store.items" :key="b._id">

              <td class="text-center">{{ rowNumber(idx) }}</td>

              <td>{{ b.MaDocGia }} — <strong>{{ b.reader?.HoLot }} {{ b.reader?.Ten }}</strong></td>

              <td>{{ b.MaSach }} — <strong>{{ b.book?.TenSach }}</strong></td>

              <td>{{ formatDate(b.NgayMuon) }}</td>
              <td>{{ formatDate(b.HanTra) }}</td>

              <td><span class="badge" :class="statusClass(getActualStatus(b))">{{ getActualStatus(b) }}</span></td>

              <!-- TIỀN PHẠT -->
              <td>
                <span v-if="calcFine(b) === 0" class="text-muted" style="font-size: 1rem;">0 đ</span>
                <button 
                  v-else
                  class="btn btn-sm btn-link text-danger p-0 text-decoration-none fw-bold"
                  @click="showFineDetail(b)"
                  type="button"
                  style="font-size: 1rem;"
                >
                  {{ calcFine(b).toLocaleString("vi-VN") }} đ
                  <font-awesome-icon icon="circle-info" class="ms-1" style="font-size: 0.85rem;" />
                </button>
              </td>

              <!-- ACTIONS -->
              <td class="text-center">
                <!-- Nếu đã trả và (không có phạt HOẶC đã thanh toán phạt) thì chỉ hiện dấu gạch -->
                <span v-if="b.NgayTra && (calcFine(b) === 0 || b.DaThanhToanPhat)" class="text-muted">—</span>
                
                <!-- Ngược lại hiện nút mở modal -->
                <button
                  v-else
                  class="btn btn-sm btn-outline-secondary"
                  @click="openActionsModal(b)"
                >
                  <font-awesome-icon icon="ellipsis-vertical" />
                </button>
              </td>

            </tr>

            <tr v-if="!store.items.length && !store.loading">
              <td colspan="8" class="text-center py-3">Không có dữ liệu</td>
            </tr>

          </tbody>
        </table>
      </div>
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

    <!-- MODALS -->
    <CreateBorrowModal ref="createModal" />
    <ReturnModal ref="returnModal" />
    <DamagedModal ref="damagedModal" />
    <LostModal ref="lostModal" />

    <!-- MODAL: Fine Detail -->
    <div class="modal fade" id="fineModal" tabindex="-1" ref="fineModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header fine-modal-header">
            <h5 class="modal-title">
              <font-awesome-icon icon="circle-exclamation" class="me-2" />
              Chi tiết tiền phạt
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedBorrow">
              <div class="mb-3">
                <strong>Độc giả:</strong> {{ selectedBorrow.MaDocGia }} - {{ selectedBorrow.reader?.HoLot }} {{ selectedBorrow.reader?.Ten }}
              </div>
              <div class="mb-3">
                <strong>Sách:</strong> {{ selectedBorrow.MaSach }} - {{ selectedBorrow.book?.TenSach }}
              </div>

              <hr>

              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Loại phạt</th>
                      <th class="text-end">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="getFineBreakdown(selectedBorrow).lateFine > 0">
                      <td>
                        Phạt trễ hạn
                        <br>
                        <small class="text-muted">
                          {{ getFineBreakdown(selectedBorrow).daysLate }} ngày × 5,000 đ
                        </small>
                      </td>
                      <td class="text-end">
                        {{ getFineBreakdown(selectedBorrow).lateFine.toLocaleString("vi-VN") }} đ
                      </td>
                    </tr>
                    <tr v-if="getFineBreakdown(selectedBorrow).damageFine > 0">
                      <td>
                        <span v-if="selectedBorrow.TrangThai === 'Hư hỏng'">
                          Phạt hư hỏng ({{ selectedBorrow.MucDoHuHong || "Không rõ" }})
                        </span>
                        <span v-else-if="['Mất sách', 'Đã bồi thường'].includes(selectedBorrow.TrangThai)">
                          Phạt mất sách
                        </span>
                      </td>
                      <td class="text-end">
                        {{ getFineBreakdown(selectedBorrow).damageFine.toLocaleString("vi-VN") }} đ
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="fine-total-row">
                      <td>TỔNG CỘNG</td>
                      <td class="text-end">
                        {{ calcFine(selectedBorrow).toLocaleString("vi-VN") }} đ
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Actions -->
    <div class="modal fade" id="actionsModal" ref="actionsModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thao tác</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-2">
            <div class="list-group list-group-flush">
              <!-- Trả sách -->
              <button
                v-if="selectedBorrow && ['Đã mượn','Trễ hạn'].includes(getActualStatus(selectedBorrow))"
                class="list-group-item list-group-item-action"
                @click="handleReturn"
              >
                <font-awesome-icon icon="rotate-left" class="me-2 text-primary" />
                Trả sách
              </button>

              <!-- Gia hạn -->
              <button
                v-if="selectedBorrow && getActualStatus(selectedBorrow) === 'Đã mượn'"
                class="list-group-item list-group-item-action"
                @click="handleExtend"
              >
                <font-awesome-icon icon="clock-rotate-left" class="me-2 text-info" />
                Gia hạn
              </button>

              <!-- Báo hư hỏng -->
              <button
                v-if="selectedBorrow && ['Đã mượn','Trễ hạn'].includes(getActualStatus(selectedBorrow))"
                class="list-group-item list-group-item-action"
                @click="handleDamaged"
              >
                <font-awesome-icon icon="triangle-exclamation" class="me-2 text-warning" />
                Báo hư hỏng
              </button>

              <!-- Báo mất -->
              <button
                v-if="selectedBorrow && ['Đã mượn','Trễ hạn'].includes(getActualStatus(selectedBorrow))"
                class="list-group-item list-group-item-action"
                @click="handleLost"
              >
                <font-awesome-icon icon="book-dead" class="me-2 text-danger" />
                Báo mất sách
              </button>

              <hr class="my-1" v-if="selectedBorrow && (canPrintBorrow(selectedBorrow) || canPrintFine(selectedBorrow) || canConfirmFinePaid(selectedBorrow))" />

              <!-- In phiếu mượn -->
              <button
                v-if="selectedBorrow && canPrintBorrow(selectedBorrow)"
                class="list-group-item list-group-item-action"
                @click="handlePrintBorrow"
              >
                <font-awesome-icon icon="print" class="me-2" />
                In phiếu mượn
              </button>

              <!-- Xác nhận đã thanh toán tiền phạt -->
              <button
                v-if="selectedBorrow && canConfirmFinePaid(selectedBorrow)"
                class="list-group-item list-group-item-action text-success"
                @click="handleConfirmFinePaid"
              >
                <font-awesome-icon icon="check" class="me-2" />
                Xác nhận đã thanh toán phạt
              </button>

              <!-- In phiếu phạt -->
              <button
                v-if="selectedBorrow && canPrintFine(selectedBorrow)"
                class="list-group-item list-group-item-action text-danger"
                @click="handlePrintFine"
              >
                <font-awesome-icon icon="file-pdf" class="me-2" />
                In phiếu phạt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useBorrowStore } from "../../stores/borrow";
import { useToast } from "../../composables/useToast";
import { useConfirm } from "../../composables/useConfirm";
import { useSocket, SOCKET_EVENTS } from "../../composables/useSocket";
import { Modal } from "bootstrap";

import Pagination from "../../components/Pagination.vue";
import CreateBorrowModal from "../../components/borrow/CreateBorrowModal.vue";
import ReturnModal from "../../components/borrow/ReturnModal.vue";
import DamagedModal from "../../components/borrow/DamagedModal.vue";
import LostModal from "../../components/borrow/LostModal.vue";

const store = useBorrowStore();
const toast = useToast();
const { confirm } = useConfirm();
const { connect, disconnect, on, off } = useSocket();
const fineModal = ref(null);
const actionsModal = ref(null);
const selectedBorrow = ref(null);
let fineModalInstance = null;
let actionsModalInstance = null;

onMounted(() => {
  store.fetch();
  fineModalInstance = new Modal(fineModal.value);
  if (actionsModal.value) {
    actionsModalInstance = new Modal(actionsModal.value);
  }
  
  connect();
  on(SOCKET_EVENTS.BORROW_ADDED, () => store.fetch());
  on(SOCKET_EVENTS.BORROW_UPDATED, () => store.fetch());
  on(SOCKET_EVENTS.BORROW_DELETED, () => store.fetch());
});

onUnmounted(() => {
  off(SOCKET_EVENTS.BORROW_ADDED);
  off(SOCKET_EVENTS.BORROW_UPDATED);
  off(SOCKET_EVENTS.BORROW_DELETED);
  disconnect();
});

const openActionsModal = (borrow) => {
  selectedBorrow.value = borrow;
  if (!actionsModalInstance && actionsModal.value) {
    actionsModalInstance = new Modal(actionsModal.value);
  }
  if (actionsModalInstance) {
    actionsModalInstance.show();
  }
};

const closeActionsModal = () => {
  if (actionsModalInstance) {
    actionsModalInstance.hide();
  }
};

const showFineDetail = (borrow) => {
  selectedBorrow.value = borrow;
  fineModalInstance.show();
};

/* FILTERS */
const applyFilters = () => {
  store.page = 1;
  store.fetch();
};

const resetFilters = () => {
  store.search = "";
  store.status = "";
  store.page = 1;
  store.fetch();
};

/* PAGINATION */
const changePage = (p) => {
  const maxPage = Math.ceil(store.total / store.limit) || 1;
  if (p < 1 || p > maxPage) return;
  store.page = p;
  store.fetch();
};

const rowNumber = (idx) => (store.page - 1) * store.limit + idx + 1;

/* FORMATTERS */
const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "");

/* GET ACTUAL STATUS - Kiểm tra thời gian để xác định trễ hạn */
const getActualStatus = (b) => {
  // Nếu đã có NgayTra (đã trả sách) thì luôn giữ nguyên trạng thái từ database
  if (b.NgayTra) {
    return b.TrangThai;
  }
  
  // Nếu chưa trả và đang mượn, kiểm tra xem có quá hạn không
  if (b.TrangThai === 'Đã mượn' && b.HanTra) {
    const hanTra = new Date(b.HanTra);
    const now = new Date();
    // Hạn trả tính đến 23:59:59 của ngày đó
    hanTra.setHours(23, 59, 59, 999);
    
    if (now > hanTra) {
      return 'Trễ hạn';
    }
  }
  
  return b.TrangThai;
};

/* STATUS COLORS */
const statusClass = (st) =>
  ({
    "Đã mượn": "bg-primary",
    "Đã trả": "bg-success",
    "Trễ hạn": "bg-danger",
    "Hư hỏng": "bg-warning text-dark",
    "Mất sách": "bg-dark text-white",
    "Đã bồi thường": "bg-secondary",
  }[st] || "bg-light");

/* CALC FINE */
const calcFine = (b) => b.TienPhat || 0;

/* CHECK MULTIPLE FINES */
const hasMultipleFines = (b) => {
  if (!b.NgayTra || !b.HanTra) return false;
  const hanTra = new Date(b.HanTra);
  const ngayTra = new Date(b.NgayTra);
  return ngayTra > hanTra && ["Hư hỏng", "Mất sách", "Đã bồi thường"].includes(b.TrangThai);
};

/* FINE BREAKDOWN */
const getFineBreakdown = (b) => {
  let daysLate = 0;
  let lateFine = 0;
  let damageFine = 0;

  if (b.NgayTra && b.HanTra) {
    const hanTra = new Date(b.HanTra);
    const ngayTra = new Date(b.NgayTra);
    
    // Set hạn trả về 23:59:59 của ngày đó
    hanTra.setHours(23, 59, 59, 999);
    // Set ngày trả về 00:00:00 để tính từ đầu ngày
    ngayTra.setHours(0, 0, 0, 0);
    
    if (ngayTra > hanTra) {
      // Tính số ngày trễ
      daysLate = Math.ceil((ngayTra - hanTra) / 86400000);
      lateFine = daysLate * 5000;
    }
  }

  if (["Hư hỏng", "Mất sách", "Đã bồi thường"].includes(b.TrangThai)) {
    damageFine = (b.TienPhat || 0) - lateFine;
  }

  return { daysLate, lateFine, damageFine };
};

/* CONDITIONS */
const canPrintBorrow = (b) => {
  const actualStatus = getActualStatus(b);
  return ['Đã mượn', 'Trễ hạn'].includes(actualStatus);
};

const canPrintFine = (b) => {
  // Có thể in phiếu phạt nếu có tiền phạt > 0 và chưa thanh toán
  return calcFine(b) > 0 && !b.DaThanhToanPhat;
};

const canConfirmFinePaid = (b) => {
  // Hiện nút xác nhận thanh toán cho MỌI trường hợp có phạt:
  // - Đã xử lý xong (có NgayTra): trễ hạn, hư hỏng, mất sách
  // - Có tiền phạt > 0
  // - Chưa xác nhận thanh toán
  return b.NgayTra && calcFine(b) > 0 && !b.DaThanhToanPhat;
};

/* ACTIONS */
const createModal = ref(null);
const returnModal = ref(null);
const damagedModal = ref(null);
const lostModal = ref(null);

const openCreate = () => createModal.value?.open();
const openReturn = (b) => returnModal.value?.open(b);
const openDamaged = (b) => damagedModal.value?.open(b);
const openLost = (b) => lostModal.value?.open(b);

// Handler functions from modal
const handleReturn = () => {
  closeActionsModal();
  openReturn(selectedBorrow.value);
};

const handleExtend = async () => {
  closeActionsModal();
  await extendBorrow(selectedBorrow.value);
};

const handleDamaged = () => {
  closeActionsModal();
  openDamaged(selectedBorrow.value);
};

const handleLost = () => {
  closeActionsModal();
  openLost(selectedBorrow.value);
};

const handlePrintBorrow = () => {
  closeActionsModal();
  printBorrow(selectedBorrow.value._id);
};

const handlePrintFine = () => {
  closeActionsModal();
  printFine(selectedBorrow.value._id);
};

const handleConfirmFinePaid = async () => {
  closeActionsModal();
  await confirmFinePaid(selectedBorrow.value);
};

const extendBorrow = async (b) => {
  try {
    await confirm("Gia hạn thêm cho phiếu mượn này?");
    await store.extendBorrow(b._id);
    toast.success('Đã gia hạn thành công');
  } catch (err) {
    if (err && err.response) {
      toast.error(err.response?.data?.message || 'Lỗi gia hạn');
    }
  }
};

const confirmFinePaid = async (b) => {
  try {
    await confirm("Xác nhận độc giả đã thanh toán tiền phạt?");
    await store.confirmFinePaid(b._id);
    toast.success('Đã xác nhận thanh toán tiền phạt');
  } catch (err) {
    if (err && err.response) {
      toast.error(err.response?.data?.message || 'Lỗi xác nhận');
    }
  }
};

const printBorrow = (id) => {
  window.open(`${import.meta.env.VITE_API_URL}/pdf/borrow/${id}`, "_blank");
};

const printFine = (id) => {
  window.open(`${import.meta.env.VITE_API_URL}/pdf/fine/${id}`, "_blank");
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
  font-size: 28px;
  color: white;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-subtitle {
  font-size: 0.95rem;
  opacity: 0.9;
  font-weight: 400;
}

.fine-modal-header {
  background: #dc3545;
  color: white;
}

.fine-modal-header .modal-title {
  color: white;
}

.fine-total-row {
  background-color: #dc3545 !important;
  color: white !important;
  font-weight: bold !important;
}

.fine-total-row td {
  background-color: #dc3545 !important;
  color: white !important;
  font-weight: bold !important;
  border-color: #dc3545 !important;
}
</style>

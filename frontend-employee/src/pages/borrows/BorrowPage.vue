<template>
  <div class="container-fluid py-3">

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">
        <font-awesome-icon icon="book-open" class="me-2" /> Phiếu mượn
      </h3>

      <button class="btn btn-success" @click="openCreate">
        <font-awesome-icon icon="plus" class="me-1" /> Tạo phiếu mượn
      </button>
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
      <div class="card-body p-0">
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

              <td><span class="badge" :class="statusClass(b.TrangThai)">{{ b.TrangThai }}</span></td>

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
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <font-awesome-icon icon="ellipsis-vertical" />
                  </button>

                  <ul class="dropdown-menu dropdown-menu-end">

                    <!-- Trả sách -->
                    <li v-if="['Đã mượn','Trễ hạn'].includes(b.TrangThai)">
                      <button class="dropdown-item" @click="openReturn(b)">
                        <font-awesome-icon icon="rotate-left" class="me-2" /> Trả sách
                      </button>
                    </li>

                    <!-- Gia hạn -->
                    <li v-if="b.TrangThai === 'Đã mượn'">
                      <button class="dropdown-item" @click="extendBorrow(b)">
                        <font-awesome-icon icon="clock-rotate-left" class="me-2" /> Gia hạn
                      </button>
                    </li>

                    <!-- Báo hư hỏng -->
                    <li v-if="['Đã mượn','Trễ hạn'].includes(b.TrangThai)">
                      <button class="dropdown-item" @click="openDamaged(b)">
                        <font-awesome-icon icon="triangle-exclamation" class="me-2" /> Báo hư hỏng
                      </button>
                    </li>

                    <!-- Báo mất -->
                    <li v-if="['Đã mượn','Trễ hạn'].includes(b.TrangThai)">
                      <button class="dropdown-item" @click="openLost(b)">
                        <font-awesome-icon icon="book-dead" class="me-2" /> Báo mất sách
                      </button>
                    </li>

                    <!-- BỒI THƯỜNG -->
                    <li v-if="canMarkPaid(b)">
                      <button class="dropdown-item" @click="markPaid(b)">
                        <font-awesome-icon icon="check" class="me-2" /> Đã bồi thường
                      </button>
                    </li>

                    <li><hr class="dropdown-divider" /></li>

                    <!-- In phiếu mượn -->
                    <li v-if="canPrintBorrow(b)">
                      <button class="dropdown-item" @click="printBorrow(b._id)">
                        <font-awesome-icon icon="print" class="me-2" /> In phiếu mượn
                      </button>
                    </li>

                    <!-- In phiếu phạt -->
                    <li v-if="canPrintFine(b)">
                      <button class="dropdown-item text-danger" @click="printFine(b._id)">
                        <font-awesome-icon icon="file-pdf" class="me-2" /> In phiếu phạt
                      </button>
                    </li>

                  </ul>
                </div>
              </td>

            </tr>

            <tr v-if="!store.items.length && !store.loading">
              <td colspan="8" class="text-center py-3">Không có dữ liệu</td>
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

    <!-- MODALS -->
    <CreateBorrowModal ref="createModal" />
    <ReturnModal ref="returnModal" />
    <DamagedModal ref="damagedModal" />
    <LostModal ref="lostModal" />

    <!-- MODAL: Fine Detail -->
    <div class="modal fade" id="fineModal" tabindex="-1" ref="fineModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <font-awesome-icon icon="circle-exclamation" class="me-2 text-danger" />
              Chi tiết tiền phạt
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
                    <tr class="table-danger fw-bold">
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
const selectedBorrow = ref(null);
let fineModalInstance = null;

onMounted(() => {
  store.fetch();
  fineModalInstance = new Modal(fineModal.value);
  
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

/* STATUS COLORS */
const statusClass = (st) =>
  ({
    "Đã mượn": "bg-primary",
    "Đã trả": "bg-secondary",
    "Trễ hạn": "bg-danger",
    "Hư hỏng": "bg-warning text-dark",
    "Mất sách": "bg-dark",
    "Đã bồi thường": "bg-success",
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
    if (ngayTra > hanTra) {
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
const canPrintBorrow = (b) => b.TrangThai === "Đã mượn";

const canPrintFine = (b) =>
  ["Trễ hạn","Hư hỏng","Mất sách","Đã bồi thường"].includes(b.TrangThai) &&
  calcFine(b) > 0;

const canMarkPaid = (b) =>
  ["Hư hỏng", "Mất sách"].includes(b.TrangThai);

/* ACTIONS */
const createModal = ref(null);
const returnModal = ref(null);
const damagedModal = ref(null);
const lostModal = ref(null);

const openCreate = () => createModal.value?.open();
const openReturn = (b) => returnModal.value?.open(b);
const openDamaged = (b) => damagedModal.value?.open(b);
const openLost = (b) => lostModal.value?.open(b);

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

const markPaid = async (b) => {
  try {
    await confirm("Xác nhận độc giả đã bồi thường?");
    await store.markPaid(b._id);
    toast.success('Đã xác nhận bồi thường');
  } catch (err) {
    if (err && err.response) {
      toast.error(err.response?.data?.message || 'Lỗi xác nhận bồi thường');
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
.dropdown-menu {
  font-size: 14px;
}
</style>

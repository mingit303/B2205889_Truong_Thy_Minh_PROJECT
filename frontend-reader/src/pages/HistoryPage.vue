<template>
  <div class="container py-4">
    <!-- HEADER -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center">
        <div class="header-icon-wrapper me-3">
          <font-awesome-icon icon="clock-rotate-left" class="header-icon" />
        </div>
        <div>
          <h3 class="header-title mb-1">Lịch sử mượn sách</h3>
          <p class="header-subtitle mb-0">Xem lại các giao dịch mượn trả của bạn</p>
        </div>
      </div>
    </div>

    <!-- FILTER -->
    <div class="card p-3 mb-3">
      <div class="row g-2">
        <div class="col-md-3">
          <select v-model="store.status" class="form-select" @change="reload">
            <option value="">Tất cả</option>
            <option value="Đã mượn">Đã mượn</option>
            <option value="Đã trả">Đã trả</option>
            <option value="Trễ hạn">Trễ hạn</option>
          </select>
        </div>
      </div>
    </div>

    <!-- EMPTY -->
    <div v-if="store.total === 0 && !store.status" class="empty-wrapper">
      <div class="empty-icon">
        <font-awesome-icon icon="clock-rotate-left" class="main-icon" />
      </div>
      
      <h4 class="mt-4 mb-2 fw-bold">Không tìm thấy lịch sử mượn nào</h4>
      <p class="text-muted mb-4">
        <span v-if="store.status">với trạng thái "{{ store.status }}". Thử thay đổi bộ lọc.</span>
        <span v-else>Bạn chưa có bất kỳ giao dịch mượn sách nào.</span>
      </p>
      
      <button v-if="store.status" class="btn btn-primary px-4 me-2" @click="clearFilter">
        <font-awesome-icon icon="eraser" class="me-2" />
        Xóa bộ lọc
      </button>
      
      <router-link v-else to="/" class="btn btn-primary px-4">
        <font-awesome-icon icon="book" class="me-2" />
        Khám phá sách ngay
      </router-link>
    </div>

    <!-- NO RESULTS FOR FILTER -->
    <div v-else-if="store.items.length === 0 && store.status" class="empty-wrapper">
      <div class="empty-icon">
        <font-awesome-icon icon="clock-rotate-left" class="main-icon" />
      </div>
      
      <h4 class="mt-4 mb-2 fw-bold">Không tìm thấy giao dịch nào</h4>
      <p class="text-muted mb-4">với trạng thái "{{ store.status }}". Thử thay đổi bộ lọc.</p>
      
      <button class="btn btn-primary px-4" @click="clearFilter">
        <font-awesome-icon icon="eraser" class="me-2" />
        Xóa bộ lọc
      </button>
    </div>

    <!-- LIST -->
    <div class="list-group" v-else>
      <div
        class="list-group-item shadow-sm mb-3 history-card"
        v-for="h in store.items"
        :key="h._id"
      >
        <div class="d-flex gap-3">

          <!-- IMAGE -->
          <img
            :src="h.Book?.AnhBia ? h.Book.AnhBia : '/no-book.png'"
            class="rounded history-img"
          />

          <!-- INFO -->
          <div class="flex-grow-1">
            <h6 class="fw-bold mb-2">{{ h.Book?.TenSach || h.MaSach }}</h6>

            <div class="row g-2 mb-2">
              <div class="col-md-4">
                <div class="text-muted mb-3">
                  <font-awesome-icon icon="barcode" class="me-1" />
                  Mã sách: {{ h.MaSach }}
                </div>        
              </div>
              <div class="col-md-4">
                <div class="text-muted">
                  <font-awesome-icon icon="user" class="me-1" />
                  Tác giả: {{ h.Book?.MaTacGia?.TenTacGia || "Không rõ" }}
                </div>
              </div>
              <div class="col-md-4">
                <div class="text-muted">
                  <font-awesome-icon icon="building" class="me-1" />
                  NXB: {{ h.Book?.MaNXB?.TenNXB || "Không rõ" }}
                </div>
              </div>
            </div>

            

            <div class="row g-2 mb-2">
              <div class="col-md-4">
                <div class="info-box">
                  <div class="info-label">Ngày mượn</div>
                  <div class="info-value">{{ format(h.NgayMuon) }}</div>
                </div>
              </div>

              <div class="col-md-4">
                <div class="info-box">
                  <div class="info-label">Hạn trả</div>
                  <div class="info-value">{{ format(h.HanTra) }}</div>
                </div>
              </div>

              <div class="col-md-4">
                <div class="info-box">
                  <div class="info-label">Ngày trả</div>
                  <div class="info-value">{{ h.NgayTra ? format(h.NgayTra) : "Chưa trả" }}</div>
                </div>
              </div>
            </div>

            <!-- TÌNH TRẠNG MƯỢN, TIỀN PHẠT & TRẠNG THÁI THANH TOÁN -->
            <div class="mt-2">
              <!-- Tình trạng mượn -->
              <div class="mb-2">
                Tình trạng mượn:
                <span class="badge" :class="statusColor(h.TrangThai)">
                  {{ h.TrangThai }}
                </span>
              </div>

              <!-- Tiền phạt (nếu có) -->
              <div v-if="h.TienPhat && h.TienPhat > 0" class="mb-2">
                <button class="btn btn-sm fine-btn" @click="showFineDetail(h)">
                  <font-awesome-icon icon="exclamation-circle" class="me-2" />
                  Tiền phạt: {{ formatCurrency(h.TienPhat) }}
                  <font-awesome-icon icon="chevron-right" class="ms-2" />
                </button>
              </div>

              <!-- Tình trạng thanh toán (nếu có tiền phạt) -->
              <div v-if="h.TienPhat > 0">
                <span v-if="h.DaThanhToanPhat" class="badge bg-success">
                  <font-awesome-icon icon="check-circle" class="me-1" />
                  Đã thanh toán phạt
                </span>
                <span v-else class="badge bg-danger">
                  <font-awesome-icon icon="exclamation-triangle" class="me-1" />
                  Chưa thanh toán phạt
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="mt-4" v-if="store.total > store.limit">
      <Pagination
        :page="store.page"
        :limit="store.limit"
        :total="store.total"
        @change="changePage"
      />
    </div>

    <!-- MODAL CHI TIẾT TIỀN PHẠT -->
    <div class="modal fade" id="fineDetailModal" tabindex="-1">
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
            <div v-if="selectedRecord">
              <div class="mb-3">
                <strong>Sách:</strong> {{ selectedRecord.MaSach }} - {{ selectedRecord.book?.TenSach }}
              </div>

              <hr>

              <div class="table-responsive">
                <table class="table table-sm">
                  <thead class="table-header-gradient">
                    <tr>
                      <th>Loại phạt</th>
                      <th class="text-end">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="getLateFine(selectedRecord) > 0">
                      <td>
                        Phạt trễ hạn
                        <br>
                        <small class="text-muted">
                          {{ getDaysLate(selectedRecord) }} ngày × 5.000 đ
                        </small>
                      </td>
                      <td class="text-end">
                        {{ formatCurrency(getLateFine(selectedRecord)) }}
                      </td>
                    </tr>
                    <tr v-if="getDamageFine(selectedRecord) > 0">
                      <td>
                        <span v-if="selectedRecord.TrangThai === 'Hư hỏng'">
                          Phạt hư hỏng mức độ: {{ selectedRecord.MucDoHuHong || "Không xác định" }}
                        </span>
                        <span v-else-if="['Mất sách', 'Đã bồi thường'].includes(selectedRecord.TrangThai)">
                          Phạt mất sách (bồi thường 100% giá trị)
                        </span>
                      </td>
                      <td class="text-end">
                        {{ formatCurrency(getDamageFine(selectedRecord)) }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="fine-total-row">
                      <td>TỔNG CỘNG</td>
                      <td class="text-end">
                        {{ formatCurrency(selectedRecord.TienPhat) }}
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
import { Modal } from "bootstrap";
import { useHistoryStore } from "../stores/history";
import { useSocket, SOCKET_EVENTS } from "../composables/useSocket";
import Pagination from "../components/Pagination.vue";

const store = useHistoryStore();
const { connect, disconnect, on, off } = useSocket();
const selectedRecord = ref(null);
let fineModal = null;

onMounted(() => {
  store.fetch();
  
  const modalEl = document.getElementById('fineDetailModal');
  if (modalEl) {
    fineModal = new Modal(modalEl);
  }
  
  connect();
  on(SOCKET_EVENTS.BORROW_UPDATED, () => {
    store.fetch();
  });
});

const showFineDetail = (record) => {
  selectedRecord.value = record;
  if (fineModal) {
    fineModal.show();
  }
};

onUnmounted(() => {
  off(SOCKET_EVENTS.BORROW_UPDATED);
  disconnect();
});

const reload = () => {
  store.page = 1;
  store.fetch();
};

const clearFilter = () => {
  store.status = '';
  store.page = 1;
  store.fetch();
};

const changePage = (p) => {
  const maxPage = Math.ceil(store.total / store.limit) || 1;
  if (p < 1 || p > maxPage) return;
  store.page = p;
  store.fetch();
};

const format = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "-";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

/* TÍNH SỐ NGÀY TRỄ */
const getDaysLate = (record) => {
  if (!record.NgayTra || !record.HanTra) return 0;
  const hanTra = new Date(record.HanTra);
  const ngayTra = new Date(record.NgayTra);
  const daysLate = Math.ceil((ngayTra - hanTra) / 86400000);
  return daysLate > 0 ? daysLate : 0;
};

/* KIỂM TRA CÓ 2 KHOẢN PHẠT */
const hasMultipleFines = (record) => {
  if (!record.NgayTra || !record.HanTra) return false;
  const hanTra = new Date(record.HanTra);
  const ngayTra = new Date(record.NgayTra);
  return ngayTra > hanTra && ['Hư hỏng', 'Mất sách', 'Đã bồi thường'].includes(record.TrangThai);
};

/* TÍNH TIỀN PHẠT TRỄ HẠN */
const getLateFine = (record) => {
  if (!record.NgayTra || !record.HanTra) return 0;
  const hanTra = new Date(record.HanTra);
  const ngayTra = new Date(record.NgayTra);
  const daysLate = Math.ceil((ngayTra - hanTra) / 86400000);
  return daysLate > 0 ? daysLate * 5000 : 0;
};

/* TÍNH TIỀN PHẠT HƯ HỌNG/MẤT */
const getDamageFine = (record) => {
  const lateFine = getLateFine(record);
  const totalFine = record.TienPhat || 0;
  const damageFine = totalFine - lateFine;
  return damageFine > 0 ? damageFine : 0;
};

/* NHÃN CHO KHOẢN PHẠT HƯ HỌNG/MẤT */
const getDamageFineLabel = (record) => {
  if (record.TrangThai === 'Hư hỏng') {
    return `Hư hỏng (${record.MucDoHuHong || '?'})`;
  } else if (['Mất sách', 'Đã bồi thường'].includes(record.TrangThai)) {
    return 'Mất sách';
  }
  return '';
};

const statusColor = (s) => {
  switch (s) {
    case "Đã mượn": return "bg-primary";
    case "Đã trả": return "bg-success";
    case "Trễ hạn": return "bg-danger";
    case "Hư hỏng": return "bg-warning text-dark";
    case "Mất sách": return "bg-dark text-white";
    case "Đã bồi thường": return "bg-secondary";
    default: return "bg-secondary";
  }
};
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(2, 136, 209, 0.3);
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

.history-card {
  border-radius: 12px;
  padding: 15px;
}

.history-img {
  width: 90px;
  height: 120px;
  object-fit: cover;
}

.info-box {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #0d6efd;
}

.info-label {
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 2px;
}

.info-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #212529;
}

.fine-btn {
  background: #dc3545;
  color: white;
  border: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.fine-btn:hover {
  background: #bb2d3b;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
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

.table-header-gradient {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%) !important;
  color: white !important;
}

.table-header-gradient th {
  color: white !important;
  font-weight: 600;
  border: none !important;
}

.empty-wrapper {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  position: relative;
  display: inline-block;
  margin: 0 auto;
}

.main-icon {
  font-size: 120px;
  color: #e0e0e0;
}
</style>

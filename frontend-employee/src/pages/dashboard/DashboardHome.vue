<template>
  <div class="container-fluid py-4">
    <!-- HEADER -->
    <div class="dashboard-header mb-4">
      <div class="d-flex align-items-center">
        <div class="header-icon-wrapper me-3">
          <font-awesome-icon icon="chart-line" class="header-icon" />
        </div>
        <div>
          <h3 class="header-title mb-1">Thống kê hệ thống thư viện</h3>
          <p class="header-subtitle mb-0">Tổng quan hoạt động và báo cáo</p>
        </div>
      </div>
    </div>

    <!-- ======= ROW 1: OVERVIEW CARDS ======= -->
    <div class="row g-3 mb-4">
      <div class="col-md-3" v-for="card in cards" :key="card.label">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body d-flex align-items-center">
            <div class="me-3">
              <font-awesome-icon :icon="card.icon" size="2x" class="text-primary" />
            </div>
            <div>
              <div class="text-muted small">{{ card.label }}</div>
              <div class="fw-bold fs-5">
                <span v-if="!loading.overview">{{ card.value }}</span>
                <span v-else>...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======= ROW 2: TOP BOOKS & TOP READERS ======= -->
    <div class="row g-3 mb-4">

      <!-- Top Books -->
      <div class="col-md-6">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <span class="fw-bold">Top 5 sách được mượn nhiều nhất</span>
            <button class="btn btn-sm btn-outline-danger" @click="exportTopBooksPDF">
              <font-awesome-icon icon="file-pdf" />
            </button>
          </div>
          <div class="card-body">
            <apexchart
              v-if="topBooksSeries.length"
              type="bar"
              height="300"
              :options="topBooksOptions"
              :series="topBooksSeries"
            />
            <div v-else class="text-muted small">Chưa có dữ liệu</div>
          </div>
        </div>
      </div>

      <!-- Top Readers -->
      <div class="col-md-6">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <span class="fw-bold">Top 5 độc giả mượn nhiều nhất</span>
            <button class="btn btn-sm btn-outline-danger" @click="exportTopReadersPDF">
              <font-awesome-icon icon="file-pdf" />
            </button>
          </div>
          <div class="card-body">
            <apexchart
              v-if="topReadersSeries.length"
              type="bar"
              height="300"
              :options="topReadersOptions"
              :series="topReadersSeries"
            />
            <div v-else class="text-muted small">Chưa có dữ liệu</div>
          </div>
        </div>
      </div>

    </div>

    <!-- ======= ROW 3: BORROW + RETURN LINE CHARTS (COMBINED) + PIE ======= -->
    <div class="row g-3 mb-4">

      <!-- Combined Borrow & Return chart -->
      <div class="col-md-12">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <span class="fw-bold">Thống kê mượn và trả sách theo tháng</span>

            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-sm btn-outline-danger" @click="exportBorrowReturnPDF">
                <font-awesome-icon icon="file-pdf" />
              </button>
              <span class="small text-muted">Năm</span>
              <input
                type="number"
                class="form-control form-control-sm"
                style="width: 100px"
                v-model.number="store.brYear"
                @change="store.loadBorrowReturn()"
              />
            </div>
          </div>

          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h6 class="text-muted small mb-3">Lượt mượn theo tháng</h6>
                <apexchart
                  type="line"
                  height="300"
                  :options="borrowOptions"
                  :series="borrowSeries"
                />
              </div>
              <div class="col-md-6">
                <h6 class="text-muted small mb-3">Lượt trả theo tháng</h6>
                <apexchart
                  type="line"
                  height="300"
                  :options="returnOptions"
                  :series="returnSeries"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pie chart -->
      <div class="col-md-12">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <span class="fw-bold">Tỉ lệ trạng thái phiếu mượn</span>

            <div class="d-flex align-items-center gap-1 small">
              <button class="btn btn-sm btn-outline-danger" @click="exportStatusPDF">
                <font-awesome-icon icon="file-pdf" />
              </button>
              <select
                class="form-select form-select-sm"
                v-model.number="store.statusMonth"
                @change="store.loadStatusDistribution()"
              >
                <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
              </select>

              <input
                type="number"
                class="form-control form-control-sm"
                style="width: 90px"
                v-model.number="store.statusYear"
                @change="store.loadStatusDistribution()"
              />
            </div>
          </div>

          <div class="card-body">
            <apexchart
              v-if="statusSeries.length"
              type="pie"
              height="320"
              :options="statusOptions"
              :series="statusSeries"
            />
            <div v-else class="text-muted small">Chưa có dữ liệu</div>
          </div>

        </div>
      </div>

    </div>

    <!-- ======= ROW 4: FINES TABLE ======= -->
    <div class="card shadow-sm border-0">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <span class="fw-bold">Thống kê tiền phạt</span>

        <div class="d-flex align-items-center gap-2 small">
          <button class="btn btn-sm btn-outline-danger" @click="exportFinesPDF">
            <font-awesome-icon icon="file-pdf" />
          </button>
          <label class="mb-0">Tháng</label>
          <select
            class="form-select form-select-sm"
            style="width: 90px"
            v-model.number="store.fineMonth"
            @change="store.loadFines()"
          >
            <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
          </select>

          <label class="mb-0">Năm</label>
          <input
            type="number"
            class="form-control form-control-sm"
            style="width: 90px"
            v-model.number="store.fineYear"
            @change="store.loadFines()"
          />
        </div>
      </div>

      <div class="card-body p-0">
        <div class="p-3 d-flex justify-content-between align-items-center">
          <span class="small text-muted">Tổng tiền phạt:</span>
          <span class="fw-bold text-danger">{{ formatCurrency(store.totalFine) }}</span>
        </div>

        <div style="max-height: 500px; overflow-y: auto;">
          <table class="table table-hover mb-0">
            <thead class="table-light sticky-top">
              <tr>
                <th style="width: 60px" class="text-center">#</th>
                <th>Mã độc giả</th>
                <th>Họ tên</th>
                <th>Loại</th>
                <th>Tiền phạt</th>
                <th>Ngày xử lý</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!store.fineRecords.length">
                <td colspan="6" class="text-center py-3 text-muted small">Không có dữ liệu</td>
              </tr>

              <tr
                v-for="(row, idx) in store.fineRecords"
                :key="idx"
              >
                <td class="text-center">{{ idx + 1 }}</td>
                <td>{{ row.MaDocGia }}</td>
                <td>{{ row.HoTen }}</td>
                <td>
                  <span class="badge" :class="statusClass(row.Loai)">
                    {{ row.Loai }}
                  </span>
                </td>
                <td>
                  <button 
                    v-if="row.TienPhat > 0"
                    class="btn btn-sm btn-link text-danger p-0 text-decoration-none fw-bold"
                    @click="showFineDetail(row)"
                    type="button"
                  >
                    {{ formatCurrency(row.TienPhat) }}
                    <font-awesome-icon icon="circle-info" class="ms-1" style="font-size: 0.85rem;" />
                  </button>
                  <span v-else class="text-muted">0 đ</span>
                </td>
                <td>{{ formatDate(row.NgayTra) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- FINE DETAIL MODAL -->
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
          <div class="modal-body" v-if="selectedFine">
            <div class="mb-3">
              <strong>Độc giả:</strong> {{ selectedFine.MaDocGia }} - {{ selectedFine.HoTen }}
            </div>
            <div class="mb-3">
              <strong>Sách:</strong> {{ selectedFine.MaSach }} - {{ selectedFine.TenSach }}
            </div>
            
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Loại phạt</th>
                  <th class="text-end">Số tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="getFineBreakdown(selectedFine).lateFine > 0">
                  <td>
                    Phạt trễ hạn<br>
                    <small class="text-muted">{{ getFineBreakdown(selectedFine).daysLate }} ngày × 5,000 đ</small>
                  </td>
                  <td class="text-end">{{ formatCurrency(getFineBreakdown(selectedFine).lateFine) }}</td>
                </tr>
                <tr v-if="getFineBreakdown(selectedFine).damageFine > 0">
                  <td>
                    Phạt hư hỏng/mất<br>
                    <small class="text-muted" v-if="selectedFine.MucDoHuHong">{{ selectedFine.MucDoHuHong }}</small>
                  </td>
                  <td class="text-end">{{ formatCurrency(getFineBreakdown(selectedFine).damageFine) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="table-danger fw-bold">
                  <td>TỔNG CỘNG</td>
                  <td class="text-end">{{ formatCurrency(selectedFine.TienPhat) }}</td>
                </tr>
              </tfoot>
            </table>

            <div v-if="selectedFine.LyDoXuPhat" class="alert alert-warning small mb-0">
              <strong>Lý do:</strong> {{ selectedFine.LyDoXuPhat }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ======= ROW 5: DAMAGED & LOST BOOKS TABLE ======= -->
    <div class="card shadow-sm border-0 mt-4">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <span class="fw-bold">Thống kê sách hư hỏng và mất</span>
        
        <div class="d-flex align-items-center gap-2 small">
          <button class="btn btn-sm btn-outline-danger" @click="exportDamagedLostPDF">
            <font-awesome-icon icon="file-pdf" />
          </button>
          <label class="mb-0">Tháng</label>
          <select
            class="form-select form-select-sm"
            style="width: 90px"
            v-model.number="store.damagedLostMonth"
            @change="store.loadDamagedAndLostBooks()"
          >
            <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
          </select>

          <label class="mb-0">Năm</label>
          <input
            type="number"
            class="form-control form-control-sm"
            style="width: 90px"
            v-model.number="store.damagedLostYear"
            @change="store.loadDamagedAndLostBooks()"
          />
        </div>
      </div>

      <div class="card-body p-0">
        <div class="p-3">
          <span class="small text-muted">Tổng số sách:</span>
          <span class="fw-bold text-primary ms-2">{{ store.damagedLost.totalBooks }}</span>
          <span class="small text-muted ms-3">Tổng số phiếu:</span>
          <span class="fw-bold text-danger ms-2">{{ store.damagedLost.total }}</span>
        </div>

        <div style="max-height: 600px; overflow-y: auto;">
          <table class="table table-hover mb-0">
            <thead class="table-light sticky-top">
              <tr>
                <th style="width: 60px" class="text-center">#</th>
                <th>Mã sách</th>
                <th>Tên sách</th>
                <th class="text-center" style="width: 120px">Hư hỏng nhẹ</th>
                <th class="text-center" style="width: 120px">Hư hỏng nặng</th>
                <th class="text-center" style="width: 120px">Mất sách</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!store.damagedLost.books || !store.damagedLost.books.length">
                <td colspan="6" class="text-center py-3 text-muted small">Không có dữ liệu</td>
              </tr>

              <tr
                v-for="(book, idx) in store.damagedLost.books"
                :key="idx"
              >
                <td class="text-center">{{ idx + 1 }}</td>
                <td>{{ book.MaSach }}</td>
                <td>{{ book.TenSach }}</td>
                <td class="text-center">
                  <span 
                    v-if="book.lightCount > 0"
                    class="badge bg-warning text-dark cursor-pointer"
                    @click="showRecordDetails(book, 'light')"
                    style="cursor: pointer;"
                  >
                    {{ book.lightCount }}
                  </span>
                  <span v-else class="text-muted">0</span>
                </td>
                <td class="text-center">
                  <span 
                    v-if="book.heavyCount > 0"
                    class="badge bg-danger cursor-pointer"
                    @click="showRecordDetails(book, 'heavy')"
                    style="cursor: pointer;"
                  >
                    {{ book.heavyCount }}
                  </span>
                  <span v-else class="text-muted">0</span>
                </td>
                <td class="text-center">
                  <span 
                    v-if="book.lostCount > 0"
                    class="badge bg-dark cursor-pointer"
                    @click="showRecordDetails(book, 'lost')"
                    style="cursor: pointer;"
                  >
                    {{ book.lostCount }}
                  </span>
                  <span v-else class="text-muted">0</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- RECORD DETAILS MODAL -->
    <div class="modal fade" id="recordDetailsModal" tabindex="-1" ref="recordDetailsModal">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <font-awesome-icon icon="list" class="me-2" />
              Chi tiết phiếu - {{ selectedBook?.TenSach }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedBook && selectedRecords">
            <div class="mb-3">
              <span class="badge" :class="getTypeBadgeClass(selectedType)">
                {{ getTypeLabel(selectedType) }}: {{ selectedRecords.length }} phiếu
              </span>
            </div>
            
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th style="width: 50px">#</th>
                  <th>Mã độc giả</th>
                  <th>Họ tên</th>
                  <th>Tiền phạt</th>
                  <th>Ngày trả</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(rec, idx) in selectedRecords" :key="idx">
                  <td class="text-center">{{ idx + 1 }}</td>
                  <td>{{ rec.MaDocGia }}</td>
                  <td>{{ rec.HoTen }}</td>
                  <td class="text-danger fw-bold">{{ formatCurrency(rec.TienPhat) }}</td>
                  <td>{{ formatDate(rec.NgayTra) }}</td>
                </tr>
              </tbody>
            </table>
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
import { computed, onMounted, ref } from "vue";
import { useStatisticsStore } from "../../stores/statistics";
import { Modal } from "bootstrap";

const store = useStatisticsStore();
const loading = store.loading;
const fineModal = ref(null);
const selectedFine = ref(null);
let fineModalInstance = null;

const recordDetailsModal = ref(null);
const selectedBook = ref(null);
const selectedType = ref(null); // 'light', 'heavy', 'lost'
const selectedRecords = ref([]);
let recordDetailsModalInstance = null;

/* ========= OVERVIEW CARDS ========= */
const cards = computed(() => [
  { label: "Tổng số sách", value: store.overview.totalBooks, icon: "book" },
  { label: "Độc giả đang hoạt động", value: store.overview.totalReaders, icon: "users" },
  { label: "Sách đang mượn", value: store.overview.borrowing, icon: "book-open" },
  { label: "Sách quá hạn", value: store.overview.overdue, icon: "triangle-exclamation" },
]);

/* ========= TOP BOOKS ========= */
const topBooksOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  xaxis: {
    categories: store.topBooks.map((b) => b.TenSach),
    labels: { rotate: -30, trim: true, style: { fontSize: "11px" } },
  },
  dataLabels: { enabled: false },
  plotOptions: { bar: { distributed: true, borderRadius: 4 } },
}));
const topBooksSeries = computed(() => [
  { name: "Lượt mượn", data: store.topBooks.map((b) => b.count) },
]);

/* ========= TOP READERS ========= */
const topReadersOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  xaxis: {
    categories: store.topReaders.map((r) => r.HoTen),
    labels: { rotate: -30, trim: true, style: { fontSize: "11px" } },
  },
  dataLabels: { enabled: false },
  plotOptions: { bar: { distributed: true, borderRadius: 4 } },
}));
const topReadersSeries = computed(() => [
  { name: "Số phiếu mượn", data: store.topReaders.map((r) => r.count) },
]);

/* ========= 2 LINE CHARTS ========= */
const borrowOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  xaxis: { categories: store.brMonths },
  stroke: { curve: "smooth" },
  dataLabels: { enabled: false },
}));
const borrowSeries = computed(() => [
  { name: "Lượt mượn", data: store.brBorrow },
]);

const returnOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  xaxis: { categories: store.brMonths },
  stroke: { curve: "smooth" },
  dataLabels: { enabled: false },
}));
const returnSeries = computed(() => [
  { name: "Lượt trả", data: store.brReturn },
]);

/* ========= PIE CHART ========= */
const statusOptions = computed(() => ({
  labels: store.statusLabels,
  legend: { position: "bottom" },
}));
const statusSeries = computed(() => store.statusValues);

/* ========= FORMATTERS ========= */
const formatCurrency = (n) =>
  (n || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "");

const statusClass = (st) =>
  ({
    "Đã mượn": "bg-primary",
    "Đã trả": "bg-secondary",
    "Trễ hạn": "bg-danger",
    "Hư hỏng": "bg-warning text-dark",
    "Mất sách": "bg-dark",
    "Đã bồi thường": "bg-success",
  }[st] || "bg-light");

/* ========= PDF EXPORT FUNCTIONS ========= */
const exportOverallPDF = () => {
  const url = `${import.meta.env.VITE_API_URL}/pdf/statistics/overview`;
  window.open(url, "_blank");
};

const exportTopBooksPDF = () => {
  const url = `${import.meta.env.VITE_API_URL}/pdf/statistics/top?type=books`;
  window.open(url, "_blank");
};

const exportTopReadersPDF = () => {
  const url = `${import.meta.env.VITE_API_URL}/pdf/statistics/top?type=readers`;
  window.open(url, "_blank");
};

const exportBorrowReturnPDF = () => {
  const year = store.brYear;
  const url = `${import.meta.env.VITE_API_URL}/pdf/statistics/borrow-return?year=${year}`;
  window.open(url, "_blank");
};

const exportStatusPDF = () => {
  const month = store.statusMonth;
  const year = store.statusYear;
  const url = `${import.meta.env.VITE_API_URL}/pdf/statistics/status?month=${month}&year=${year}`;
  window.open(url, "_blank");
};

const exportFinesPDF = () => {
  const month = store.fineMonth;
  const year = store.fineYear;
  const url = `${import.meta.env.VITE_API_URL}/pdf/statistics/fines?month=${month}&year=${year}`;
  window.open(url, "_blank");
};

const exportDamagedLostPDF = () => {
  const month = store.damagedLostMonth;
  const year = store.damagedLostYear;
  const url = `${import.meta.env.VITE_API_URL}/pdf/statistics/damaged-lost-books?month=${month}&year=${year}`;
  window.open(url, "_blank");
};

/* ========= LOAD DATA ========= */
onMounted(() => {
  store.loadOverview();
  store.loadTopBooks();
  store.loadTopReaders();
  store.loadBorrowReturn();
  store.loadStatusDistribution();
  store.loadFines();
  store.loadDamagedAndLostBooks();
  fineModalInstance = new Modal(fineModal.value);
  recordDetailsModalInstance = new Modal(recordDetailsModal.value);
});

const showFineDetail = (fine) => {
  selectedFine.value = fine;
  fineModalInstance.show();
};

const showRecordDetails = (book, type) => {
  selectedBook.value = book;
  selectedType.value = type;
  selectedRecords.value = book.records[type] || [];
  recordDetailsModalInstance.show();
};

const getTypeBadgeClass = (type) => {
  return {
    light: 'bg-warning text-dark',
    heavy: 'bg-danger',
    lost: 'bg-dark'
  }[type] || 'bg-secondary';
};

const getTypeLabel = (type) => {
  return {
    light: 'Hư hỏng nhẹ',
    heavy: 'Hư hỏng nặng',
    lost: 'Mất sách'
  }[type] || '';
};

const getFineBreakdown = (record) => {
  let daysLate = 0;
  let lateFine = 0;
  let damageFine = 0;
  
  if (record.NgayTra && record.HanTra) {
    const hanTra = new Date(record.HanTra);
    const ngayTra = new Date(record.NgayTra);
    if (ngayTra > hanTra) {
      daysLate = Math.ceil((ngayTra - hanTra) / (1000 * 60 * 60 * 24));
      lateFine = daysLate * 5000;
    }
  }
  
  if (["Hư hỏng", "Mất sách", "Đã bồi thường"].includes(record.Loai)) {
    damageFine = (record.TienPhat || 0) - lateFine;
  }
  
  return { daysLate, lateFine, damageFine };
};
</script>

<style scoped>
.dashboard-header {
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
</style>

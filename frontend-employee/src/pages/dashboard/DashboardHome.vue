<template>
  <div class="container-fluid py-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0">
        <font-awesome-icon icon="chart-line" class="me-2" />
        Thống kê hệ thống thư viện
      </h4>
      
      <button class="btn btn-danger btn-sm" @click="exportOverallPDF">
        <font-awesome-icon icon="file-pdf" class="me-1" />
        Xuất báo cáo tổng quan
      </button>
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

    <!-- ======= ROW 3: BORROW + RETURN LINE CHARTS + PIE ======= -->
    <div class="row g-3 mb-4">

      <!-- Borrow chart -->
      <div class="col-md-6">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <span class="fw-bold">Lượt mượn theo tháng</span>

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
            <apexchart
              type="line"
              height="320"
              :options="borrowOptions"
              :series="borrowSeries"
            />
          </div>
        </div>
      </div>

      <!-- Return chart -->
      <div class="col-md-6">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <span class="fw-bold">Lượt trả theo tháng</span>

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
            <apexchart
              type="line"
              height="320"
              :options="returnOptions"
              :series="returnSeries"
            />
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

        <table class="table table-hover mb-0">
          <thead class="table-light">
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
              <td class="text-danger fw-bold">{{ formatCurrency(row.TienPhat) }}</td>
              <td>{{ formatDate(row.NgayTra) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useStatisticsStore } from "../../stores/statistics";

const store = useStatisticsStore();
const loading = store.loading;

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

/* ========= LOAD DATA ========= */
onMounted(() => {
  store.loadOverview();
  store.loadTopBooks();
  store.loadTopReaders();
  store.loadBorrowReturn();
  store.loadStatusDistribution();
  store.loadFines();
});
</script>

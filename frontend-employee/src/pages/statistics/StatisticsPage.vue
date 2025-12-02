<template>
  <div class="container-fluid py-3">
    <h4 class="mb-3">Thống kê hệ thống thư viện</h4>

    <!-- =====================================================
         ROW 1: OVERVIEW CARDS + PDF
    ====================================================== -->
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h5 class="fw-bold mb-0">Tổng quan</h5>

      <button class="btn btn-outline-danger btn-sm"
              @click="printOverview">
        <font-awesome-icon icon="file-pdf" class="me-1" /> Xuất PDF
      </button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3" v-for="card in cards" :key="card.label">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body d-flex align-items-center">
            <div class="me-3">
              <i :class="card.icon + ' fa-2x text-primary'"></i>
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

    <!-- =====================================================
         ROW 2: TOP BOOKS & TOP READERS
    ====================================================== -->
    <div class="row g-3 mb-4">

      <!-- TOP BOOKS -->
      <div class="col-md-6">
        <div class="card shadow-sm border-0 h-100">

          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <span class="fw-bold">Top 5 sách mượn nhiều nhất</span>
            <button class="btn btn-sm btn-outline-danger" @click="printTop">
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

      <!-- TOP READERS -->
      <div class="col-md-6">
        <div class="card shadow-sm border-0 h-100">

          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <span class="fw-bold">Top 5 độc giả mượn nhiều nhất</span>
            <button class="btn btn-sm btn-outline-danger" @click="printTop">
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

    <!-- =====================================================
         ROW 3: BORROW + RETURN LINE + PIE
    ====================================================== -->
    <div class="row g-3 mb-4">

      <!-- BORROW LINE -->
      <div class="col-md-6">
        <div class="card shadow-sm border-0 h-100">

          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <div class="fw-bold">Lượt mượn theo tháng</div>

            <div class="d-flex align-items-center gap-2">
              <input type="number" class="form-control form-control-sm"
                     v-model.number="store.brYear"
                     style="width: 90px"
                     @change="store.loadBorrowReturn()" />

              <button class="btn btn-sm btn-outline-danger" @click="printBorrowReturn">
                <font-awesome-icon icon="file-pdf" />
              </button>
            </div>
          </div>

          <div class="card-body">
            <apexchart type="line" height="320"
                       :options="borrowOptions"
                       :series="borrowSeries" />
          </div>

        </div>
      </div>

      <!-- RETURN LINE -->
      <div class="col-md-6">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <div class="fw-bold">Lượt trả theo tháng</div>

            <div class="d-flex align-items-center gap-2">
              <input type="number" class="form-control form-control-sm"
                     v-model.number="store.brYear"
                     style="width: 90px"
                     @change="store.loadBorrowReturn()" />

              <button class="btn btn-sm btn-outline-danger" @click="printBorrowReturn">
                <font-awesome-icon icon="file-pdf" />
              </button>
            </div>
          </div>

          <div class="card-body">
            <apexchart type="line" height="320"
                       :options="returnOptions"
                       :series="returnSeries" />
          </div>

        </div>
      </div>

      <!-- PIE CHART -->
      <div class="col-md-12">
        <div class="card shadow-sm border-0 h-100">

          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <span class="fw-bold">Tỉ lệ trạng thái phiếu mượn</span>

            <div class="d-flex align-items-center gap-2">
              <select class="form-select form-select-sm"
                      v-model.number="store.statusMonth"
                      @change="store.loadStatusDistribution()">
                <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
              </select>

              <input type="number" class="form-control form-control-sm"
                     style="width: 90px"
                     v-model.number="store.statusYear"
                     @change="store.loadStatusDistribution()" />

              <button class="btn btn-sm btn-outline-danger"
                      @click="printStatus">
                <font-awesome-icon icon="file-pdf" />
              </button>
            </div>
          </div>

          <div class="card-body">
            <apexchart v-if="statusSeries.length"
                       type="pie" height="320"
                       :options="statusOptions"
                       :series="statusSeries" />
            <div v-else class="text-muted small">Chưa có dữ liệu</div>
          </div>

        </div>
      </div>

    </div>

    <!-- =====================================================
         ROW 4: FINES TABLE
    ====================================================== -->
    <div class="card shadow-sm border-0">

      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <span class="fw-bold">Thống kê tiền phạt</span>

        <div class="d-flex align-items-center gap-2 small">

          <select class="form-select form-select-sm"
                  style="width: 90px"
                  v-model.number="store.fineMonth"
                  @change="store.loadFines()">
            <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
          </select>

          <input type="number" class="form-control form-control-sm"
                 style="width: 90px"
                 v-model.number="store.fineYear"
                 @change="store.loadFines()" />

          <button class="btn btn-sm btn-outline-danger"
                  @click="printFines">
            <font-awesome-icon icon="file-pdf" />
          </button>

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
              <th class="text-center" style="width: 60px">#</th>
              <th>Mã độc giả</th>
              <th>Họ tên</th>
              <th>Loại</th>
              <th>Tiền phạt</th>
              <th>Ngày xử lý</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="!store.fineRecords.length">
              <td colspan="6" class="text-center py-3 text-muted small">
                Không có dữ liệu
              </td>
            </tr>

            <tr v-for="(row, idx) in store.fineRecords" :key="idx">
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

/* ======================== PDF ACTIONS ========================= */

const printOverview = () =>
  window.open(`${import.meta.env.VITE_API_URL}/pdf/statistics/overview`);

const printTop = () =>
  window.open(`${import.meta.env.VITE_API_URL}/pdf/statistics/top`);

const printBorrowReturn = () =>
  window.open(`${import.meta.env.VITE_API_URL}/pdf/statistics/borrow-return?year=${store.brYear}`);

const printStatus = () =>
  window.open(
    `${import.meta.env.VITE_API_URL}/pdf/statistics/status?month=${store.statusMonth}&year=${store.statusYear}`
  );

const printFines = () =>
  window.open(
    `${import.meta.env.VITE_API_URL}/pdf/statistics/fines?month=${store.fineMonth}&year=${store.fineYear}`
  );

/* ======================== CARDS ========================= */

const cards = computed(() => [
  { label: "Tổng số sách", value: store.overview.totalBooks, icon: "fa-solid fa-book" },
  { label: "Độc giả đang hoạt động", value: store.overview.totalReaders, icon: "fa-solid fa-users" },
  { label: "Sách đang mượn", value: store.overview.borrowing, icon: "fa-solid fa-book-open" },
  { label: "Sách quá hạn", value: store.overview.overdue, icon: "fa-solid fa-triangle-exclamation" },
]);

/* ======================== TOP BOOKS ========================= */

const topBooksOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  xaxis: {
    categories: store.topBooks.map((b) => b.TenSach),
    labels: { rotate: -30, trim: true, style: { fontSize: "11px" } },
  },
  plotOptions: { bar: { distributed: true, borderRadius: 4 } },
  dataLabels: { enabled: false },
}));

const topBooksSeries = computed(() => [
  { name: "Lượt mượn", data: store.topBooks.map((b) => b.count) },
]);

/* ======================== TOP READERS ========================= */

const topReadersOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  xaxis: {
    categories: store.topReaders.map((r) => r.HoTen),
    labels: { rotate: -30, trim: true, style: { fontSize: "11px" } },
  },
  plotOptions: { bar: { distributed: true, borderRadius: 4 } },
  dataLabels: { enabled: false },
}));

const topReadersSeries = computed(() => [
  { name: "Số phiếu mượn", data: store.topReaders.map((r) => r.count) },
]);

/* ======================== BORROW + RETURN ========================= */

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

/* ======================== PIE ========================= */

const statusOptions = computed(() => ({
  labels: store.statusLabels,
  legend: { position: "bottom" },
}));

const statusSeries = computed(() => store.statusValues);

/* ======================== HELPERS ========================= */

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

/* ======================== LOAD ========================= */

onMounted(() => {
  store.loadOverview();
  store.loadTopBooks();
  store.loadTopReaders();
  store.loadBorrowReturn();
  store.loadStatusDistribution();
  store.loadFines();
});
</script>

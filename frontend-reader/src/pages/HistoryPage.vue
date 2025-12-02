<template>
  <div class="container py-4">
    <h3 class="fw-bold mb-4 d-flex align-items-center gap-2">
      <font-awesome-icon icon="clock-rotate-left" />
      Lịch sử mượn sách
    </h3>

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
    <div v-if="store.items.length === 0" class="alert alert-info">
      Không có dữ liệu.
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
            <h6 class="fw-bold mb-1">{{ h.Book?.TenSach || h.MaSach }}</h6>

            <div class="text-muted small">
              Tác giả: {{ h.Book?.MaTacGia?.TenTacGia || "Không rõ" }}
            </div>

            <div class="text-muted small">
              NXB: {{ h.Book?.MaNXB?.TenNXB || "Không rõ" }}
            </div>

            <div class="text-muted small mb-2">
              Mã sách: {{ h.MaSach }}
            </div>

            <div class="small">
              <span class="fw-semibold">Ngày mượn:</span>
              {{ format(h.NgayMuon) }}
            </div>

            <div class="small">
              <span class="fw-semibold">Hạn trả:</span>
              {{ format(h.HanTra) }}
            </div>

            <div class="small">
              <span class="fw-semibold">Ngày trả:</span>
              {{ h.NgayTra ? format(h.NgayTra) : "Chưa trả" }}
            </div>

            <!-- TIỀN PHẠT -->
            <div v-if="h.TienPhat && h.TienPhat > 0" class="small">
              <span class="fw-semibold text-danger">Tiền phạt:</span>
              <span class="text-danger fw-bold">{{ formatCurrency(h.TienPhat) }}</span>
              
              <!-- CHI TIẾT NẾu CÓ 2 KHOẢN -->
              <div v-if="hasMultipleFines(h)" class="text-muted" style="font-size: 11px; margin-left: 10px;">
                • Trễ hạn: {{ formatCurrency(getLateFine(h)) }}<br>
                • {{ getDamageFineLabel(h) }}: {{ formatCurrency(getDamageFine(h)) }}
              </div>
            </div>

            <span class="badge mt-2" :class="statusColor(h.TrangThai)">
              {{ h.TrangThai }}
            </span>
          </div>

        </div>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="mt-4">
      <Pagination
        :page="store.page"
        :limit="store.limit"
        :total="store.total"
        @change="changePage"
      />
    </div>

  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useHistoryStore } from "../stores/history";
import Pagination from "../components/Pagination.vue";

const store = useHistoryStore();

onMounted(() => store.fetch());

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

const format = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "-";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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
  const hanTra = new Date(record.HanTra);
  const ngayTra = new Date(record.NgayTra);
  const daysLate = Math.ceil((ngayTra - hanTra) / 86400000);
  return daysLate * 5000;
};

/* TÍNH TIỀN PHẠT HƯ HỌNG/MẤT */
const getDamageFine = (record) => {
  return (record.TienPhat || 0) - getLateFine(record);
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
    default: return "bg-secondary";
  }
};
</script>

<style scoped>
.history-card {
  border-radius: 12px;
  padding: 15px;
}

.history-img {
  width: 90px;
  height: 120px;
  object-fit: cover;
}
</style>

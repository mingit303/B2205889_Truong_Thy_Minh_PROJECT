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
    <div v-if="store.total === 0 && !store.status" class="empty-wrapper">
      <div class="empty-icon">
        <font-awesome-icon icon="clock-rotate-left" class="main-icon" />
      </div>
      
      <h4 class="mt-4 mb-2 fw-bold">Chưa có lịch sử mượn sách</h4>
      <p class="text-muted mb-4">Bạn chưa có bất kỳ giao dịch mượn sách nào.</p>
      
      <router-link to="/" class="btn btn-primary px-4">
        <font-awesome-icon icon="book" class="me-2" />
        Khám phá sách ngay
      </router-link>
    </div>

    <!-- NO RESULTS FOR FILTER -->
    <div v-else-if="store.items.length === 0 && store.status" class="alert alert-info text-center">
      <font-awesome-icon icon="circle-info" class="me-2" />
      Không có giao dịch nào với trạng thái "{{ store.status }}"
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
              <div class="col-md-6">
                <div class="text-muted small">
                  <font-awesome-icon icon="user" class="me-1" />
                  Tác giả: {{ h.Book?.MaTacGia?.TenTacGia || "Không rõ" }}
                </div>
              </div>
              <div class="col-md-6">
                <div class="text-muted small">
                  <font-awesome-icon icon="building" class="me-1" />
                  NXB: {{ h.Book?.MaNXB?.TenNXB || "Không rõ" }}
                </div>
              </div>
            </div>

            <div class="text-muted small mb-3">
              <font-awesome-icon icon="barcode" class="me-1" />
              Mã sách: {{ h.MaSach }}
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

            <!-- TIỀN PHẠT -->
            <div v-if="h.TienPhat && h.TienPhat > 0" class="mt-2">
              <div class="alert alert-danger py-2 mb-2">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="fw-semibold">
                    <font-awesome-icon icon="exclamation-circle" class="me-1" />
                    Tiền phạt:
                  </span>
                  <span class="fw-bold">{{ formatCurrency(h.TienPhat) }}</span>
                </div>
                
                <!-- CHI TIẾT NẾU CÓ 2 KHOẢN -->
                <div v-if="hasMultipleFines(h)" class="mt-2 small">
                  <div class="d-flex justify-content-between">
                    <span>• Trễ hạn:</span>
                    <span>{{ formatCurrency(getLateFine(h)) }}</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span>• {{ getDamageFineLabel(h) }}:</span>
                    <span>{{ formatCurrency(getDamageFine(h)) }}</span>
                  </div>
                </div>
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
    <div class="mt-4" v-if="store.total > store.limit">
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
import { onMounted, onUnmounted } from "vue";
import { useHistoryStore } from "../stores/history";
import { useSocket, SOCKET_EVENTS } from "../composables/useSocket";
import Pagination from "../components/Pagination.vue";

const store = useHistoryStore();
const { connect, disconnect, on, off } = useSocket();

onMounted(() => {
  store.fetch();
  
  connect();
  on(SOCKET_EVENTS.BORROW_UPDATED, () => {
    console.log('🔄 Borrow record updated - refreshing');
    store.fetch();
  });
});

onUnmounted(() => {
  off(SOCKET_EVENTS.BORROW_UPDATED);
  disconnect();
});

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

.info-box {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #0d6efd;
}

.info-label {
  font-size: 11px;
  color: #6c757d;
  margin-bottom: 2px;
}

.info-value {
  font-size: 13px;
  font-weight: 600;
  color: #212529;
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

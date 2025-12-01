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

            <span class="badge mt-2" :class="statusColor(h.TrangThai)">
              {{ h.TrangThai }}
            </span>
          </div>

        </div>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="d-flex justify-content-center align-items-center mt-3 gap-2">
      <button
        class="btn btn-outline-secondary"
        :disabled="store.page === 1"
        @click="changePage(store.page - 1)"
      >
        «
      </button>

      <span>Trang {{ store.page }}</span>

      <button
        class="btn btn-outline-secondary"
        :disabled="store.page * store.limit >= store.total"
        @click="changePage(store.page + 1)"
      >
        »
      </button>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useHistoryStore } from "../stores/history";

const store = useHistoryStore();

onMounted(() => store.fetch());

const reload = () => {
  store.page = 1;
  store.fetch();
};

const changePage = (p) => {
  store.page = p;
  store.fetch();
};

const format = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "-";

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

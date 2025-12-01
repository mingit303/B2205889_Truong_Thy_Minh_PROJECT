<template>
  <div class="container py-4">
    <h3 class="fw-bold mb-4 d-flex align-items-center gap-2">
      <font-awesome-icon icon="envelope-open-text" />
      Yêu cầu mượn sách
    </h3>

    <!-- EMPTY STATE -->
    <div v-if="req.items.length === 0" class="alert alert-info">
      Bạn chưa gửi yêu cầu mượn nào.
    </div>

    <!-- REQUEST LIST -->
    <div class="accordion" id="requestAccordion" v-else>
      <div
        class="accordion-item"
        v-for="(r, index) in req.items"
        :key="r._id"
      >
        <!-- HEADER -->
        <h2 class="accordion-header" :id="'heading-' + index">
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="'#collapse-' + index"
          >
            <div class="d-flex flex-column w-100">
              <div class="d-flex justify-content-between">
                <span>
                  <strong>#{{ r._id }}</strong>
                </span>

                
              </div>

              <small class="text-muted mt-2">{{ formatDate(r.createdAt) }}</small>
              <div class="text-start mt-2">
                <span :class="'badge ' + statusColor(r.TrangThai)">
                  {{ mapStatus(r.TrangThai) }}
                </span> 
              </div>
            </div>
          </button>
        </h2>

        <!-- BODY -->
        <div
          :id="'collapse-' + index"
          class="accordion-collapse collapse"
          data-bs-parent="#requestAccordion"
        >
          <div class="accordion-body">
            <h6 class="fw-bold mb-2">📘 Danh sách sách đã yêu cầu:</h6>

            <ul class="list-group">
              <li
                v-for="(book, i) in r.Sach"
                :key="i"
                class="list-group-item d-flex align-items-center gap-3"
              >
                <!-- BOOK IMAGE -->
                <img
                  :src="book.AnhBia || '/no-book.png'"
                  class="rounded"
                  style="width: 65px; height: 85px; object-fit: cover"
                />

                <!-- BOOK INFO -->
                <div class="flex-grow-1">
                  <div class="fw-semibold">{{ book.TenSach }}</div>

                  <div class="text-muted small">
                    Mã: <b>{{ book.MaSach }}</b>
                  </div>

                  <div class="text-muted small">
                    Tác giả: <b>{{ book.MaTacGia?.TenTacGia || "Không rõ" }}</b>
                  </div>

                  <div class="text-muted small">
                    NXB: <b>{{ book.MaNXB?.TenNXB || "Không rõ" }}</b>
                  </div>
                </div>

                <!-- <span class="badge bg-primary">Sách</span> -->
              </li>
            </ul>

            <!-- NOTE -->
            <div v-if="r.GhiChu" class="mt-3">
              <strong>Ghi chú:</strong>
              <div>{{ r.GhiChu }}</div>
            </div>

            <!-- REJECTED REASON -->
            <div
              v-if="r.TrangThai === 'TU_CHOI' && r.LyDoTuChoi"
              class="mt-3 text-danger"
            >
              <strong>Lý do từ chối:</strong>
              <div>{{ r.LyDoTuChoi }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRequestStore } from "../stores/request";

const req = useRequestStore();

/* STATUS LABEL */
const mapStatus = (s) => {
  switch (s) {
    case "CHO_DUYET":
      return "Đang chờ duyệt";
    case "DA_DUYET":
      return "Đã duyệt";
    case "TU_CHOI":
      return "Bị từ chối";
    default:
      return s;
  }
};

/* STATUS COLOR BADGE */
const statusColor = (s) => {
  switch (s) {
    case "CHO_DUYET":
      return "bg-warning text-dark";
    case "DA_DUYET":
      return "bg-success";
    case "TU_CHOI":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};

/* DATE FORMAT */
const formatDate = (date) => {
  return new Date(date).toLocaleString("vi-VN");
};

onMounted(() => req.fetchMine());
</script>

<style scoped>
.accordion-button {
  padding: 14px 18px;
}

.accordion-item {
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  background: #fff;
}

.list-group-item {
  padding: 12px 16px;
}
</style>

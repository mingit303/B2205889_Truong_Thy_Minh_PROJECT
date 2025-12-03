<template>
  <div class="container py-4">
    <!-- HEADER -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center">
        <div class="header-icon-wrapper me-3">
          <font-awesome-icon icon="envelope-open-text" class="header-icon" />
        </div>
        <div>
          <h3 class="header-title mb-1">Yêu cầu mượn sách</h3>
          <p class="header-subtitle mb-0">Theo dõi trạng thái yêu cầu của bạn</p>
        </div>
      </div>
    </div>

    <!-- FILTER -->
    <div class="card p-3 mb-3">
      <div class="row g-2">
        <div class="col-md-3">
          <select v-model="filterStatus" class="form-select" @change="handleFilterChange">
            <option value="">Tất cả trạng thái</option>
            <option value="CHO_DUYET">Đang chờ duyệt</option>
            <option value="DA_DUYET">Đã duyệt</option>
            <option value="TU_CHOI">Bị từ chối</option>
          </select>
        </div>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-if="req.items.length === 0" class="empty-wrapper">
      <div class="empty-icon">
        <font-awesome-icon icon="envelope-open-text" class="main-icon" />
      </div>
      
      <h4 class="mt-4 mb-2 fw-bold">Không tìm thấy yêu cầu mượn nào</h4>
      <p class="text-muted mb-4">
        <span v-if="filterStatus">với trạng thái "{{ mapStatus(filterStatus) }}". Thử thay đổi bộ lọc.</span>
        <span v-else>Bạn chưa gửi yêu cầu mượn nào. Hãy thêm sách vào giỏ và gửi yêu cầu!</span>
      </p>
      
      <button v-if="filterStatus" class="btn btn-primary px-4 me-2" @click="filterStatus = ''">
        <font-awesome-icon icon="eraser" class="me-2" />
        Xóa bộ lọc
      </button>
      
      <router-link v-else to="/" class="btn btn-primary px-4">
        <font-awesome-icon icon="book" class="me-2" />
        Khám phá sách ngay
      </router-link>
    </div>

    <!-- NO RESULTS FOR FILTER -->
    <div v-else-if="filteredItems.length === 0" class="empty-wrapper">
      <div class="empty-icon">
        <font-awesome-icon icon="envelope-open-text" class="main-icon" />
      </div>
      
      <h4 class="mt-4 mb-2 fw-bold">Không tìm thấy yêu cầu nào</h4>
      <p class="text-muted mb-4">với trạng thái "{{ mapStatus(filterStatus) }}". Thử thay đổi bộ lọc.</p>
      
      <button class="btn btn-primary px-4" @click="filterStatus = ''">
        <font-awesome-icon icon="eraser" class="me-2" />
        Xóa bộ lọc
      </button>
    </div>

    <!-- REQUEST LIST -->
    <div class="accordion" id="requestAccordion" v-else>
      <div
        class="accordion-item"
        v-for="(r, index) in paginatedItems"
        :key="r._id"
      >
        <!-- HEADER -->
        <h2 class="accordion-header" :id="'heading-' + index">
          <button
            class="accordion-button"
            :class="{ collapsed: openAccordion !== index }"
            type="button"
            @click="toggleAccordion(index)"
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
          :class="{ show: openAccordion === index }"
        >
          <div class="accordion-body">
            <h6 class="fw-bold mb-2">Danh sách sách đã yêu cầu:</h6>

            <div style="max-height: 400px; overflow-y: auto;">
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
            </div>

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

    <!-- PAGINATION -->
    <div class="mt-4" v-if="filteredItems.length > limit">
      <Pagination
        :page="page"
        :limit="limit"
        :total="filteredItems.length"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRequestStore } from "../stores/request";
import { useSocket, SOCKET_EVENTS } from "../composables/useSocket";
import Pagination from "../components/Pagination.vue";

const req = useRequestStore();
const { connect, disconnect, on, off } = useSocket();

const page = ref(1);
const limit = ref(10);
const filterStatus = ref("");
const openAccordion = ref(null);

const filteredItems = computed(() => {
  if (!filterStatus.value) {
    return req.items;
  }
  return req.items.filter(item => item.TrangThai === filterStatus.value);
});

const paginatedItems = computed(() => {
  const start = (page.value - 1) * limit.value;
  const end = start + limit.value;
  return filteredItems.value.slice(start, end);
});

const handleFilterChange = () => {
  page.value = 1;
  openAccordion.value = null;
};

const toggleAccordion = (index) => {
  if (openAccordion.value === index) {
    openAccordion.value = null;
  } else {
    openAccordion.value = index;
  }
};

const handlePageChange = (p) => {
  page.value = p;
  openAccordion.value = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  req.fetchMine();
  
  connect();
  on(SOCKET_EVENTS.REQUEST_UPDATED, () => {
    console.log('🔄 Request updated - refreshing');
    req.fetchMine();
  });
});

onUnmounted(() => {
  off(SOCKET_EVENTS.REQUEST_UPDATED);
  disconnect();
});

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

.accordion-button {
  padding: 14px 18px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border: none;
  transition: all 0.3s ease;
}

.accordion-button:not(.collapsed) {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.accordion-button:not(.collapsed) .text-muted,
.accordion-button:not(.collapsed) small {
  color: rgba(255, 255, 255, 0.9) !important;
}

.accordion-button:focus {
  box-shadow: none;
  border: none;
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

<template>
  <div>
    <!-- HEADER -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center">
        <div class="header-icon-wrapper me-3">
          <font-awesome-icon icon="book" class="header-icon" />
        </div>
        <div>
          <h3 class="header-title mb-1">Danh sách sách</h3>
          <p class="header-subtitle mb-0">Khám phá và chọn sách yêu thích</p>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div v-for="b in books.items" :key="b.MaSach" class="col-md-3">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5>{{ b.TenSach }}</h5>
            <div class="text-muted small">Tác giả: {{ b.TacGia }}</div>
            <div class="text-muted small">Mã: {{ b.MaSach }}</div>
          </div>

          <div class="card-footer">
            <button class="btn btn-dark w-100" @click="add(b.MaSach)">
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useBookStore } from "../stores/book";
import { useCartStore } from "../stores/cart";
import { useToast } from "../composables/useToast";
import { useSocket, SOCKET_EVENTS } from "../composables/useSocket";

const books = useBookStore();
const cart = useCartStore();
const toast = useToast();
const { connect, disconnect, on, off } = useSocket();

onMounted(() => {
  books.fetch();
  
  connect();
  on(SOCKET_EVENTS.BOOK_ADDED, () => books.fetch());
  on(SOCKET_EVENTS.BOOK_UPDATED, () => books.fetch());
  on(SOCKET_EVENTS.BOOK_DELETED, () => books.fetch());
});

onUnmounted(() => {
  off(SOCKET_EVENTS.BOOK_ADDED);
  off(SOCKET_EVENTS.BOOK_UPDATED);
  off(SOCKET_EVENTS.BOOK_DELETED);
  disconnect();
});

const add = async (id) => {
  try {
    await cart.add(id);
    toast.success('Đã thêm vào giỏ');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi thêm vào giỏ');
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

.card {
  transition: 0.2s;
  border: 2px solid #e3f2fd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card:hover {
  transform: translateY(-4px);
  border-color: #1976d2;
  box-shadow: 0 8px 20px rgba(25, 118, 210, 0.2);
}
</style>

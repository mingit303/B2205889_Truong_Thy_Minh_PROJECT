<template>
  <div>
    <h3 class="mb-3">Danh sách sách</h3>

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

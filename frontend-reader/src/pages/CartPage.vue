<template>
  <div class="container py-4">

    <!-- TITLE -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold">
        <font-awesome-icon icon="cart-shopping" class="me-2" />
        Giỏ mượn sách
      </h3>
    </div>

    <!-- GIỎ TRỐNG -->
    <div v-if="cart.items.length === 0" class="alert alert-info text-center py-4">
      <font-awesome-icon icon="circle-info" class="me-2" />
      Giỏ mượn trống. Hãy thêm sách từ trang chủ.
    </div>

    <!-- DANH SÁCH SÁCH -->
    <div class="list-group mb-4" v-else>
      <div
        v-for="book in cart.items"
        :key="book.MaSach"
        class="list-group-item d-flex gap-3 align-items-center cart-item"
      >
        <!-- IMAGE -->
        <img
          :src="book.AnhBia || '/no-book.png'"
          alt="Ảnh"
          class="rounded book-img"
        />

        <!-- INFO -->
        <div class="flex-grow-1">
          <h6 class="mb-1 fw-bold">{{ book.TenSach }}</h6>

          <div class="text-muted small">
            ✍️ <b>{{ book.MaTacGia?.TenTacGia || "Không rõ" }}</b>
          </div>

          <div class="text-muted small">
            🏷️ <b>{{ book.MaTheLoai?.TenTheLoai }}</b>
          </div>

          <div class="text-muted small">
            🏢 <b>{{ book.MaNXB?.TenNXB }}</b>
          </div>

          <span
            class="badge mt-2"
            :class="book.SoQuyen > 0 ? 'bg-success' : 'bg-secondary'"
          >
            {{ book.SoQuyen > 0 ? "Còn sách" : "Hết sách" }}
          </span>
        </div>

        <!-- REMOVE BUTTON -->
        <button
          class="btn btn-sm btn-outline-danger"
          @click="remove(book.MaSach)"
        >
          <font-awesome-icon icon="trash" />
        </button>
      </div>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="d-flex gap-2" v-if="cart.items.length > 0">
      <button class="btn btn-primary px-4" @click="sendRequest">
        <font-awesome-icon icon="paper-plane" class="me-2" />
        Gửi yêu cầu mượn
      </button>

      <button class="btn btn-outline-danger px-4" @click="clear">
        <font-awesome-icon icon="trash-can" class="me-2" />
        Xóa tất cả
      </button>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useCartStore } from "../stores/cart";
import { useRequestStore } from "../stores/request";

const cart = useCartStore();
const request = useRequestStore();

onMounted(() => cart.load());

const remove = (id) => cart.remove(id);
const clear = () => cart.clear();

const sendRequest = async () => {
  if (cart.items.length === 0) return;

  const ids = cart.items.map((b) => b.MaSach);

  await request.create({ Sach: ids });
  cart.clear();

  alert("🎉 Gửi yêu cầu thành công!");
};
</script>

<style scoped>
.cart-item {
  border-radius: 10px;
  border: 1px solid #ddd;
  transition: 0.2s;
}
.cart-item:hover {
  background: #f8f9fa;
}

.book-img {
  width: 70px;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
}

.btn-primary {
  background: #1e88e5;
  border-color: #1e88e5;
}
.btn-primary:hover {
  background: #1565c0;
}

.btn-outline-secondary:hover {
  background: #e0e0e0;
}
</style>

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
    <div v-if="cart.items.length === 0" class="empty-cart-wrapper">
      <div class="empty-cart-icon">
        <font-awesome-icon icon="cart-shopping" class="cart-icon" />
        <font-awesome-icon icon="xmark" class="x-icon" />
      </div>
      
      <h4 class="mt-4 mb-2 fw-bold">Giỏ mượn trống</h4>
      <p class="text-muted mb-4">Hãy thêm sách từ trang chủ để bắt đầu mượn sách nhé!</p>
      
      <router-link to="/" class="btn btn-primary px-4">
        <font-awesome-icon icon="book" class="me-2" />
        Khám phá sách ngay
      </router-link>
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
import { useToast } from "../composables/useToast";
import { useConfirm } from "../composables/useConfirm";

const cart = useCartStore();
const request = useRequestStore();
const toast = useToast();
const { confirm } = useConfirm();

onMounted(() => cart.load());

const remove = async (id) => {
  try {
    await confirm('Bạn có chắc muốn xóa sách này khỏi giỏ mượn?');
    await cart.remove(id);
    toast.success('Đã xóa sách khỏi giỏ');
  } catch {
    // User cancelled
  }
};

const clear = async () => {
  try {
    await confirm('Bạn có chắc muốn xóa tất cả sách trong giỏ?');
    await cart.clear();
    toast.success('Đã xóa tất cả sách');
  } catch {
    // User cancelled
  }
};

const sendRequest = async () => {
  if (cart.items.length === 0) return;

  const ids = cart.items.map((b) => b.MaSach);

  try {
    await request.create({ Sach: ids });
    cart.clear();
    toast.success('Gửi yêu cầu mượn thành công!');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi gửi yêu cầu');
  }
};
</script>

<style scoped>
/* EMPTY CART STATE */
.empty-cart-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-cart-icon {
  position: relative;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.empty-cart-icon .cart-icon {
  font-size: 3.5rem;
  color: #1e88e5;
}

.empty-cart-icon .x-icon {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 2.5rem;
  color: #f44336;
  font-weight: bold;
}

/* CART ITEMS */
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

<template>
  <div class="container py-4">

    <!-- HEADER -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center">
        <div class="header-icon-wrapper me-3">
          <font-awesome-icon icon="cart-shopping" class="header-icon" />
        </div>
        <div>
          <h3 class="header-title mb-1">Giỏ mượn sách</h3>
          <p class="header-subtitle mb-0">Quản lý danh sách sách bạn muốn mượn</p>
        </div>
      </div>
    </div>

    <!-- GIỎ TRỐNG -->
    <div v-if="cart.items.length === 0" class="empty-cart-wrapper">
      <div class="empty-cart-icon">
        <font-awesome-icon icon="cart-shopping" class="cart-icon" />
        <!-- <font-awesome-icon icon="xmark" class="x-icon" /> -->
      </div>
      
      <h4 class="mt-4 mb-2 fw-bold">Giỏ mượn trống</h4>
      <p class="text-muted mb-4">Hãy thêm sách từ trang chủ để bắt đầu mượn sách nhé!</p>
      
      <router-link to="/" class="btn btn-primary px-4">
        <font-awesome-icon icon="book" class="me-2" />
        Khám phá sách ngay
      </router-link>
    </div>

    <!-- THÔNG TIN TỔNG QUAN -->
    <div class="cart-summary mb-3" v-if="cart.items.length > 0">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <span class="text-muted">Tổng số sách trong giỏ:</span>
          <strong class="ms-2 text-primary">{{ cart.items.length }} cuốn</strong>
        </div>
        <div>
          <span class="text-muted">Sách có sẵn:</span>
          <strong class="ms-2 text-success">{{ cart.items.filter(b => b.SoQuyen > 0).length }} cuốn</strong>
        </div>
      </div>
    </div>

    <!-- DANH SÁCH SÁCH -->
    <div class="list-group mb-4" v-if="cart.items.length > 0">
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
          <h6 class="mb-2 fw-bold">{{ book.TenSach }}</h6>

          <div class="row g-2 mb-2">
            <div class="col-md-6">
              <div class="info-item">
                <font-awesome-icon icon="pen-nib" class="me-2" />
                <span class="text-muted small">Tác giả:</span>
                <strong class="ms-1 small">{{ book.MaTacGia?.TenTacGia || "Không rõ" }}</strong>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="info-item">
                <font-awesome-icon icon="book-open" class="me-2" />
                <span class="text-muted small">Thể loại:</span>
                <strong class="ms-1 small">{{ book.MaTheLoai?.TenTheLoai }}</strong>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="info-item">
                <font-awesome-icon icon="building" class="me-2" />
                <span class="text-muted small">Nhà xuất bản:</span>
                <strong class="ms-1 small">{{ book.MaNXB?.TenNXB }}</strong>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="info-item">
                <font-awesome-icon icon="calendar" class="me-2" />
                <span class="text-muted small">Năm xuất bản:</span>
                <strong class="ms-1 small">{{ book.NamXuatBan || "N/A" }}</strong>
              </div>
            </div>
          </div>

          <div class="d-flex gap-2 align-items-center">
            <span
              class="badge"
              :class="book.SoQuyen > 0 ? 'bg-success' : 'bg-secondary'"
            >
              {{ book.SoQuyen > 0 ? "Còn sách" : "Hết sách" }}
            </span>
            <span class="text-muted small" v-if="book.SoQuyen > 0">
              (Còn <strong>{{ book.SoQuyen }}</strong> quyển)
            </span>
          </div>
        </div>

        <!-- REMOVE BUTTON -->
        <button
          class="btn btn-sm btn-outline-danger"
          @click="remove(book.MaSach)"
          title="Xóa khỏi giỏ"
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

  // Kiểm tra giới hạn 5 cuốn
  if (cart.items.length > 5) {
    toast.error('Bạn chỉ được mượn tối đa 5 cuốn sách cùng lúc!');
    return;
  }

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
  padding: 1.25rem;
}
.cart-item:hover {
  background: #f8f9fa;
  border-color: #1976d2;
}

.book-img {
  width: 90px;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-item {
  display: flex;
  align-items: center;
}

.cart-summary {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8f5e9 100%);
  padding: 1rem 1.5rem;
  border-radius: 10px;
  border-left: 4px solid #1976d2;
}

.btn-primary {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  border: none;
  box-shadow: 0 4px 15px 0 rgba(25, 118, 210, 0.4);
}
.btn-primary:hover {
  background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%);
  box-shadow: 0 6px 20px 0 rgba(25, 118, 210, 0.6);
}

.btn-outline-secondary:hover {
  background: #e0e0e0;
}
</style>

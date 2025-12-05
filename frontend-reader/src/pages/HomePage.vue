<template>
  <div class="container py-4">
    <!-- HEADER -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <div class="header-icon-wrapper me-3">
            <font-awesome-icon icon="book" class="header-icon" />
          </div>
          <div>
            <h3 class="header-title mb-1">Khám phá sách</h3>
            <p class="header-subtitle mb-0">Tìm kiếm và chọn sách yêu thích của bạn</p>
          </div>
        </div>
        <!-- CART BUTTON -->
        <router-link to="/cart" class="cart-btn position-relative">
          <font-awesome-icon icon="cart-shopping" class="cart-icon" />

          <!-- BADGE NỔI RA NGOÀI -->
          <span v-if="cartCount > 0" class="cart-badge">
            {{ cartCount }}
          </span>
        </router-link>
      </div>
    </div>

    <!-- FILTER -->
    <div class="card p-3 mb-4">
      <div class="row g-3">

        <!-- Keyword -->
        <div class="col-md-2">
          <input
            v-model="keyword"
            class="form-control"
            placeholder="Tìm kiếm"
            @input="fetch"
          />
        </div>

        <!-- Status -->
        <div class="col-md-2">
          <select v-model="status" class="form-select" @change="fetch">
            <option value="">Tất cả</option>
            <option value="available">Còn sách</option>
            <option value="out">Hết sách</option>
          </select>
        </div>

        <!-- Author -->
        <div class="col-md-2">
          <select v-model="authorId" class="form-select" @change="fetch">
            <option value="">Tác giả</option>
            <option v-for="a in authors" :key="a._id" :value="a._id">
              {{ a.TenTacGia }}
            </option>
          </select>
        </div>

        <!-- Publisher -->
        <div class="col-md-2">
          <select v-model="publisherId" class="form-select" @change="fetch">
            <option value="">Nhà XB</option>
            <option v-for="n in publishers" :key="n._id" :value="n._id">
              {{ n.TenNXB }}
            </option>
          </select>
        </div>

        <!-- Category -->
        <div class="col-md-2">
          <select v-model="categoryId" class="form-select" @change="fetch">
            <option value="">Thể loại</option>
            <option v-for="c in categories" :key="c._id" :value="c._id">
              {{ c.TenTheLoai }}
            </option>
          </select>
        </div>

        <div class="col-md-2">
          <button class="btn btn-outline-secondary w-100" @click="clearFilters">
            <font-awesome-icon icon="rotate-left" class="me-1" />
            Xóa lọc
          </button>
        </div>

      </div>
    </div>

    <!-- EMPTY STATE -->
    <!-- EMPTY STATE -->
    <div v-if="books.length === 0" class="empty-state-wrapper">
      <div class="empty-state-icon">
        <font-awesome-icon icon="book" class="book-icon" />
      </div>

      <h4 class="mt-4 mb-2 fw-bold">
        {{ emptyMessage }}
      </h4>

      <p class="text-muted mb-4" v-if="noBooksForFilter">
        Thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.
      </p>

      <button 
        v-if="noBooksForFilter"
        class="btn btn-primary px-4"
        @click="clearFilters"
      >
        <font-awesome-icon icon="rotate-left" class="me-2" />
        Xóa tất cả bộ lọc
      </button>
    </div>


    <!-- BOOK LIST -->
    <div class="row g-4" v-else>
      <div class="col-md-3" v-for="book in books" :key="book.MaSach">
        <div class="card h-100 book-card">

          <!-- IMG + BADGE -->
          <div class="cover-wrapper position-relative">
            <span
              class="badge corner-badge"
              :class="book.SoQuyen > 0 ? 'bg-success' : 'bg-secondary'"
            >
              {{ book.SoQuyen > 0 ? `Còn ${book.SoQuyen} cuốn` : "Hết sách" }}
            </span>

            <img
              :src="book.AnhBia || '/no-book.png'"
              class="book-cover"
            />
          </div>

          <div class="card-body d-flex flex-column">

            <h6 class="fw-bold">{{ book.TenSach }}</h6>

            <p class="text-muted small mb-1">Tác giả: <b>{{ book.MaTacGia?.TenTacGia || "Không rõ" }}</b></p>
            <p class="text-muted small mb-1">Nhà xuất bản: <b>{{ book.MaNXB?.TenNXB || "Không rõ" }}</b></p>
            <p class="text-muted small mb-1">Thể loại: <b>{{ book.MaTheLoai?.TenTheLoai || "Không rõ" }}</b></p>

            <p class="text-muted small">Mã: {{ book.MaSach }}</p>

            <div class="mt-auto">
              <button
                class="btn btn-primary w-100"
                :disabled="book.SoQuyen === 0"
                @click="addToCart(book)"
              >
                <font-awesome-icon icon="cart-plus" class="me-1" />
                Thêm vào giỏ
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="mt-4" v-if="total > 0">
      <Pagination
        :page="page"
        :limit="limit"
        :total="total"
        @change="changePage"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useBookStore } from "../stores/book";
import { useCartStore } from "../stores/cart";
import { useToast } from "../composables/useToast";
import { useSocket, SOCKET_EVENTS } from "../composables/useSocket";
import http from "../api/axios";
import Pagination from "../components/Pagination.vue";

const bookStore = useBookStore();
const cartStore = useCartStore();
const toast = useToast();
const { connect, disconnect, on, off } = useSocket();

/* DATA */
const books = computed(() => bookStore.items);
const total = computed(() => bookStore.total);
const page = computed(() => bookStore.page);
const limit = computed(() => bookStore.limit);

/* Filters */
const keyword = ref("");
const status = ref("");
const authorId = ref("");
const publisherId = ref("");
const categoryId = ref("");

/* filter options */
const authors = ref([]);
const publishers = ref([]);
const categories = ref([]);

const fetchFilterData = async () => {
  authors.value = (await http.get("/authors")).data.data || [];
  publishers.value = (await http.get("/publishers")).data.data || [];
  categories.value = (await http.get("/categories")).data.data || [];
};

const fetch = () => {
  bookStore.keyword = keyword.value;
  bookStore.status = status.value;
  bookStore.authorId = authorId.value;
  bookStore.publisherId = publisherId.value;
  bookStore.categoryId = categoryId.value;

  bookStore.fetch();
};

const changePage = (p) => {
  const maxPage = Math.ceil(bookStore.total / bookStore.limit) || 1;
  if (p < 1 || p > maxPage) return;
  bookStore.page = p;
  bookStore.fetch();
};

onMounted(() => {
  fetchFilterData();
  fetch();
  cartStore.load();
  
  connect();
  on(SOCKET_EVENTS.BOOK_ADDED, () => {
    console.log('Book added - refreshing');
    fetch();
  });
  on(SOCKET_EVENTS.BOOK_UPDATED, () => {
    console.log('Book updated - refreshing');
    fetch();
  });
  on(SOCKET_EVENTS.BOOK_DELETED, () => {
    console.log('Book deleted - refreshing');
    fetch();
  });
});

onUnmounted(() => {
  off(SOCKET_EVENTS.BOOK_ADDED);
  off(SOCKET_EVENTS.BOOK_UPDATED);
  off(SOCKET_EVENTS.BOOK_DELETED);
  disconnect();
});

const addToCart = async (book) => {
  // Kiểm tra giới hạn 5 cuốn
  if (cartStore.items.length >= 5) {
    toast.error('Bạn chỉ được mượn tối đa 5 cuốn sách cùng lúc!');
    return;
  }
  
  try {
    await cartStore.add(book.MaSach);
    toast.success(`Đã thêm "${book.TenSach}" vào giỏ`);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi thêm vào giỏ');
  }
};

const clearFilters = () => {
  keyword.value = "";
  status.value = "";
  authorId.value = "";
  publisherId.value = "";
  categoryId.value = "";

  bookStore.keyword = "";
  bookStore.status = "";
  bookStore.authorId = "";
  bookStore.publisherId = "";
  bookStore.categoryId = "";
  bookStore.page = 1;

  bookStore.fetch();
};

const hasActiveFilters = computed(() => {
  return keyword.value || status.value || authorId.value || publisherId.value || categoryId.value;
});
const noBooksInSystem = computed(() => {
  return books.value.length === 0 && !hasActiveFilters.value;
});

const noBooksForFilter = computed(() => {
  return books.value.length === 0 && hasActiveFilters.value;
});
const emptyMessage = computed(() => {
  if (!hasActiveFilters.value) return "Hiện tại chưa có sách nào trong hệ thống.";

  if (status.value === "out") return "Không có sách nào đang hết hàng.";
  if (status.value === "available") return "Không có sách nào còn hàng.";
  if (authorId.value) return "Không tìm thấy sách của tác giả này.";
  if (publisherId.value) return "Không tìm thấy sách của nhà xuất bản này.";
  if (categoryId.value) return "Không tìm thấy sách thuộc thể loại này.";

  return "Không tìm thấy sách nào với bộ lọc hiện tại.";
});

const cartCount = computed(() => cartStore.count);
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

.book-card {
  transition: all 0.3s ease;
  border: 2px solid #e3f2fd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.book-card:hover {
  transform: translateY(-4px);
  border-color: #1976d2;
  box-shadow: 0 8px 20px rgba(25, 118, 210, 0.2);
}

.card {
  transition: 0.2s;
}

/* BOOK COVER */
.cover-wrapper {
  width: 100%;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #eee;
  position: relative;
}

.book-cover {
  max-height: 165px;
  max-width: 90%;
  object-fit: contain;
}

/* STATUS BADGE */
.corner-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 5px 10px;
  font-size: 0.72rem;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* CART BUTTON */
.cart-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  background: #e3f2fd;
  border: 2px solid #42a5f5;
  border-radius: 50%;
  color: #1e88e5;
  text-decoration: none;
  position: relative;
  transition: 0.2s;
}

.cart-btn:hover {
  background: #bbdefb;
  border-color: #1e88e5;
}

.cart-icon {
  font-size: 1.35rem;
}

/* BADGE NỔI NGOÀI ICON */
.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;

  background: #d32f2f;
  color: white;
  padding: 4px 8px;

  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: bold;

  box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
}

/* EMPTY STATE */
.empty-state-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-state-icon {
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

.empty-state-icon .book-icon {
  font-size: 3.5rem;
  color: #1e88e5;
}
</style>

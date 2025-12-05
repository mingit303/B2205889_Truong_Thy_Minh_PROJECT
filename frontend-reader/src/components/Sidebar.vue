<template>
  <aside class="sidebar d-flex flex-column bg-primary text-white position-fixed top-0 start-0 h-100 shadow">

    <!-- LOGO + TITLE -->
    <div class="sidebar-header d-flex align-items-center px-3 py-3 border-bottom border-light">
      <img src="../assets/frontend_logo.png" alt="Logo" class="sidebar-logo me-2" />
      <div>
        <div class="fw-bold">MingMing Library</div>
        <!-- <small class="text-light opacity-75">Reader Panel</small> -->
      </div>
    </div>

    <!-- MENU -->
    <div class="flex-grow-1 mt-2">
      <ul class="nav flex-column">

      <li class="nav-item">
        <RouterLink to="/" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/') && route.path === '/' }">
          <font-awesome-icon icon="book" class="me-2" />
          <span>Sách</span>
        </RouterLink>
      </li>

      <li class="nav-item">
        <RouterLink to="/cart" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/cart') }">
          <font-awesome-icon icon="cart-shopping" class="me-2" />
          <span>Giỏ mượn</span>
        </RouterLink>
      </li>

      <li class="nav-item">
        <RouterLink to="/requests" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/requests') }">
          <font-awesome-icon icon="envelope-open-text" class="me-2" />
          <span>Yêu cầu mượn</span>
        </RouterLink>
      </li>

      <li class="nav-item">
        <RouterLink to="/history" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/history') }">
          <font-awesome-icon icon="clock-rotate-left" class="me-2" />
          <span>Lịch sử</span>
        </RouterLink>
      </li>

      <li class="nav-item">
        <RouterLink to="/profile" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/profile') }">
          <font-awesome-icon icon="user" class="me-2" />
          <span>Hồ sơ</span>
        </RouterLink>
      </li>

    </ul>
    </div>

    <!-- FOOTER: USER + LOGOUT -->
    <div class="sidebar-footer border-top border-light px-3 py-3">
      <div class="mb-2 small opacity-75">Xin chào,</div>
      <div class="fw-bold mb-2">{{ fullName }}</div>

      <button class="btn btn-sm btn-light w-100 text-center" @click="logout">
        <font-awesome-icon icon="right-from-bracket" class="me-1" />
        Đăng xuất
      </button>
    </div>

  </aside>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useToast } from "../composables/useToast";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const isActive = (path) => route.path.startsWith(path);

const fullName = computed(() =>
  auth.reader ? `${auth.reader.HoLot} ${auth.reader.Ten}` : "Reader"
);

const logout = () => {
  auth.logout();
  toast.success("Hẹn gặp lại!", "Đã đăng xuất");
  router.push("/login");
};
</script>

<style scoped>
.sidebar {
  width: 240px;
}

.sidebar-logo {
  width: 45px;
  height: 45px;
  object-fit: contain;
  border-radius: 8px;
  background: white;
  padding: 4px;
}

.nav-link {
  padding: 10px 16px;
  font-size: 0.95rem;
  opacity: 0.9;
}

.nav-link.active,
.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  opacity: 1;
}

.sidebar-footer {
  background: rgba(255, 255, 255, 0.1);
}
</style>

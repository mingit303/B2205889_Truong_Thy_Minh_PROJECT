<template>
  <aside class="sidebar">

    <!-- LOGO + TITLE -->
    <div class="sidebar-header d-flex align-items-center gap-2">
      <font-awesome-icon icon="book-open" />
      <span class="fw-bold">MingMing Library</span>
    </div>

    <!-- MENU -->
    <ul class="menu">

      <li>
        <RouterLink to="/" class="menu-item">
          <font-awesome-icon icon="book" />
          <span>Sách</span>
        </RouterLink>
      </li>

      <li>
        <RouterLink to="/cart" class="menu-item">
          <font-awesome-icon icon="cart-shopping" />
          <span>Giỏ mượn</span>
        </RouterLink>
      </li>

      <li>
        <RouterLink to="/requests" class="menu-item">
          <font-awesome-icon icon="envelope-open-text" />
          <span>Yêu cầu mượn</span>
        </RouterLink>
      </li>

      <li>
        <RouterLink to="/history" class="menu-item">
          <font-awesome-icon icon="clock-rotate-left" />
          <span>Lịch sử</span>
        </RouterLink>
      </li>

      <li>
        <RouterLink to="/profile" class="menu-item">
          <font-awesome-icon icon="user" />
          <span>Hồ sơ</span>
        </RouterLink>
      </li>

    </ul>

    <!-- FOOTER: USER + LOGOUT -->
    <div class="sidebar-footer">
      <div class="user-name">Hi, {{ fullName }}</div>

      <button class="btn btn-light w-100 mt-2 logout-btn" @click="logout">
        <font-awesome-icon icon="right-from-bracket" class="me-2" />
        Đăng xuất
      </button>
    </div>

  </aside>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();

const fullName = computed(() =>
  auth.reader ? `${auth.reader.HoLot} ${auth.reader.Ten}` : "Reader"
);

const logout = () => {
  auth.logout();
  router.push("/login");
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: #0d6efd;
  color: white;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  font-size: 1.3rem;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.menu {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  flex-grow: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  padding: 12px;
  border-radius: 8px;
  text-decoration: none;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.router-link-active {
  background: rgba(0, 0, 0, 0.25);
  font-weight: 600;
}

.sidebar-footer {
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.user-name {
  font-weight: 500;
}

.logout-btn {
  border-radius: 6px;
  font-weight: 500;
}
</style>

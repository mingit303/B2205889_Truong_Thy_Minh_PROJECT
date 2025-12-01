<template>
  <nav class="sidebar d-flex flex-column bg-primary text-white position-fixed top-0 start-0 h-100 shadow">
    <!-- LOGO -->
    <div class="sidebar-header d-flex align-items-center px-3 py-3 border-bottom border-light">
      <i class="fa-solid fa-book-open-reader me-2 fs-4"></i>
      <div>
        <div class="fw-bold">QL Mượn Sách</div>
        <small class="text-light opacity-75">Employee Panel</small>
      </div>
    </div>

    <!-- MENU -->
    <div class="flex-grow-1 mt-2">
      <ul class="nav flex-column">
<li class="nav-item">
  <RouterLink to="/statistics" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/statistics') }">
    <i class="fa-solid fa-chart-line me-2"></i>
    <span>Thống kê</span>
  </RouterLink>
</li>

<li class="nav-item">
  <RouterLink to="/books" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/books') }">
    <i class="fa-solid fa-book me-2"></i>
    <span>Quản lý sách</span>
  </RouterLink>
</li>

<li class="nav-item">
  <RouterLink to="/authors" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/authors') }">
    <i class="fa-solid fa-pen-nib me-2"></i>
    <span>Tác giả</span>
  </RouterLink>
</li>

<li class="nav-item">
  <RouterLink to="/publishers" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/publishers') }">
    <i class="fa-solid fa-building-columns me-2"></i>
    <span>Nhà xuất bản</span>
  </RouterLink>
</li>

<li class="nav-item">
  <RouterLink to="/categories" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/categories') }">
    <i class="fa-solid fa-tags me-2"></i>
    <span>Thể loại</span>
  </RouterLink>
</li>

<li class="nav-item">
  <RouterLink to="/readers" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/readers') }">
    <i class="fa-solid fa-users me-2"></i>
    <span>Độc giả</span>
  </RouterLink>
</li>

<li class="nav-item">
  <RouterLink to="/borrows" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/borrows') }">
    <i class="fa-solid fa-book-open me-2"></i>
    <span>Phiếu mượn</span>
  </RouterLink>
</li>

<li class="nav-item">
      <RouterLink
        to="/requests"
        class="nav-link text-white d-flex align-items-center px-3"
        :class="{ active: isActive('/requests') }"
      >
        <i class="fa-solid fa-envelope-open-text me-2"></i>
        <span>Yêu cầu mượn</span>
      </RouterLink>
    </li>

<!-- ⭐ CHỈ SUPERADMIN MỚI THẤY ⭐ -->
<li class="nav-item" v-if="auth.user?.VaiTro === 'SUPERADMIN'">
  <RouterLink
    to="/employees"
    class="nav-link text-white d-flex align-items-center px-3"
    :class="{ active: isActive('/employees') }"
  >
    <i class="fa-solid fa-user-gear me-2"></i>
    <span>Quản lý nhân viên</span>
  </RouterLink>
</li>



      </ul>
    </div>

    <!-- USER INFO + LOGOUT -->
    <div class="sidebar-footer border-top border-light px-3 py-3">
      <div class="mb-2 small opacity-75">Xin chào,</div>
      <div class="fw-bold mb-2">{{ auth.user?.HoTenNV || "Nhân viên" }}</div>

      <button class="btn btn-sm btn-light w-100 text-center" @click="handleLogout">
        <font-awesome-icon icon="right-to-bracket" />
        Đăng xuất
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRoute, RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const isActive = (path) => route.path.startsWith(path);

const handleLogout = () => {
  auth.logout();
  router.push("/login");
};
</script>

<style scoped>
.sidebar {
  width: 240px;
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

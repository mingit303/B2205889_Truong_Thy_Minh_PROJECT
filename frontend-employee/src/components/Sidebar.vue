<template>
  <nav class="sidebar d-flex flex-column bg-primary text-white position-fixed top-0 start-0 h-100 shadow">
    <!-- LOGO -->
    <div class="sidebar-header d-flex align-items-center px-3 py-3 border-bottom border-light">
      <img src="../assets/frontend_logo.png" alt="Logo" class="sidebar-logo me-2" />
      <div>
        <div class="fw-bold">MingMing Library</div>
        <!-- <small class="text-light opacity-75">Employee Panel</small> -->
      </div>
    </div>

    <!-- MENU -->
    <div class="flex-grow-1 mt-2">
      <ul class="nav flex-column">
        <li class="nav-item">
          <RouterLink to="/" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/') && route.path === '/' }">
            <font-awesome-icon icon="chart-line" class="me-2" />
            <span>Trang chủ</span>
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink to="/books" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/books') }">
            <font-awesome-icon icon="book" class="me-2" />
            <span>Quản lý sách</span>
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink to="/authors" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/authors') }">
            <font-awesome-icon icon="pen-nib" class="me-2" />
            <span>Tác giả</span>
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink to="/publishers" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/publishers') }">
            <font-awesome-icon icon="building" class="me-2" />
            <span>Nhà xuất bản</span>
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink to="/categories" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/categories') }">
            <font-awesome-icon icon="tags" class="me-2" />
            <span>Thể loại</span>
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink to="/readers" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/readers') }">
            <font-awesome-icon icon="users" class="me-2" />
            <span>Độc giả</span>
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink to="/borrows" class="nav-link text-white d-flex align-items-center px-3" :class="{ active: isActive('/borrows') }">
            <font-awesome-icon icon="book-open" class="me-2" />
            <span>Phiếu mượn</span>
          </RouterLink>
        </li>

        <li class="nav-item">
              <RouterLink
                to="/requests"
                class="nav-link text-white d-flex align-items-center px-3"
                :class="{ active: isActive('/requests') }"
              >
                <font-awesome-icon icon="envelope-open-text" class="me-2" />
                <span>Yêu cầu mượn</span>
              </RouterLink>
            </li>

        <li class="nav-item" v-if="auth.isSuperAdmin">
          <RouterLink
            to="/employees"
            class="nav-link text-white d-flex align-items-center px-3"
            :class="{ active: isActive('/employees') }"
          >
            <font-awesome-icon icon="user-gear" class="me-2" />
            <span>Quản lý nhân viên</span>
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink
            to="/profile"
            class="nav-link text-white d-flex align-items-center px-3"
            :class="{ active: isActive('/profile') }"
          >
            <font-awesome-icon icon="user-circle" class="me-2" />
            <span>Thông tin tài khoản</span>
          </RouterLink>
        </li>
      </ul>
    </div>

    <!-- USER INFO + LOGOUT -->
    <div class="sidebar-footer border-top border-light px-3 py-3">
      <div class="mb-2 small opacity-75">Xin chào,</div>
      <div class="fw-bold mb-2">{{ auth.user?.HoTenNV || "Nhân viên" }}</div>

      <button class="btn btn-sm btn-light w-100 text-center" @click="handleLogout">
        <font-awesome-icon icon="right-from-bracket" class="me-1" />
        Đăng xuất
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRoute, RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useToast } from "../composables/useToast";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toast = useToast();

const isActive = (path) => route.path.startsWith(path);

const handleLogout = () => {
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

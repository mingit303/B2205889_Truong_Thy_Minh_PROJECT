<template>
  <nav class="navbar navbar-expand-lg shadow-sm main-nav fixed-top">
    <div class="container-fluid">

      <!-- BRAND -->
      <RouterLink class="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
        <font-awesome-icon icon="book-open" />
        MingMing Library
      </RouterLink>

      <!-- Toggle -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#nav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- MENU -->
      <div class="collapse navbar-collapse" id="nav">

        <!-- LEFT MENU -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">

          <li class="nav-item">
            <RouterLink to="/cart" class="nav-link">
              <font-awesome-icon icon="cart-shopping" class="me-2" />
              Giỏ mượn
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/requests" class="nav-link">
              <font-awesome-icon icon="envelope-open-text" class="me-2" />
              Yêu cầu mượn
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/history" class="nav-link">
              <font-awesome-icon icon="clock-rotate-left" class="me-2" />
              Đang mượn
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/profile" class="nav-link">
              <font-awesome-icon icon="user" class="me-2" />
              Hồ sơ
            </RouterLink>
          </li>

        </ul>

        <!-- RIGHT SIDE -->
        <div class="d-flex align-items-center gap-3">

          <!-- GREETING -->
          <div class="greeting text-white fw-semibold">
            Hi, {{ fullName }}
          </div>

          <!-- LOGOUT -->
          <button class="btn btn-light btn-sm px-3 logout-btn" @click="logout">
            <font-awesome-icon icon="right-from-bracket" class="me-2" />
            Đăng xuất
          </button>

        </div>

      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";

const auth = useAuthStore();
const router = useRouter();
const cartStore = useCartStore();

onMounted(() => cartStore.load());
console.log("AUTH READER NAVBAR:", auth.reader);
/* Lấy tên độc giả */
const fullName = computed(() =>
  auth.reader ? `${auth.reader.HoLot} ${auth.reader.Ten}` : "Reader"
);

const logout = () => {
  auth.logout();
  router.push("/login");
};
</script>

<style scoped>
.main-nav {
  background: linear-gradient(90deg, #2196f3, #64b5f6);
  color: white;
}

.navbar-brand {
  font-size: 1.3rem;
  color: white !important;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9) !important;
  padding: 9px 14px !important;
  border-radius: 6px;
}

.nav-link:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.15);
}

.router-link-active {
  font-weight: 600;
  color: #fff !important;
  background: rgba(0, 0, 0, 0.22);
}

.logout-btn {
  border-radius: 6px;
  font-weight: 500;
}

.greeting {
  font-size: 0.95rem;
  opacity: 0.95;
}

.navbar-toggler {
  border-color: rgba(255, 255, 255, 0.6);
}

.navbar-toggler-icon {
  filter: brightness(0) invert(1);
}
</style>

<template>
  <div>
    <!-- NAV -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <router-link to="/" class="navbar-brand">📚 Thư viện</router-link>

      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><router-link class="nav-link" to="/books">Sách</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/cart">Giỏ của tôi</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/requests">Yêu cầu</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/history">Lịch sử</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/profile">Tài khoản</router-link></li>

        <li class="nav-item">
          <button class="btn btn-sm btn-danger ms-3" @click="logout">Đăng xuất</button>
        </li>
      </ul>
    </nav>

    <div class="container py-4">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "../stores/auth.store";
const auth = useAuthStore();
const logout = () => auth.logout();
</script>

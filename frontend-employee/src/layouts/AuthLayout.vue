<template>
  <div class="auth-layout d-flex align-items-center justify-content-center vh-100 bg-light">
    <div class="card shadow p-4" style="min-width: 380px;">
      <div class="text-center mb-3">
        <font-awesome-icon icon="book-open" class="fa-2x text-primary mb-2" />
        <h4 class="mb-0">Quản Lý Mượn Sách</h4>
        <small class="text-muted">Đăng nhập nhân viên</small>
      </div>
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  background: linear-gradient(135deg, #e0f2ff, #f5f9ff);
}
</style>

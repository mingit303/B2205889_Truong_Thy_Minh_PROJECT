<template>
  <div class="auth-layout d-flex align-items-center justify-content-center vh-100 bg-light">
    <div class="card shadow p-4" style="min-width: 380px;">
      <div class="text-center mb-3">
        <div class="logo-wrapper mb-3">
          <img src="../assets/frontend_logo.png" alt="Logo" class="logo-icon" />
        </div>
        <h3 class="fw-bold mb-1 text-center">
          <span>MINGMING LIBRARY</span>
        </h3>
        <small class="text-muted">Đăng nhập nhân viên</small>
      </div>
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.logo-wrapper {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.auth-layout {
  background: linear-gradient(135deg, #e0f2ff, #f5f9ff);
}
</style>

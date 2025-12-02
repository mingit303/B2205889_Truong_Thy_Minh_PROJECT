<template>
  <div class="login-form">
    <h3 class="text-center mb-4 fw-bold">
      <font-awesome-icon icon="user"/>
      Đăng nhập
    </h3>

    <div v-if="errorMsg" class="alert alert-danger py-2 small">
      {{ errorMsg }}
    </div>

    <form @submit.prevent="login">

      <div class="mb-3">
        <label class="form-label">Mã độc giả / Email</label>
        <input
          v-model="form.MaDocGia"
          type="text"
          class="form-control"
          placeholder="DG001 hoặc email@gmail.com"
          required
          minlength="3"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Mật khẩu</label>
        <input
          v-model="form.MatKhau"
          type="password"
          class="form-control"
          placeholder="Nhập mật khẩu..."
          required
          minlength="6"
        />
      </div>

      <button class="btn btn-primary w-100 py-2">
        <font-awesome-icon icon="unlock-keyhole" class="me-2" />
        Đăng nhập
      </button>

    </form>

    <div class="text-center mt-3">
      <router-link to="/register">
        Chưa có tài khoản? <strong>Đăng ký ngay</strong>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { useToast } from "../composables/useToast";

const form = reactive({
  MaDocGia: "",
  MatKhau: "",
});

const errorMsg = ref("");
const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const login = async () => {
  errorMsg.value = "";

  try {
    await auth.login(form);
    toast.success(`Chào mừng ${auth.reader?.HoLot} ${auth.reader?.Ten || 'bạn'}!`, "Đăng nhập thành công");
    router.push("/");
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "Sai thông tin đăng nhập!";
  }
};
</script>

<style scoped>
.login-form {
  max-width: 420px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-form h3 {
  color: #333;
}

.login-form label {
  color: #555;
}

.login-form .form-control {
  background: white;
  border: 1px solid #ddd;
}

.login-form .form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.login-form a {
  text-decoration: none;
  transition: opacity 0.2s;
}

.login-form a:hover {
  opacity: 0.8;
}
</style>

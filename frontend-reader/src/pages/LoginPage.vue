<template>
  <div class="page-bg">
    <div class="container" style="max-width: 420px">
      <div class="card shadow-sm border-0">
        <div class="card-body p-4">

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
                class="form-control"
                placeholder="DG001 hoặc email@gmail.com"
                required
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
              />
            </div>

            <button class="btn btn-primary w-100 py-2">
              <i class="fa-solid fa-unlock-keyhole me-2"></i>
              Đăng nhập
            </button>

          </form>

          <div class="text-center mt-3">
            <router-link to="/register">
              Chưa có tài khoản? <strong>Đăng ký ngay</strong>
            </router-link>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const form = reactive({
  MaDocGia: "",
  MatKhau: "",
});

const errorMsg = ref("");
const auth = useAuthStore();
const router = useRouter();

const login = async () => {
  errorMsg.value = "";

  try {
    await auth.login(form);
    router.push("/");
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "Sai thông tin đăng nhập!";
  }
};
</script>

<style scoped>
.page-bg {
  background: #f5f6fa;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  border-radius: 14px;
}
</style>

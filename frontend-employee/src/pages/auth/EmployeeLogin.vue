<template>
  <form @submit.prevent="onSubmit">
    <div class="mb-3">
      <label class="form-label">MSNV</label>
      <input
        v-model="form.MSNV"
        type="text"
        class="form-control"
        placeholder="Nhập mã nhân viên..."
        required
        minlength="3"
      />
    </div>

    <div class="mb-3">
      <label class="form-label">Mật khẩu</label>
      <input
        v-model="form.Password"
        type="password"
        class="form-control"
        placeholder="Nhập mật khẩu..."
        required
        minlength="6"
      />
    </div>

    <!-- <div v-if="auth.error" class="alert alert-danger py-2 small">
      {{ auth.error }}
    </div> -->

    <button class="btn btn-primary w-100" :disabled="auth.loading">
      <!-- <span v-if="auth.loading" class="spinner-border spinner-border-sm me-2" /> -->
      Đăng nhập
    </button>
  </form>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { useToast } from "../../composables/useToast";

const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const form = reactive({
  MSNV: "",
  Password: "",
});

const onSubmit = async () => {
  try {
    await auth.loginEmployee(form);
    await auth.fetchMe();
    toast.success(`Chào mừng ${auth.user?.HoTenNV || 'bạn'}!`, "Đăng nhập thành công");
    router.push({ name: "dashboard" });
  } catch (err) {
    form.Password = "";
  }
};
</script>

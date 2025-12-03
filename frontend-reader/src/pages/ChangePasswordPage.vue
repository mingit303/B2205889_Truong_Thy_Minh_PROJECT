<template>
  <div style="max-width: 450px" class="mx-auto">
    <div class="page-header mb-4">
      <div class="d-flex align-items-center">
        <div class="header-icon-wrapper me-3">
          <font-awesome-icon icon="key" class="header-icon" />
        </div>
        <div>
          <h3 class="header-title mb-1">Đổi mật khẩu</h3>
          <p class="header-subtitle mb-0">Cập nhật mật khẩu bảo mật</p>
        </div>
      </div>
    </div>

    <div class="card p-3">

      <div class="mb-2">
        Mật khẩu cũ
        <input v-model="oldPass" type="password" class="form-control" />
      </div>

      <div class="mb-2">
        Mật khẩu mới
        <input v-model="newPass" type="password" class="form-control" />
      </div>

      <button class="btn btn-danger" @click="change">Đổi mật khẩu</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import http from "../api/axios";
import { useToast } from "../composables/useToast";

const toast = useToast();
const oldPass = ref("");
const newPass = ref("");

const change = async () => {
  try {
    await http.put("/change-password", {
      oldPass: oldPass.value,
      newPass: newPass.value,
    });
    toast.success('Đổi mật khẩu thành công!');
    oldPass.value = "";
    newPass.value = "";
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi đổi mật khẩu');
  }
};
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(2, 136, 209, 0.3);
  color: white;
}

.header-icon-wrapper {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.header-icon {
  font-size: 1.8rem;
}

.header-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.header-subtitle {
  font-size: 0.95rem;
  opacity: 0.9;
  margin: 0;
}
</style>

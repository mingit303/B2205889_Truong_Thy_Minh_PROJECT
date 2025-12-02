<template>
  <div style="max-width: 450px" class="mx-auto">
    <h3 class="mb-3">Đổi mật khẩu</h3>

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

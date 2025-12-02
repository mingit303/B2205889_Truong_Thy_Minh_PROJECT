<template>
  <div class="register-form">
    <h3 class="text-center mb-4 fw-bold">
      <font-awesome-icon icon="user"/>
      Đăng ký
    </h3>

    <!-- ERROR MESSAGE -->
    <div v-if="errorMsg" class="alert alert-danger py-2">
      {{ errorMsg }}
    </div>

    <form @submit.prevent="submit">

            <!-- MÃ ĐỘC GIẢ -->
            <div class="mb-3">
              <label class="form-label">Mã độc giả *</label>
              <input 
                v-model="form.MaDocGia" 
                type="text"
                class="form-control" 
                placeholder="VD: DG001" 
                required 
                minlength="3"
                maxlength="20"
              />
            </div>

            <!-- HỌ TÊN -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Họ lót *</label>
                <input 
                  v-model="form.HoLot" 
                  type="text"
                  class="form-control" 
                  required 
                  minlength="1"
                  maxlength="50"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Tên *</label>
                <input 
                  v-model="form.Ten" 
                  type="text"
                  class="form-control" 
                  required 
                  minlength="1"
                  maxlength="20"
                />
              </div>
            </div>

            <!-- GIỚI TÍNH & NGÀY SINH -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Giới tính *</label>
                <select v-model="form.Phai" class="form-select">
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Ngày sinh</label>
                <input 
                  type="date" 
                  v-model="form.NgaySinh" 
                  class="form-control" 
                />
              </div>
            </div>

            <!-- EMAIL -->
            <div class="mb-3">
              <label class="form-label">Email *</label>
              <input 
                type="email" 
                v-model="form.Email" 
                class="form-control" 
                placeholder="email@gmail.com" 
                required 
              />
            </div>

            <!-- ĐIỆN THOẠI -->
            <div class="mb-3">
              <label class="form-label">Số điện thoại</label>
              <input 
                v-model="form.DienThoai" 
                type="tel"
                class="form-control" 
                placeholder="09xxxxxxxx"
                pattern="[0-9]{10,11}"
                title="Số điện thoại phải có 10-11 chữ số"
              />
            </div>

            <!-- ĐỊA CHỈ -->
            <div class="mb-3">
              <label class="form-label">Địa chỉ</label>
              <textarea 
                v-model="form.DiaChi" 
                class="form-control"
                rows="2"
                placeholder="Số nhà, đường, quận..."
                maxlength="200"
              ></textarea>
            </div>

            <!-- MẬT KHẨU -->
            <div class="mb-3">
              <label class="form-label">Mật khẩu *</label>
              <input 
                v-model="form.MatKhau" 
                type="password" 
                minlength="6"
                class="form-control" 
                placeholder="Tối thiểu 6 ký tự" 
                required 
              />
            </div>

            <button class="btn btn-primary w-100 py-2">
              <font-awesome-icon icon="user-check" class="me-2" />
              Đăng ký
            </button>

    </form>

    <div class="text-center mt-3">
      <router-link to="/login">
        Đã có tài khoản? <strong>Đăng nhập</strong>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const store = useAuthStore();
const router = useRouter();

const errorMsg = ref("");

const form = reactive({
  MaDocGia: "",
  HoLot: "",
  Ten: "",
  Phai: "Nam",
  NgaySinh: "",
  Email: "",
  DienThoai: "",
  DiaChi: "",
  MatKhau: "",
});

import { useToast } from "../composables/useToast";

const toast = useToast();

const submit = async () => {
  errorMsg.value = "";

  try {
    await store.register(form);
    toast.success('Đăng ký thành công!');
    router.push("/login");
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "Lỗi đăng ký!";
    toast.error(errorMsg.value);
  }
};
</script>

<style scoped>
.register-form {
  max-width: 550px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.register-form h3 {
  color: #333;
}

.register-form .form-control,
.register-form .form-select {
  background: white;
  border: 1px solid #ddd;
}

.register-form .form-control:focus,
.register-form .form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.register-form label {
  color: #555;
  font-weight: 500;
}

.register-form a {
  text-decoration: none;
  transition: opacity 0.2s;
}

.register-form a:hover {
  opacity: 0.8;
}
</style>

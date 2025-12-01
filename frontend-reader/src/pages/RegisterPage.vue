<template>
  <div class="page-bg">
    <div class="container" style="max-width: 550px">
      <div class="card shadow-sm border-0">
        <div class="card-body p-4">

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
                class="form-control" 
                placeholder="VD: DG001" 
                required 
              />
            </div>

            <!-- HỌ TÊN -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Họ lót *</label>
                <input v-model="form.HoLot" class="form-control" required />
              </div>

              <div class="col-md-6">
                <label class="form-label">Tên *</label>
                <input v-model="form.Ten" class="form-control" required />
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
                class="form-control" 
                placeholder="09xxxxxxxx"
              />
            </div>

            <!-- ĐỊA CHỈ -->
            <div class="mb-3">
              <label class="form-label">Địa chỉ</label>
              <input 
                v-model="form.DiaChi" 
                class="form-control"
                placeholder="Số nhà, đường, quận..."
              />
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

            <!-- BUTTON -->
            <button class="btn btn-primary w-100 py-2">
              <i class="fa-solid fa-user-check me-2"></i>
              Đăng ký
            </button>

            <div class="text-center mt-3">
              <router-link to="/login">
                Đã có tài khoản? Đăng nhập
              </router-link>
            </div>

          </form>

        </div>
      </div>
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

const submit = async () => {
  errorMsg.value = "";

  try {
    await store.register(form);
    alert("Đăng ký thành công!");
    router.push("/login");
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "Lỗi đăng ký!";
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

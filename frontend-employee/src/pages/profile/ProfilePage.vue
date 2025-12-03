<template>
  <div class="container-fluid px-4 py-4">
    <div class="row">
      <div class="col-lg-8 mx-auto">
        
        <div class="page-header mb-4">
          <div class="d-flex align-items-center">
            <div class="header-icon-wrapper me-3">
              <font-awesome-icon icon="user-circle" class="header-icon" />
            </div>
            <div>
              <h3 class="header-title mb-1">Thông tin tài khoản</h3>
              <p class="header-subtitle mb-0">Xem và cập nhật thông tin cá nhân</p>
            </div>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            
            <div class="row mb-3">
              <div class="col-md-4 text-muted">
                <font-awesome-icon icon="id-card" class="me-2" />
                Mã nhân viên
              </div>
              <div class="col-md-8">
                <strong>{{ auth.user.MSNV }}</strong>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-4 text-muted">
                <font-awesome-icon icon="user" class="me-2" />
                Họ và tên
              </div>
              <div class="col-md-8">
                <strong>{{ auth.user.HoTenNV }}</strong>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-4 text-muted">
                <font-awesome-icon icon="briefcase" class="me-2" />
                Chức vụ
              </div>
              <div class="col-md-8">
                {{ auth.user.ChucVu || "—" }}
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-4 text-muted">
                <font-awesome-icon icon="phone" class="me-2" />
                Số điện thoại
              </div>
              <div class="col-md-8">
                {{ auth.user.SoDienThoai || "—" }}
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-4 text-muted">
                <font-awesome-icon icon="location-dot" class="me-2" />
                Địa chỉ
              </div>
              <div class="col-md-8">
                {{ auth.user.DiaChi || "—" }}
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-4 text-muted">
                <font-awesome-icon icon="shield-halved" class="me-2" />
                Vai trò
              </div>
              <div class="col-md-8">
                <span class="badge bg-primary">{{ auth.user.VaiTro }}</span>
              </div>
            </div>

            <hr class="my-4" />

            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
              <button class="btn btn-outline-danger" @click="openPassword">
                <font-awesome-icon icon="key" class="me-2" />
                Đổi mật khẩu
              </button>
              <button class="btn btn-primary" @click="openUpdate">
                <font-awesome-icon icon="pen-to-square" class="me-2" />
                Cập nhật thông tin
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- UPDATE PROFILE MODAL -->
    <div class="modal fade" id="updateModal" tabindex="-1" ref="updateRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

          <form @submit.prevent="saveProfile">
            <div class="modal-header">
              <h5 class="modal-title">
                <font-awesome-icon icon="pen-to-square" class="me-2" />
                Cập nhật thông tin
              </h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">

              <div class="mb-3">
                <label class="form-label">
                  Họ và tên <span class="text-danger">*</span>
                </label>
                <input 
                  v-model="form.HoTenNV" 
                  type="text"
                  class="form-control" 
                  placeholder="Nhập họ và tên"
                  
                  minlength="1"
                  maxlength="100"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">
                  Chức vụ
                </label>
                <input 
                  v-model="form.ChucVu" 
                  type="text"
                  class="form-control"
                  placeholder="Nhập chức vụ"
                  maxlength="50"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Số điện thoại</label>
                <input 
                  v-model="form.SoDienThoai" 
                  type="tel"
                  class="form-control"
                  placeholder="0123456789"
                  pattern="[0-9]{10,11}"
                  title="Số điện thoại phải có 10-11 chữ số"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <textarea 
                  v-model="form.DiaChi" 
                  class="form-control"
                  rows="2"
                  placeholder="Nhập địa chỉ"
                  maxlength="200"
                ></textarea>
              </div>

            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                <font-awesome-icon icon="xmark" class="me-1" />
                Hủy
              </button>
              <button type="submit" class="btn btn-primary">
                <font-awesome-icon icon="floppy-disk" class="me-1" />
                Lưu thay đổi
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>

    <!-- CHANGE PASSWORD MODAL -->
    <div class="modal fade" id="passwordModal" tabindex="-1" ref="passwordRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

          <form @submit.prevent="changePassword">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <font-awesome-icon icon="key" class="me-2" />
                Đổi mật khẩu
              </h5>
              <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">

              <div class="mb-3">
                <label class="form-label">
                  Mật khẩu cũ <span class="text-danger">*</span>
                </label>
                <input 
                  v-model="oldPass" 
                  type="password" 
                  class="form-control" 
                  placeholder="Nhập mật khẩu cũ"
                  
                  minlength="6"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">
                  Mật khẩu mới <span class="text-danger">*</span>
                </label>
                <input 
                  v-model="newPass" 
                  type="password" 
                  class="form-control"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" 
                  
                  minlength="6"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">
                  Nhập lại mật khẩu mới <span class="text-danger">*</span>
                </label>
                <input 
                  v-model="confirmPass" 
                  type="password" 
                  class="form-control"
                  placeholder="Nhập lại mật khẩu mới"
                  
                  minlength="6"
                />
                <div v-if="confirmPass && newPass !== confirmPass" class="text-danger small mt-1">
                  <font-awesome-icon icon="circle-xmark" class="me-1" />
                  Mật khẩu nhập lại không khớp
                </div>
                <div v-else-if="confirmPass && newPass === confirmPass" class="text-success small mt-1">
                  <font-awesome-icon icon="circle-check" class="me-1" />
                  Mật khẩu khớp
                </div>
              </div>

            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                <font-awesome-icon icon="xmark" class="me-1" />
                Hủy
              </button>
              <button type="submit" class="btn btn-danger" :disabled="newPass !== confirmPass">
                <font-awesome-icon icon="key" class="me-1" />
                Đổi mật khẩu
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import * as bootstrap from "bootstrap";
import { useAuthStore } from "../../stores/auth";
import http from "../../api/axios";
import { useToast } from "../../composables/useToast";

const auth = useAuthStore();
const toast = useToast();

// ---------- DATA ----------
const form = reactive({
  HoTenNV: "",
  ChucVu: "",
  SoDienThoai: "",
  DiaChi: "",
});

const oldPass = ref("");
const newPass = ref("");
const confirmPass = ref("");

let updateModal = null;
let passwordModal = null;

const updateRef = ref(null);
const passwordRef = ref(null);

// ---------- LOAD PROFILE ----------
onMounted(async () => {
  await auth.fetchMe();
  Object.assign(form, {
    HoTenNV: auth.user.HoTenNV,
    ChucVu: auth.user.ChucVu || "",
    SoDienThoai: auth.user.SoDienThoai || "",
    DiaChi: auth.user.DiaChi || "",
  });

  updateModal = new bootstrap.Modal(updateRef.value);
  passwordModal = new bootstrap.Modal(passwordRef.value);
});

// ---------- OPEN MODALS ----------
const openUpdate = () => {
  Object.assign(form, {
    HoTenNV: auth.user.HoTenNV,
    ChucVu: auth.user.ChucVu || "",
    SoDienThoai: auth.user.SoDienThoai || "",
    DiaChi: auth.user.DiaChi || "",
  });
  updateModal.show();
};

const openPassword = () => {
  oldPass.value = "";
  newPass.value = "";
  confirmPass.value = "";
  passwordModal.show();
};

// ---------- UPDATE PROFILE ----------
const saveProfile = async () => {
  // Kiểm tra xem có thay đổi gì không
  const hasChanges = 
    form.HoTenNV !== auth.user.HoTenNV ||
    form.ChucVu !== (auth.user.ChucVu || "") ||
    form.SoDienThoai !== (auth.user.SoDienThoai || "") ||
    form.DiaChi !== (auth.user.DiaChi || "");

  if (!hasChanges) {
    updateModal.hide();
    return;
  }

  try {
    await http.put("/employee/me", form);
    await auth.fetchMe();
    updateModal.hide();
    toast.success('Cập nhật thông tin thành công!');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi cập nhật thông tin');
  }
};

// ---------- CHANGE PASSWORD ----------
const changePassword = async () => {
  if (newPass.value !== confirmPass.value) {
    toast.error('Mật khẩu nhập lại không khớp!');
    return;
  }
  
  try {
    await http.put("/employee/change-password", {
      oldPass: oldPass.value,
      newPass: newPass.value,
    });
    passwordModal.hide();
    toast.success('Đổi mật khẩu thành công!');
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
  box-shadow: 0 10px 30px rgba(25, 118, 210, 0.3);
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

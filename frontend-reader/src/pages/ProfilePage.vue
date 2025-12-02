<template>
  <div class="container py-4">
    <div class="row">
      <div class="col-lg-8 mx-auto">
        
        <div class="d-flex align-items-center mb-4">
          <font-awesome-icon icon="user-circle" class="text-primary me-3" size="2x" />
          <h3 class="mb-0">Thông tin tài khoản</h3>
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            
            <div class="row mb-3">
              <div class="col-md-4 text-muted">
                <font-awesome-icon icon="id-card" class="me-2" />
                Mã độc giả
              </div>
              <div class="col-md-8">
                <strong>{{ auth.reader.MaDocGia }}</strong>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-4 text-muted">
                <font-awesome-icon icon="user" class="me-2" />
                Họ và tên
              </div>
              <div class="col-md-8">
                <strong>{{ auth.reader.HoLot }} {{ auth.reader.Ten }}</strong>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-4 text-muted">
                <font-awesome-icon icon="envelope" class="me-2" />
                Email
              </div>
              <div class="col-md-8">
                {{ auth.reader.Email }}
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-4 text-muted">
                <font-awesome-icon icon="phone" class="me-2" />
                Số điện thoại
              </div>
              <div class="col-md-8">
                {{ auth.reader.DienThoai || "—" }}
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-4 text-muted">
                <font-awesome-icon icon="location-dot" class="me-2" />
                Địa chỉ
              </div>
              <div class="col-md-8">
                {{ auth.reader.DiaChi || "—" }}
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
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <font-awesome-icon icon="pen-to-square" class="me-2" />
                Cập nhật thông tin
              </h5>
              <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">

              <div class="mb-3">
                <label class="form-label">
                  Họ lót <span class="text-danger">*</span>
                </label>
                <input 
                  v-model="form.HoLot" 
                  type="text"
                  class="form-control" 
                  placeholder="Nhập họ lót"
                  required 
                  minlength="1"
                  maxlength="50"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">
                  Tên <span class="text-danger">*</span>
                </label>
                <input 
                  v-model="form.Ten" 
                  type="text"
                  class="form-control"
                  placeholder="Nhập tên" 
                  required 
                  minlength="1"
                  maxlength="20"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">
                  Email <span class="text-danger">*</span>
                </label>
                <input 
                  v-model="form.Email" 
                  type="email"
                  class="form-control"
                  placeholder="example@email.com"
                  required 
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Số điện thoại</label>
                <input 
                  v-model="form.DienThoai" 
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
                  required 
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
                  required 
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
                  required 
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
import { useAuthStore } from "../stores/auth";
import http from "../api/axios";
import { useToast } from "../composables/useToast";

const auth = useAuthStore();
const toast = useToast();

// ---------- DATA ----------
const form = reactive({
  HoLot: "",
  Ten: "",
  Email: "",
  DienThoai: "",
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
  await auth.loadProfile();
  Object.assign(form, auth.reader);

  updateModal = new bootstrap.Modal(updateRef.value);
  passwordModal = new bootstrap.Modal(passwordRef.value);
});

// ---------- OPEN MODALS ----------
const openUpdate = () => {
  Object.assign(form, auth.reader);
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
  try {
    await http.put("/me", form);
    await auth.loadProfile();
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
    await http.put("/change-password", {
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

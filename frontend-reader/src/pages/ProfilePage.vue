<template>
  <div style="max-width: 500px" class="mx-auto">

    <h3 class="mb-3">Thông tin tài khoản</h3>

    <div class="card p-3">

      <div class="mb-2"><strong>Mã độc giả:</strong> {{ auth.reader.MaDocGia }}</div>
      <div class="mb-2"><strong>Họ lót:</strong> {{ auth.reader.HoLot }}</div>
      <div class="mb-2"><strong>Tên:</strong> {{ auth.reader.Ten }}</div>
      <div class="mb-2"><strong>Email:</strong> {{ auth.reader.Email }}</div>
      <div class="mb-2"><strong>SĐT:</strong> {{ auth.reader.DienThoai || "—" }}</div>
      <div class="mb-2"><strong>Địa chỉ:</strong> {{ auth.reader.DiaChi || "—" }}</div>

      <button class="btn btn-dark mt-3" @click="openUpdate">Cập nhật thông tin</button>

      <button class="btn btn-outline-danger mt-2" @click="openPassword">
        Đổi mật khẩu
      </button>

    </div>

    <!-- UPDATE PROFILE MODAL -->
    <div class="modal fade" id="updateModal" tabindex="-1" ref="updateRef">
      <div class="modal-dialog">
        <div class="modal-content">

          <form @submit.prevent="saveProfile">
            <div class="modal-header">
              <h5 class="modal-title">Cập nhật thông tin</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">

              <div class="mb-2">
                Họ lót
                <input v-model="form.HoLot" class="form-control" required />
              </div>

              <div class="mb-2">
                Tên
                <input v-model="form.Ten" class="form-control" required />
              </div>

              <div class="mb-2">
                Email
                <input v-model="form.Email" class="form-control" required />
              </div>

              <div class="mb-2">
                SĐT
                <input v-model="form.DienThoai" class="form-control" />
              </div>

              <div class="mb-2">
                Địa chỉ
                <input v-model="form.DiaChi" class="form-control" />
              </div>

            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
              <button class="btn btn-primary">Lưu</button>
            </div>

          </form>

        </div>
      </div>
    </div>

    <!-- CHANGE PASSWORD MODAL -->
    <div class="modal fade" id="passwordModal" tabindex="-1" ref="passwordRef">
      <div class="modal-dialog">
        <div class="modal-content">

          <form @submit.prevent="changePassword">
            <div class="modal-header">
              <h5 class="modal-title">Đổi mật khẩu</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">

              <div class="mb-2">
                Mật khẩu cũ
                <input v-model="oldPass" type="password" class="form-control" required />
              </div>

              <div class="mb-2">
                Mật khẩu mới
                <input v-model="newPass" type="password" class="form-control" required />
              </div>

            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
              <button class="btn btn-danger">Đổi mật khẩu</button>
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

const auth = useAuthStore();

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
  passwordModal.show();
};

// ---------- UPDATE PROFILE ----------
const saveProfile = async () => {
  await http.put("/me", form);
  await auth.loadProfile();
  updateModal.hide();
  alert("Cập nhật thông tin thành công!");
};

// ---------- CHANGE PASSWORD ----------
const changePassword = async () => {
  await http.put("/change-password", {
    oldPass: oldPass.value,
    newPass: newPass.value,
  });

  passwordModal.hide();
  alert("Đổi mật khẩu thành công!");
};
</script>

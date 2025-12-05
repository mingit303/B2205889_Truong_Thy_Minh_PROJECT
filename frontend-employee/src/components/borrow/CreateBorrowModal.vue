<!-- src/components/borrow/CreateBorrowModal.vue -->
<template>
  <div v-if="visible">
    <div class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="handleSubmit">
            <div class="modal-header">
              <h5 class="modal-title">
                <font-awesome-icon icon="plus" class="me-2" />
                Tạo phiếu mượn
              </h5>
              <button type="button" class="btn-close" @click="close"></button>
            </div>

            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Mã độc giả (MaDocGia) *</label>
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

              <div class="mb-3">
                <label class="form-label">Mã sách (MaSach) *</label>
                <input
                  v-model="form.MaSach"
                  type="text"
                  class="form-control"
                  placeholder="VD: S001"
                  required
                  minlength="2"
                  maxlength="20"
                />
              </div>

              <div class="small text-muted">
                Hạn mượn, số ngày gia hạn, số sách tối đa...
                sẽ lấy theo cấu hình trên server (Config).
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="close"
                :disabled="loading"
              >
                Hủy
              </button>
              <button type="submit" class="btn btn-success" :disabled="loading">
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                Tạo phiếu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useBorrowStore } from "../../stores/borrow";
import { useToast } from "../../composables/useToast";

const store = useBorrowStore();
const toast = useToast();
const visible = ref(false);
const loading = ref(false);

const form = reactive({
  MaDocGia: "",
  MaSach: "",
});

const open = () => {
  form.MaDocGia = "";
  form.MaSach = "";
  visible.value = true;
};

const close = () => {
  if (loading.value) return;
  visible.value = false;
};

const handleSubmit = async () => {
  if (!form.MaDocGia || !form.MaSach) return;

  try {
    loading.value = true;
    await store.createBorrow({
      MaDocGia: form.MaDocGia.trim(),
      MaSach: form.MaSach.trim(),
    });
    toast.success("Tạo phiếu mượn thành công!");
    // Close modal after setting loading to false
    loading.value = false;
    close();
  } catch (err) {
    // Bắt lỗi từ server với nhiều định dạng khác nhau
    const errorMessage = 
      err?.response?.data?.message || 
      err?.response?.data?.error ||
      err?.message || 
      "Lỗi tạo phiếu mượn";
    toast.error(errorMessage);
    loading.value = false;
  }
};

defineExpose({ open });
</script>

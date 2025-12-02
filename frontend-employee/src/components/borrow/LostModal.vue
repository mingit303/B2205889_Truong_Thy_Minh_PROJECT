<template>
  <div v-if="visible && record">
    <div class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="handleSubmit">
            <div class="modal-header">
              <h5 class="modal-title">
                <font-awesome-icon icon="book-dead" class="me-2" />
                Báo mất sách
              </h5>
              <button type="button" class="btn-close" @click="close"></button>
            </div>

            <div class="modal-body">
              <p>
                Độc giả:
                <strong>
                  {{ record.MaDocGia }} —
                  {{ record.reader?.HoLot }} {{ record.reader?.Ten }}
                </strong>
              </p>
              <p>
                Sách:
                <strong>
                  {{ record.MaSach }} — {{ record.book?.TenSach }}
                </strong>
              </p>

              <div class="mb-3">
                <label class="form-label">Lý do / ghi chú</label>
                <textarea
                  v-model="form.LyDoXuPhat"
                  class="form-control"
                  rows="3"
                  placeholder="VD: Mất trên đường đi học, bị rơi không tìm thấy..."
                  maxlength="500"
                ></textarea>
              </div>

              <div class="alert alert-danger small mb-0">
                Hệ thống sẽ tính phạt mất sách theo:
                <strong>Tỷ lệ phạt mất sách</strong> +
                <strong>Phí xử lý mất sách</strong> và giá bìa sách.
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
              <button type="submit" class="btn btn-dark" :disabled="loading">
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                Xác nhận mất sách
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
import { ref, reactive } from "vue";
import { useBorrowStore } from "../../stores/borrow";
import { useToast } from "../../composables/useToast";

const store = useBorrowStore();
const toast = useToast();
const visible = ref(false);
const loading = ref(false);
const record = ref(null);

const form = reactive({
  LyDoXuPhat: "",
});

const open = (row) => {
  record.value = row;
  form.LyDoXuPhat = "";
  visible.value = true;
};

const close = () => {
  if (loading.value) return;
  visible.value = false;
  record.value = null;
};

const handleSubmit = async () => {
  if (!record.value?._id) return;

  loading.value = true;
  try {
    await store.reportLost(record.value._id, {
      LyDoXuPhat: form.LyDoXuPhat || "Mất sách",
    });
    toast.success("Đã báo mất sách thành công!");
    visible.value = false;
    record.value = null;
  } catch (err) {
    console.error("Report lost error:", err);
    toast.error(err?.response?.data?.message || "Lỗi xử lý mất sách");
  } finally {
    loading.value = false;
  }
};

defineExpose({ open });
</script>

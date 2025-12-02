<template>
  <div v-if="visible && record">
    <div class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <font-awesome-icon icon="rotate-left" class="me-2" />
              Trả sách
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
            <p>Ngày mượn: <strong>{{ formatDate(record.NgayMuon) }}</strong></p>
            <p>Hạn trả: <strong>{{ formatDate(record.HanTra) }}</strong></p>

            <div class="alert alert-warning mt-3" v-if="isOverdue">
              Phiếu này đã quá hạn, tiền phạt (nếu có) sẽ được hệ thống tự tính
              theo cấu hình.
            </div>

            <p class="mb-0">Bạn có chắc chắn muốn xác nhận trả sách?</p>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="close" :disabled="loading">
              Hủy
            </button>
            <button class="btn btn-success" @click="handleConfirm" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
              Xác nhận trả
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useBorrowStore } from "../../stores/borrow";
import { useToast } from "../../composables/useToast";

const store = useBorrowStore();
const toast = useToast();

const visible = ref(false);
const loading = ref(false);
const record = ref(null);

const open = (row) => {
  record.value = row;
  visible.value = true;
};

const close = () => {
  if (loading.value) return;
  visible.value = false;
  record.value = null;
};

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("vi-VN");
};

const isOverdue = computed(() => {
  if (!record.value?.HanTra || record.value?.NgayTra) return false;
  return new Date(record.value.HanTra) < new Date();
});

const handleConfirm = async () => {
  if (!record.value?._id) return;
  try {
    loading.value = true;
    await store.returnBook(record.value._id);
    toast.success("Trả sách thành công!");
    close();
  } catch (err) {
    toast.error(err?.response?.data?.message || "Lỗi trả sách");
  } finally {
    loading.value = false;
  }
};

defineExpose({ open });
</script>

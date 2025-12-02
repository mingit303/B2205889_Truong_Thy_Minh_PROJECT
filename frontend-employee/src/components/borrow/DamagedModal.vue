<template>
  <div v-if="visible && record">
    <div class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="handleSubmit">
            <div class="modal-header">
              <h5 class="modal-title">
                <font-awesome-icon icon="triangle-exclamation" class="me-2" />
                Báo sách hư hỏng
              </h5>
              <button type="button" class="btn-close" @click="close"></button>
            </div>

            <div class="modal-body">
              <p>
                Độc giả:
                <strong>
                  {{ record.MaDocGia }} — {{ record.reader?.HoLot }}
                  {{ record.reader?.Ten }}
                </strong>
              </p>
              <p>
                Sách:
                <strong>
                  {{ record.MaSach }} — {{ record.book?.TenSach }}
                </strong>
              </p>

              <div class="mb-3">
                <label class="form-label">Mức độ hư hỏng</label>
                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="damageLight"
                      value="Nhẹ"
                      v-model="form.MucDoHuHong"
                    />
                    <label class="form-check-label" for="damageLight">Nhẹ</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="damageHeavy"
                      value="Nặng"
                      v-model="form.MucDoHuHong"
                    />
                    <label class="form-check-label" for="damageHeavy">Nặng</label>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Lý do / ghi chú xử phạt</label>
                <textarea
                  v-model="form.LyDoXuPhat"
                  class="form-control"
                  rows="3"
                  placeholder="Mô tả tình trạng sách, nguyên nhân hư hỏng..."
                  maxlength="500"
                ></textarea>
              </div>

              <div class="alert alert-info small mb-0">
                Tiền phạt sẽ được tính theo cấu hình:
                <strong>Tỷ lệ phạt hư hỏng nhẹ / nặng</strong> và giá bìa sách.
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
              <button type="submit" class="btn btn-warning" :disabled="loading">
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                Xác nhận
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
  MucDoHuHong: "Nhẹ",
  LyDoXuPhat: "",
});

const open = (row) => {
  record.value = row;
  form.MucDoHuHong = "Nhẹ";
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
  if (!form.MucDoHuHong) {
    toast.warning("Vui lòng chọn mức độ hư hỏng");
    return;
  }

  try {
    loading.value = true;
    await store.reportDamaged(record.value._id, {
      MucDoHuHong: form.MucDoHuHong,
      LyDoXuPhat: form.LyDoXuPhat || "",
    });
    toast.success("Đã báo sách hư hỏng thành công!");
    close();
  } catch (err) {
    toast.error(err?.response?.data?.message || "Lỗi xử lý sách hư hỏng");
  } finally {
    loading.value = false;
  }
};

defineExpose({ open });
</script>

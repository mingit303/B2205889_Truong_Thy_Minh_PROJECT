<template>
  <div class="container-fluid py-3">

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">
        <i class="fa-solid fa-book-open me-2"></i> Phiếu mượn
      </h3>

      <button class="btn btn-success" @click="openCreate">
        <i class="fa-solid fa-plus me-1"></i> Tạo phiếu mượn
      </button>
    </div>

    <!-- FILTERS -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-3">

          <div class="col-md-4">
            <label class="form-label">Tìm kiếm độc giả / sách</label>
            <input
              class="form-control"
              placeholder="Mã DG, tên DG, mã sách..."
              v-model="store.search"
              @input="applyFilters"
            />
          </div>

          <div class="col-md-3">
            <label class="form-label">Trạng thái</label>
            <select
              v-model="store.status"
              class="form-select"
              @change="applyFilters"
            >
              <option value="">Tất cả</option>
              <option>Đã mượn</option>
              <option>Đã trả</option>
              <option>Trễ hạn</option>
              <option>Hư hỏng</option>
              <option>Mất sách</option>
              <option>Đã bồi thường</option>
            </select>
          </div>

          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              Xóa lọc
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="card">
      <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="text-center" style="width:50px">#</th>
              <th>Độc giả</th>
              <th>Sách</th>
              <th>Ngày mượn</th>
              <th>Hạn trả</th>
              <th>Trạng thái</th>
              <th>Tiền phạt</th>
              <th class="text-center" style="width:140px">Thao tác</th>
            </tr>
          </thead>

          <tbody>

            <tr v-if="store.loading">
              <td colspan="8" class="text-center py-3">Đang tải dữ liệu...</td>
            </tr>

            <tr v-for="(b, idx) in store.items" :key="b._id">

              <td class="text-center">{{ rowNumber(idx) }}</td>

              <td>{{ b.MaDocGia }} — <strong>{{ b.reader?.HoLot }} {{ b.reader?.Ten }}</strong></td>

              <td>{{ b.MaSach }} — <strong>{{ b.book?.TenSach }}</strong></td>

              <td>{{ formatDate(b.NgayMuon) }}</td>
              <td>{{ formatDate(b.HanTra) }}</td>

              <td><span class="badge" :class="statusClass(b.TrangThai)">{{ b.TrangThai }}</span></td>

              <!-- TIỀN PHẠT -->
              <td class="fw-bold text-danger">
                {{ calcFine(b).toLocaleString("vi-VN") }} đ
              </td>

              <!-- ACTIONS -->
              <td class="text-center">
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </button>

                  <ul class="dropdown-menu dropdown-menu-end">

                    <!-- Trả sách -->
                    <li v-if="['Đã mượn','Trễ hạn'].includes(b.TrangThai)">
                      <button class="dropdown-item" @click="openReturn(b)">
                        <i class="fa-solid fa-rotate-left me-2"></i> Trả sách
                      </button>
                    </li>

                    <!-- Gia hạn -->
                    <li v-if="b.TrangThai === 'Đã mượn'">
                      <button class="dropdown-item" @click="extendBorrow(b)">
                        <i class="fa-solid fa-clock-rotate-left me-2"></i> Gia hạn
                      </button>
                    </li>

                    <!-- Báo hư hỏng -->
                    <li v-if="['Đã mượn','Trễ hạn'].includes(b.TrangThai)">
                      <button class="dropdown-item" @click="openDamaged(b)">
                        <i class="fa-solid fa-triangle-exclamation me-2"></i> Báo hư hỏng
                      </button>
                    </li>

                    <!-- Báo mất -->
                    <li v-if="['Đã mượn','Trễ hạn'].includes(b.TrangThai)">
                      <button class="dropdown-item" @click="openLost(b)">
                        <i class="fa-solid fa-book-dead me-2"></i> Báo mất sách
                      </button>
                    </li>

                    <!-- BỒI THƯỜNG -->
                    <li v-if="canMarkPaid(b)">
                      <button class="dropdown-item" @click="markPaid(b)">
                        <i class="fa-solid fa-check me-2"></i> Đã bồi thường
                      </button>
                    </li>

                    <li><hr class="dropdown-divider" /></li>

                    <!-- In phiếu mượn -->
                    <li v-if="canPrintBorrow(b)">
                      <button class="dropdown-item" @click="printBorrow(b._id)">
                        <i class="fa-solid fa-print me-2"></i> In phiếu mượn
                      </button>
                    </li>

                    <!-- In phiếu phạt -->
                    <li v-if="canPrintFine(b)">
                      <button class="dropdown-item text-danger" @click="printFine(b._id)">
                        <i class="fa-solid fa-file-pdf me-2"></i> In phiếu phạt
                      </button>
                    </li>

                  </ul>
                </div>
              </td>

            </tr>

            <tr v-if="!store.items.length && !store.loading">
              <td colspan="8" class="text-center py-3">Không có dữ liệu</td>
            </tr>

          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="card-footer d-flex justify-content-end">
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: store.page === 1 }">
            <button class="page-link" @click="changePage(store.page - 1)">«</button>
          </li>

          <li class="page-item disabled">
            <span class="page-link">Trang {{ store.page }}</span>
          </li>

          <li class="page-item" :class="{ disabled: store.page * store.limit >= store.total }">
            <button class="page-link" @click="changePage(store.page + 1)">»</button>
          </li>
        </ul>
      </div>
    </div>

    <!-- MODALS -->
    <CreateBorrowModal ref="createModal" />
    <ReturnModal ref="returnModal" />
    <DamagedModal ref="damagedModal" />
    <LostModal ref="lostModal" />

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useBorrowStore } from "../../stores/borrow";

import CreateBorrowModal from "../../components/borrow/CreateBorrowModal.vue";
import ReturnModal from "../../components/borrow/ReturnModal.vue";
import DamagedModal from "../../components/borrow/DamagedModal.vue";
import LostModal from "../../components/borrow/LostModal.vue";

const store = useBorrowStore();

onMounted(() => {
  store.fetch();
});

/* FILTERS */
const applyFilters = () => {
  store.page = 1;
  store.fetch();
};

const resetFilters = () => {
  store.search = "";
  store.status = "";
  store.page = 1;
  store.fetch();
};

/* PAGINATION */
const changePage = (p) => {
  if (p < 1) return;
  store.page = p;
  store.fetch();
};

const rowNumber = (idx) => (store.page - 1) * store.limit + idx + 1;

/* FORMATTERS */
const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "");

/* STATUS COLORS */
const statusClass = (st) =>
  ({
    "Đã mượn": "bg-primary",
    "Đã trả": "bg-secondary",
    "Trễ hạn": "bg-danger",
    "Hư hỏng": "bg-warning text-dark",
    "Mất sách": "bg-dark",
    "Đã bồi thường": "bg-success",
  }[st] || "bg-light");

/* CALC FINE */
const calcFine = (b) => b.TienPhat || 0;

/* CONDITIONS */
const canPrintBorrow = (b) => b.TrangThai === "Đã mượn";

const canPrintFine = (b) =>
  ["Trễ hạn","Hư hỏng","Mất sách","Đã bồi thường"].includes(b.TrangThai) &&
  calcFine(b) > 0;

const canMarkPaid = (b) =>
  ["Hư hỏng", "Mất sách"].includes(b.TrangThai);

/* ACTIONS */
const createModal = ref(null);
const returnModal = ref(null);
const damagedModal = ref(null);
const lostModal = ref(null);

const openCreate = () => createModal.value?.open();
const openReturn = (b) => returnModal.value?.open(b);
const openDamaged = (b) => damagedModal.value?.open(b);
const openLost = (b) => lostModal.value?.open(b);

const extendBorrow = async (b) => {
  if (!confirm("Gia hạn thêm cho phiếu mượn này?")) return;
  await store.extendBorrow(b._id);
};

const markPaid = async (b) => {
  if (!confirm("Xác nhận độc giả đã bồi thường?")) return;
  await store.markPaid(b._id);
};

const printBorrow = (id) => {
  window.open(`${import.meta.env.VITE_API_URL}/pdf/borrow/${id}`, "_blank");
};

const printFine = (id) => {
  window.open(`${import.meta.env.VITE_API_URL}/pdf/fine/${id}`, "_blank");
};
</script>

<style scoped>
.dropdown-menu {
  font-size: 14px;
}
</style>

<template>
  <div class="container py-3">
    <h3 class="mb-3">Yêu cầu mượn sách</h3>

    <!-- FILTER -->
    <div class="card mb-3 p-3">
      <div class="row g-2">
        <div class="col-md-3">
          <select class="form-select" v-model="store.status" @change="reload">
            <option value="">Tất cả</option>
            <option value="CHO_DUYET">Chờ duyệt</option>
            <option value="DA_DUYET">Đã duyệt</option>
            <option value="TU_CHOI">Từ chối</option>
          </select>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="card">
      <table class="table mb-0">
        <thead class="table-light">
          <tr>
            <th style="width: 50px">#</th>
            <th>Độc giả</th>
            <th>Sách</th>
            <th>Trạng thái</th>
            <th>Ngày yêu cầu</th>
            <th class="text-center" style="width:160px">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(r, idx) in store.items" :key="r._id">
            <td>{{ (store.page - 1) * store.limit + idx + 1 }}</td>

            <td class="fw-bold">{{ r.MaDocGia }}</td>

            <!-- BOOK LIST -->
            <td>
              <details>
                <summary class="text-primary" style="cursor:pointer">
                  {{ r.Sach.length }} sách
                </summary>

                <ul class="list-group mt-2">
                  <li
                    v-for="book in r.Sach"
                    :key="book._id || book.MaSach"
                    class="list-group-item small"
                  >
                    <strong>{{ book.MaSach }} - {{ book.TenSach }}</strong>
                    <div class="text-muted">Tác giả: {{ book.MaTacGia?.TenTacGia }}</div>
                    <div class="text-muted">NXB: {{ book.MaNXB?.TenNXB }}</div>
                  </li>
                </ul>
              </details>
            </td>

            <td>
              <span class="badge" :class="badge(r.TrangThai)">
                {{ convertStatus(r.TrangThai) }}
              </span>
            </td>

            <td>{{ formatDate(r.createdAt) }}</td>

            <td class="text-center">
              <template v-if="r.TrangThai === 'CHO_DUYET'">
                <button class="btn btn-sm btn-success me-1" @click="approve(r._id)">
                  <i class="fa-solid fa-check"></i>
                </button>

                <button class="btn btn-sm btn-danger" @click="reject(r._id)">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </template>
              <span v-else class="text-muted">—</span>
            </td>
          </tr>

          <tr v-if="store.items.length === 0">
            <td colspan="6" class="text-center py-3">Không có yêu cầu</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PAGINATION -->
    <Pagination
  :page="store.page"
  :limit="store.limit"
  :total="store.total"
  @change="changePage"
/>


  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRequestStore } from "../../stores/request";
import Pagination from "../../components/Pagination.vue";
const store = useRequestStore();

onMounted(() => store.fetch());

const reload = () => {
  store.page = 1;
  store.fetch();
};

const changePage = (p) => {
  store.page = p;
  store.fetch();
};

/* APPROVE */
const approve = async (id) => {
  if (!confirm("Xác nhận duyệt yêu cầu mượn này?")) return;
  await store.approve(id);
};

/* REJECT */
const reject = async (id) => {
  const reason = prompt("Nhập lý do từ chối:");
  if (!reason) return;
  await store.reject(id, reason);
};

/* BADGE COLOR */
const badge = (st) =>
  ({
    CHO_DUYET: "bg-warning text-dark",
    DA_DUYET: "bg-success",
    TU_CHOI: "bg-danger",
  }[st]);

/* STATUS TEXT */
const convertStatus = (st) =>
  ({
    CHO_DUYET: "Chờ duyệt",
    DA_DUYET: "Đã duyệt",
    TU_CHOI: "Từ chối",
  }[st] || st);

const formatDate = (d) =>
  new Date(d).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}

.badge {
  font-size: 0.85rem;
  padding: 6px 10px;
}
</style>

<template>
  <div class="container py-3">
    <h3>Lịch sử yêu cầu mượn</h3>

    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Ngày tạo</th>
          <th>Sách</th>
          <th>Trạng thái</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="r in store.items" :key="r._id">
          <td>{{ new Date(r.createdAt).toLocaleDateString('vi-VN') }}</td>

          <td>
            <ul>
              <li v-for="b in r.Sach" :key="b.MaSach">
                {{ b.MaSach }} — {{ b.TenSach }}
              </li>
            </ul>
          </td>

          <td>
            <span :class="badge(r.TrangThai)" class="badge">
              {{ mapStatus(r.TrangThai) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRequestStore } from "../stores/request";

const store = useRequestStore();

onMounted(() => {
  store.fetchMyRequests();
});

const mapStatus = (s) =>
  ({
    CHO_DUYET: "Chờ duyệt",
    DA_DUYET: "Đã duyệt",
    TU_CHOI: "Từ chối",
  }[s] || s);

const badge = (s) =>
  ({
    CHO_DUYET: "bg-warning text-dark",
    DA_DUYET: "bg-success",
    TU_CHOI: "bg-danger",
  }[s] || "bg-secondary");
</script>

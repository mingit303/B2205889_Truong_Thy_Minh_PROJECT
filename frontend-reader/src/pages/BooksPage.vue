<template>
  <div>
    <h3 class="mb-3">Danh sách sách</h3>

    <div class="row g-3">
      <div v-for="b in books.items" :key="b.MaSach" class="col-md-3">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5>{{ b.TenSach }}</h5>
            <div class="text-muted small">Tác giả: {{ b.TacGia }}</div>
            <div class="text-muted small">Mã: {{ b.MaSach }}</div>
          </div>

          <div class="card-footer">
            <button class="btn btn-dark w-100" @click="add(b.MaSach)">
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useBookStore } from "../stores/book";
import { useCartStore } from "../stores/cart";

const books = useBookStore();
const cart = useCartStore();

onMounted(() => {
  books.fetch();
});
const add = async (id) => {
  await cart.add(id);
};
</script>

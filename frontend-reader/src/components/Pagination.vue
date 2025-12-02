<template>
  <div class="d-flex justify-content-between align-items-center">
    <div class="text-muted small">
      Hiển thị {{ startItem }} - {{ endItem }} / {{ total }} kết quả
    </div>
    
    <ul class="pagination mb-0">
      <!-- FIRST -->
      <li class="page-item" :class="{ disabled: page === 1 }">
        <button class="page-link" @click="go(1)" title="Trang đầu">
          <font-awesome-icon icon="angles-left" />
        </button>
      </li>

      <!-- PREV -->
      <li class="page-item" :class="{ disabled: page === 1 }">
        <button class="page-link" @click="go(page - 1)" title="Trang trước">
          <font-awesome-icon icon="angle-left" />
        </button>
      </li>

      <!-- PAGE NUMBERS -->
      <li 
        v-for="p in visiblePages" 
        :key="p" 
        class="page-item" 
        :class="{ active: p === page }"
      >
        <button class="page-link" @click="go(p)">{{ p }}</button>
      </li>

      <!-- NEXT -->
      <li class="page-item" :class="{ disabled: page >= maxPage }">
        <button class="page-link" @click="go(page + 1)" title="Trang sau">
          <font-awesome-icon icon="angle-right" />
        </button>
      </li>

      <!-- LAST -->
      <li class="page-item" :class="{ disabled: page >= maxPage }">
        <button class="page-link" @click="go(maxPage)" title="Trang cuối">
          <font-awesome-icon icon="angles-right" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  page: { type: Number, required: true },
  limit: { type: Number, required: true },
  total: { type: Number, required: true },
});

const emit = defineEmits(["change"]);

const maxPage = computed(() => Math.ceil(props.total / props.limit) || 1);

const startItem = computed(() => {
  if (props.total === 0) return 0;
  return (props.page - 1) * props.limit + 1;
});

const endItem = computed(() => {
  const end = props.page * props.limit;
  return end > props.total ? props.total : end;
});

const visiblePages = computed(() => {
  const current = props.page;
  const max = maxPage.value;
  const pages = [];
  
  // Hiển thị tối đa 5 trang
  let start = Math.max(1, current - 2);
  let end = Math.min(max, current + 2);
  
  // Điều chỉnh để luôn có 5 trang nếu có thể
  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(max, start + 4);
    } else if (end === max) {
      start = Math.max(1, end - 4);
    }
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

const go = (p) => {
  if (p < 1 || p > maxPage.value || p === props.page) return;
  emit("change", p);
};
</script>

<style scoped>
.page-link {
  cursor: pointer;
  min-width: 38px;
  text-align: center;
}

.page-item.disabled .page-link {
  cursor: not-allowed;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
  font-weight: bold;
}
</style>

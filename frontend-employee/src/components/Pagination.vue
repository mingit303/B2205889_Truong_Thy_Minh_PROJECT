<template>
  <div class="d-flex justify-content-end mt-3">
    <ul class="pagination mb-0">

      <!-- PREV -->
      <li class="page-item" :class="{ disabled: page === 1 }">
        <button class="page-link" @click="go(page - 1)">«</button>
      </li>

      <!-- CURRENT -->
      <li class="page-item disabled">
        <span class="page-link">Trang {{ page }}</span>
      </li>

      <!-- NEXT -->
      <li class="page-item" :class="{ disabled: page >= maxPage }">
        <button class="page-link" @click="go(page + 1)">»</button>
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

const maxPage = computed(() => Math.ceil(props.total / props.limit));

const go = (p) => {
  if (p < 1 || p > maxPage.value) return;
  emit("change", p);
};
</script>

<style scoped>
.page-link {
  cursor: pointer;
}
</style>

<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999">
    <div
      v-for="toast in toastList"
      :key="toast.id"
      class="toast show"
      role="alert"
    >
      <div class="toast-header" :class="getHeaderClass(toast.type)">
        <font-awesome-icon :icon="getIcon(toast.type)" class="me-2" />
        <strong class="me-auto">{{ getTitle(toast.type) }}</strong>
        <button
          type="button"
          class="btn-close btn-close-white"
          @click="remove(toast.id)"
        ></button>
      </div>
      <div class="toast-body">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast';

const { toastList, remove } = useToast();

const getHeaderClass = (type) => {
  const classes = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning text-dark',
    info: 'bg-info text-white'
  };
  return classes[type] || classes.info;
};

const getIcon = (type) => {
  const icons = {
    success: 'circle-check',
    error: 'circle-xmark',
    warning: 'triangle-exclamation',
    info: 'circle-info'
  };
  return icons[type] || icons.info;
};

const getTitle = (type) => {
  const titles = {
    success: 'Thành công',
    error: 'Lỗi',
    warning: 'Cảnh báo',
    info: 'Thông báo'
  };
  return titles[type] || titles.info;
};
</script>

<style scoped>
.toast {
  min-width: 300px;
  margin-bottom: 0.5rem;
}

.btn-close-white {
  filter: brightness(0) invert(1);
}
</style>

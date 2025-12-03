<template>
  <div
    v-if="isOpen"
    class="modal fade show"
    style="display: block"
    tabindex="-1"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header" :class="{ 'danger-header': dialogData.type === 'danger' }">
          <h5 class="modal-title">
            <font-awesome-icon :icon="getIcon(dialogData.type)" class="me-2" />
            {{ dialogData.title }}
          </h5>
          <button
            type="button"
            class="btn-close"
            :class="{ 'btn-close-white': dialogData.type === 'danger' }"
            @click="handleCancel"
          ></button>
        </div>
        <div class="modal-body">
          <p>{{ dialogData.message }}</p>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="handleCancel"
          >
            {{ dialogData.cancelText }}
          </button>
          <button
            type="button"
            :class="dialogData.type === 'danger' ? 'btn danger-btn' : `btn btn-${dialogData.type}`"
            @click="handleConfirm"
          >
            {{ dialogData.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- BACKDROP -->
  <div
    v-if="isOpen"
    class="modal-backdrop fade show"
    @click="handleCancel"
  ></div>
</template>

<script setup>
import { useConfirm } from '../composables/useConfirm';

const { isOpen, dialogData, handleConfirm, handleCancel } = useConfirm();

const getIcon = (type) => {
  const icons = {
    danger: 'triangle-exclamation',
    warning: 'exclamation-circle',
    primary: 'circle-info'
  };
  return icons[type] || icons.danger;
};

const getIconColor = (type) => {
  const colors = {
    danger: 'text-danger',
    warning: 'text-warning',
    primary: 'text-primary'
  };
  return colors[type] || colors.danger;
};
</script>

<style scoped>
.modal {
  z-index: 10000;
}

.modal-backdrop {
  z-index: 9999;
}

.danger-header {
  background: #dc3545 !important;
  color: white !important;
  border-bottom: none;
}

.danger-header .modal-title {
  color: white !important;
}

.danger-btn {
  background: #dc3545;
  color: white;
  border: none;
}

.danger-btn:hover {
  background: #c82333;
  color: white;
}
</style>

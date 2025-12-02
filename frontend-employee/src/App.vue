<template>
  <router-view />
  
  <!-- TOAST NOTIFICATIONS -->
  <ToastContainer />

  <!-- CONFIRM DIALOG -->
  <ConfirmDialog />
</template>

<script setup>
import ToastContainer from './components/ToastContainer.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
</script>

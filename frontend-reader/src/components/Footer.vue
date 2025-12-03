<template>
  <footer class="footer bg-white border-top py-3 mt-4">
    <div class="container-fluid">
      <div class="row align-items-center">
        <div class="col-md-6 text-center text-md-start">
          <span class="text-muted">
            &copy; {{ currentYear }} <strong>MingMing Library</strong>. All rights reserved.
          </span>
        </div>
        <div class="col-md-6 text-center text-md-end">
          <span class="text-muted">
            Developed by <strong>Truong Thy Minh</strong> - B2205889
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style>

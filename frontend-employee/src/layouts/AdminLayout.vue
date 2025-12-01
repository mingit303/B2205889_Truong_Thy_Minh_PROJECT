<template>
  <div class="admin-layout d-flex">
    <!-- SIDEBAR -->
    <Sidebar />

    <!-- MAIN AREA -->
    <div class="main flex-grow-1 d-flex flex-column">

      <main class="p-3" style="background:#f5f7fb; min-height: calc(100vh - 56px);">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue";
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.main {
  margin-left: 240px; /* trùng width sidebar */
}
</style>

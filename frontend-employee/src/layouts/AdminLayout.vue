<template>
  <div class="admin-layout d-flex" style="min-height: 100vh;">
    <!-- SIDEBAR -->
    <Sidebar />

    <!-- MAIN AREA -->
    <div class="main flex-grow-1 d-flex flex-column">
      <main class="flex-grow-1 p-3" style="background:#f5f7fb;">
        <router-view />
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue";
import Footer from "../components/Footer.vue";
</script>

<style scoped>
.main {
  margin-left: 240px; /* trùng width sidebar */
}
</style>

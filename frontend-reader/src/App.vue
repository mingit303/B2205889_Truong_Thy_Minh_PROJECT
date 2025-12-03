<template>
  <div>
    <!-- LOGIN/REGISTER - KHÔNG CÓ SIDEBAR -->
    <div v-if="isAuthPage" class="auth-wrapper">
      <div class="container py-5" style="max-width: 450px;">
        <router-view :key="route.fullPath" />
      </div>
    </div>

    <!-- MAIN APP - CÓ SIDEBAR -->
    <div v-else style="min-height: 100vh; display: flex; flex-direction: column;">
      <div style="display: flex; flex: 1;">
        <ReaderSidebar />
        <main class="content-shift" style="flex: 1; display: flex; flex-direction: column;">
          <div style="flex: 1;">
            <router-view :key="route.fullPath" />
          </div>
          <Footer />
        </main>
      </div>
    </div>

    <!-- TOAST NOTIFICATIONS -->
    <ToastContainer />

    <!-- CONFIRM DIALOG -->
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import ReaderSidebar from "./components/Sidebar.vue";
import ToastContainer from "./components/ToastContainer.vue";
import ConfirmDialog from "./components/ConfirmDialog.vue";
import Footer from "./components/Footer.vue";

const route = useRoute();

const isAuthPage = computed(() => 
  route.path === "/login" || route.path === "/register"
);
</script>

<style>
.auth-wrapper {
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-shift {
  margin-left: 250px;
  width: calc(100% - 250px);
  padding: 20px;
}
</style>

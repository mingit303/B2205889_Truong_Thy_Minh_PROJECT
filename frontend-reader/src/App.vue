<template>
  <div class="d-flex">

    <!-- SIDEBAR -->
    <ReaderSidebar v-if="!hideSidebar" />

    <!-- MAIN CONTENT -->
    <main :class="!hideSidebar ? 'content-shift' : ''">
      <router-view />
    </main>

  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import ReaderSidebar from "./components/Sidebar.vue";

const route = useRoute();

const hideSidebar = computed(() =>
  route.path === "/login" || route.path === "/register"
);
</script>

<style>
.content-shift {
  margin-left: 250px;
  width: calc(100% - 250px);
  padding: 20px;
}
</style>

import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

// Layouts
import AuthLayout from "../layouts/AuthLayout.vue";
import AdminLayout from "../layouts/AdminLayout.vue";

// Pages
import EmployeeLogin from "../pages/auth/EmployeeLogin.vue";
import DashboardHome from "../pages/dashboard/DashboardHome.vue";

import BookPage from "../pages/books/BookPage.vue";
import AuthorPage from "../pages/authors/AuthorPage.vue";
import PublisherPage from "../pages/publishers/PublisherPage.vue";
import CategoryPage from "../pages/categories/CategoryPage.vue";
import ReaderPage from "../pages/readers/ReaderPage.vue";
import BorrowPage from "../pages/borrows/BorrowPage.vue";
import EmployeePage from "../pages/employees/EmployeePage.vue";
import StatisticsPage from "../pages/statistics/StatisticsPage.vue";
import RequestPage from "../pages/requests/RequestPage.vue";
const routes = [
  {
    path: "/login",
    component: AuthLayout,
    children: [
      {
        path: "",
        name: "login",
        component: EmployeeLogin,
        meta: { guestOnly: true },
      },
    ],
  },

  {
    path: "/",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "dashboard", component: DashboardHome },

      { path: "books", name: "books", component: BookPage },
      { path: "authors", name: "authors", component: AuthorPage },
      { path: "publishers", name: "publishers", component: PublisherPage },
      { path: "categories", name: "categories", component: CategoryPage },
      { path: "readers", name: "readers", component: ReaderPage },
      { path: "borrows", name: "borrows", component: BorrowPage },
      { path: "employees", name: "employees", component: EmployeePage },
      { path: "statistics", name: "statistics", component: StatisticsPage },
      { path: "requests", name: "requests", component: RequestPage },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: "login" });
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: "dashboard" });
  }

  next();
});

export default router;

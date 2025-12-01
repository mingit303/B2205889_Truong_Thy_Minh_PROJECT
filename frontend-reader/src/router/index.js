// import { createRouter, createWebHistory } from "vue-router";
// import { useAuthStore } from "../stores/auth";

// import AuthLayout from "../layouts/AuthLayout.vue";
// import MainLayout from "../layouts/MainLayout.vue";

// import LoginPage from "../pages/auth/LoginPage.vue";
// import RegisterPage from "../pages/auth/RegisterPage.vue";

// import HomePage from "../pages/HomePage.vue";
// import BooksPage from "../pages/BooksPage.vue";
// import BookDetail from "../pages/BookDetail.vue";
// import CartPage from "../pages/CartPage.vue";
// import BorrowRequestHistory from "../pages/BorrowRequestHistory.vue";
// import BorrowHistory from "../pages/BorrowHistory.vue";
// import ProfilePage from "../pages/ProfilePage.vue";
// import ChangePassword from "../pages/ChangePassword.vue";

// const router = createRouter({
//   history: createWebHistory(),
//   routes: [
//     // AUTH
//     {
//       path: "/auth",
//       component: AuthLayout,
//       children: [
//         { path: "login", component: LoginPage },
//         { path: "register", component: RegisterPage },
//       ],
//     },

//     // MAIN APP
//     {
//       path: "/",
//       component: MainLayout,
//       meta: { requiresAuth: true },
//       children: [
//         { path: "", component: HomePage },
//         { path: "books", component: BooksPage },
//         { path: "books/:id", component: BookDetail },
//         { path: "cart", component: CartPage },
//         { path: "my-requests", component: BorrowRequestHistory },
//         { path: "my-borrows", component: BorrowHistory },
//         { path: "profile", component: ProfilePage },
//         { path: "change-password", component: ChangePassword },
//       ],
//     },
//   ],
// });

// // Bảo vệ router
// router.beforeEach((to) => {
//   const auth = useAuthStore();

//   if (to.meta.requiresAuth && !auth.isLoggedIn)
//     return "/auth/login";
// });

// export default router;
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import LoginPage from "../pages/LoginPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";

import HomePage from "../pages/HomePage.vue";
import BooksPage from "../pages/BooksPage.vue";
import CartPage from "../pages/CartPage.vue";
import RequestsPage from "../pages/RequestsPage.vue";
import HistoryPage from "../pages/HistoryPage.vue";
import ProfilePage from "../pages/ProfilePage.vue";
import ChangePasswordPage from "../pages/ChangePasswordPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Auth
    { path: "/login", component: LoginPage },
    { path: "/register", component: RegisterPage },

    // Main
    { path: "/", component: HomePage },
    { path: "/books", component: BooksPage },
    { path: "/cart", component: CartPage },
    { path: "/requests", component: RequestsPage },
    { path: "/history", component: HistoryPage },
    { path: "/profile", component: ProfilePage },
    { path: "/change-password", component: ChangePasswordPage },
  ],
});

// Guard — bắt buộc login
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  const publicPages = ["/login", "/register"];
  const authRequired = !publicPages.includes(to.path);

  if (authRequired && !auth.isLoggedIn) return next("/login");

  next();
});

export default router;

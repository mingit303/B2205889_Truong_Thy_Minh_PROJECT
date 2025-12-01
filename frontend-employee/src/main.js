import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "./assets/main.css";

const app = createApp(App);
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'
import VueApexCharts from "vue3-apexcharts";
// JS Bootstrap (fix dropdown, modal, tooltip,…)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faShoppingCart,
  faBars,
  faBook,
  faUser,
  faRightFromBracket,
  faClockRotateLeft,
  faUserPlus,
  faEnvelope,
  faBookOpen,
  faBookmark,
  faHistory,
  faUserCircle,
  faRightToBracket,     
  faUnlockKeyhole,
  faEnvelopeOpenText,     
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faShoppingCart,
  faBars,
  faBook,
  faUser,
  faRightFromBracket,
  faClockRotateLeft,
  faUserPlus,
  faEnvelope,
  faBookOpen,
  faBookmark,
  faHistory,
  faUserCircle,
  faRightToBracket,     
  faUnlockKeyhole,
  faEnvelopeOpenText,     
);

app.component("font-awesome-icon", FontAwesomeIcon);
app.use(createPinia());
app.use(router);

app.use(VueApexCharts);

app.mount("#app");

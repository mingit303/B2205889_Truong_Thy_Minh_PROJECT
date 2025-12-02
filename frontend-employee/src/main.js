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
  faBookOpen,
  faBookOpenReader,
  faBookDead,
  faUser,
  faUsers,
  faUserTie,
  faUserCircle,
  faUserGear,
  faRightFromBracket,
  faRightToBracket,
  faClockRotateLeft,
  faUserPlus,
  faEnvelope,
  faEnvelopeOpenText,
  faBookmark,
  faHistory,
  faUnlockKeyhole,
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faCircleInfo,
  faExclamationCircle,
  faAnglesLeft,
  faAnglesRight,
  faAngleLeft,
  faAngleRight,
  faPlus,
  faPen,
  faPenNib,
  faTrash,
  faCheck,
  faXmark,
  faRotateLeft,
  faEllipsisVertical,
  faPrint,
  faFilePdf,
  faMagnifyingGlass,
  faTags,
  faBuildingColumns,
  faChartLine,
  faLock,
  faLockOpen,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faShoppingCart,
  faBars,
  faBook,
  faBookOpen,
  faBookOpenReader,
  faBookDead,
  faUser,
  faUsers,
  faUserTie,
  faUserCircle,
  faUserGear,
  faRightFromBracket,
  faRightToBracket,
  faClockRotateLeft,
  faUserPlus,
  faEnvelope,
  faEnvelopeOpenText,
  faBookmark,
  faHistory,
  faUnlockKeyhole,
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faCircleInfo,
  faExclamationCircle,
  faAnglesLeft,
  faAnglesRight,
  faAngleLeft,
  faAngleRight,
  faPlus,
  faPen,
  faPenNib,
  faTrash,
  faCheck,
  faXmark,
  faRotateLeft,
  faEllipsisVertical,
  faPrint,
  faFilePdf,
  faMagnifyingGlass,
  faTags,
  faBuildingColumns,
  faChartLine,
  faLock,
  faLockOpen,
);

app.component("font-awesome-icon", FontAwesomeIcon);
app.use(createPinia());
app.use(router);

app.use(VueApexCharts);

app.mount("#app");

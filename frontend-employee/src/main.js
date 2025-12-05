import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "./assets/main.css";

const app = createApp(App);
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'
import VueApexCharts from "vue3-apexcharts";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/el-popper.css'
import 'element-plus/theme-chalk/el-select.css'
import 'element-plus/theme-chalk/el-option.css'
import 'element-plus/theme-chalk/el-scrollbar.css'
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
  faBuilding,
  faCalendar,
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
  faIdCard,
  faBriefcase,
  faPhone,
  faLocationDot,
  faShieldHalved,
  faKey,
  faPenToSquare,
  faFloppyDisk,
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
  faIdCard,
  faBriefcase,
  faPhone,
  faLocationDot,
  faShieldHalved,
  faKey,
  faPenToSquare,
  faFloppyDisk,
  faBuilding,
  faCalendar,
);

app.component("font-awesome-icon", FontAwesomeIcon);
app.use(createPinia());
app.use(router);

app.use(VueApexCharts);

app.use(ElementPlus).mount("#app");

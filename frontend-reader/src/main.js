import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "./assets/main.css";

const app = createApp(App);
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'

// JS Bootstrap (fix dropdown, modal, tooltip,…)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faShoppingCart,
  faBars,
  faBookOpenReader,
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
  faTrash,
  faTrashCan,
  faPaperPlane,
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faCircleInfo,
  faExclamationCircle,
  faXmark,
  faCartShopping,
  faCartPlus,
  faEraser,
  faIdCard,
  faPhone,
  faLocationDot,
  faPenToSquare,
  faKey,
  faFloppyDisk,
  faAnglesLeft,
  faAnglesRight,
  faAngleLeft,
  faAngleRight,
  faUserCheck,
  faBuilding,
  faBarcode,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faShoppingCart,
  faBars,
  faBook,
  faBookOpenReader,
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
  faTrash,
  faTrashCan,
  faPaperPlane,
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faCircleInfo,
  faExclamationCircle,
  faXmark,
  faCartShopping,
  faCartPlus,
  faEraser,
  faIdCard,
  faPhone,
  faLocationDot,
  faPenToSquare,
  faKey,
  faFloppyDisk,
  faAnglesLeft,
  faAnglesRight,
  faAngleLeft,
  faAngleRight,
  faUserCheck,
  faBuilding,
  faBarcode,
);

app.component("font-awesome-icon", FontAwesomeIcon);
app.use(createPinia());
app.use(router);

import { useAuthStore } from "./stores/auth";
const auth = useAuthStore();
auth.init();

app.mount("#app");
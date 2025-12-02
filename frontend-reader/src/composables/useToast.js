import { ref } from 'vue';
import { Toast } from 'bootstrap';

const toastList = ref([]);
let idCounter = 0;

export function useToast() {
  const show = (message, type = 'info', title = null, duration = 3000) => {
    const id = ++idCounter;
    
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      title, // custom title
      visible: true
    };

    toastList.value.push(toast);

    // Auto remove after duration
    setTimeout(() => {
      remove(id);
    }, duration);

    return id;
  };

  const remove = (id) => {
    const index = toastList.value.findIndex(t => t.id === id);
    if (index > -1) {
      toastList.value.splice(index, 1);
    }
  };

  const success = (message, title = null, duration = 3000) => show(message, 'success', title, duration);
  const error = (message, title = null, duration = 3000) => show(message, 'error', title, duration);
  const warning = (message, title = null, duration = 3000) => show(message, 'warning', title, duration);
  const info = (message, title = null, duration = 3000) => show(message, 'info', title, duration);

  return {
    toastList,
    show,
    remove,
    success,
    error,
    warning,
    info
  };
}

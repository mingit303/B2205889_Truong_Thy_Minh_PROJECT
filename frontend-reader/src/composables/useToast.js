import { ref } from 'vue';
import { Toast } from 'bootstrap';

const toastList = ref([]);
let idCounter = 0;

export function useToast() {
  const show = (message, type = 'info', duration = 3000) => {
    const id = ++idCounter;
    
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
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

  const success = (message, duration) => show(message, 'success', duration);
  const error = (message, duration) => show(message, 'error', duration);
  const warning = (message, duration) => show(message, 'warning', duration);
  const info = (message, duration) => show(message, 'info', duration);

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

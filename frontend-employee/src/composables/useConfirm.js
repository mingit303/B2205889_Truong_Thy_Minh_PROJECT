import { ref } from 'vue';

const isOpen = ref(false);
const resolvePromise = ref(null);
const rejectPromise = ref(null);
const dialogData = ref({
  title: 'Xác nhận',
  message: '',
  confirmText: 'Xác nhận',
  cancelText: 'Hủy',
  type: 'danger' // 'danger', 'warning', 'primary'
});

export function useConfirm() {
  const confirm = (message, options = {}) => {
    dialogData.value = {
      title: options.title || 'Xác nhận',
      message,
      confirmText: options.confirmText || 'Xác nhận',
      cancelText: options.cancelText || 'Hủy',
      type: options.type || 'danger'
    };

    isOpen.value = true;

    return new Promise((resolve, reject) => {
      resolvePromise.value = resolve;
      rejectPromise.value = reject;
    });
  };

  const handleConfirm = () => {
    if (resolvePromise.value) {
      resolvePromise.value(true);
    }
    close();
  };

  const handleCancel = () => {
    if (rejectPromise.value) {
      rejectPromise.value(false);
    }
    close();
  };

  const close = () => {
    isOpen.value = false;
    resolvePromise.value = null;
    rejectPromise.value = null;
  };

  return {
    isOpen,
    dialogData,
    confirm,
    handleConfirm,
    handleCancel,
    close
  };
}

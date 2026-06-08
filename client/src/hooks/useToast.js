// src/hooks/useToast.js
import toast from 'react-hot-toast';

/**
 * useToast — A simple wrapper around react-hot-toast for consistent toast styling
 */
const useToast = () => {
  const success = (message) =>
    toast.success(message, {
      duration: 3000,
      style: {
        background: '#1A1A2E',
        color: '#E2E8F0',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '10px',
      },
      iconTheme: { primary: '#10B981', secondary: '#1A1A2E' },
    });

  const error = (message) =>
    toast.error(message, {
      duration: 4000,
      style: {
        background: '#1A1A2E',
        color: '#E2E8F0',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        borderRadius: '10px',
      },
      iconTheme: { primary: '#EF4444', secondary: '#1A1A2E' },
    });

  const info = (message) =>
    toast(message, {
      icon: 'ℹ️',
      duration: 3000,
      style: {
        background: '#1A1A2E',
        color: '#E2E8F0',
        border: '1px solid rgba(108, 99, 255, 0.4)',
        borderRadius: '10px',
      },
    });

  const loading = (message) =>
    toast.loading(message, {
      style: {
        background: '#1A1A2E',
        color: '#E2E8F0',
        border: '1px solid rgba(108, 99, 255, 0.2)',
        borderRadius: '10px',
      },
    });

  const dismiss = (toastId) => toast.dismiss(toastId);

  return { success, error, info, loading, dismiss };
};

export default useToast;

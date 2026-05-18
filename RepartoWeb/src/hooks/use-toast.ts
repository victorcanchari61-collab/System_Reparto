import { useToastStore } from '../store/useToastStore';

export const useToast = () => {
  const { add } = useToastStore();
  return {
    success: (msg: string) => add(msg, 'success'),
    error:   (msg: string) => add(msg, 'error'),
    warning: (msg: string) => add(msg, 'warning'),
    info:    (msg: string) => add(msg, 'info'),
  };
};

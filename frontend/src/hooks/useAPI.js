import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

/**
 * Custom hook for common API operations with error handling
 * Handles async operations, loading states, and error notifications
 */
export const useAPI = () => {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (asyncThunk, onSuccess = null, onError = null) => {
    try {
      setLoading(true);
      const result = await asyncThunk;
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error?.message || 'An error occurred';
      toast.error(errorMessage);
      
      if (onError) {
        onError(error);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeWithNotification = useCallback(
    async (asyncThunk, successMessage = 'Success!', errorMessage = 'Error occurred') => {
      try {
        setLoading(true);
        const result = await asyncThunk;
        toast.success(successMessage);
        return result;
      } catch (error) {
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    execute,
    executeWithNotification,
  };
};

export default useAPI;

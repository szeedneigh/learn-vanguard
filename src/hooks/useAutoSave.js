import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useAutoSave Hook
 *
 * Automatically saves form data to localStorage or API after a debounce delay.
 * Prevents data loss and provides save status feedback.
 *
 * @param {string} key - Storage key or API endpoint
 * @param {Object} initialData - Initial data
 * @param {Object} [options] - Configuration options
 * @param {number} [options.delay=2000] - Debounce delay in milliseconds
 * @param {'local'|'session'|'api'} [options.storage='local'] - Storage type
 * @param {Function} [options.onSave] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {boolean} [options.enabled=true] - Enable auto-save
 * @returns {Object} - Auto-save state and methods
 *
 * @example
 * const { data, setData, saveStatus, lastSaved, save, isDirty } = useAutoSave(
 *   'draft-resource',
 *   initialResource,
 *   { delay: 2000 }
 * );
 */
export function useAutoSave(key, initialData = {}, options = {}) {
  const {
    delay = 2000,
    storage = 'local',
    onSave,
    onError,
    enabled = true,
  } = options;

  const [data, setData] = useState(() => {
    // Try to restore from storage on mount
    if (storage === 'local' || storage === 'session') {
      try {
        const storageObj = storage === 'local' ? localStorage : sessionStorage;
        const saved = storageObj.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.data || initialData;
        }
      } catch (error) {
        console.error('Failed to restore auto-save data:', error);
      }
    }
    return initialData;
  });

  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const saveTimeoutRef = useRef(null);
  const initialDataRef = useRef(initialData);

  /**
   * Save data to storage
   */
  const saveToStorage = useCallback(
    async (dataToSave) => {
      if (!enabled) return false;

      setSaveStatus('saving');

      try {
        if (storage === 'local' || storage === 'session') {
          // Save to localStorage or sessionStorage
          const storageObj = storage === 'local' ? localStorage : sessionStorage;
          const payload = {
            data: dataToSave,
            timestamp: Date.now(),
            version: 1,
          };
          storageObj.setItem(key, JSON.stringify(payload));
        } else if (storage === 'api') {
          // Save to API
          const response = await fetch(key, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave),
          });

          if (!response.ok) {
            throw new Error('API save failed');
          }
        }

        setSaveStatus('saved');
        setLastSaved(new Date());
        setIsDirty(false);

        if (onSave) {
          onSave(dataToSave);
        }

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveStatus((current) => (current === 'saved' ? 'idle' : current));
        }, 2000);

        return true;
      } catch (error) {
        console.error('Auto-save error:', error);
        setSaveStatus('error');

        if (onError) {
          onError(error);
        }

        return false;
      }
    },
    [key, storage, enabled, onSave, onError]
  );

  /**
   * Manual save trigger
   */
  const save = useCallback(() => {
    // Clear pending timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    return saveToStorage(data);
  }, [data, saveToStorage]);

  /**
   * Auto-save on data change (debounced)
   */
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Check if data has changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(initialDataRef.current);
    setIsDirty(hasChanged);

    if (!enabled || !hasChanged) {
      return;
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage(data);
    }, delay);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, delay, enabled, saveToStorage]);

  /**
   * Reset to initial data
   */
  const reset = useCallback(() => {
    setData(initialDataRef.current);
    setIsDirty(false);
    setSaveStatus('idle');
  }, []);

  /**
   * Clear saved data from storage
   */
  const clear = useCallback(() => {
    try {
      if (storage === 'local' || storage === 'session') {
        const storageObj = storage === 'local' ? localStorage : sessionStorage;
        storageObj.removeItem(key);
      }
      setData(initialDataRef.current);
      setIsDirty(false);
      setSaveStatus('idle');
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear auto-save data:', error);
    }
  }, [key, storage]);

  /**
   * Update initial data reference (for when initialData changes externally)
   */
  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  return {
    data,
    setData,
    saveStatus,
    lastSaved,
    isDirty,
    save,
    reset,
    clear,
  };
}

/**
 * useFormPersistence Hook
 *
 * Simplified auto-save specifically for forms.
 * Automatically clears on successful submit.
 *
 * @param {string} formId - Unique form identifier
 * @param {Object} initialValues - Initial form values
 * @param {Object} [options] - Configuration options
 * @returns {Object} - Form persistence state
 *
 * @example
 * const { values, setValues, clearPersistedData } = useFormPersistence(
 *   'create-resource-form',
 *   { title: '', description: '' }
 * );
 */
export function useFormPersistence(formId, initialValues = {}, options = {}) {
  const {
    data: values,
    setData: setValues,
    clear: clearPersistedData,
    isDirty,
    saveStatus,
  } = useAutoSave(`form_${formId}`, initialValues, {
    delay: 1000, // Faster save for forms
    storage: 'local',
    ...options,
  });

  return {
    values,
    setValues,
    clearPersistedData,
    isDirty,
    saveStatus,
  };
}

/**
 * useUnsavedChanges Hook
 *
 * Warns users before leaving page with unsaved changes.
 *
 * @param {boolean} isDirty - Whether form has unsaved changes
 * @param {string} [message] - Custom warning message
 *
 * @example
 * useUnsavedChanges(isDirty, 'You have unsaved changes. Are you sure you want to leave?');
 */
export function useUnsavedChanges(
  isDirty,
  message = 'You have unsaved changes. Are you sure you want to leave?'
) {
  useEffect(() => {
    if (!isDirty) return;

    // Browser beforeunload event
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message]);

  // TODO: Add React Router navigation blocking when needed
  // This would require useBlocker from react-router-dom v6.4+
}

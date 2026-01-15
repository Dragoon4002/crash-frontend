'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  amount?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info', amount?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global ref for toast function
const toastRef: { current: ((message: string, type?: 'success' | 'error' | 'info', amount?: number) => void) | null } = { current: null };

export function showGlobalToast(message: string, type: 'success' | 'error' | 'info' = 'success', amount?: number) {
  if (toastRef.current) {
    toastRef.current(message, type, amount);
  }
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success', amount?: number) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, amount }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  // Use ref to avoid dependency issues
  const addToastRef = useRef(addToast);
  addToastRef.current = addToast;

  // Register global toast function once on mount
  useEffect(() => {
    toastRef.current = (message, type, amount) => addToastRef.current(message, type, amount);
    return () => {
      toastRef.current = null;
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const bgColor = toast.type === 'success'
    ? 'from-[#9B61DB] to-[#7457CC]'
    : toast.type === 'error'
    ? 'from-red-500 to-red-700'
    : 'from-blue-500 to-blue-700';

  return (
    <div
      className={`
        pointer-events-auto cursor-pointer
        bg-gradient-to-br ${bgColor}
        text-white px-5 py-4 rounded-xl shadow-2xl
        min-w-[300px] max-w-[400px]
        animate-slide-in
        border border-white/10
        backdrop-blur-sm
      `}
      onClick={() => onRemove(toast.id)}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          {toast.type === 'success' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : toast.type === 'error' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{toast.message}</p>
          {toast.amount !== undefined && (
            <p className="text-white/80 text-xs mt-1">
              +{toast.amount.toFixed(4)} MNT
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-white/60 rounded-full animate-toast-progress" />
      </div>
    </div>
  );
}

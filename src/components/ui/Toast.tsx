'use client';

import { createPortal } from 'react-dom';
import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToastItem {
  id: number;
  title: string;
  message?: string;
}

// ─── Global trigger ───────────────────────────────────────────────────────────

type ShowFn = (opts: { title: string; message?: string }) => void;
let _show: ShowFn = () => {};
export const toast = { show: (opts: { title: string; message?: string }) => _show(opts) };

// ─── Component ────────────────────────────────────────────────────────────────

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    _show = ({ title, message }) => {
      const id = Date.now();
      setItems((prev) => [...prev, { id, title, message }]);
      setTimeout(() => remove(id), 4000);
    };
  }, [remove]);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{ pointerEvents: 'auto' }}
          className="bg-white border border-zinc-200 rounded-lg px-4 py-3 shadow-lg max-w-xs animate-in fade-in slide-in-from-right-4 duration-200"
        >
          <p className="text-[13px] font-semibold text-zinc-800">{item.title}</p>
          {item.message && (
            <p className="text-[12px] text-zinc-500 mt-0.5">{item.message}</p>
          )}
        </div>
      ))}
    </div>,
    document.body,
  );
}

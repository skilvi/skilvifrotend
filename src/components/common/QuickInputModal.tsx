'use client';

import React, { useState, useEffect, useRef } from 'react';

interface QuickInputModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  defaultValue?: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function QuickInputModal({ 
  isOpen, 
  title, 
  description, 
  defaultValue = '', 
  placeholder = 'Type here...', 
  onConfirm, 
  onCancel 
}: QuickInputModalProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">{title}</h3>
          {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <input
              ref={inputRef}
              type="text"
              className="w-full border-2 border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-lg font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 dark:bg-slate-800/50 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

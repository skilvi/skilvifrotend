'use client';

import React, { useState, useEffect } from 'react';

interface CodeSandboxProps {
  template?: 'vanilla' | 'react' | 'node' | 'python' | 'c' | 'cpp' | 'java';
  height?: string;
}

export function CodeSandbox({ template = 'python', height = '500px' }: CodeSandboxProps) {
  const [lang, setLang] = useState<string>(template);

  // Initialize with proper language handler
  useEffect(() => {
    if (template) setLang(template);
  }, [template]);

  let src = '';
  // Use OneCompiler universally for all languages
  if (lang === 'vanilla' || lang === 'html') src = `https://onecompiler.com/embed/html?theme=light`;
  else if (lang === 'node') src = `https://onecompiler.com/embed/nodejs?theme=light`;
  else if (lang === 'python') src = `https://onecompiler.com/embed/python?theme=light`;
  else if (lang === 'c') src = `https://onecompiler.com/embed/c?theme=light`;
  else if (lang === 'cpp') src = `https://onecompiler.com/embed/cpp?theme=light`;
  else if (lang === 'java') src = `https://onecompiler.com/embed/java?theme=light`;
  else src = `https://onecompiler.com/embed/python?theme=light`;

  return (
    <div className="w-full flex flex-col rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl" id="ide-sandbox">
       <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest hidden sm:inline">Execution Environment</span>
                <select 
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-emerald-400 text-xs font-bold rounded-lg px-3 py-1 outline-none focus:border-emerald-500/50 transition-colors"
                >
                   <optgroup label="Multi-Language IDE" className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold">
                     <option value="python" className="bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200">Python</option>
                     <option value="node" className="bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200">Node.js</option>
                     <option value="vanilla" className="bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200">HTML/JS</option>
                     <option value="c" className="bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200">C</option>
                     <option value="cpp" className="bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200">C++</option>
                     <option value="java" className="bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200">Java</option>
                   </optgroup>
                </select>
             </div>
          </div>
          <a href={src} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 font-medium">Open Externally ↗</a>
       </div>
       <iframe
          src={src}
          style={{ width: '100%', height, border: 0, borderRadius: '0 0 12px 12px', overflow: 'hidden' }}
          title="Execution Environment"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; xr-spatial-tracking; clipboard-read; clipboard-write"
       />
    </div>
  );
}

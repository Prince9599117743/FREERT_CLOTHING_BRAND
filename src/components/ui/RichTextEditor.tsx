'use client';

import React, { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Synchronize incoming value changes to innerHTML, ensuring we do not disrupt local typing cursors
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-neutral-soft/80 flex flex-col bg-bg-luxury rounded-sm focus-within:border-fg-luxury transition-all duration-300">
      {/* Editor controls toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-neutral-soft/10 border-b border-neutral-soft/40 select-none">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="w-7 h-7 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center hover:bg-neutral-soft/30 text-fg-luxury border border-neutral-soft/20 cursor-pointer"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="w-7 h-7 text-[10px] italic font-semibold flex items-center justify-center hover:bg-neutral-soft/30 text-fg-luxury border border-neutral-soft/20 cursor-pointer"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="w-7 h-7 text-[10px] underline flex items-center justify-center hover:bg-neutral-soft/30 text-fg-luxury border border-neutral-soft/20 cursor-pointer"
          title="Underline"
        >
          U
        </button>

        <div className="w-[1px] h-4 bg-neutral-soft/40 mx-1" />

        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="h-7 px-2 text-[9px] uppercase tracking-widest flex items-center justify-center hover:bg-neutral-soft/30 text-fg-luxury border border-neutral-soft/20 cursor-pointer"
          title="Bullet List"
        >
          • Bullets
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="h-7 px-2 text-[9px] uppercase tracking-widest flex items-center justify-center hover:bg-neutral-soft/30 text-fg-luxury border border-neutral-soft/20 cursor-pointer"
          title="Numbered List"
        >
          1. Numbers
        </button>

        <div className="w-[1px] h-4 bg-neutral-soft/40 mx-1" />

        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          className="w-7 h-7 text-[10px] flex items-center justify-center hover:bg-neutral-soft/30 text-fg-luxury border border-neutral-soft/20 cursor-pointer"
          title="Align Left"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          className="w-7 h-7 text-[10px] flex items-center justify-center hover:bg-neutral-soft/30 text-fg-luxury border border-neutral-soft/20 cursor-pointer"
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          className="w-7 h-7 text-[10px] flex items-center justify-center hover:bg-neutral-soft/30 text-fg-luxury border border-neutral-soft/20 cursor-pointer"
          title="Align Right"
        >
          →
        </button>

        <div className="w-[1px] h-4 bg-neutral-soft/40 mx-1" />

        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          className="h-7 px-2 text-[9px] uppercase tracking-widest flex items-center justify-center hover:bg-neutral-soft/30 text-fg-luxury border border-neutral-soft/20 cursor-pointer"
          title="Heading"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<p>')}
          className="h-7 px-2 text-[9px] uppercase tracking-widest flex items-center justify-center hover:bg-neutral-soft/30 text-fg-luxury border border-neutral-soft/20 cursor-pointer"
          title="Paragraph text"
        >
          Para
        </button>
      </div>

      {/* Editor editing surface */}
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="p-4 min-h-[140px] focus:outline-none text-xs leading-relaxed text-left text-[#eaeaea] overflow-y-auto whitespace-normal"
        style={{ minHeight: '140px' }}
      />
    </div>
  );
};

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Table from '@editorjs/table';
import Embed from '@editorjs/embed';
import Undo from 'editorjs-undo';

/* ── Toolbar button definitions ──────────────────────────────────────── */
const TOOLBAR_BUTTONS = [
  {
    label: 'H1',
    title: 'Heading 1',
    type: 'header',
    data: { text: '', level: 1 },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <path d="M4 12h8M4 6v12M12 6v12M17 12l3-3v9" />
      </svg>
    ),
  },
  {
    label: 'H2',
    title: 'Heading 2',
    type: 'header',
    data: { text: '', level: 2 },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <path d="M4 12h8M4 6v12M12 6v12M21 18h-4c0-4 4-3 4-6 0-1.5-1-2.5-2-2.5s-2 1-2 2" />
      </svg>
    ),
  },
  {
    label: 'H3',
    title: 'Heading 3',
    type: 'header',
    data: { text: '', level: 3 },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <path d="M4 12h8M4 6v12M12 6v12M17.5 10.5c1 0 1.5.5 1.5 1s-.5 1.5-1.5 1.5H17m.5 0c1.5 0 2 .7 2 1.5S18.5 18 17 18h-1" />
      </svg>
    ),
  },
  { divider: true },
  {
    label: 'Bullet',
    title: 'Bulleted list',
    type: 'list',
    data: { style: 'unordered', items: [''] },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
        <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Numbered',
    title: 'Numbered list',
    type: 'list',
    data: { style: 'ordered', items: [''] },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
        <path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" strokeLinecap="round" />
      </svg>
    ),
  },
  { divider: true },
  {
    label: 'Quote',
    title: 'Blockquote',
    type: 'quote',
    data: { text: '', caption: '', alignment: 'left' },
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
      </svg>
    ),
  },
  {
    label: 'Code',
    title: 'Code block',
    type: 'code',
    data: { code: '' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    label: 'Table',
    title: 'Table',
    type: 'table',
    data: { withHeadings: false, content: [['', ''], ['', '']] },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="12" y1="3" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    label: 'Embed',
    title: 'Embed (YouTube, Vimeo…)',
    type: 'embed',
    data: { service: 'youtube', source: '', embed: '', width: 580, height: 320, caption: '' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3l-4 4-4-4" />
        <polygon points="10 11 16 14 10 17 10 11" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  { divider: true },
  {
    label: 'Paragraph',
    title: 'Paragraph',
    type: 'paragraph',
    data: { text: '' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <path d="M13 4v16M17 4H9.5a4.5 4.5 0 0 0 0 9H13" />
      </svg>
    ),
  },
];

/* ── Component ────────────────────────────────────────────────────────── */
const EditorJsField = forwardRef(function EditorJsField(
  { data, onChange, placeholder = 'Start writing your post…', readOnly = false },
  ref
) {
  const holderRef = useRef(null);
  const editorRef = useRef(null);
  const isReadyRef = useRef(false);
  const undoRef = useRef(null);
  const [activeType, setActiveType] = useState(null); // visual feedback

  /* Expose save / clear to parent */
  useImperativeHandle(ref, () => ({
    save: () => {
      if (!editorRef.current || !isReadyRef.current) return Promise.resolve({ blocks: [] });
      return editorRef.current.save();
    },
    clear: () => {
      if (editorRef.current && isReadyRef.current) editorRef.current.clear();
    },
  }));

  /* Insert a block programmatically */
  const insertBlock = (type, blockData) => {
    if (!editorRef.current || !isReadyRef.current) return;
    editorRef.current.blocks.insert(type, blockData);
    // brief visual highlight
    setActiveType(type + JSON.stringify(blockData));
    setTimeout(() => setActiveType(null), 300);
    // focus back into editor
    editorRef.current.focus(true);
  };

  /* Init Editor.js */
  useEffect(() => {
    if (editorRef.current) return;

    const editor = new EditorJS({
      holder: 'editorjs-holder',
      placeholder,
      readOnly,
      data: data || { blocks: [] },
      tools: {
        header: {
          class: Header,
          config: { levels: [1, 2, 3, 4], defaultLevel: 2 },
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: { defaultStyle: 'unordered' },
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: { quotePlaceholder: 'Enter a quote', captionPlaceholder: 'Author' },
        },
        code: Code,
        table: {
          class: Table,
          inlineToolbar: true,
        },
        embed: Embed,
      },
      onChange: async () => {
        if (onChange && editorRef.current && isReadyRef.current) {
          const saved = await editorRef.current.save();
          onChange(saved);
        }
      },
    });

    editorRef.current = editor;
    editor.isReady
      .then(() => { 
        isReadyRef.current = true;
        // Initialize Undo tool
        undoRef.current = new Undo({ editor });
      })
      .catch((err) => console.error('EditorJS failed to initialize:', err));

    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        try { editorRef.current.destroy(); } catch (_) { /* silent */ }
      }
      editorRef.current = null;
      isReadyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* No data-driven re-render useEffect needed because React handles remounts using the key prop */

  return (
    <div className="editorjs-container">
      {/* ── Top toolbar ── */}
      {!readOnly && (
        <div className="editorjs-toolbar" role="toolbar" aria-label="Content block toolbar">
          <span className="editorjs-toolbar__label">Insert</span>

          {TOOLBAR_BUTTONS.map((btn, i) => {
            if (btn.divider) {
              return <span key={`div-${i}`} className="editorjs-toolbar__divider" aria-hidden="true" />;
            }
            const key = btn.type + JSON.stringify(btn.data);
            return (
              <button
                key={i}
                type="button"
                title={btn.title}
                aria-label={btn.title}
                className={`editorjs-toolbar__btn${activeType === key ? ' editorjs-toolbar__btn--active' : ''}`}
                onMouseDown={(e) => {
                  // mousedown so we don't lose editor focus
                  e.preventDefault();
                  insertBlock(btn.type, btn.data);
                }}
              >
                {btn.icon}
                <span className="editorjs-toolbar__btn-label">{btn.label}</span>
              </button>
            );
          })}

          <span className="editorjs-toolbar__divider" aria-hidden="true" />
          
          <button
            type="button"
            title="Undo"
            aria-label="Undo"
            className="editorjs-toolbar__btn"
            onMouseDown={(e) => { e.preventDefault(); undoRef.current?.undo(); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
            </svg>
            <span className="editorjs-toolbar__btn-label">Undo</span>
          </button>
          
          <button
            type="button"
            title="Redo"
            aria-label="Redo"
            className="editorjs-toolbar__btn"
            onMouseDown={(e) => { e.preventDefault(); undoRef.current?.redo(); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
            </svg>
            <span className="editorjs-toolbar__btn-label">Redo</span>
          </button>
        </div>
      )}

      {/* ── Editor canvas ── */}
      <div id="editorjs-holder" className="editorjs-canvas" />
    </div>
  );
});

export default EditorJsField;

import React from 'react';
import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const TopBar = ({ title, subtitle, onToggleSidebar }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <IconButton
            onClick={onToggleSidebar}
            className="text-slate-700 hover:bg-slate-100"
            size="small"
          >
            <MenuIcon />
          </IconButton>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">{title}</p>
            {subtitle && <p className="mt-1 truncate text-sm text-slate-500 hidden sm:block">{subtitle}</p>}
          </div>
        </div>

        {/* <div className="flex w-full justify-end sm:w-auto">
          <div className="rounded-3xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
            {subtitle && <span className="hidden sm:inline">Use the menu to navigate.</span>}
          </div>
        </div> */}
      </div>
    </header>
  );
};

export default TopBar;

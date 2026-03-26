import React, { ReactNode } from 'react';
import { COLORS, EFFECTS } from '../../styles/design-tokens';
import { formatDate } from '../../utils/formatters';

interface SharedLayoutProps {
  mode: 'antibiotic' | 'contrast';
  title: string;
  subtitle: string;
  icon: string;
  searchBar: ReactNode;
  filterPanel: ReactNode;
  onSwitchMode: () => void;
  lastDatabaseUpdate: string | null;
  lastMonitoring: string | null;
  sidePanel: ReactNode;
  sidePanelOpen: boolean;
  onToggleSidePanel: () => void;
  children: ReactNode;
}

export function SharedLayout({
  mode,
  title,
  subtitle,
  icon,
  searchBar,
  filterPanel,
  onSwitchMode,
  lastDatabaseUpdate,
  lastMonitoring,
  sidePanel,
  sidePanelOpen,
  onToggleSidePanel,
  children,
}: SharedLayoutProps) {
  const theme = mode === 'antibiotic' ? COLORS.brand.antibiotic : COLORS.brand.contrast;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: COLORS.bg.main, color: COLORS.text.primary }}>
      {/* Header — glass morphism */}
      <header
        className="flex items-center gap-4 px-5 py-3 flex-shrink-0 z-30"
        style={{
          background: COLORS.bg.header,
          backdropFilter: EFFECTS.glass.backdrop,
          borderBottom: `1px solid ${COLORS.border.subtle}`,
        }}
      >
        <div className="flex items-center gap-3 mr-2">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            style={{ background: theme.gradient }}
          >
            <span className="text-lg">{icon}</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight tracking-tight">{title}</h1>
            <p className="text-[11px] text-slate-500 leading-tight font-medium">{subtitle}</p>
          </div>
        </div>

        <div className="flex-1 max-w-lg mx-4">
          {searchBar}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden lg:flex flex-col items-end mr-2 text-[10px] leading-tight font-mono">
            <span className="text-slate-400" title="검토 후 반영된 데이터베이스 최종 갱신 시점">
              DB: {formatDate(lastDatabaseUpdate)}
            </span>
            <span className="text-slate-500" title="자동 문헌 모니터링 마지막 실행 시점">
              Sync: {formatDate(lastMonitoring)}
            </span>
          </div>
          
          <button
            type="button"
            onClick={onSwitchMode}
            className="px-3 py-2 rounded-lg text-xs font-bold text-slate-200 hover:text-white transition-all hover:bg-white/5 border border-white/10"
            style={{ background: 'rgba(30, 41, 59, 0.4)' }}
          >
            {mode === 'antibiotic' ? 'CT 조영제 보기' : '항생제 보기'}
          </button>
          
          {filterPanel}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Graph Content Area */}
        <div className="flex-1 relative min-w-0">
          {children}

          {/* Toggle side panel button */}
          <button
            onClick={onToggleSidePanel}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105 shadow-lg border border-white/10"
            style={{
              background: COLORS.bg.header,
              backdropFilter: EFFECTS.glass.backdrop,
            }}
          >
            {sidePanelOpen ? '→' : '←'}
          </button>
        </div>

        {/* Side Panel Area */}
        <aside
          className="flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out shadow-2xl z-20"
          style={{
            width: sidePanelOpen ? 380 : 0,
            borderLeft: sidePanelOpen ? `1px solid ${COLORS.border.subtle}` : 'none',
            background: COLORS.bg.panel,
          }}
        >
          <div className="w-[380px] h-full">
            {sidePanel}
          </div>
        </aside>
      </main>
    </div>
  );
}

import React from 'react';
import { Home, Compass, MessageSquare, Vault, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useI18n } from '../lib/i18n';

export type Tab = 'app' | 'explore' | 'local-experiences' | 'evisa' | 'assistant';

export function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname.split('/')[1] || 'trip';
  const { t } = useI18n();

  const tabs: { id: Tab; label: string; icon: React.FC<any> }[] = [
    { id: 'app', label: t('Trip', 'Chuyến đi', 'Călătorie'), icon: Home },
    { id: 'explore', label: t('Explore', 'Khám phá', 'Explorează'), icon: Compass },
    { id: 'local-experiences', label: t('Locals', 'Địa phương', 'Locali'), icon: Users },
    { id: 'evisa', label: t('e-Visa & Forms', 'e-Visa & Mẫu Đơn', 'e-Visa & Formulare'), icon: Vault },
    { id: 'assistant', label: t('Assistant', 'Trợ lý', 'Asistent'), icon: MessageSquare },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-2 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] flex justify-center">
      <div className="flex items-center justify-around max-w-5xl w-full h-full">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPath === tab.id;
        return (
          <Link
            key={tab.id}
            to={`/${tab.id}`}
            className={cn(
              "relative flex flex-col items-center justify-center flex-1 min-w-0 h-full gap-0.5 sm:gap-1 transition-colors",
              isActive ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] sm:text-[10px] font-bold tracking-tight uppercase text-center max-w-full px-1 leading-[1.1]">{tab.label}</span>
            {tab.id === 'local-experiences' && (
              <span className="absolute max-w-[50px] top-1 right-1 translate-x-3 -translate-y-1.5 bg-amber-500 text-white text-[8px] font-black uppercase tracking-wider px-1 rounded-sm shadow-sm opacity-90">
                {t('Soon', 'Sắp có', 'Curând')}
              </span>
            )}
          </Link>
        );
      })}
      </div>
    </div>
  );
}

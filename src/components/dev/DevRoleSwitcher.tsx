import React, { useState } from 'react';
import { env } from '@/config/env';
import { DEMO_USERS } from '@/config/constants';
import { useAuth } from '@/hooks/useAuth';
import { AppRole } from '@/types/domain';
import { UserCheck, ChevronDown, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DevRoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  // Visible only when VITE_APP_ENV !== 'production'
  if (env.VITE_APP_ENV === 'production') {
    return null;
  }

  const handleSelectRole = async (targetRole: AppRole) => {
    setIsOpen(false);
    await switchDemoRole(targetRole);

    // Redirect to the appropriate portal for the role
    if (['super_admin', 'ops_manager', 'branch_staff', 'finance'].includes(targetRole)) {
      navigate('/admin');
    } else if (targetRole === 'rider') {
      navigate('/rider');
    } else if (targetRole === 'merchant') {
      navigate('/merchant');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="relative inline-block text-left z-40">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Quick Role Switcher for Phase F0 testing"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
        <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider">DEV ROLE:</span>
        <span className="font-semibold">{role || 'Guest'}</span>
        <ChevronDown className="w-3 h-3 text-amber-700" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-lg bg-surface shadow-xl border border-ink-200 py-1.5 text-ink-900 z-50 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-3 py-1.5 border-b border-ink-100 text-[11px] text-ink-600">
            Switch Demo Account (Memory/Mock)
          </div>
          {DEMO_USERS.map((demo) => {
            const isCurrent = user?.role === demo.role;
            return (
              <button
                key={demo.role}
                type="button"
                role="menuitem"
                onClick={() => handleSelectRole(demo.role)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-muted transition-colors ${
                  isCurrent ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-700'
                }`}
              >
                <div>
                  <div className="font-medium">{demo.name}</div>
                  <div className="text-[10px] text-ink-400 font-mono">{demo.email}</div>
                </div>
                {isCurrent && <UserCheck className="w-4 h-4 text-brand-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

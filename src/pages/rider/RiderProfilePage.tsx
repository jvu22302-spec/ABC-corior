import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RiderProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-ink-900">Rider Profile</h1>
        <p className="text-xs text-ink-600">Assigned vehicle & branch information</p>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center gap-3 pb-3 border-b border-ink-100">
          <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-lg">
            {user?.fullName.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-bold text-ink-900">{user?.fullName}</div>
            <div className="text-xs text-ink-600 font-mono">{user?.phone}</div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-ink-700">
          <div className="flex justify-between py-1">
            <span className="text-ink-500">Rider ID:</span>
            <span className="font-mono font-semibold">RDR-0042</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-ink-500">Vehicle Type:</span>
            <span className="font-semibold">Motorcycle (Honda 125)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-ink-500">Plate Number:</span>
            <span className="font-mono font-semibold">KHI-8942</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-ink-500">Assigned Branch:</span>
            <span className="font-semibold">Karachi Central Hub</span>
          </div>
        </div>

        <div className="pt-4 border-t border-ink-100">
          <Button
            variant="danger"
            className="w-full min-h-[44px]"
            onClick={handleSignOut}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            End Shift & Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}

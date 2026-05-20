/**
 * M3-4.C.6 — User Recovery Menu
 *
 * Dropdown menu for Resend Invite and Reset Access actions.
 */

import { RotateCcw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserRecoveryMenuProps {
  userId: string;
  userName: string;
  isActive: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
  onRecovery: () => void;
  disabled?: boolean;
}

export function UserRecoveryMenu({
  onRecovery,
  isActive,
  disabled = false,
}: UserRecoveryMenuProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onRecovery}
      disabled={disabled}
      title={isActive ? 'Resend Invite' : 'Reset Access'}
    >
      {isActive ? (
        <Mail className="h-4 w-4" />
      ) : (
        <RotateCcw className="h-4 w-4" />
      )}
    </Button>
  );
}
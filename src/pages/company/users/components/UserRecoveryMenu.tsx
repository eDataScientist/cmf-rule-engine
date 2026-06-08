/**
 * M3-4.C.6 — User Recovery Menu
 *
 * Dropdown menu for Resend Invite and Reset Access actions.
 * Each entry opens its own confirmation dialog and shows transient feedback.
 */

import { useState } from 'react';
import { RotateCcw, Mail, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Loader2 } from 'lucide-react';
import { resendCompanyUserInvite, resetCompanyUserAccess } from '@/lib/db/client-operations';

interface UserRecoveryMenuProps {
  userId: string;
  userName: string;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function UserRecoveryMenu({
  userId,
  userName,
  disabled = false,
  onSuccess,
}: UserRecoveryMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState<'resend' | 'reset' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  async function handleResend() {
    setSubmitting(true);
    setFeedback(null);

    const result = await resendCompanyUserInvite(userId);

    setSubmitting(false);
    setConfirming(null);

    if (!result.ok) {
      setFeedback({ type: 'error', message: result.error });
      return;
    }

    setFeedback({ type: 'success', message: 'Invite resent successfully.' });
    onSuccess?.();

    // Clear feedback after 3 seconds
    setTimeout(() => setFeedback(null), 3000);
  }

  async function handleReset() {
    setSubmitting(true);
    setFeedback(null);

    const result = await resetCompanyUserAccess(userId);

    setSubmitting(false);
    setConfirming(null);

    if (!result.ok) {
      setFeedback({ type: 'error', message: result.error });
      return;
    }

    setFeedback({ type: 'success', message: 'Access reset successfully.' });
    onSuccess?.();

    setTimeout(() => setFeedback(null), 3000);
  }

  return (
    <div className="relative inline-flex">
      <DropdownMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={disabled}
            title="Recovery options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        }
      >
        <DropdownMenuItem onClick={() => { setMenuOpen(false); setConfirming('resend'); }}>
          <Mail className="mr-2 h-4 w-4" />
          Resend Invite
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setMenuOpen(false); setConfirming('reset'); }}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Access
        </DropdownMenuItem>
      </DropdownMenu>

      {feedback && (
        <span
          className="absolute right-0 top-8 z-50 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium shadow-md"
          style={{
            backgroundColor: feedback.type === 'success' ? 'var(--color-status-green-bg, rgba(34, 197, 94, 0.1))' : 'var(--color-status-red-bg, rgba(239, 68, 68, 0.1))',
            color: feedback.type === 'success' ? 'var(--color-status-green)' : 'var(--color-status-red)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          {feedback.message}
        </span>
      )}

      {/* Resend Invite Confirmation Dialog */}
      <Dialog open={confirming === 'resend'} onOpenChange={() => setConfirming(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resend Invite</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to resend the invitation email to {userName}?
          </DialogDescription>

          {feedback?.type === 'error' && !submitting && (
            <p className="text-sm" style={{ color: 'var(--color-status-red)' }}>
              {feedback.message}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirming(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleResend} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Access Confirmation Dialog */}
      <Dialog open={confirming === 'reset'} onOpenChange={() => setConfirming(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Access</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to reset access for {userName}? This will revoke their current sessions and force a fresh sign-in.
          </DialogDescription>

          {feedback?.type === 'error' && !submitting && (
            <p className="text-sm" style={{ color: 'var(--color-status-red)' }}>
              {feedback.message}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirming(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleReset} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

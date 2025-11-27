import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Network, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TreeActionsMenuProps {
  treeId: string;
  onVisualize: (id: string) => void;
  onViewStructure: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function TreeActionsMenu({
  treeId,
  onVisualize,
  onViewStructure,
  onDelete,
  isDeleting
}: TreeActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowConfirm(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleDelete = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    onDelete(treeId);
    setIsOpen(false);
    setShowConfirm(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-48 rounded-md shadow-lg border z-50"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="py-1">
            {!showConfirm ? (
              <>
                <button
                  onClick={() => {
                    onVisualize(treeId);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-800/50 transition-colors"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  <Eye className="h-4 w-4" />
                  Visualize
                </button>
                <button
                  onClick={() => {
                    onViewStructure(treeId);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-800/50 transition-colors"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  <Network className="h-4 w-4" />
                  View Structure
                </button>
                <div
                  className="my-1"
                  style={{ height: '1px', backgroundColor: 'var(--color-border)' }}
                />
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-900/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </>
            ) : (
              <>
                <div className="px-4 py-3">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                    Delete this tree?
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-2 px-4 py-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

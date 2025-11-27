interface TreeStatusDotProps {
  status: 'active' | 'inactive';
}

export function TreeStatusDot({ status }: TreeStatusDotProps) {
  return (
    <div
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{
        backgroundColor: status === 'active' ? '#10b981' : '#6b7280'
      }}
    />
  );
}

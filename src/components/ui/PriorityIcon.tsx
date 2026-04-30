import type { Priority } from '@/stores/useActionItemsStore';

const STRIPES: Record<Priority, { count: number; color: string }> = {
  High:   { count: 3, color: 'bg-red-500' },
  Medium: { count: 2, color: 'bg-yellow-400' },
  Low:    { count: 1, color: 'bg-blue-400' },
};

export function PriorityIcon({ priority }: { priority: Priority }) {
  const { count, color } = STRIPES[priority];
  return (
    <span className="inline-flex flex-col gap-0.5 flex-shrink-0" style={{ verticalAlign: 'middle' }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`block rounded-sm ${color}`} style={{ height: 2, width: 14 }} />
      ))}
    </span>
  );
}

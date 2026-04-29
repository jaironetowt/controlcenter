import { IconCalendar } from '@tabler/icons-react';

const events = [
  { date: 'Apr 30', label: 'Sprint demo', urgent: true },
  { date: 'May 5',  label: 'Stakeholder review', urgent: false },
  { date: 'May 15', label: 'Q2 Milestone', urgent: false },
  { date: 'May 20', label: 'Kickoff — Client X', urgent: false },
];

export function Upcoming() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <IconCalendar size={15} className="text-zinc-400" />
        <span className="text-[12px] font-semibold text-zinc-700">Upcoming</span>
      </div>
      <ul className="flex flex-col gap-2">
        {events.map((ev) => (
          <li key={ev.label} className="flex items-start gap-3">
            <span className={`text-[11px] font-medium w-12 flex-shrink-0 pt-px ${ev.urgent ? 'text-red-500' : 'text-zinc-400'}`}>
              {ev.date}
            </span>
            <span className="text-[12px] text-zinc-700 leading-tight">{ev.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

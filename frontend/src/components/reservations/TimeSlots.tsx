interface TimeSlotsProps {
  slots: string[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
}

export function TimeSlots({ slots, selectedSlot, onSelect }: TimeSlotsProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSelect(slot)}
          className={`
            py-3 px-2 border font-mono text-sm transition-all
            ${selectedSlot === slot
              ? 'bg-rockstar-yellow border-rockstar-yellow text-black font-bold'
              : 'bg-transparent border-white/20 text-white hover:border-white'}
          `}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}
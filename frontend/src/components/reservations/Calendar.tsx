import { addDays, format, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

export function Calendar({ selectedDate, onSelect }: CalendarProps) {
  const today = startOfToday();
  const days = Array.from({ length: 7 }).map((_, i) => addDays(today, i));

  return (
    <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
      {days.map((day) => {
        const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

        return (
          <button
            key={day.toString()}
            onClick={() => onSelect(day)}
            className={`
              p-4 border text-center transition-all
              ${isSelected 
                ? 'bg-white text-black border-white' 
                : 'bg-transparent border-white/20 text-white/70 hover:border-white hover:text-white'}
            `}
          >
            <span className="block font-gta text-sm opacity-60 mb-1">
              {format(day, 'EEE', { locale: es })}
            </span>
            <span className="block font-gta text-2xl">
              {format(day, 'd')}
            </span>
          </button>
        );
      })}
    </div>
  );
}
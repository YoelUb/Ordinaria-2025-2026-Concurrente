interface Service {
  id: string;
  name: string;
  desc: string;
}

export function ServiceCard({ service, onSelect, isSelected }: { service: Service, onSelect: () => void, isSelected: boolean }) {
  return (
    <div
      onClick={onSelect}
      className={`
        cursor-pointer p-6 border transition-all duration-300
        ${isSelected 
          ? 'bg-rockstar-yellow border-rockstar-yellow text-black' 
          : 'bg-black/40 border-white/20 text-white hover:border-white hover:bg-black/60'}
      `}
    >
      <h3 className="font-gta text-3xl mb-2">{service.name}</h3>
      <p className={`text-sm ${isSelected ? 'text-black/80' : 'text-white/60'}`}>
        {service.desc}
      </p>
    </div>
  );
}
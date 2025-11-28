import { House } from '@/types/energy';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface HouseStatusGridProps {
  houses: House[];
  maxItems?: number;
}

export const HouseStatusGrid = ({ houses, maxItems }: HouseStatusGridProps) => {
  const navigate = useNavigate();
  const displayHouses = maxItems ? houses.slice(0, maxItems) : houses;

  return (
    <div className="grid grid-cols-10 gap-1.5">
      {displayHouses.map((house) => (
        <button
          key={house.id}
          onClick={() => navigate(`/houses/${house.id}`)}
          className={cn(
            "aspect-square rounded-md transition-all duration-200 hover:scale-110 relative group",
            house.status === 'online' && "bg-energy-green/80 hover:bg-energy-green",
            house.status === 'warning' && "bg-energy-yellow/80 hover:bg-energy-yellow animate-pulse",
            house.status === 'offline' && "bg-energy-red/80 hover:bg-energy-red"
          )}
          title={`${house.name} - ${house.status}`}
        >
          <div className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/10" />
          <span className="sr-only">{house.name}</span>
        </button>
      ))}
    </div>
  );
};

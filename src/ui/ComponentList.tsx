import { Component } from '../domain/model/types';

interface ComponentListProps {
  components: Component[];
  onSelect: (id: string) => void;
}

export function ComponentList({ components, onSelect }: ComponentListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {components.map((comp) => (
        <div
          key={comp.id}
          className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700"
          onClick={() => onSelect(comp.id)}
        >
          <h3 className="font-bold">{comp.brand} {comp.model}</h3>
          <p>{comp.type}</p>
          <p className="text-sm text-gray-400">{comp.specs.type}</p>
        </div>
      ))}
    </div>
  );
}

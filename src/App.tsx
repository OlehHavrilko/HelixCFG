import { useEffect, useState } from 'react';
import { useAppStore } from './app/store';
import { ComponentList } from './ui/ComponentList';
import { BuildSummary } from './ui/BuildSummary';
import { PCScene } from './three/PCScene';
import catalogData from './data/catalog.json';
import pricesData from './data/prices.json';
import presetsData from './data/presets.json';
import { ComponentType } from './domain/model/types';

function App() {
  const { setComponents, setPrices, setPresets, selectComponent, getAvailableComponents } = useAppStore();
  const [selectedType, setSelectedType] = useState<ComponentType>('CPU');

  useEffect(() => {
    setComponents(catalogData.catalog.items as any);
    setPrices(pricesData.prices.items as any);
    setPresets(presetsData.presets.items as any);
  }, [setComponents, setPrices, setPresets]);

  const components = getAvailableComponents(selectedType);

  const handleSelect = (id: string) => {
    if (selectedType === 'RAM' || selectedType === 'Storage') {
      // For arrays, add to array
      selectComponent(selectedType.toLowerCase() as any, [id]);
    } else {
      selectComponent(selectedType.toLowerCase() as any, id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4">
        <h1 className="text-2xl font-bold">HelixCFG - 3D PC Configurator</h1>
      </header>
      <main className="flex">
        <div className="w-1/4 p-4 bg-gray-800">
          <h2 className="text-lg font-bold mb-4">Steps</h2>
          <div className="space-y-2">
            {(['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'Cooler', 'Case', 'PSU'] as ComponentType[]).map((type) => (
              <button
                key={type}
                className={`block w-full text-left p-2 rounded ${selectedType === type ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4">
          <h2 className="text-xl font-bold mb-4">Select {selectedType}</h2>
          <ComponentList components={components} onSelect={handleSelect} />
        </div>
        <div className="w-1/3 p-4">
          <BuildSummary />
        </div>
      </main>
    </div>
  );
}

export default App;

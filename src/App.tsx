import { useEffect, useState } from 'react';
import { useAppStore } from './app/store';
import { ComponentList } from './ui/ComponentList';
import { BuildSummary } from './ui/BuildSummary';
import { PCScene } from './three/PCScene';
import catalogData from './data/catalog.json';
import pricesData from './data/prices.json';
import presetsData from './data/presets.json';
import { ComponentType } from './domain/model/types';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface AppError {
  message: string;
  code?: string;
}

function App() {
  const { setComponents, setPrices, setPresets, selectComponent, getAvailableComponents } = useAppStore();
  const [selectedType, setSelectedType] = useState<ComponentType>('CPU');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<AppError | null>(null);
  const [selectedRAM, setSelectedRAM] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoadingState('loading');
        setError(null);

        // Simulate async data loading
        await Promise.all([
          new Promise(resolve => setTimeout(resolve, 500)),
          setComponents(catalogData.catalog.items),
          setPrices(pricesData.prices.items),
          setPresets(presetsData.presets.items),
        ]);

        setLoadingState('success');
      } catch (err) {
        const appError: AppError = {
          message: err instanceof Error ? err.message : 'Failed to load application data',
          code: 'DATA_LOAD_ERROR',
        };
        setError(appError);
        setLoadingState('error');
      }
    };

    initializeData();
  }, [setComponents, setPrices, setPresets]);

  const components = getAvailableComponents(selectedType);

  const handleSelect = (id: string) => {
    try {
      if (selectedType === 'RAM') {
        // Handle multiple RAM selection
        const newSelection = selectedRAM.includes(id) 
          ? selectedRAM.filter(ramId => ramId !== id)
          : [...selectedRAM, id];
        
        setSelectedRAM(newSelection);
        selectComponent('ram', newSelection);
      } else if (selectedType === 'Storage') {
        // Handle multiple Storage selection
        const newSelection = selectedStorage.includes(id)
          ? selectedStorage.filter(storageId => storageId !== id)
          : [...selectedStorage, id];
        
        setSelectedStorage(newSelection);
        selectComponent('storage', newSelection);
      } else {
        // Handle single component selection
        const componentKey = selectedType.toLowerCase() as 'cpu' | 'gpu' | 'motherboard' | 'cooler' | 'case' | 'psu';
        selectComponent(componentKey, id);
      }
    } catch (err) {
      setError({
        message: `Failed to select component: ${err instanceof Error ? err.message : 'Unknown error'}`,
        code: 'COMPONENT_SELECT_ERROR',
      });
    }
  };

  const handleRetry = () => {
    setLoadingState('idle');
    setError(null);
    // Trigger re-initialization
    window.location.reload();
  };

  const clearError = () => {
    setError(null);
  };

  if (loadingState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading HelixCFG...</h2>
          <p className="text-gray-400 mt-2">Initializing PC configurator</p>
        </div>
      </div>
    );
  }

  if (loadingState === 'error' && error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Initialization Error</h2>
          <p className="text-gray-300 mb-6">{error.message}</p>
          {error.code && (
            <p className="text-gray-500 text-sm mb-6">Error code: {error.code}</p>
          )}
          <div className="space-x-4">
            <button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
            <button
              onClick={clearError}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">HelixCFG - 3D PC Configurator</h1>
          {error && (
            <div className="flex items-center space-x-4">
              <span className="text-red-400 text-sm">{error.message}</span>
              <button
                onClick={clearError}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex">
        <aside className="w-1/4 p-4 bg-gray-800 border-r border-gray-700">
          <h2 className="text-lg font-bold mb-4">Components</h2>
          <div className="space-y-2">
            {(['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'Cooler', 'Case', 'PSU'] as ComponentType[]).map((type) => {
              const isSelected = selectedType === type;
              const isMultiSelect = type === 'RAM' || type === 'Storage';
              const selectionCount = isMultiSelect 
                ? (type === 'RAM' ? selectedRAM.length : selectedStorage.length)
                : 0;
              
              return (
                <button
                  key={type}
                  className={`block w-full text-left p-3 rounded transition-all ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                  onClick={() => setSelectedType(type)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{type}</span>
                    {isMultiSelect && selectionCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {selectionCount}
                      </span>
                    )}
                  </div>
                  {isMultiSelect && (
                    <div className="text-xs text-gray-400 mt-1">
                      Click to add/remove multiple items
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <h3 className="font-semibold mb-2">Tips</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• CPU and motherboard sockets must match</li>
              <li>• Check GPU length vs case size</li>
              <li>• Ensure PSU wattage is sufficient</li>
              <li>• RAM type must match motherboard</li>
            </ul>
          </div>
        </aside>
        
        <section className="flex-1 p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Select {selectedType}</h2>
            <p className="text-gray-400 text-sm">
              {selectedType === 'RAM' || selectedType === 'Storage' 
                ? 'Click components to add/remove them from your build'
                : 'Click a component to select it for your build'
              }
            </p>
          </div>
          <ComponentList components={components} onSelect={handleSelect} />
        </section>
        
        <aside className="w-1/3 p-4 bg-gray-800 border-l border-gray-700">
          <BuildSummary />
        </aside>
      </main>
    </div>
  );
}

export default App;

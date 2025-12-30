import { Component, Build, CpuSpecs, GpuSpecs, MotherboardSpecs, RamSpecs, StorageSpecs, CoolerSpecs, CaseSpecs, PsuSpecs } from '../domain/model/types';

// Factory functions for creating test data
export function createCPU(overrides: Partial<CpuSpecs> & { id?: string; brand?: string; model?: string } = {}): Component {
  const defaults: CpuSpecs = {
    type: 'CPU',
    socket: 'LGA1700',
    cores: 8,
    threads: 16,
    baseClock: 3.5,
    boostClock: 5.0,
    tdpW: 125,
    integratedGraphics: false,
  };

  return {
    id: overrides.id || 'cpu-test',
    type: 'CPU',
    brand: overrides.brand || 'TestBrand',
    model: overrides.model || 'TestCPU',
    specs: { ...defaults, ...overrides } as CpuSpecs,
  };
}

export function createGPU(overrides: Partial<GpuSpecs> & { id?: string; brand?: string; model?: string } = {}): Component {
  const defaults: GpuSpecs = {
    type: 'GPU',
    vramGB: 8,
    interface: 'PCIe 4.0 x16',
    lengthMm: 300,
    widthMm: 120,
    heightMm: 40,
    tdpW: 200,
  };

  return {
    id: overrides.id || 'gpu-test',
    type: 'GPU',
    brand: overrides.brand || 'TestBrand',
    model: overrides.model || 'TestGPU',
    specs: { ...defaults, ...overrides } as GpuSpecs,
  };
}

export function createMotherboard(overrides: Partial<MotherboardSpecs> & { id?: string; brand?: string; model?: string } = {}): Component {
  const defaults: MotherboardSpecs = {
    type: 'Motherboard',
    socket: 'LGA1700',
    formFactor: 'ATX',
    ramSlots: 4,
    ramType: 'DDR5',
    maxRamGB: 128,
    chipset: 'Z790',
    pcieSlots: 3,
  };

  return {
    id: overrides.id || 'mb-test',
    type: 'Motherboard',
    brand: overrides.brand || 'TestBrand',
    model: overrides.model || 'TestMB',
    specs: { ...defaults, ...overrides } as MotherboardSpecs,
  };
}

export function createRAM(overrides: Partial<RamSpecs> & { id?: string; brand?: string; model?: string } = {}): Component {
  const defaults: RamSpecs = {
    type: 'RAM',
    ramType: 'DDR5',
    speed: 5600,
    capacityGB: 16,
    sticks: 1,
  };

  return {
    id: overrides.id || 'ram-test',
    type: 'RAM',
    brand: overrides.brand || 'TestBrand',
    model: overrides.model || 'TestRAM',
    specs: { ...defaults, ...overrides } as RamSpecs,
  };
}

export function createStorage(overrides: Partial<StorageSpecs> & { id?: string; brand?: string; model?: string } = {}): Component {
  const defaults: StorageSpecs = {
    type: 'Storage',
    storageType: 'SSD',
    capacityGB: 1000,
    interface: 'NVMe',
  };

  return {
    id: overrides.id || 'storage-test',
    type: 'Storage',
    brand: overrides.brand || 'TestBrand',
    model: overrides.model || 'TestStorage',
    specs: { ...defaults, ...overrides } as StorageSpecs,
  };
}

export function createCooler(overrides: Partial<CoolerSpecs> & { id?: string; brand?: string; model?: string } = {}): Component {
  const defaults: CoolerSpecs = {
    type: 'Cooler',
    coolerType: 'air',
    socketCompatibility: ['LGA1700', 'AM4', 'AM5'],
    tdpW: 150,
  };

  return {
    id: overrides.id || 'cooler-test',
    type: 'Cooler',
    brand: overrides.brand || 'TestBrand',
    model: overrides.model || 'TestCooler',
    specs: { ...defaults, ...overrides } as CoolerSpecs,
  };
}

export function createCase(overrides: Partial<CaseSpecs> & { id?: string; brand?: string; model?: string } = {}): Component {
  const defaults: CaseSpecs = {
    type: 'Case',
    formFactorCompatibility: ['ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 350,
    maxCpuCoolerHeightMm: 170,
  };

  return {
    id: overrides.id || 'case-test',
    type: 'Case',
    brand: overrides.brand || 'TestBrand',
    model: overrides.model || 'TestCase',
    specs: { ...defaults, ...overrides } as CaseSpecs,
  };
}

export function createPSU(overrides: Partial<PsuSpecs> & { id?: string; brand?: string; model?: string } = {}): Component {
  const defaults: PsuSpecs = {
    type: 'PSU',
    wattage: 750,
    efficiency: '80+ Gold',
    modular: true,
  };

  return {
    id: overrides.id || 'psu-test',
    type: 'PSU',
    brand: overrides.brand || 'TestBrand',
    model: overrides.model || 'TestPSU',
    specs: { ...defaults, ...overrides } as PsuSpecs,
  };
}

export function createBuild(overrides: Partial<Build> = {}): Build {
  const defaults: Build = {
    ram: [],
    storage: [],
    meta: {
      target: 'gaming',
      budget: 1500,
    },
  };

  return { ...defaults, ...overrides };
}

// Helper function to create a complete compatible build
export function createCompatibleBuild(): { build: Build; components: Component[] } {
  const cpu = createCPU({ socket: 'LGA1700', tdpW: 125 });
  const motherboard = createMotherboard({ socket: 'LGA1700', ramType: 'DDR5' });
  const gpu = createGPU({ lengthMm: 300, tdpW: 200 });
  const ram1 = createRAM({ id: 'ram-1', ramType: 'DDR5', capacityGB: 16 });
  const ram2 = createRAM({ id: 'ram-2', ramType: 'DDR5', capacityGB: 16 });
  const case_ = createCase({ maxGpuLengthMm: 350 });
  const psu = createPSU({ wattage: 750 });
  const cooler = createCooler({ socketCompatibility: ['LGA1700'] });
  const storage = createStorage();

  const build = createBuild({
    cpu: cpu.id,
    gpu: gpu.id,
    motherboard: motherboard.id,
    case: case_.id,
    psu: psu.id,
    cooler: cooler.id,
    ram: [ram1.id, ram2.id],
    storage: [storage.id],
  });

  return {
    build,
    components: [cpu, motherboard, gpu, ram1, ram2, case_, psu, cooler, storage],
  };
}

// Helper function to create incompatible builds for testing
export function createIncompatibleBuilds(): Array<{ description: string; build: Build; components: Component[] }> {
  const compatible = createCompatibleBuild();
  
  return [
    {
      description: 'CPU-Motherboard socket mismatch',
      build: { ...compatible.build, cpu: createCPU({ id: 'cpu-am5', socket: 'AM5' }).id },
      components: [...compatible.components, createCPU({ id: 'cpu-am5', socket: 'AM5' })],
    },
    {
      description: 'RAM type mismatch',
      build: compatible.build,
      components: [
        ...compatible.components.filter(c => c.type !== 'RAM'),
        createRAM({ id: 'ram-ddr4', ramType: 'DDR4' }),
      ],
    },
    {
      description: 'GPU too long for case',
      build: compatible.build,
      components: [
        ...compatible.components.filter(c => c.type !== 'GPU'),
        createGPU({ id: 'gpu-long', lengthMm: 400 }),
      ],
    },
    {
      description: 'PSU insufficient wattage',
      build: compatible.build,
      components: [
        ...compatible.components.filter(c => c.type !== 'PSU'),
        createPSU({ id: 'psu-weak', wattage: 400 }),
      ],
    },
    {
      description: 'Too many RAM sticks',
      build: { ...compatible.build, ram: ['ram-1', 'ram-2', 'ram-3', 'ram-4', 'ram-5'] },
      components: [
        ...compatible.components.filter(c => c.type !== 'RAM'),
        createRAM({ id: 'ram-1' }),
        createRAM({ id: 'ram-2' }),
        createRAM({ id: 'ram-3' }),
        createRAM({ id: 'ram-4' }),
        createRAM({ id: 'ram-5' }),
      ],
    },
    {
      description: 'Cooler socket incompatibility',
      build: compatible.build,
      components: [
        ...compatible.components.filter(c => c.type !== 'Cooler'),
        createCooler({ id: 'cooler-am4', socketCompatibility: ['AM4'] }),
      ],
    },
  ];
}

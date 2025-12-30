import { Build, Component, CpuSpecs, GpuSpecs, MotherboardSpecs, RamSpecs, StorageSpecs, CoolerSpecs, CaseSpecs, PsuSpecs } from '../model/types';

// Type Guards
export function isCPU(specs: any): specs is CpuSpecs {
  return specs?.type === 'CPU';
}

export function isGPU(specs: any): specs is GpuSpecs {
  return specs?.type === 'GPU';
}

export function isMotherboard(specs: any): specs is MotherboardSpecs {
  return specs?.type === 'Motherboard';
}

export function isRAM(specs: any): specs is RamSpecs {
  return specs?.type === 'RAM';
}

export function isStorage(specs: any): specs is StorageSpecs {
  return specs?.type === 'Storage';
}

export function isCooler(specs: any): specs is CoolerSpecs {
  return specs?.type === 'Cooler';
}

export function isCase(specs: any): specs is CaseSpecs {
  return specs?.type === 'Case';
}

export function isPSU(specs: any): specs is PsuSpecs {
  return specs?.type === 'PSU';
}

// Component getters with type safety
export function getCPU(build: Build, components: Component[]): (Component & { specs: CpuSpecs }) | null {
  if (!build.cpu) return null;
  const cpu = components.find(c => c.id === build.cpu);
  if (!cpu || !isCPU(cpu.specs)) return null;
  return cpu as Component & { specs: CpuSpecs };
}

export function getGPU(build: Build, components: Component[]): (Component & { specs: GpuSpecs }) | null {
  if (!build.gpu) return null;
  const gpu = components.find(c => c.id === build.gpu);
  if (!gpu || !isGPU(gpu.specs)) return null;
  return gpu as Component & { specs: GpuSpecs };
}

export function getMotherboard(build: Build, components: Component[]): (Component & { specs: MotherboardSpecs }) | null {
  if (!build.motherboard) return null;
  const motherboard = components.find(c => c.id === build.motherboard);
  if (!motherboard || !isMotherboard(motherboard.specs)) return null;
  return motherboard as Component & { specs: MotherboardSpecs };
}

export function getRAM(build: Build, components: Component[]): (Component & { specs: RamSpecs })[] {
  return build.ram
    .map(id => components.find(c => c.id === id))
    .filter((ram): ram is Component & { specs: RamSpecs } => ram !== undefined && isRAM(ram.specs));
}

export function getStorage(build: Build, components: Component[]): (Component & { specs: StorageSpecs })[] {
  return build.storage
    .map(id => components.find(c => c.id === id))
    .filter((storage): storage is Component & { specs: StorageSpecs } => storage !== undefined && isStorage(storage.specs));
}

export function getCooler(build: Build, components: Component[]): (Component & { specs: CoolerSpecs }) | null {
  if (!build.cooler) return null;
  const cooler = components.find(c => c.id === build.cooler);
  if (!cooler || !isCooler(cooler.specs)) return null;
  return cooler as Component & { specs: CoolerSpecs };
}

export function getCase(build: Build, components: Component[]): (Component & { specs: CaseSpecs }) | null {
  if (!build.case) return null;
  const case_ = components.find(c => c.id === build.case);
  if (!case_ || !isCase(case_.specs)) return null;
  return case_ as Component & { specs: CaseSpecs };
}

export function getPSU(build: Build, components: Component[]): (Component & { specs: PsuSpecs }) | null {
  if (!build.psu) return null;
  const psu = components.find(c => c.id === build.psu);
  if (!psu || !isPSU(psu.specs)) return null;
  return psu as Component & { specs: PsuSpecs };
}

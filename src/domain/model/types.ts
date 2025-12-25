export type ComponentType = 'CPU' | 'GPU' | 'Motherboard' | 'RAM' | 'Storage' | 'Cooler' | 'Case' | 'PSU';

export type Currency = 'UAH' | 'USD';

export type Target = 'gaming' | 'work' | 'mixed';

export type Severity = 'error' | 'warning' | 'info';

export interface Component {
  id: string;
  type: ComponentType;
  brand: string;
  model: string;
  specs: ComponentSpecs;
  dimensions?: Dimensions;
  tags?: string[];
}

export interface Dimensions {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
}

export type ComponentSpecs =
  | CpuSpecs
  | GpuSpecs
  | MotherboardSpecs
  | RamSpecs
  | StorageSpecs
  | CoolerSpecs
  | CaseSpecs
  | PsuSpecs;

export interface CpuSpecs {
  type: 'CPU';
  socket: string;
  cores: number;
  threads: number;
  baseClock: number; // GHz
  boostClock: number; // GHz
  tdpW: number;
  integratedGraphics?: boolean;
}

export interface GpuSpecs {
  type: 'GPU';
  vramGB: number;
  interface: string; // e.g., PCIe 4.0 x16
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  tdpW: number;
}

export interface MotherboardSpecs {
  type: 'Motherboard';
  socket: string;
  formFactor: string; // e.g., ATX, Micro-ATX
  ramSlots: number;
  ramType: string; // e.g., DDR4, DDR5
  maxRamGB: number;
  chipset: string;
  pcieSlots: number;
}

export interface RamSpecs {
  type: 'RAM';
  ramType: string; // DDR4, DDR5
  speed: number; // MHz
  capacityGB: number;
  sticks: number; // always 1 for individual sticks
}

export interface StorageSpecs {
  type: 'Storage';
  storageType: 'SSD' | 'HDD';
  capacityGB: number;
  interface: string; // e.g., SATA, NVMe
}

export interface CoolerSpecs {
  type: 'Cooler';
  coolerType: 'air' | 'liquid';
  socketCompatibility: string[]; // list of supported sockets
  tdpW: number;
}

export interface CaseSpecs {
  type: 'Case';
  formFactorCompatibility: string[]; // list of supported form factors
  maxGpuLengthMm: number;
  maxCpuCoolerHeightMm: number;
}

export interface PsuSpecs {
  type: 'PSU';
  wattage: number;
  efficiency: string; // e.g., 80+ Bronze
  modular: boolean;
}

export interface Build {
  cpu?: string;
  gpu?: string;
  motherboard?: string;
  cooler?: string;
  case?: string;
  psu?: string;
  ram: string[]; // up to 4
  storage: string[]; // up to 6
  meta: {
    target: Target;
    budget?: number;
  };
}

export interface Price {
  componentId: string;
  value: number;
  currency: Currency;
  source: 'average' | 'manual';
  updatedAt: string; // ISO date
}

export interface RuleResult {
  code: string;
  severity: Severity;
  message: string;
  reason: string;
  affectedIds: string[];
}

export interface Recommendation {
  reasonCode: string;
  message: string;
  replaceId: string;
  alternatives: string[];
  expectedEffect: string;
}

export interface LineItem {
  componentId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  currency: Currency;
}

export interface Fitment {
  componentId: string;
  position: string; // e.g., 'slot1', 'gpu-slot'
  conflicts: string[]; // ids of conflicting parts
}

export interface BuildReport {
  totalPrice: number;
  lineItems: LineItem[];
  errors: RuleResult[];
  warnings: RuleResult[];
  recommendations: Recommendation[];
  summary: string;
  fitment?: Fitment[];
}

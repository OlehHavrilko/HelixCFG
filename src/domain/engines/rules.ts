import { CompatibilityRule } from './ruleEngine';
import { Build, Component, RuleResult } from '../model/types';
import { getCPU, getMotherboard, getRAM, getGPU, getCase, getPSU, getCooler, getStorage } from '../utils/typeGuards';

// Socket Compatibility Rule
export const socketCompatibilityRule: CompatibilityRule = {
  id: 'cpu-socket-match',
  name: 'CPU Socket Compatibility',
  check: (build: Build, components: Component[]): RuleResult | null => {
    const cpu = getCPU(build, components);
    const motherboard = getMotherboard(build, components);
    
    if (!cpu || !motherboard) return null;
    
    if (cpu.specs.socket !== motherboard.specs.socket) {
      return {
        code: 'cpu-socket-mismatch',
        severity: 'error',
        message: `CPU socket ${cpu.specs.socket} ≠ MB socket ${motherboard.specs.socket}`,
        reason: 'Physical incompatibility - CPU and motherboard must have compatible sockets',
        affectedIds: [cpu.id, motherboard.id],
      };
    }
    return null;
  },
  priority: 100,
  category: 'compatibility',
  enabled: true,
};

// RAM Type Compatibility Rule
export const ramTypeCompatibilityRule: CompatibilityRule = {
  id: 'ram-type-match',
  name: 'RAM Type Compatibility',
  check: (build: Build, components: Component[]): RuleResult | null => {
    const motherboard = getMotherboard(build, components);
    const rams = getRAM(build, components);
    
    if (!motherboard || rams.length === 0) return null;
    
    const incompatibleRams = rams.filter(ram => ram.specs.ramType !== motherboard.specs.ramType);
    if (incompatibleRams.length > 0) {
      return {
        code: 'ram-type-mismatch',
        severity: 'error',
        message: `RAM type incompatible with motherboard DDR type ${motherboard.specs.ramType}`,
        reason: 'RAM must be compatible with motherboard DDR generation',
        affectedIds: [motherboard.id, ...incompatibleRams.map(r => r.id)],
      };
    }
    return null;
  },
  priority: 95,
  category: 'compatibility',
  enabled: true,
};

// Motherboard Form Factor Rule
export const formFactorCompatibilityRule: CompatibilityRule = {
  id: 'form-factor-match',
  name: 'Motherboard Form Factor Compatibility',
  check: (build: Build, components: Component[]): RuleResult | null => {
    const motherboard = getMotherboard(build, components);
    const case_ = getCase(build, components);
    
    if (!motherboard || !case_) return null;
    
    if (!case_.specs.formFactorCompatibility.includes(motherboard.specs.formFactor)) {
      return {
        code: 'form-factor-incompatible',
        severity: 'error',
        message: `Motherboard form factor ${motherboard.specs.formFactor} not supported by case`,
        reason: 'Case must support the motherboard form factor',
        affectedIds: [motherboard.id, case_.id],
      };
    }
    return null;
  },
  priority: 90,
  category: 'compatibility',
  enabled: true,
};

// GPU Length Compatibility Rule
export const gpuLengthCompatibilityRule: CompatibilityRule = {
  id: 'gpu-length-fit',
  name: 'GPU Length Compatibility',
  check: (build: Build, components: Component[]): RuleResult | null => {
    const gpu = getGPU(build, components);
    const case_ = getCase(build, components);
    
    if (!gpu || !case_) return null;
    
    if (gpu.specs.lengthMm > case_.specs.maxGpuLengthMm) {
      return {
        code: 'gpu-length-exceeds',
        severity: 'error',
        message: `GPU length ${gpu.specs.lengthMm}mm exceeds case max ${case_.specs.maxGpuLengthMm}mm`,
        reason: 'GPU must fit within the case dimensions',
        affectedIds: [gpu.id, case_.id],
      };
    }
    return null;
  },
  priority: 85,
  category: 'compatibility',
  enabled: true,
};

// PSU Wattage Rule
export const psuWattageRule: CompatibilityRule = {
  id: 'psu-wattage-check',
  name: 'PSU Wattage Check',
  check: (build: Build, components: Component[]): RuleResult | null => {
    const cpu = getCPU(build, components);
    const gpu = getGPU(build, components);
    const rams = getRAM(build, components);
    const storages = getStorage(build, components);
    const psu = getPSU(build, components);
    
    if (!cpu && !gpu && rams.length === 0 && storages.length === 0) return null;
    
    const estimatedWatt = calculateEstimatedWatt(cpu, gpu, rams, storages);
    const required = estimatedWatt * 1.25;
    
    if (!psu) return null;
    
    if (psu.specs.wattage < required) {
      return {
        code: 'psu-insufficient',
        severity: 'error',
        message: `PSU ${psu.specs.wattage}W insufficient for estimated ${estimatedWatt}W system`,
        reason: 'PSU must provide at least 125% of estimated system power',
        affectedIds: [psu.id],
      };
    } else if (psu.specs.wattage < estimatedWatt * 1.5) {
      return {
        code: 'psu-close',
        severity: 'warning',
        message: `PSU ${psu.specs.wattage}W is close to estimated ${estimatedWatt}W system`,
        reason: 'Consider higher wattage PSU for stability',
        affectedIds: [psu.id],
      };
    }
    return null;
  },
  priority: 80,
  category: 'compatibility',
  enabled: true,
};

// RAM Slots Rule
export const ramSlotsRule: CompatibilityRule = {
  id: 'ram-slots-check',
  name: 'RAM Slots Check',
  check: (build: Build, components: Component[]): RuleResult | null => {
    const motherboard = getMotherboard(build, components);
    const rams = getRAM(build, components);
    
    if (!motherboard || rams.length === 0) return null;
    
    if (rams.length > motherboard.specs.ramSlots) {
      return {
        code: 'ram-slots-exceed',
        severity: 'error',
        message: `Too many RAM sticks (${rams.length}) for motherboard slots (${motherboard.specs.ramSlots})`,
        reason: 'Motherboard has limited RAM slots',
        affectedIds: [motherboard.id, ...rams.map(r => r.id)],
      };
    }
    return null;
  },
  priority: 75,
  category: 'compatibility',
  enabled: true,
};

// Cooler Compatibility Rule
export const coolerCompatibilityRule: CompatibilityRule = {
  id: 'cooler-socket-match',
  name: 'Cooler Socket Compatibility',
  check: (build: Build, components: Component[]): RuleResult | null => {
    const cpu = getCPU(build, components);
    const cooler = getCooler(build, components);
    
    if (!cpu || !cooler) return null;
    
    if (!cooler.specs.socketCompatibility.includes(cpu.specs.socket)) {
      return {
        code: 'cooler-incompatible',
        severity: 'error',
        message: `Cooler not compatible with CPU socket ${cpu.specs.socket}`,
        reason: 'Cooler must support the CPU socket',
        affectedIds: [cooler.id, cpu.id],
      };
    }
    return null;
  },
  priority: 70,
  category: 'compatibility',
  enabled: true,
};

// Helper function
function calculateEstimatedWatt(
  cpu: any,
  gpu: any,
  rams: any[],
  storages: any[]
): number {
  let watt = 50; // baseline
  if (cpu) watt += cpu.specs.tdpW;
  if (gpu) watt += gpu.specs.tdpW;
  watt += rams.length * 10;
  watt += storages.length * 5;
  return watt;
}

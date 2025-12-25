import { Build, Component, RuleResult, Severity } from '../model/types';

export function checkCompatibility(build: Build, components: Component[]): RuleResult[] {
  const errors: RuleResult[] = [];
  const warnings: RuleResult[] = [];

  // Get selected components
  const cpu = build.cpu ? components.find(c => c.id === build.cpu) || null : null;
  const gpu = build.gpu ? components.find(c => c.id === build.gpu) || null : null;
  const motherboard = build.motherboard ? components.find(c => c.id === build.motherboard) || null : null;
  const cooler = build.cooler ? components.find(c => c.id === build.cooler) || null : null;
  const case_ = build.case ? components.find(c => c.id === build.case) || null : null;
  const psu = build.psu ? components.find(c => c.id === build.psu) || null : null;
  const rams = build.ram.map(id => components.find(c => c.id === id)).filter(Boolean) as Component[];
  const storages = build.storage.map(id => components.find(c => c.id === id)).filter(Boolean) as Component[];

  // Rule 1: CPU socket must match motherboard socket
  if (cpu && motherboard) {
    const cpuSocket = (cpu.specs as any).socket;
    const mbSocket = (motherboard.specs as any).socket;
    if (cpuSocket !== mbSocket) {
      errors.push({
        code: 'cpu-socket-mismatch',
        severity: 'error',
        message: `CPU socket ${cpuSocket} does not match motherboard socket ${mbSocket}`,
        reason: 'CPU and motherboard must have compatible sockets for installation',
        affectedIds: [cpu.id, motherboard.id],
      });
    }
  }

  // Rule 2: RAM DDR must match motherboard
  if (rams.length > 0 && motherboard) {
    const mbRamType = (motherboard.specs as any).ramType;
    const incompatibleRams = rams.filter(ram => (ram.specs as any).ramType !== mbRamType);
    if (incompatibleRams.length > 0) {
      errors.push({
        code: 'ram-type-mismatch',
        severity: 'error',
        message: `RAM type does not match motherboard DDR type ${mbRamType}`,
        reason: 'RAM must be compatible with motherboard DDR generation',
        affectedIds: [motherboard.id, ...incompatibleRams.map(r => r.id)],
      });
    }
  }

  // Rule 3: Motherboard form factor must be supported by case
  if (motherboard && case_) {
    const mbFormFactor = (motherboard.specs as any).formFactor;
    const caseCompat = (case_.specs as any).formFactorCompatibility;
    if (!caseCompat.includes(mbFormFactor)) {
      errors.push({
        code: 'form-factor-incompatible',
        severity: 'error',
        message: `Motherboard form factor ${mbFormFactor} not supported by case`,
        reason: 'Case must support the motherboard form factor',
        affectedIds: [motherboard.id, case_.id],
      });
    }
  }

  // Rule 4: GPU length must fit case
  if (gpu && case_) {
    const gpuLength = (gpu.specs as any).lengthMm;
    const caseMax = (case_.specs as any).maxGpuLengthMm;
    if (gpuLength > caseMax) {
      errors.push({
        code: 'gpu-length-exceeds',
        severity: 'error',
        message: `GPU length ${gpuLength}mm exceeds case max ${caseMax}mm`,
        reason: 'GPU must fit within the case dimensions',
        affectedIds: [gpu.id, case_.id],
      });
    }
  }

  // Rule 5: PSU wattage
  if (cpu || gpu || rams.length > 0 || storages.length > 0) {
    const estimatedWatt = calculateEstimatedWatt(cpu, gpu, rams, storages);
    const required = estimatedWatt * 1.25;
    if (psu) {
      const psuWatt = (psu.specs as any).wattage;
      if (psuWatt < required) {
        errors.push({
          code: 'psu-insufficient',
          severity: 'error',
          message: `PSU ${psuWatt}W insufficient for estimated ${estimatedWatt}W system`,
          reason: 'PSU must provide at least 125% of estimated system power',
          affectedIds: [psu.id],
        });
      } else if (psuWatt < estimatedWatt * 1.5) {
        warnings.push({
          code: 'psu-close',
          severity: 'warning',
          message: `PSU ${psuWatt}W is close to estimated ${estimatedWatt}W system`,
          reason: 'Consider higher wattage PSU for stability',
          affectedIds: [psu.id],
        });
      }
    }
  }

  // Additional: RAM slots
  if (rams.length > 0 && motherboard) {
    const mbSlots = (motherboard.specs as any).ramSlots;
    if (rams.length > mbSlots) {
      errors.push({
        code: 'ram-slots-exceed',
        severity: 'error',
        message: `Too many RAM sticks (${rams.length}) for motherboard slots (${mbSlots})`,
        reason: 'Motherboard has limited RAM slots',
        affectedIds: [motherboard.id, ...rams.map(r => r.id)],
      });
    }
  }

  // Cooler compatibility
  if (cpu && cooler) {
    const cpuSocket = (cpu.specs as any).socket;
    const coolerCompat = (cooler.specs as any).socketCompatibility;
    if (!coolerCompat.includes(cpuSocket)) {
      errors.push({
        code: 'cooler-incompatible',
        severity: 'error',
        message: `Cooler not compatible with CPU socket ${cpuSocket}`,
        reason: 'Cooler must support the CPU socket',
        affectedIds: [cooler.id, cpu.id],
      });
    }
  }

  return [...errors, ...warnings];
}

function calculateEstimatedWatt(
  cpu: Component | null,
  gpu: Component | null,
  rams: Component[],
  storages: Component[]
): number {
  let watt = 50; // baseline
  if (cpu) watt += (cpu.specs as any).tdpW;
  if (gpu) watt += (gpu.specs as any).tdpW;
  watt += rams.length * 10;
  watt += storages.length * 5;
  return watt;
}

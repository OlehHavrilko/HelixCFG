import { Build, Component, RuleResult } from '../model/types';

export function checkBalance(build: Build, components: Component[]): RuleResult[] {
  const warnings: RuleResult[] = [];

  // Get selected components
  const cpu = build.cpu ? components.find(c => c.id === build.cpu) || null : null;
  const gpu = build.gpu ? components.find(c => c.id === build.gpu) || null : null;
  const psu = build.psu ? components.find(c => c.id === build.psu) || null : null;
  const rams = build.ram.map(id => components.find(c => c.id === id)).filter(Boolean) as Component[];
  const storages = build.storage.map(id => components.find(c => c.id === id)).filter(Boolean) as Component[];

  const target = build.meta.target;

  // Rule 1: CPU/GPU mismatch for gaming
  if (target === 'gaming' && cpu && gpu) {
    const cpuCores = (cpu.specs as any).cores;
    const gpuVram = (gpu.specs as any).vramGB;
    if (cpuCores < 6 && gpuVram >= 8) {
      warnings.push({
        code: 'cpu-gpu-mismatch',
        severity: 'warning',
        message: 'CPU may bottleneck high-end GPU in gaming',
        reason: 'Low core count CPU can limit GPU performance in games',
        affectedIds: [cpu.id, gpu.id],
      });
    }
  }

  // Rule 2: Too little RAM
  const totalRamGB = rams.reduce((sum, ram) => sum + (ram.specs as any).capacityGB, 0);
  if (target === 'gaming' && totalRamGB < 16) {
    warnings.push({
      code: 'insufficient-ram-gaming',
      severity: 'warning',
      message: `Only ${totalRamGB}GB RAM for gaming, recommend at least 16GB`,
      reason: 'Gaming workloads benefit from more RAM',
      affectedIds: rams.map(r => r.id),
    });
  } else if (target === 'work' && totalRamGB < 32) {
    warnings.push({
      code: 'insufficient-ram-work',
      severity: 'warning',
      message: `Only ${totalRamGB}GB RAM for work, recommend at least 32GB`,
      reason: 'Workstation tasks require more RAM',
      affectedIds: rams.map(r => r.id),
    });
  }

  // Rule 3: No SSD
  const hasSSD = storages.some(storage => (storage.specs as any).storageType === 'SSD');
  if (!hasSSD) {
    warnings.push({
      code: 'no-ssd',
      severity: 'warning',
      message: 'No SSD selected, system may be slow',
      reason: 'SSD provides much faster boot and load times',
      affectedIds: storages.map(s => s.id),
    });
  }

  // Rule 4: PSU oversized
  if (cpu || gpu || rams.length > 0 || storages.length > 0) {
    const estimatedWatt = calculateEstimatedWatt(cpu, gpu, rams, storages);
    if (psu) {
      const psuWatt = (psu.specs as any).wattage;
      if (psuWatt > estimatedWatt * 2.2) {
        warnings.push({
          code: 'psu-oversized',
          severity: 'warning',
          message: `PSU ${psuWatt}W is oversized for ${estimatedWatt}W system`,
          reason: 'Oversized PSU may waste energy and cost more',
          affectedIds: [psu.id],
        });
      }
    }
  }

  return warnings;
}

function calculateEstimatedWatt(
  cpu: Component | null,
  gpu: Component | null,
  rams: Component[],
  storages: Component[]
): number {
  let watt = 50;
  if (cpu) watt += (cpu.specs as any).tdpW;
  if (gpu) watt += (gpu.specs as any).tdpW;
  watt += rams.length * 10;
  watt += storages.length * 5;
  return watt;
}

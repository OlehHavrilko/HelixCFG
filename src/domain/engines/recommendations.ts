import { Build, Component, Recommendation } from '../model/types';

export function generateRecommendations(
  build: Build,
  components: Component[],
  errors: any[],
  warnings: any[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const allIssues = [...errors, ...warnings];

  // For each issue, generate recommendations
  for (const issue of allIssues) {
    switch (issue.code) {
      case 'cpu-socket-mismatch':
        recommendations.push(...recommendCpuSocketFix(build, components, issue));
        break;
      case 'ram-type-mismatch':
        recommendations.push(...recommendRamTypeFix(build, components, issue));
        break;
      case 'form-factor-incompatible':
        recommendations.push(...recommendFormFactorFix(build, components, issue));
        break;
      case 'gpu-length-exceeds':
        recommendations.push(...recommendGpuLengthFix(build, components, issue));
        break;
      case 'psu-insufficient':
        recommendations.push(...recommendPsuUpgrade(build, components, issue));
        break;
      case 'cpu-gpu-mismatch':
        recommendations.push(...recommendCpuGpuBalance(build, components, issue));
        break;
      case 'insufficient-ram-gaming':
      case 'insufficient-ram-work':
        recommendations.push(...recommendMoreRam(build, components, issue));
        break;
      case 'no-ssd':
        recommendations.push(...recommendAddSSD(build, components, issue));
        break;
      // Add more as needed
    }
  }

  return recommendations;
}

function recommendCpuSocketFix(build: Build, components: Component[], issue: any): Recommendation[] {
  const recs: Recommendation[] = [];
  const cpu = components.find(c => c.id === build.cpu);
  const motherboard = components.find(c => c.id === build.motherboard);
  if (!cpu || !motherboard) return recs;

  const cpuSocket = (cpu.specs as any).socket;
  const mbSocket = (motherboard.specs as any).socket;

  // Suggest motherboards matching CPU socket
  const matchingMbs = components
    .filter(c => c.type === 'Motherboard' && (c.specs as any).socket === cpuSocket)
    .slice(0, 3); // limit to 3
  if (matchingMbs.length > 0) {
    recs.push({
      reasonCode: issue.code,
      message: `Replace motherboard with one supporting ${cpuSocket} socket`,
      replaceId: motherboard.id,
      alternatives: matchingMbs.map(m => m.id),
      expectedEffect: 'Fixes socket compatibility',
    });
  }

  // Suggest CPUs matching motherboard socket
  const matchingCpus = components
    .filter(c => c.type === 'CPU' && (c.specs as any).socket === mbSocket)
    .slice(0, 3);
  if (matchingCpus.length > 0) {
    recs.push({
      reasonCode: issue.code,
      message: `Replace CPU with one for ${mbSocket} socket`,
      replaceId: cpu.id,
      alternatives: matchingCpus.map(c => c.id),
      expectedEffect: 'Fixes socket compatibility',
    });
  }

  return recs;
}

function recommendRamTypeFix(build: Build, components: Component[], issue: any): Recommendation[] {
  const motherboard = components.find(c => c.id === build.motherboard);
  if (!motherboard) return [];

  const mbRamType = (motherboard.specs as any).ramType;
  const matchingRams = components
    .filter(c => c.type === 'RAM' && (c.specs as any).ramType === mbRamType)
    .slice(0, 3);

  return matchingRams.length > 0 ? [{
    reasonCode: issue.code,
    message: `Replace RAM with ${mbRamType} compatible sticks`,
    replaceId: issue.affectedIds.find((id: string) => components.find(c => c.id === id)?.type === 'RAM'),
    alternatives: matchingRams.map(r => r.id),
    expectedEffect: 'Fixes RAM compatibility',
  }] : [];
}

function recommendFormFactorFix(build: Build, components: Component[], issue: any): Recommendation[] {
  const motherboard = components.find(c => c.id === build.motherboard);
  const case_ = components.find(c => c.id === build.case);
  if (!motherboard || !case_) return [];

  const mbFormFactor = (motherboard.specs as any).formFactor;
  const matchingCases = components
    .filter(c => c.type === 'Case' && (c.specs as any).formFactorCompatibility.includes(mbFormFactor))
    .slice(0, 3);

  return matchingCases.length > 0 ? [{
    reasonCode: issue.code,
    message: `Replace case with one supporting ${mbFormFactor} motherboards`,
    replaceId: case_.id,
    alternatives: matchingCases.map(c => c.id),
    expectedEffect: 'Fixes form factor compatibility',
  }] : [];
}

function recommendGpuLengthFix(build: Build, components: Component[], issue: any): Recommendation[] {
  const gpu = components.find(c => c.id === build.gpu);
  const case_ = components.find(c => c.id === build.case);
  if (!gpu || !case_) return [];

  const caseMax = (case_.specs as any).maxGpuLengthMm;
  const shorterGpus = components
    .filter(c => c.type === 'GPU' && (c.specs as any).lengthMm <= caseMax)
    .slice(0, 3);

  const biggerCases = components
    .filter(c => c.type === 'Case' && (c.specs as any).maxGpuLengthMm >= (gpu.specs as any).lengthMm)
    .slice(0, 3);

  const recs: Recommendation[] = [];
  if (shorterGpus.length > 0) {
    recs.push({
      reasonCode: issue.code,
      message: 'Replace GPU with shorter model',
      replaceId: gpu.id,
      alternatives: shorterGpus.map(g => g.id),
      expectedEffect: 'Fits in current case',
    });
  }
  if (biggerCases.length > 0) {
    recs.push({
      reasonCode: issue.code,
      message: 'Replace case with larger model',
      replaceId: case_.id,
      alternatives: biggerCases.map(c => c.id),
      expectedEffect: 'Accommodates current GPU',
    });
  }
  return recs;
}

function recommendPsuUpgrade(build: Build, components: Component[], issue: any): Recommendation[] {
  const psu = components.find(c => c.id === build.psu);
  if (!psu) return [];

  const currentWatt = (psu.specs as any).wattage;
  const higherPsus = components
    .filter(c => c.type === 'PSU' && (c.specs as any).wattage > currentWatt)
    .slice(0, 3);

  return higherPsus.length > 0 ? [{
    reasonCode: issue.code,
    message: 'Upgrade to higher wattage PSU',
    replaceId: psu.id,
    alternatives: higherPsus.map(p => p.id),
    expectedEffect: 'Provides sufficient power',
  }] : [];
}

function recommendCpuGpuBalance(build: Build, components: Component[], issue: any): Recommendation[] {
  const cpu = components.find(c => c.id === build.cpu);
  const gpu = components.find(c => c.id === build.gpu);
  if (!cpu || !gpu) return [];

  const betterCpus = components
    .filter(c => c.type === 'CPU' && (c.specs as any).cores >= 6)
    .slice(0, 3);

  const weakerGpus = components
    .filter(c => c.type === 'GPU' && (c.specs as any).vramGB < 8)
    .slice(0, 3);

  const recs: Recommendation[] = [];
  if (betterCpus.length > 0) {
    recs.push({
      reasonCode: issue.code,
      message: 'Upgrade CPU for better balance',
      replaceId: cpu.id,
      alternatives: betterCpus.map(c => c.id),
      expectedEffect: 'Reduces GPU bottleneck',
    });
  }
  if (weakerGpus.length > 0) {
    recs.push({
      reasonCode: issue.code,
      message: 'Downgrade GPU for better balance',
      replaceId: gpu.id,
      alternatives: weakerGpus.map(g => g.id),
      expectedEffect: 'Matches CPU performance',
    });
  }
  return recs;
}

function recommendMoreRam(build: Build, components: Component[], issue: any): Recommendation[] {
  const target = build.meta.target;
  const minGB = target === 'gaming' ? 16 : 32;
  const biggerRams = components
    .filter(c => c.type === 'RAM' && (c.specs as any).capacityGB >= minGB / 2) // at least half
    .slice(0, 3);

  return biggerRams.length > 0 ? [{
    reasonCode: issue.code,
    message: `Add more RAM to reach ${minGB}GB`,
    replaceId: build.ram[0], // replace first
    alternatives: biggerRams.map(r => r.id),
    expectedEffect: 'Improves performance for target workload',
  }] : [];
}

function recommendAddSSD(build: Build, components: Component[], issue: any): Recommendation[] {
  const ssds = components
    .filter(c => c.type === 'Storage' && (c.specs as any).storageType === 'SSD')
    .slice(0, 3);

  return ssds.length > 0 ? [{
    reasonCode: issue.code,
    message: 'Add an SSD for faster performance',
    replaceId: '', // add new
    alternatives: ssds.map(s => s.id),
    expectedEffect: 'Dramatically improves load times',
  }] : [];
}

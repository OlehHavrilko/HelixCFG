import { describe, it, expect, beforeEach } from 'vitest';
import { checkCompatibility } from '../domain/engines/compatibility';
import { ruleEngine } from '../domain/engines/compatibility';
import { createCompatibleBuild, createIncompatibleBuilds, createCPU, createMotherboard, createRAM, createGPU, createCase, createPSU, createCooler, createBuild } from './factories';

describe('Compatibility Engine', () => {
  beforeEach(() => {
    // Ensure all rules are enabled for testing
    ruleEngine.getAllRules().forEach(rule => {
      if (!rule.enabled) {
        ruleEngine.enableRule(rule.id);
      }
    });
  });

  describe('Socket Compatibility', () => {
    it('should accept compatible CPU-Motherboard socket', () => {
      const { build, components } = createCompatibleBuild();
      const results = checkCompatibility(build, components);
      
      const socketErrors = results.filter(r => r.code === 'cpu-socket-mismatch');
      expect(socketErrors).toHaveLength(0);
    });

    it('should reject CPU-MB socket mismatch', () => {
      const cpu = createCPU({ socket: 'AM5' });
      const motherboard = createMotherboard({ socket: 'LGA1700' });
      
      const build = createBuild({
        cpu: cpu.id,
        motherboard: motherboard.id,
      });
      
      const results = checkCompatibility(build, [cpu, motherboard]);
      expect(results).toContainEqual(
        expect.objectContaining({
          code: 'cpu-socket-mismatch',
          severity: 'error',
          message: expect.stringContaining('AM5'),
          affectedIds: [cpu.id, motherboard.id],
        })
      );
    });

    it('should handle missing CPU or motherboard gracefully', () => {
      const build = createBuild({ cpu: undefined, motherboard: undefined });
      expect(() => checkCompatibility(build, [])).not.toThrow();
      
      const results = checkCompatibility(build, []);
      expect(results.filter(r => r.code === 'cpu-socket-mismatch')).toHaveLength(0);
    });
  });

  describe('RAM Type Compatibility', () => {
    it('should accept compatible RAM type', () => {
      const { build, components } = createCompatibleBuild();
      const results = checkCompatibility(build, components);
      
      const ramErrors = results.filter(r => r.code === 'ram-type-mismatch');
      expect(ramErrors).toHaveLength(0);
    });

    it('should reject RAM type mismatch', () => {
      const motherboard = createMotherboard({ ramType: 'DDR5' });
      const ramDDR4 = createRAM({ id: 'ram-ddr4', ramType: 'DDR4' });
      const ramDDR5 = createRAM({ id: 'ram-ddr5', ramType: 'DDR5' });
      
      const build = createBuild({
        motherboard: motherboard.id,
        ram: [ramDDR4.id, ramDDR5.id],
      });
      
      const results = checkCompatibility(build, [motherboard, ramDDR4, ramDDR5]);
      expect(results).toContainEqual(
        expect.objectContaining({
          code: 'ram-type-mismatch',
          severity: 'error',
          affectedIds: expect.arrayContaining([motherboard.id, ramDDR4.id]),
        })
      );
    });

    it('should handle empty RAM arrays', () => {
      const build = createBuild({ ram: [] });
      const results = checkCompatibility(build, []);
      expect(results.filter(r => r.code === 'ram-type-mismatch')).toHaveLength(0);
    });
  });

  describe('Form Factor Compatibility', () => {
    it('should accept compatible form factors', () => {
      const { build, components } = createCompatibleBuild();
      const results = checkCompatibility(build, components);
      
      const formFactorErrors = results.filter(r => r.code === 'form-factor-incompatible');
      expect(formFactorErrors).toHaveLength(0);
    });

    it('should reject incompatible form factors', () => {
      const motherboard = createMotherboard({ formFactor: 'E-ATX' });
      const case_ = createCase({ formFactorCompatibility: ['ATX', 'Micro-ATX'] });
      
      const build = createBuild({
        motherboard: motherboard.id,
        case: case_.id,
      });
      
      const results = checkCompatibility(build, [motherboard, case_]);
      expect(results).toContainEqual(
        expect.objectContaining({
          code: 'form-factor-incompatible',
          severity: 'error',
          message: expect.stringContaining('E-ATX'),
        })
      );
    });
  });

  describe('GPU Length Compatibility', () => {
    it('should accept GPU that fits in case', () => {
      const { build, components } = createCompatibleBuild();
      const results = checkCompatibility(build, components);
      
      const gpuErrors = results.filter(r => r.code === 'gpu-length-exceeds');
      expect(gpuErrors).toHaveLength(0);
    });

    it('should reject GPU too long for case', () => {
      const gpu = createGPU({ lengthMm: 400 });
      const case_ = createCase({ maxGpuLengthMm: 350 });
      
      const build = createBuild({
        gpu: gpu.id,
        case: case_.id,
      });
      
      const results = checkCompatibility(build, [gpu, case_]);
      expect(results).toContainEqual(
        expect.objectContaining({
          code: 'gpu-length-exceeds',
          severity: 'error',
          message: expect.stringContaining('400mm'),
        })
      );
    });
  });

  describe('PSU Wattage', () => {
    it('should accept sufficient PSU wattage', () => {
      const { build, components } = createCompatibleBuild();
      const results = checkCompatibility(build, components);
      
      const psuErrors = results.filter(r => r.code === 'psu-insufficient');
      expect(psuErrors).toHaveLength(0);
    });

    it('should reject insufficient PSU wattage', () => {
      const cpu = createCPU({ tdpW: 250 });
      const gpu = createGPU({ tdpW: 350 });
      const psu = createPSU({ wattage: 400 });
      
      const build = createBuild({
        cpu: cpu.id,
        gpu: gpu.id,
        psu: psu.id,
      });
      
      const results = checkCompatibility(build, [cpu, gpu, psu]);
      expect(results).toContainEqual(
        expect.objectContaining({
          code: 'psu-insufficient',
          severity: 'error',
        })
      );
    });

    it('should warn about close PSU wattage', () => {
      const cpu = createCPU({ tdpW: 125 });
      const gpu = createGPU({ tdpW: 200 });
      const psu = createPSU({ wattage: 450 }); // Close to minimum
      
      const build = createBuild({
        cpu: cpu.id,
        gpu: gpu.id,
        psu: psu.id,
      });
      
      const results = checkCompatibility(build, [cpu, gpu, psu]);
      expect(results).toContainEqual(
        expect.objectContaining({
          code: 'psu-close',
          severity: 'warning',
        })
      );
    });
  });

  describe('RAM Slots', () => {
    it('should accept RAM within slot limits', () => {
      const { build, components } = createCompatibleBuild();
      const results = checkCompatibility(build, components);
      
      const slotErrors = results.filter(r => r.code === 'ram-slots-exceed');
      expect(slotErrors).toHaveLength(0);
    });

    it('should reject too many RAM sticks', () => {
      const motherboard = createMotherboard({ ramSlots: 2 });
      const rams = [
        createRAM({ id: 'ram-1' }),
        createRAM({ id: 'ram-2' }),
        createRAM({ id: 'ram-3' }),
      ];
      
      const build = createBuild({
        motherboard: motherboard.id,
        ram: rams.map(r => r.id),
      });
      
      const results = checkCompatibility(build, [motherboard, ...rams]);
      expect(results).toContainEqual(
        expect.objectContaining({
          code: 'ram-slots-exceed',
          severity: 'error',
          message: expect.stringContaining('3'),
        })
      );
    });
  });

  describe('Cooler Compatibility', () => {
    it('should accept compatible cooler', () => {
      const { build, components } = createCompatibleBuild();
      const results = checkCompatibility(build, components);
      
      const coolerErrors = results.filter(r => r.code === 'cooler-incompatible');
      expect(coolerErrors).toHaveLength(0);
    });

    it('should reject incompatible cooler socket', () => {
      const cpu = createCPU({ socket: 'LGA1700' });
      const cooler = createCooler({ socketCompatibility: ['AM4', 'AM5'] });
      
      const build = createBuild({
        cpu: cpu.id,
        cooler: cooler.id,
      });
      
      const results = checkCompatibility(build, [cpu, cooler]);
      expect(results).toContainEqual(
        expect.objectContaining({
          code: 'cooler-incompatible',
          severity: 'error',
          message: expect.stringContaining('LGA1700'),
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty component list', () => {
      const build = createBuild();
      expect(() => checkCompatibility(build, [])).not.toThrow();
    });

    it('should handle build with missing components', () => {
      const build = createBuild({
        cpu: 'non-existent',
        motherboard: 'also-non-existent',
      });
      
      expect(() => checkCompatibility(build, [])).not.toThrow();
      const results = checkCompatibility(build, []);
      expect(results).toHaveLength(0);
    });

    it('should handle malformed component specs gracefully', () => {
      const malformedComponent = {
        id: 'bad-cpu',
        type: 'CPU' as const,
        brand: 'Test',
        model: 'Bad',
        specs: { type: 'CPU' as const, socket: 'LGA1700', cores: 4, threads: 8, baseClock: 3.0, boostClock: 4.0, tdpW: 65 }, // Minimal valid CPU specs
      };
      
      const build = createBuild({ cpu: malformedComponent.id });
      expect(() => checkCompatibility(build, [malformedComponent])).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should pass complete compatible build', () => {
      const { build, components } = createCompatibleBuild();
      const results = checkCompatibility(build, components);
      
      const errors = results.filter(r => r.severity === 'error');
      expect(errors).toHaveLength(0);
    });

    it('should detect multiple incompatibilities', () => {
      const incompatibleBuilds = createIncompatibleBuilds();
      
      incompatibleBuilds.forEach(({ description, build, components }) => {
        const results = checkCompatibility(build, components);
        const errors = results.filter(r => r.severity === 'error');
        expect(errors.length).toBeGreaterThan(0, `Expected errors for: ${description}`);
      });
    });
  });

  describe('Rule Engine Configuration', () => {
    it('should allow disabling specific rules', () => {
      // Disable socket compatibility rule
      ruleEngine.disableRule('cpu-socket-match');
      
      // Create incompatible socket
      const incompatibleBuild = createBuild({
        cpu: createCPU({ id: 'cpu-am5', socket: 'AM5' }).id,
        motherboard: createMotherboard({ id: 'mb-lga', socket: 'LGA1700' }).id,
      });
      
      const results = checkCompatibility(incompatibleBuild, []);
      const socketErrors = results.filter(r => r.code === 'cpu-socket-mismatch');
      expect(socketErrors).toHaveLength(0);
      
      // Re-enable for other tests
      ruleEngine.enableRule('cpu-socket-match');
    });

    it('should allow rule priority ordering', () => {
      const rules = ruleEngine.getAllRules();
      const sortedRules = rules.sort((a, b) => b.priority - a.priority);
      
      expect(sortedRules[0].priority).toBeGreaterThanOrEqual(sortedRules[1]?.priority || 0);
    });
  });
});

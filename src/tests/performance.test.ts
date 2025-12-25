import { describe, it, expect } from 'vitest';
import { checkCompatibility } from '../domain/engines/compatibility';
import { checkBalance } from '../domain/engines/balance';
import { generateRecommendations } from '../domain/engines/recommendations';
import { generateBuildReport } from '../domain/services/buildReport';
import { Build, Component, Price } from '../domain/model/types';
import { debug } from '../utils/debug';

describe('Performance Tests', () => {
  const createLargeComponentSet = (): Component[] => {
    const set: Component[] = [];
    for (let i = 0; i < 1000; i++) {
      set.push({
        id: `cpu-${i}`,
        type: 'CPU',
        brand: i % 2 === 0 ? 'Intel' : 'AMD',
        model: `Processor-${i}`,
        specs: { 
          type: 'CPU', 
          socket: i % 2 === 0 ? 'LGA1700' : 'AM4', 
          cores: 4 + (i % 12), 
          threads: 8 + (i % 24), 
          baseClock: 2.5 + (i % 3), 
          boostClock: 3.5 + (i % 2), 
          tdpW: 65 + (i % 100) 
        },
      });
    }
    return set;
  };

  describe('Compatibility Engine Performance', () => {
    it('should handle large component dataset efficiently', () => {
      const largeComponentSet = createLargeComponentSet();
      const build: Build = {
        cpu: 'cpu-0',
        motherboard: 'mb-1',
        ram: ['ram-1'],
        storage: ['storage-1'],
        meta: { target: 'gaming' },
      };

      const startTime = performance.now();
      const results = checkCompatibility(build, largeComponentSet);
      const endTime = performance.now();

      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50);
      expect(results).toBeDefined();
    });
  });

  describe('System Integration Performance', () => {
    it('should handle complete workflow efficiently', () => {
      const componentSet = createLargeComponentSet();
      const build: Build = {
        cpu: 'cpu-100',
        gpu: 'gpu-200',
        motherboard: 'mb-300',
        ram: ['ram-1', 'ram-2'],
        storage: ['storage-1'],
        meta: { target: 'gaming' },
      };

      const startTime = performance.now();
      const report = generateBuildReport(build, componentSet, []);
      const endTime = performance.now();

      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
      expect(report).toBeDefined();
      expect(report.totalPrice).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Memory and Stress Tests', () => {
    it('should handle multiple operations without memory issues', () => {
      const componentSet = createLargeComponentSet();
      const builds: Build[] = Array.from({ length: 100 }, (_, i) => ({
        cpu: `cpu-${i}`,
        motherboard: 'mb-1',
        ram: ['ram-1'],
        storage: ['storage-1'],
        meta: { target: i % 2 === 0 ? 'gaming' : 'work' },
      }));

      const startTime = performance.now();
      const results = builds.map(build => generateBuildReport(build, componentSet, []));
      const endTime = performance.now();

      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500);
      expect(results).toHaveLength(100);
      expect(results.every(r => r !== null)).toBe(true);
    });
  });
});

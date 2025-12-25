import { describe, it, expect, beforeEach } from 'vitest';
import { generateBuildReport } from '../domain/services/buildReport';
import { checkCompatibility } from '../domain/engines/compatibility';
import { checkBalance } from '../domain/engines/balance';
import { generateRecommendations } from '../domain/engines/recommendations';
import { Build, Component, Price, RuleResult } from '../domain/model/types';

describe('Integration Tests', () => {
  const fullComponentSet: Component[] = [
    {
      id: 'cpu-modern',
      type: 'CPU',
      brand: 'AMD',
      model: 'Ryzen 5 5600X',
      specs: { type: 'CPU', socket: 'AM4', cores: 6, threads: 12, baseClock: 3.7, boostClock: 4.6, tdpW: 65 },
      tags: ['modern', 'gaming'],
    },
    {
      id: 'cpu-old',
      type: 'CPU',
      brand: 'Intel',
      model: 'i5-8400',
      specs: { type: 'CPU', socket: 'LGA1151', cores: 6, threads: 6, baseClock: 2.8, boostClock: 4.0, tdpW: 65 },
      tags: ['old-gen'],
    },
    {
      id: 'gpu-strong',
      type: 'GPU',
      brand: 'NVIDIA',
      model: 'RTX 3070',
      specs: { type: 'GPU', vramGB: 8, interface: 'PCIe 4.0 x16', lengthMm: 242, widthMm: 111, heightMm: 40, tdpW: 220 },
      tags: ['high-end', 'gaming'],
    },
    {
      id: 'gpu-weak',
      type: 'GPU',
      brand: 'NVIDIA',
      model: 'GTX 1050',
      specs: { type: 'GPU', vramGB: 2, interface: 'PCIe 3.0 x16', lengthMm: 145, widthMm: 111, heightMm: 40, tdpW: 75 },
      tags: ['budget'],
    },
    {
      id: 'mb-am4',
      type: 'Motherboard',
      brand: 'MSI',
      model: 'B450 Tomahawk',
      specs: { type: 'Motherboard', socket: 'AM4', formFactor: 'ATX', ramSlots: 4, ramType: 'DDR4', maxRamGB: 64, chipset: 'B450', pcieSlots: 2 },
    },
    {
      id: 'mb-intel',
      type: 'Motherboard',
      brand: 'ASUS',
      model: 'B360M',
      specs: { type: 'Motherboard', socket: 'LGA1151', formFactor: 'Micro-ATX', ramSlots: 4, ramType: 'DDR4', maxRamGB: 64, chipset: 'B360', pcieSlots: 2 },
    },
    {
      id: 'ram-ddr4-16',
      type: 'RAM',
      brand: 'Corsair',
      model: 'Vengeance LPX',
      specs: { type: 'RAM', ramType: 'DDR4', speed: 3200, capacityGB: 16, sticks: 1 },
      tags: ['gaming'],
    },
    {
      id: 'ram-ddr4-8',
      type: 'RAM',
      brand: 'Kingston',
      model: 'ValueRAM',
      specs: { type: 'RAM', ramType: 'DDR4', speed: 2400, capacityGB: 8, sticks: 1 },
      tags: ['basic'],
    },
    {
      id: 'storage-ssd',
      type: 'Storage',
      brand: 'Samsung',
      model: '980',
      specs: { type: 'Storage', storageType: 'SSD', capacityGB: 500, interface: 'NVMe' },
    },
    {
      id: 'storage-hdd',
      type: 'Storage',
      brand: 'Seagate',
      model: 'Barracuda',
      specs: { type: 'Storage', storageType: 'HDD', capacityGB: 1000, interface: 'SATA' },
    },
    {
      id: 'case-atx',
      type: 'Case',
      brand: 'Fractal',
      model: 'Define 7',
      specs: { type: 'Case', formFactorCompatibility: ['ATX', 'Micro-ATX', 'Mini-ITX'], maxGpuLengthMm: 491, maxCpuCoolerHeightMm: 185 },
    },
    {
      id: 'psu-650w',
      type: 'PSU',
      brand: 'Corsair',
      model: 'RM650',
      specs: { type: 'PSU', wattage: 650, efficiency: '80+ Gold', modular: true },
    },
    {
      id: 'psu-450w',
      type: 'PSU',
      brand: 'EVGA',
      model: 'BV450',
      specs: { type: 'PSU', wattage: 450, efficiency: '80+ Bronze', modular: false },
    },
  ];

  const mockPrices: Price[] = [
    { componentId: 'cpu-modern', value: 200, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'cpu-old', value: 120, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'gpu-strong', value: 400, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'gpu-weak', value: 80, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'mb-am4', value: 100, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'mb-intel', value: 90, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'ram-ddr4-16', value: 70, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'ram-ddr4-8', value: 35, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'storage-ssd', value: 80, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'storage-hdd', value: 40, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'case-atx', value: 120, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'psu-650w', value: 100, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'psu-450w', value: 60, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
  ];

  describe('Complete Build Workflow Integration', () => {
    it('should handle complete compatible build without issues', () => {
      const compatibleBuild: Build = {
        cpu: 'cpu-modern',
        gpu: 'gpu-strong',
        motherboard: 'mb-am4',
        case: 'case-atx',
        psu: 'psu-650w',
        ram: ['ram-ddr4-16', 'ram-ddr4-16'],
        storage: ['storage-ssd'],
        meta: { target: 'gaming' },
      };

      // Test individual engines
      const compatibilityResults = checkCompatibility(compatibleBuild, fullComponentSet);
      const balanceResults = checkBalance(compatibleBuild, fullComponentSet);
      const recommendations = generateRecommendations(compatibleBuild, fullComponentSet, compatibilityResults, balanceResults);

      // Test integrated report generation
      const report = generateBuildReport(compatibleBuild, fullComponentSet, mockPrices);

      // Assertions
      expect(compatibilityResults.filter(r => r.severity === 'error')).toHaveLength(0);
      expect(balanceResults).toHaveLength(0);
      expect(recommendations).toHaveLength(0);
      expect(report.totalPrice).toBe(1140);
      expect(report.summary).toContain('No issues detected');
    });

    it('should detect and fix socket mismatch through recommendations', () => {
      const incompatibleBuild: Build = {
        cpu: 'cpu-modern', // AM4 socket
        gpu: 'gpu-weak',
        motherboard: 'mb-intel', // LGA1151 socket
        ram: ['ram-ddr4-8'],
        storage: ['storage-hdd'],
        meta: { target: 'gaming' },
      };

      const compatibilityResults = checkCompatibility(incompatibleBuild, fullComponentSet);
      const balanceResults = checkBalance(incompatibleBuild, fullComponentSet);
      const recommendations = generateRecommendations(incompatibleBuild, fullComponentSet, compatibilityResults, balanceResults);

      expect(compatibilityResults.some(r => r.code === 'cpu-socket-mismatch')).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      const socketFixRec = recommendations.find(r => r.reasonCode === 'cpu-socket-mismatch');
      expect(socketFixRec).toBeDefined();
      expect(socketFixRec?.alternatives).toContain('mb-am4');
    });

    it('should handle performance bottleneck detection and recommendations', () => {
      const bottleneckBuild: Build = {
        cpu: 'cpu-old', // Weak CPU for modern GPU
        gpu: 'gpu-strong', // High-end GPU
        motherboard: 'mb-intel',
        ram: ['ram-ddr4-8'], // Insufficient RAM
        storage: ['storage-hdd'], // Slow storage
        meta: { target: 'gaming' },
      };

      const compatibilityResults = checkCompatibility(bottleneckBuild, fullComponentSet);
      const balanceResults = checkBalance(bottleneckBuild, fullComponentSet);
      const recommendations = generateRecommendations(bottleneckBuild, fullComponentSet, compatibilityResults, balanceResults);

      // Should detect multiple issues
      expect(balanceResults.length).toBeGreaterThan(0);
      expect(balanceResults.some((r: any) => r.code === 'cpu-gpu-mismatch')).toBe(true);
      expect(balanceResults.some((r: any) => r.code === 'insufficient-ram-gaming')).toBe(true);
      expect(balanceResults.some((r: any) => r.code === 'no-ssd')).toBe(true);

      // Should generate recommendations for all issues
      expect(recommendations.length).toBeGreaterThanOrEqual(3);
    });

    it('should calculate pricing correctly across all components', () => {
      const build: Build = {
        cpu: 'cpu-modern',
        gpu: 'gpu-strong',
        motherboard: 'mb-am4',
        case: 'case-atx',
        psu: 'psu-650w',
        ram: ['ram-ddr4-16', 'ram-ddr4-16'], // 2 sticks
        storage: ['storage-ssd'],
        meta: { target: 'gaming' },
      };

      const report = generateBuildReport(build, fullComponentSet, mockPrices);

      // Expected price: 200 + 400 + 100 + 120 + 100 + (70 * 2) + 80 = 1140
      expect(report.totalPrice).toBe(1140);
      expect(report.lineItems).toHaveLength(8);

      // Verify RAM pricing for 2 sticks
      const ramItem = report.lineItems.find(item => item.componentId === 'ram-ddr4-16');
      expect(ramItem?.quantity).toBe(2);
      expect(ramItem?.total).toBe(140);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle missing components gracefully', () => {
      const incompleteBuild: Build = {
        cpu: 'cpu-modern',
        // Missing motherboard, gpu, etc.
        ram: ['ram-ddr4-16'],
        storage: ['storage-ssd'],
        meta: { target: 'gaming' },
      };

      const report = generateBuildReport(incompleteBuild, fullComponentSet, mockPrices);

      expect(report.totalPrice).toBe(350); // cpu + ram + storage
      expect(report.errors.length).toBeGreaterThan(0);
      expect(report.summary).toContain('compatibility error');
    });

    it('should handle missing prices gracefully', () => {
      const build: Build = {
        cpu: 'cpu-modern',
        gpu: 'gpu-strong',
        motherboard: 'mb-am4',
        ram: ['ram-ddr4-16'],
        storage: ['storage-ssd'],
        meta: { target: 'gaming' },
      };

      // Only partial pricing data
      const partialPrices = mockPrices.filter(p => 
        ['cpu-modern', 'gpu-strong', 'mb-am4'].includes(p.componentId)
      );

      const report = generateBuildReport(build, fullComponentSet, partialPrices);

      expect(report.totalPrice).toBe(700); // Only priced components
      expect(report.lineItems).toHaveLength(3);
    });

    it('should handle duplicate components in build', () => {
      const buildWithDuplicates: Build = {
        cpu: 'cpu-modern',
        gpu: 'gpu-strong',
        motherboard: 'mb-am4',
        ram: ['ram-ddr4-16', 'ram-ddr4-16', 'ram-ddr4-16', 'ram-ddr4-16'], // 4 sticks
        storage: ['storage-ssd', 'storage-hdd'],
        meta: { target: 'gaming' },
      };

      const report = generateBuildReport(buildWithDuplicates, fullComponentSet, mockPrices);

      const ramItem = report.lineItems.find(item => item.componentId === 'ram-ddr4-16');
      expect(ramItem?.quantity).toBe(4);
      expect(ramItem?.total).toBe(280); // 70 * 4

      const storageItems = report.lineItems.filter(item => item.componentId.startsWith('storage'));
      expect(storageItems).toHaveLength(2);
    });
  });

  describe('Performance and Load Integration', () => {
    it('should handle large component dataset efficiently', () => {
      // Create a larger dataset
      const largeComponentSet = [...fullComponentSet];
      for (let i = 0; i < 10; i++) {
        largeComponentSet.push({
          id: `cpu-${i}`,
          type: 'CPU',
          brand: 'Intel',
          model: `i${i}-${1000 + i}`,
          specs: { type: 'CPU', socket: 'LGA1200', cores: 4 + i, threads: 8 + i * 2, baseClock: 3.0, boostClock: 4.0 + i * 0.2, tdpW: 65 + i * 10 },
        });
      }

      const build: Build = {
        cpu: 'cpu-modern',
        gpu: 'gpu-strong',
        motherboard: 'mb-am4',
        ram: ['ram-ddr4-16'],
        storage: ['storage-ssd'],
        meta: { target: 'gaming' },
      };

      const startTime = performance.now();
      const report = generateBuildReport(build, largeComponentSet, mockPrices);
      const endTime = performance.now();

      expect(report).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});

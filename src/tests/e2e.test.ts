import { describe, it, expect } from 'vitest';
import { generateBuildReport } from '../domain/services/buildReport';
import { checkCompatibility } from '../domain/engines/compatibility';
import { checkBalance } from '../domain/engines/balance';
import { generateRecommendations } from '../domain/engines/recommendations';
import { Build, Component, Price } from '../domain/model/types';
import { debug } from '../utils/debug';

describe('E2E User Scenarios', () => {
  const fullComponentDatabase: Component[] = [
    // CPUs
    {
      id: 'cpu-gaming-1',
      type: 'CPU',
      brand: 'AMD',
      model: 'Ryzen 7 5800X',
      specs: { type: 'CPU', socket: 'AM4', cores: 8, threads: 16, baseClock: 3.8, boostClock: 4.7, tdpW: 105 },
      tags: ['gaming', 'high-end'],
    },
    {
      id: 'cpu-budget-1',
      type: 'CPU',
      brand: 'Intel',
      model: 'i3-12100F',
      specs: { type: 'CPU', socket: 'LGA1700', cores: 4, threads: 8, baseClock: 3.3, boostClock: 4.3, tdpW: 65 },
      tags: ['budget', 'entry'],
    },
    // GPUs
    {
      id: 'gpu-high-end',
      type: 'GPU',
      brand: 'NVIDIA',
      model: 'RTX 4070 Ti',
      specs: { type: 'GPU', vramGB: 12, interface: 'PCIe 4.0 x16', lengthMm: 267, widthMm: 111, heightMm: 40, tdpW: 285 },
      tags: ['gaming', 'high-end', '4k'],
    },
    {
      id: 'gpu-mid-range',
      type: 'GPU',
      brand: 'AMD',
      model: 'RX 6700 XT',
      specs: { type: 'GPU', vramGB: 12, interface: 'PCIe 4.0 x16', lengthMm: 267, widthMm: 120, heightMm: 40, tdpW: 230 },
      tags: ['gaming', '1440p'],
    },
    {
      id: 'gpu-budget',
      type: 'GPU',
      brand: 'NVIDIA',
      model: 'GTX 1650',
      specs: { type: 'GPU', vramGB: 4, interface: 'PCIe 3.0 x16', lengthMm: 229, widthMm: 111, heightMm: 35, tdpW: 75 },
      tags: ['budget', '1080p'],
    },
    // Motherboards
    {
      id: 'mb-am4-atx',
      type: 'Motherboard',
      brand: 'MSI',
      model: 'B450 Tomahawk MAX',
      specs: { type: 'Motherboard', socket: 'AM4', formFactor: 'ATX', ramSlots: 4, ramType: 'DDR4', maxRamGB: 64, chipset: 'B450', pcieSlots: 2 },
    },
    {
      id: 'mb-intel-matx',
      type: 'Motherboard',
      brand: 'ASUS',
      model: 'Prime B660M-A',
      specs: { type: 'Motherboard', socket: 'LGA1700', formFactor: 'Micro-ATX', ramSlots: 4, ramType: 'DDR4', maxRamGB: 128, chipset: 'B660', pcieSlots: 2 },
    },
    // RAM
    {
      id: 'ram-16gb-ddr4',
      type: 'RAM',
      brand: 'Corsair',
      model: 'Vengeance LPX 16GB',
      specs: { type: 'RAM', ramType: 'DDR4', speed: 3200, capacityGB: 16, sticks: 1 },
      tags: ['gaming'],
    },
    {
      id: 'ram-32gb-ddr4',
      type: 'RAM',
      brand: 'G.Skill',
      model: 'Ripjaws V 32GB',
      specs: { type: 'RAM', ramType: 'DDR4', speed: 3600, capacityGB: 32, sticks: 1 },
      tags: ['workstation'],
    },
    {
      id: 'ram-8gb-ddr4',
      type: 'RAM',
      brand: 'Kingston',
      model: 'ValueRAM 8GB',
      specs: { type: 'RAM', ramType: 'DDR4', speed: 2400, capacityGB: 8, sticks: 1 },
      tags: ['budget'],
    },
    // Storage
    {
      id: 'ssd-nvme-1tb',
      type: 'Storage',
      brand: 'Samsung',
      model: '980 PRO 1TB',
      specs: { type: 'Storage', storageType: 'SSD', capacityGB: 1000, interface: 'NVMe' },
      tags: ['gaming', 'fast'],
    },
    {
      id: 'ssd-sata-500gb',
      type: 'Storage',
      brand: 'Crucial',
      model: 'MX500 500GB',
      specs: { type: 'Storage', storageType: 'SSD', capacityGB: 500, interface: 'SATA' },
      tags: ['budget'],
    },
    {
      id: 'hdd-2tb',
      type: 'Storage',
      brand: 'Seagate',
      model: 'Barracuda 2TB',
      specs: { type: 'Storage', storageType: 'HDD', capacityGB: 2000, interface: 'SATA' },
      tags: ['storage'],
    },
    // Cases
    {
      id: 'case-full-tower',
      type: 'Case',
      brand: 'Fractal Design',
      model: 'Define 7',
      specs: { type: 'Case', formFactorCompatibility: ['ATX', 'Micro-ATX', 'Mini-ITX'], maxGpuLengthMm: 491, maxCpuCoolerHeightMm: 185 },
    },
    {
      id: 'case-mid-tower',
      type: 'Case',
      brand: 'NZXT',
      model: 'H510',
      specs: { type: 'Case', formFactorCompatibility: ['ATX', 'Micro-ATX', 'Mini-ITX'], maxGpuLengthMm: 381, maxCpuCoolerHeightMm: 165 },
    },
    // PSUs
    {
      id: 'psu-750w',
      type: 'PSU',
      brand: 'Corsair',
      model: 'RM750x',
      specs: { type: 'PSU', wattage: 750, efficiency: '80+ Gold', modular: true },
    },
    {
      id: 'psu-550w',
      type: 'PSU',
      brand: 'EVGA',
      model: 'BV550',
      specs: { type: 'PSU', wattage: 550, efficiency: '80+ Bronze', modular: false },
    },
  ];

  const mockPrices: Price[] = [
    { componentId: 'cpu-gaming-1', value: 350, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'cpu-budget-1', value: 120, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'gpu-high-end', value: 800, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'gpu-mid-range', value: 400, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'gpu-budget', value: 150, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'mb-am4-atx', value: 120, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'mb-intel-matx', value: 100, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'ram-16gb-ddr4', value: 80, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'ram-32gb-ddr4', value: 150, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'ram-8gb-ddr4', value: 40, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'ssd-nvme-1tb', value: 120, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'ssd-sata-500gb', value: 60, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'hdd-2tb', value: 50, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'case-full-tower', value: 150, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'case-mid-tower', value: 80, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'psu-750w', value: 130, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'psu-550w', value: 70, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
  ];

  describe('Gaming Build Scenarios', () => {
    it('should create a high-end 4K gaming build', () => {
      const gamingBuild: Build = {
        cpu: 'cpu-gaming-1',
        gpu: 'gpu-high-end',
        motherboard: 'mb-am4-atx',
        case: 'case-full-tower',
        psu: 'psu-750w',
        ram: ['ram-16gb-ddr4', 'ram-16gb-ddr4'], // 32GB total
        storage: ['ssd-nvme-1tb'],
        meta: { target: 'gaming', budget: 2500 },
      };

      const report = generateBuildReport(gamingBuild, fullComponentDatabase, mockPrices);

      // Should have no compatibility errors
      expect(report.errors.filter(e => e.severity === 'error')).toHaveLength(0);
      
      // Should have good performance balance
      expect(report.warnings).toHaveLength(0);
      
      // Should be expensive but balanced
      expect(report.totalPrice).toBeGreaterThan(1800);
      expect(report.totalPrice).toBeLessThan(2200);
      
      // Should not need recommendations
      expect(report.recommendations).toHaveLength(0);
      
      expect(report.summary).toContain('No issues detected');
    });

    it('should detect bottlenecks in budget gaming build', () => {
      const budgetBuild: Build = {
        cpu: 'cpu-budget-1', // Weak CPU
        gpu: 'gpu-high-end', // Strong GPU - bottleneck!
        motherboard: 'mb-intel-matx',
        ram: ['ram-8gb-ddr4'], // Only 8GB
        storage: ['hdd-2tb'], // Slow storage
        meta: { target: 'gaming', budget: 800 },
      };

      const report = generateBuildReport(budgetBuild, fullComponentDatabase, mockPrices);

      // Should detect multiple issues
      expect(report.errors).toHaveLength(0); // Still compatible
      expect(report.warnings.length).toBeGreaterThan(0);
      
      // Should generate recommendations
      expect(report.recommendations.length).toBeGreaterThan(0);
      
      // Should be within budget
      expect(report.totalPrice).toBeLessThanOrEqual(800);
    });
  });

  describe('Compatibility Edge Cases', () => {
    it('should handle socket mismatch gracefully', () => {
      const socketMismatchBuild: Build = {
        cpu: 'cpu-gaming-1', // AM4
        gpu: 'gpu-budget',
        motherboard: 'mb-intel-matx', // LGA1700 - mismatch!
        ram: ['ram-8gb-ddr4'],
        storage: ['ssd-sata-500gb'],
        meta: { target: 'gaming' },
      };

      const report = generateBuildReport(socketMismatchBuild, fullComponentDatabase, mockPrices);

      // Should detect socket mismatch
      expect(report.errors.some(e => e.code === 'cpu-socket-mismatch')).toBe(true);
      
      // Should provide recommendations to fix it
      expect(report.recommendations.some(r => r.reasonCode === 'cpu-socket-mismatch')).toBe(true);
    });
  });

  describe('Complete User Workflows', () => {
    it('should handle full build creation workflow', () => {
      // Step 1: User selects components
      const userBuild: Build = {
        cpu: 'cpu-gaming-1',
        gpu: 'gpu-mid-range',
        motherboard: 'mb-am4-atx',
        case: 'case-mid-tower',
        psu: 'psu-550w',
        ram: ['ram-16gb-ddr4'],
        storage: ['ssd-nvme-1tb'],
        meta: { target: 'gaming', budget: 1500 },
      };

      // Step 2: System analyzes compatibility
      const compatibilityResults = checkCompatibility(userBuild, fullComponentDatabase);
      
      // Step 3: System checks balance
      const balanceResults = checkBalance(userBuild, fullComponentDatabase);
      
      // Step 4: System generates recommendations
      const recommendations = generateRecommendations(userBuild, fullComponentDatabase, compatibilityResults, balanceResults);
      
      // Step 5: Generate final report
      const report = generateBuildReport(userBuild, fullComponentDatabase, mockPrices);

      // Verify complete workflow
      expect(compatibilityResults).toBeDefined();
      expect(balanceResults).toBeDefined();
      expect(recommendations).toBeDefined();
      expect(report).toBeDefined();
      
      // Should be a well-balanced build
      expect(report.errors.filter(e => e.severity === 'error')).toHaveLength(0);
      expect(report.totalPrice).toBeLessThanOrEqual(1500);
      
      // Debug system should have recorded this workflow
      const health = debug.getHealth();
      expect(health.metrics.performanceCount).toBeGreaterThan(0);
    });
  });
});

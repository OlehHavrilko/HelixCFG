import { z } from 'zod';

// Basic types
export const ComponentTypeSchema = z.enum(['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'Cooler', 'Case', 'PSU']);
export const CurrencySchema = z.enum(['UAH', 'USD']);
export const TargetSchema = z.enum(['gaming', 'work', 'mixed']);
export const SeveritySchema = z.enum(['error', 'warning', 'info']);

// Dimensions
export const DimensionsSchema = z.object({
  lengthMm: z.number().positive(),
  widthMm: z.number().positive(),
  heightMm: z.number().positive(),
});

// Component specs
export const CpuSpecsSchema = z.object({
  type: z.literal('CPU'),
  socket: z.string(),
  cores: z.number().int().positive(),
  threads: z.number().int().positive(),
  baseClock: z.number().positive(),
  boostClock: z.number().positive(),
  tdpW: z.number().positive(),
  integratedGraphics: z.boolean().optional(),
});

export const GpuSpecsSchema = z.object({
  type: z.literal('GPU'),
  vramGB: z.number().positive(),
  interface: z.string(),
  lengthMm: z.number().positive(),
  widthMm: z.number().positive(),
  heightMm: z.number().positive(),
  tdpW: z.number().positive(),
});

export const MotherboardSpecsSchema = z.object({
  type: z.literal('Motherboard'),
  socket: z.string(),
  formFactor: z.string(),
  ramSlots: z.number().int().positive(),
  ramType: z.string(),
  maxRamGB: z.number().positive(),
  chipset: z.string(),
  pcieSlots: z.number().int().positive(),
});

export const RamSpecsSchema = z.object({
  type: z.literal('RAM'),
  ramType: z.string(),
  speed: z.number().positive(),
  capacityGB: z.number().positive(),
  sticks: z.literal(1),
});

export const StorageSpecsSchema = z.object({
  type: z.literal('Storage'),
  storageType: z.enum(['SSD', 'HDD']),
  capacityGB: z.number().positive(),
  interface: z.string(),
});

export const CoolerSpecsSchema = z.object({
  type: z.literal('Cooler'),
  coolerType: z.enum(['air', 'liquid']),
  socketCompatibility: z.array(z.string()),
  tdpW: z.number().positive(),
});

export const CaseSpecsSchema = z.object({
  type: z.literal('Case'),
  formFactorCompatibility: z.array(z.string()),
  maxGpuLengthMm: z.number().positive(),
  maxCpuCoolerHeightMm: z.number().positive(),
});

export const PsuSpecsSchema = z.object({
  type: z.literal('PSU'),
  wattage: z.number().positive(),
  efficiency: z.string(),
  modular: z.boolean(),
});

export const ComponentSpecsSchema = z.discriminatedUnion('type', [
  CpuSpecsSchema,
  GpuSpecsSchema,
  MotherboardSpecsSchema,
  RamSpecsSchema,
  StorageSpecsSchema,
  CoolerSpecsSchema,
  CaseSpecsSchema,
  PsuSpecsSchema,
]);

// Component
export const ComponentSchema = z.object({
  id: z.string(),
  type: ComponentTypeSchema,
  brand: z.string(),
  model: z.string(),
  specs: ComponentSpecsSchema,
  dimensions: DimensionsSchema.optional(),
  tags: z.array(z.string()).optional(),
});

// Build
export const BuildSchema = z.object({
  cpu: z.string().optional(),
  gpu: z.string().optional(),
  motherboard: z.string().optional(),
  cooler: z.string().optional(),
  case: z.string().optional(),
  psu: z.string().optional(),
  ram: z.array(z.string()).max(4),
  storage: z.array(z.string()).max(6),
  meta: z.object({
    target: TargetSchema,
    budget: z.number().positive().optional(),
  }),
});

// Price
export const PriceSchema = z.object({
  componentId: z.string(),
  value: z.number().positive(),
  currency: CurrencySchema,
  source: z.enum(['average', 'manual']),
  updatedAt: z.string().datetime(),
});

// RuleResult
export const RuleResultSchema = z.object({
  code: z.string(),
  severity: SeveritySchema,
  message: z.string(),
  reason: z.string(),
  affectedIds: z.array(z.string()),
});

// Recommendation
export const RecommendationSchema = z.object({
  reasonCode: z.string(),
  message: z.string(),
  replaceId: z.string(),
  alternatives: z.array(z.string()),
  expectedEffect: z.string(),
});

// LineItem
export const LineItemSchema = z.object({
  componentId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  total: z.number().positive(),
  currency: CurrencySchema,
});

// Fitment
export const FitmentSchema = z.object({
  componentId: z.string(),
  position: z.string(),
  conflicts: z.array(z.string()),
});

// BuildReport
export const BuildReportSchema = z.object({
  totalPrice: z.number(),
  lineItems: z.array(LineItemSchema),
  errors: z.array(RuleResultSchema),
  warnings: z.array(RuleResultSchema),
  recommendations: z.array(RecommendationSchema),
  summary: z.string(),
  fitment: z.array(FitmentSchema).optional(),
});

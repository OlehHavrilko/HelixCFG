import { Build, BuildReport, Component, Fitment, LineItem, Price } from '../model/types';
import { checkCompatibility } from '../engines/compatibility';
import { checkBalance } from '../engines/balance';
import { generateRecommendations } from '../engines/recommendations';

export function generateBuildReport(
  build: Build,
  components: Component[],
  prices: Price[]
): BuildReport {
  // Get selected components
  const selectedComponents = getSelectedComponents(build, components);

  // Check compatibility (errors)
  const errors = checkCompatibility(build, components);

  // Check balance (warnings)
  const warnings = checkBalance(build, components);

  // Generate recommendations
  const recommendations = generateRecommendations(build, components, errors, warnings);

  // Calculate pricing
  const { totalPrice, lineItems } = calculatePricing(selectedComponents, prices);

  // Summary
  const summary = generateSummary(build, errors, warnings, totalPrice);

  // Fitment (basic, for now empty or simple)
  const fitment: Fitment[] = []; // TODO: implement if needed

  return {
    totalPrice,
    lineItems,
    errors,
    warnings,
    recommendations,
    summary,
    fitment,
  };
}

function getSelectedComponents(build: Build, components: Component[]): Component[] {
  const ids = [
    build.cpu,
    build.gpu,
    build.motherboard,
    build.cooler,
    build.case,
    build.psu,
    ...build.ram,
    ...build.storage,
  ].filter(Boolean) as string[];

  return ids.map(id => components.find(c => c.id === id)!).filter(Boolean);
}

function calculatePricing(selectedComponents: Component[], prices: Price[]): { totalPrice: number; lineItems: LineItem[] } {
  const lineItems: LineItem[] = [];
  let total = 0;

  // Group by component id
  const grouped = selectedComponents.reduce((acc, comp) => {
    acc[comp.id] = (acc[comp.id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  for (const [id, qty] of Object.entries(grouped)) {
    const price = prices.find(p => p.componentId === id);
    if (price) {
      const unitPrice = price.value;
      const totalForItem = unitPrice * qty;
      lineItems.push({
        componentId: id,
        quantity: qty,
        unitPrice,
        total: totalForItem,
        currency: price.currency,
      });
      total += totalForItem;
    }
  }

  return { totalPrice: total, lineItems };
}

function generateSummary(build: Build, errors: any[], warnings: any[], totalPrice: number): string {
  const errorCount = errors.length;
  const warningCount = warnings.length;
  const target = build.meta.target;

  let summary = `Build for ${target} with ${totalPrice} USD total.`;
  if (errorCount > 0) {
    summary += ` ${errorCount} compatibility error(s) found.`;
  }
  if (warningCount > 0) {
    summary += ` ${warningCount} balance warning(s).`;
  }
  if (errorCount === 0 && warningCount === 0) {
    summary += ' No issues detected.';
  }

  return summary;
}

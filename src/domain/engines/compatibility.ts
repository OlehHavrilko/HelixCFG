import { Build, Component, RuleResult } from '../model/types';
import { RuleEngine } from './ruleEngine';
import {
  socketCompatibilityRule,
  ramTypeCompatibilityRule,
  formFactorCompatibilityRule,
  gpuLengthCompatibilityRule,
  psuWattageRule,
  ramSlotsRule,
  coolerCompatibilityRule
} from './rules';

// Create and configure the rule engine
const ruleEngine = new RuleEngine();

// Register all compatibility rules
ruleEngine.register(socketCompatibilityRule);
ruleEngine.register(ramTypeCompatibilityRule);
ruleEngine.register(formFactorCompatibilityRule);
ruleEngine.register(gpuLengthCompatibilityRule);
ruleEngine.register(psuWattageRule);
ruleEngine.register(ramSlotsRule);
ruleEngine.register(coolerCompatibilityRule);

export function checkCompatibility(build: Build, components: Component[]): RuleResult[] {
  return ruleEngine.execute(build, components);
}

// Export the rule engine for advanced usage
export { ruleEngine };
export type { CompatibilityRule } from './ruleEngine';

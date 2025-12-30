import { Build, Component, RuleResult } from '../model/types';

export interface CompatibilityRule {
  id: string;
  name: string;
  check: (build: Build, components: Component[]) => RuleResult | null;
  priority: number;
  category: 'compatibility' | 'balance' | 'optimization';
  enabled: boolean;
}

export class RuleEngine {
  private rules: Map<string, CompatibilityRule> = new Map();

  register(rule: CompatibilityRule): void {
    this.rules.set(rule.id, rule);
  }

  unregister(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  enableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
    }
  }

  disableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
    }
  }

  execute(build: Build, components: Component[]): RuleResult[] {
    return Array.from(this.rules.values())
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority)
      .map(rule => rule.check(build, components))
      .filter((result): result is RuleResult => result !== null);
  }

  getRulesByCategory(category: CompatibilityRule['category']): CompatibilityRule[] {
    return Array.from(this.rules.values())
      .filter(rule => rule.category === category);
  }

  getRule(ruleId: string): CompatibilityRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): CompatibilityRule[] {
    return Array.from(this.rules.values());
  }
}

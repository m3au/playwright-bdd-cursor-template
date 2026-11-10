export type LighthouseGatedCategory =
  | 'performance'
  | 'accessibility'
  | 'best-practices'
  | 'seo';

export interface TargetGatePolicy {
  readonly lighthouseCategories: readonly LighthouseGatedCategory[];
  readonly axeViolationGate: boolean;
  readonly localhostSimulatedPerformance?: boolean;
}

export const targetGatePolicies: Record<string, TargetGatePolicy> = {
  'polymer-shop': {
    lighthouseCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    axeViolationGate: true,
  },
  'w3c-bad': {
    lighthouseCategories: [],
    axeViolationGate: true,
    localhostSimulatedPerformance: true,
  },
  'w3c-after': {
    lighthouseCategories: [],
    axeViolationGate: true,
    localhostSimulatedPerformance: true,
  },
  'deque-mars': {
    lighthouseCategories: [],
    axeViolationGate: true,
  },
};

export function gatePolicyForTarget(targetId: string): TargetGatePolicy {
  const policy = targetGatePolicies[targetId];
  if (!policy) {
    throw new Error(`No gate policy registered for ${targetId}`);
  }
  if (!policy.axeViolationGate && policy.lighthouseCategories.length === 0) {
    throw new Error(`Gate policy for ${targetId} would gate nothing`);
  }
  return policy;
}

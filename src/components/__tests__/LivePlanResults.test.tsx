import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AccessoryRecommendation, SalesContext, SalesScript } from '../../types';
import LivePlanResults from '../LivePlanResults';

function context(overrides: Partial<SalesContext> = {}): SalesContext {
  return {
    age: '25-34',
    region: 'Pacific Northwest',
    product: ['Phone'],
    purchaseIntent: 'ready to buy',
    currentPlatform: 'iOS',
    ...overrides,
  };
}

function recommendation(overrides: Partial<AccessoryRecommendation>): AccessoryRecommendation {
  return {
    itemId: 'case',
    name: 'Protective Case',
    why: 'Drop protection for the device they are buying.',
    priceRange: '$39.99',
    brands: ['Tech21'],
    bundleEligible: true,
    proofText: 'Case protection proof.',
    eligibilityStatus: 'quote-safe',
    ...overrides,
  };
}

function script(accessoryRecommendations: AccessoryRecommendation[] = []): SalesScript {
  return {
    welcomeMessages: ['I can get that started - what are you looking to solve today?'],
    smallTalk: [],
    discoveryQuestions: ['What matters most on this call?'],
    valuePropositions: ['Use one value point that matches what they already told you.'],
    objectionHandling: [],
    accessoryRecommendations,
    purchaseSteps: ['Confirm the next step and keep the close simple.'],
    oneLiners: ['Keep it simple.'],
    coachsCorner: 'Stay focused.',
    nearbyStores: [],
    groundingSources: [],
  };
}

describe('LivePlanResults', () => {
  it('renders one earned attach max instead of a grid of random offers', () => {
    render(
      <LivePlanResults
        context={context()}
        script={script([
          recommendation({ itemId: 'case', name: 'Protective Case' }),
          recommendation({ itemId: 'charger', name: 'Fast Charger', why: 'Fast charging.' }),
        ])}
      />,
    );

    expect(screen.getByText('Earned add-on')).toBeInTheDocument();
    expect(screen.getByText('Protective Case')).toBeInTheDocument();
    expect(screen.queryByText('Fast Charger')).not.toBeInTheDocument();
  });

  it('shows a relationship-first empty state when no product has earned an add-on', () => {
    render(
      <LivePlanResults
        context={context({ product: ['No Specific Product'] })}
        script={script([recommendation({ itemId: 'case', name: 'Protective Case' })])}
      />,
    );

    expect(screen.getByText('No add-on yet')).toBeInTheDocument();
    expect(screen.getByText(/ask what product they are solving for first/i)).toBeInTheDocument();
    expect(screen.queryByText('Protective Case')).not.toBeInTheDocument();
  });

  it('does not show the old generic source or fake opener labels', () => {
    render(
      <LivePlanResults
        context={context()}
        script={script([recommendation({ itemId: 'case', name: 'Protective Case' })])}
      />,
    );

    expect(screen.queryByText(/^Source$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/built from the local sales plan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/kip says/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /hide details/i })).not.toBeInTheDocument();
  });
});

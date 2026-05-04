import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SalesContext } from '../../types';
import GuidedContextFlow from '../GuidedContextFlow';

function context(overrides: Partial<SalesContext> = {}): SalesContext {
  return {
    age: '25-34',
    region: 'Pacific Northwest',
    product: ['Phone'],
    purchaseIntent: 'ready to buy',
    ...overrides,
  };
}

describe('GuidedContextFlow', () => {
  it('highlights the prior answer and lets the rep go back without data loss', () => {
    const onStepChange = vi.fn();

    render(
      <GuidedContextFlow
        context={context()}
        setContext={vi.fn()}
        onComplete={vi.fn()}
        currentStep="product"
        onStepChange={onStepChange}
      />,
    );

    const selectedPhone = screen.getByRole('button', { name: /phone/i });
    expect(selectedPhone.className).toContain('border-t-magenta');

    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onStepChange).toHaveBeenCalledWith('hintCheck');
  });

  it('supports keyboard back navigation for fast correction', () => {
    const onStepChange = vi.fn();

    render(
      <GuidedContextFlow
        context={context({ totalLines: 2 })}
        setContext={vi.fn()}
        onComplete={vi.fn()}
        currentStep="lines"
        onStepChange={onStepChange}
      />,
    );

    fireEvent.keyDown(window, { key: 'ArrowLeft', ctrlKey: true });
    expect(onStepChange).toHaveBeenCalledWith('carrier');
  });
});

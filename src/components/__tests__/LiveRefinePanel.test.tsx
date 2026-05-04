import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SalesContext } from '../../types';
import LiveRefinePanel from '../LiveRefinePanel';

const baseContext: SalesContext = {
  age: 'Not Specified',
  region: 'Not Specified',
  product: ['Phone'],
  purchaseIntent: 'ready to buy',
  customerRelationship: 'unknown',
  discountProfile: 'unknown',
  householdTags: [],
};

describe('LiveRefinePanel', () => {
  it('keeps Quick Tune actions reachable and applies optional profile context', () => {
    const onApply = vi.fn();

    render(
      <LiveRefinePanel
        open
        context={baseContext}
        onClose={vi.fn()}
        onApply={onApply}
      />,
    );

    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^close$/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /senior \/ low-tech/i }));
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({
      age: '55+',
      profilePreset: 'senior-low-tech',
      householdTags: ['caregiver'],
    }));
  });
});

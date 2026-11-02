import { render } from '@testing-library/react-native';
import { BankBreakdown } from '../src/components/BankBreakdown';
import { accounts } from '../src/data/mock';

describe('BankBreakdown', () => {
  it('shows a total for Khaya Bank and each linked bank', () => {
    const linked = [{ id: 'cap-chq', name: 'Cheque account', type: 'cheque' as const, number: '•••• 1111', balance: 1000, institutionId: 'capitec', institutionName: 'Capitec', connectionId: 'c1' }];
    const { getByText } = render(<BankBreakdown accounts={[...accounts, ...linked]} />);
    expect(getByText('Khaya Bank')).toBeTruthy();
    expect(getByText('Capitec')).toBeTruthy();
    expect(getByText('Across your banks')).toBeTruthy();
  });
});

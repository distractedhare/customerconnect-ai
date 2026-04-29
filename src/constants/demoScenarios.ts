import { SalesContext } from '../types';

export interface DemoScenario {
  name: string;
  description: string;
  emoji: string;
  context: SalesContext;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    name: 'Switcher from Verizon',
    description: 'Young professional comparing carriers. Wants the best phone deal and streaming perks.',
    emoji: '📱',
    context: {
      age: '25-34',
      region: 'California',
      state: 'California',
      zipCode: '90210',
      product: ['Phone'],
      purchaseIntent: 'upgrade / add a line',
      currentCarrier: 'Verizon',
    },
  },
  {
    name: 'Family Plan Shopper',
    description: 'Parent of 3 looking to bundle phones + home internet. Ready to commit if the price is right.',
    emoji: '👨‍👩‍👧‍👦',
    context: {
      age: '35-54',
      region: 'Great Lakes',
      state: 'Illinois',
      zipCode: '60614',
      product: ['Phone', 'Home Internet'],
      purchaseIntent: 'ready to buy',
      currentCarrier: 'AT&T',
    },
  },
  {
    name: 'Gen Z First-Timer',
    description: 'College student on a prepaid plan, exploring their first postpaid account.',
    emoji: '🎓',
    context: {
      age: '18-24',
      region: 'South Atlantic',
      state: 'Georgia',
      zipCode: '30301',
      product: ['Phone', 'IOT'],
      purchaseIntent: 'exploring',
      currentCarrier: 'Prepaid (Mint, Boost, etc.)',
    },
  },
  {
    name: 'USC Migration',
    description: 'US Cellular customer being migrated to T-Mobile — retention play with new customer deals.',
    emoji: '🔄',
    context: {
      age: '35-54',
      region: 'Great Lakes',
      state: 'Wisconsin',
      zipCode: '53703',
      product: ['Phone'],
      purchaseIntent: 'upgrade / add a line',
      currentCarrier: 'US Cellular',
    },
  },
  {
    name: 'Tech Support Pivot',
    description: 'Their phone is acting up. Fix it, then pivot to P360 and Home Internet.',
    emoji: '🛠️',
    context: {
      age: '25-34',
      region: 'Pacific Northwest',
      state: 'Washington',
      zipCode: '98101',
      product: ['Phone', 'Home Internet'],
      purchaseIntent: 'tech support',
      currentCarrier: 'AT&T',
    },
  },
  {
    name: 'Budget-Conscious Family',
    description: 'Family on Mint/Boost looking at postpaid. Price-sensitive — lead with value, not features.',
    emoji: '💸',
    context: {
      age: '55+',
      region: 'South Atlantic',
      state: 'Virginia',
      zipCode: '23219',
      product: ['Phone', 'Home Internet'],
      purchaseIntent: 'exploring',
      currentCarrier: 'Prepaid (Mint, Boost, etc.)',
    },
  },
];

import data from './catalog.generated.json';
import type { Concept } from '@noetherwake/engine';
export const catalog = data as unknown as Concept[];
export const concept = (id: string) => catalog.find((c) => c.id === id)!;
export const goals = [
  {
    id: 'conservation-energy',
    title: 'Understand mechanics',
    description: 'From mathematical foundations to motion, force and energy.',
    label: 'Math → Physics',
  },
  {
    id: 'substitution',
    title: 'Build calculus intuition',
    description: 'Understand change and accumulation, from algebra upward.',
    label: 'Math',
  },
  {
    id: 'capacitance',
    title: 'Explore electricity',
    description:
      'Follow the math behind fields, energy and your first circuits.',
    label: 'Physics + Math',
  },
];

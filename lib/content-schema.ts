import { z } from 'zod';
const id = z.string().regex(/^[a-z][a-z0-9-]*$/);
const template = z.object({
  id,
  kind: z.enum([
    'numeric',
    'symbolic',
    'choice',
    'ordering',
    'error',
    'point',
    'simulation',
    'proof',
  ]),
  prompt: z.string().min(15),
  answer: z.string().min(1),
  parameters: z.record(
    z.string(),
    z.tuple([z.number().int(), z.number().int()]).refine(([a, b]) => a <= b),
  ),
  unit: z.string(),
  difficulty: z.number().min(0).max(1),
  expectedSeconds: z.number().positive(),
  hints: z.tuple([z.string().min(10), z.string().min(10), z.string().min(10)]),
  solution: z.string().min(30),
  choices: z
    .array(z.object({ text: z.string(), misconception: z.string().optional() }))
    .optional(),
});
export const conceptSchema = z.object({
  id,
  title: z.string().min(4),
  domain: z.enum(['math', 'physics']),
  strand: z.string(),
  prerequisites: z.array(id),
  softPrerequisites: z.array(id),
  difficulty: z.number().min(0).max(1),
  representations: z
    .array(z.enum(['symbolic', 'geometric', 'numeric', 'physical']))
    .refine((r) =>
      ['symbolic', 'geometric', 'numeric'].every((x) =>
        r.includes(x as 'symbolic'),
      ),
    ),
  misconceptions: z
    .array(
      z.object({
        id,
        description: z.string().min(10),
        remediation: z.string().min(25),
      }),
    )
    .min(1),
  generators: z.array(template).min(3),
  interactive: z.object({
    kind: z.enum(['curve', 'motion']),
    prompt: z.string().min(30),
    prediction: z.string().min(20),
    parameterLabel: z.string(),
    min: z.number(),
    max: z.number(),
    initial: z.number(),
    formula: z.string(),
    xLabel: z.string(),
    yLabel: z.string(),
  }),
  derivation: z
    .array(z.object({ expression: z.string(), rule: z.string(), concept: id }))
    .min(2),
  explanation: z.object({
    prompt: z.string(),
    keywords: z.array(z.array(z.string()).min(1)).min(1),
  }),
  summary: z.string().min(80),
  boundary: z.string().min(40),
});

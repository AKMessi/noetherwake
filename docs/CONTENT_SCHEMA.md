# Content format and authoring contract

Source: `content/concepts/<id>.mdx`, YAML frontmatter parsed with gray-matter and Zod, markdown/MDX compiled at build time. Content is trusted repository content; user input is never compiled as MDX.

Required fields: `id`, `title`, `domain` (math|physics), `strand`, `prerequisites` (hard IDs), `softPrerequisites`, `difficulty` [0,1], `representations` (symbolic, geometric, numeric, physical; first three required), `misconceptions` [{id,description,remediation}], `generators` (≥3), `interactive` {kind,prompt,prediction,parameterLabel,min,max,initial,formula,xLabel,yLabel}, `derivation` [{expression,rule,concept}], `explanation` {prompt,keywords}, `summary`, `boundary`.

Each generator: `id`, `kind` (numeric|symbolic|choice|ordering|error|point|simulation|proof), `prompt` containing named parameters, `answer` safe arithmetic expression or canonical symbolic string, `parameters` record of integer [min,max], `unit` SI-compatible string, `difficulty`, `expectedSeconds`, `hints` exactly three strings, `choices` optional [{text,misconception?}], `solution` rule explanation. Substitutions use `{a}` syntax. Evaluation uses a whitelist arithmetic parser, never JavaScript eval. Parameter bounds must avoid singularities. Every generated instance carries concepts, seed, difficulty, expected time, units and misconception IDs.

Lesson sections are `## Intuition`, `## Formalism`, `## Worked example`, `## Where it breaks`. Math uses `$...$` or `$$...$$`; KaTeX compilation must succeed. Internal concept links use `[title](concept:<id>)` and are checked. Lessons are short but explain mechanisms before notation; physics derives from principles and links the actual math prerequisite. The derivation metadata enables a rule-annotated collapsible stepper. The interactive is a linked numeric/graph/symbolic instrument with a committed prediction before reveal; dynamics use a shared RK4 worker.

Run `npm run content:check` to validate schema, DAG, reachability, all links, KaTeX, MDX compilation, 1,000 seeds per template (finite, verifiable answers, plausible bounded magnitudes and valid units), and build the catalog. No planned node may masquerade as a complete lesson. Add breadth only with reviewed source content; use `content/templates/concept.mdx` as the authoring guide.

## Validation limitations
Generator fuzzing detects runtime failures, not whether the physics model fits every context. Units are explicit and dimension-checked; an author must still review derivations, misconceptions and parameter realism. Independent subject-matter review remains a release requirement for classroom deployment. Domain restrictions and finite precision must appear beside formulas.

Runtime item metadata also includes `concepts` (the focus node and its hard prerequisites), `misconceptionTags`, and the seed. Choice distractors resolve to individual named causes with different remediation. The initial curriculum has all eight declared item kinds; graph-point tasks currently use a one-dimensional number line, simulation assessment uses level-ground projectile range, and proof completion is a constrained skeleton. The content bank has bounded parameter ranges and repeated seeded draws, not infinitely many distinct contexts. Wider variant/context coverage requires authored templates and review.

The initial authoring scripts are a bootstrap record. `refine-content.py` adds intermediate derivation equations and distractor-specific remediation; neither bootstrap script runs during builds. The editable MDX files are the final source of truth.

## Curated expedition annotations

`lib/expeditions.ts` supplies three presentation routes through existing authored concepts. Five landmarks summarize each route; they are not an exhaustive prerequisite sequence. The content build verifies every goal and landmark ID against the MDX catalog and checks the displayed formula with KaTeX. Runtime route sizes use the engine's complete ancestor graph, and every landmark's readiness uses `missing`; presentation never promotes a concept to ready or generates learner evidence.

The Curiosity Studio expands the lesson bodies for fractions, units, vectors, derivatives, integrals, Newton's second law, energy conservation and electric fields. Generator contracts remain unchanged. The authored MDX remains the source of truth; rebuild the catalog rather than hand-editing compiled lesson HTML.

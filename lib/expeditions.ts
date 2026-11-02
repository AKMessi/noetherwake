/** Authored routes through complete catalog lessons. Landmarks are not exhaustive prerequisites. */
export const expeditions = [
  {
    id: "conservation-energy",
    number: "01",
    tag: "MOTION & ENERGY",
    title: "Why does the world move?",
    description:
      "Turn a falling object into a story about vectors, forces and conserved energy.",
    question: "A ball slows as it rises. Where does its energy go?",
    connection:
      "The height you lose becomes the speed you gain. Algebra keeps the energy account balanced.",
    formula: "E_k + E_p = \\text{constant}",
    landmarks: [
      "vectors",
      "velocity",
      "newton-2",
      "kinetic-energy",
      "conservation-energy",
    ],
    art: "orbit",
  },
  {
    id: "substitution",
    number: "02",
    tag: "CHANGE & ACCUMULATION",
    title: "How small becomes infinite.",
    description:
      "Zoom into a curve. Add up tiny pieces. Discover why these two actions are connected.",
    question: "What does the area under a velocity graph actually measure?",
    connection:
      "Velocity tells you how position changes. Accumulating velocity reconstructs displacement.",
    formula: "\\Delta x = \\int_{t_0}^{t_1} v(t)\\,dt",
    landmarks: [
      "functions",
      "limits",
      "derivative",
      "integral",
      "substitution",
    ],
    art: "curve",
  },
  {
    id: "capacitance",
    number: "03",
    tag: "FIELDS & CIRCUITS",
    title: "Make the invisible visible.",
    description:
      "Follow a charge through fields and potential, all the way to a working circuit.",
    question: "How can a battery push charges around a whole circuit?",
    connection:
      "Potential difference gives an energy change per coulomb. Resistance relates that difference to current.",
    formula: "V = IR \\qquad Q = CV",
    landmarks: [
      "charge",
      "electric-field",
      "voltage",
      "circuits",
      "capacitance",
    ],
    art: "field",
  },
] as const;

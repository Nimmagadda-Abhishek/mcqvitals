export const categories = [
  {
    id: 'med',
    title: 'Medical Sciences',
    icon: 'Stethoscope',
    count: 1250,
    color: '#0037b0',
    description: 'Advanced clinical medicine and pathology MCQs for professionals.'
  },
  {
    id: 'eng',
    title: 'Engineering',
    icon: 'Cpu',
    count: 840,
    color: '#4648d4',
    description: 'Core concepts in civil, mechanical, and electrical engineering.'
  },
  {
    id: 'apt',
    title: 'Critical Thinking',
    icon: 'Brain',
    count: 2100,
    color: '#004f35',
    description: 'Quantitative aptitude and logical reasoning for competitive exams.'
  }
];

export const mockTests = [
  {
    id: 't1',
    title: 'Clinical Pathology Mastery',
    category: 'Medical Sciences',
    questions: 50,
    duration: 60,
    difficulty: 'Advanced',
    enrollments: 4500
  },
  {
    id: 't2',
    title: 'Structural Mechanics I',
    category: 'Engineering',
    questions: 30,
    duration: 45,
    difficulty: 'Intermediate',
    enrollments: 1200
  },
  {
    id: 't3',
    title: 'Logical Reasoning Sprint',
    category: 'Critical Thinking',
    questions: 25,
    duration: 20,
    difficulty: 'Beginner',
    enrollments: 8900
  }
];

export const sampleQuestions = [
  {
    id: 1,
    question: "Which of the following cellular structures is responsible for the synthesis of integral membrane proteins?",
    options: [
      "Smooth Endoplasmic Reticulum",
      "Rough Endoplasmic Reticulum",
      "Golgi Apparatus",
      "Lysosomes"
    ],
    correctAnswer: 1,
    explanation: "The Rough Endoplasmic Reticulum (RER) is studded with ribosomes and is the primary site for the synthesis of proteins destined for membranes or secretion."
  },
  {
    id: 2,
    question: "In thermodynamics, what does the Second Law state regarding the entropy of an isolated system?",
    options: [
      "It always decreases over time.",
      "It remains constant.",
      "It always increases over time.",
      "It can either increase or decrease."
    ],
    correctAnswer: 2,
    explanation: "The Second Law of Thermodynamics states that the total entropy of an isolated system can never decrease over time; it can only remain constant or increase."
  }
];

export const mockResources = [
  {
    id: 'r1',
    title: 'Advanced Pathophysiology Guide',
    description: 'Comprehensive guide covering cellular mechanisms and disease progression for clinical specialists.',
    type: 'PDF',
    category: 'Medical Sciences',
    author: 'Admin',
    date: 'Jan 15, 2025',
    fileSize: '4.2 MB'
  },
  {
    id: 'r2',
    title: 'Modern Thermodynamics Lecture Series',
    description: 'A deep dive into the second law and entropy in complex autonomous systems.',
    type: 'Video',
    category: 'Engineering',
    author: 'Admin',
    date: 'Jan 10, 2025',
    duration: '45 mins'
  },
  {
    id: 'r3',
    title: 'Critical Thinking: Logical Fallacies',
    description: 'Mastering the identification of logical fallacies in academic writing and peer reviews.',
    type: 'Article',
    category: 'Critical Thinking',
    author: 'Admin',
    date: 'Jan 05, 2025',
    readTime: '12 mins'
  },
  {
    id: 'r4',
    title: 'Organic Chemistry Synthesis Map',
    description: 'Visualizing reaction pathways for complex carbon-based molecules.',
    type: 'PDF',
    category: 'Medical Sciences',
    author: 'Admin',
    date: 'Dec 22, 2024',
    fileSize: '8.5 MB'
  }
];

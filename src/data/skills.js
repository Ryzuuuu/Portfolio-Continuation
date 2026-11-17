export const skills = [
  "Python",
  "FastAPI",
  "Flask",
  "SQL",
  "pytest",
  "LangChain",
  "LangGraph",
  "LangSmith",
  "OpenCV",
  "YOLOv8",
  "ByteTrack",
  "Scikit-learn",
  "Keras",
  "Pandas",
  "NumPy",
  "AWS",
  "Docker",
  "React",
  "JavaScript",
  "Node.js",
  "Redis",
  "SQLite",
  "Git",
  "CI/CD",
];

// Areas for the Toolbox tabs. Every skill above belongs to one.
export const skillAreas = [
  {
    id: "backend",
    label: "Backend",
    items: ["Python", "FastAPI", "Flask", "SQL", "pytest", "Redis", "SQLite"],
  },
  {
    id: "vision",
    label: "Vision & ML",
    items: ["OpenCV", "YOLOv8", "ByteTrack", "Scikit-learn", "Keras", "Pandas", "NumPy"],
  },
  { id: "llm", label: "LLM", items: ["LangChain", "LangGraph", "LangSmith"] },
  {
    id: "ship",
    label: "Ship",
    items: ["AWS", "Docker", "Git", "CI/CD", "React", "JavaScript", "Node.js"],
  },
];

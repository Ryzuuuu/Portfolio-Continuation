// `color` picks the card's art treatment: "coral", "blue" or "yellow".
// `repo` is optional; cards without one render no link.
export const projects = [
  {
    id: "storesight",
    type: "COMPUTER VISION · BACKEND",
    title: "StoreSight",
    description:
      "Turns live CCTV into store analytics: conversion funnels, heatmaps, and anomaly alerts.",
    impact: "YOLOv8 + ByteTrack · idempotent events · 80%+ pytest coverage",
    color: "coral",
    tags: ["YOLOv8", "ByteTrack", "FastAPI"],
    mark: "S",
    repo: "https://github.com/Ryzuuuu/StoreSight",
  },
  {
    id: "parabridge",
    type: "OPEN SOURCE · BIM / CAD",
    title: "ParaBridge",
    description: "Parametric bridge substructures and IFC4 BIM export for IIT Bombay's Osdag.",
    impact: "5 CAD builders · IFC4 elements validated · OpenCASCADE fixes",
    color: "blue",
    tags: ["PythonOCC", "IfcOpenShell", "Python"],
    mark: "P.",
    repo: "https://github.com/Ryzuuuu/ParaBridge",
  },
];

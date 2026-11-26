# Iter: zoomable cyber flowchart

An input-driven, interactive flowchart that visualises security issues and their remediations for **Microsoft 365, Azure and AWS**, mapped to **NIST CSF 2.0, NIST 800-53, MITRE ATT&CK, SOC 2, GDPR, HIPAA, GLBA and CCPA/CPRA**.

## What it does
- **Tailored to your organisation:** enter industry, business units, environments, data classes, clouds, key software and hardware, and the flowchart adapts
- **Compliance mapping:** nodes carry real control IDs (for example `AC-2`, `T1110`, `Art.32`)
- **Interactive canvas:** React Flow canvas with pan, zoom and progressive disclosure
- **Search and filter:** by title, service, framework ID, cloud, severity, status, business unit and environment
- **Coverage heatmap:** see which frameworks each node covers
- **Export and import:** PNG, PDF, CSV and JSON
- **Accessible:** keyboard shortcuts (`Cmd/Ctrl+K` search), dark mode, WCAG AA contrast targets

## Stack
React, TypeScript, Vite, React Flow (`@xyflow/react`), Zustand, Zod, Tailwind CSS, `html-to-image` and `jsPDF`.

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Repo layout note
This repo also contains a Next.js risk-assessment front end (`app/`, `lib/assessment-*`).

## Customising
Add issues and frameworks by editing the seed catalogue and the `Framework` type; tailoring rules live in `graphGenerator.ts`.

## Licence
Licence not yet added.

Built by [Gouresh Kamble](https://github.com/gkambl).

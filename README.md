# Iter

A client-facing cybersecurity **risk-assessment questionnaire** built for Hanco Cyber. An organisation answers a branching set of questions about its security posture, then sees a risk score, compliance-gap analysis, service recommendations and an ROI estimate.

## What it does

- A landing page that starts the assessment at `/assessment`
- A branching questionnaire: later questions can appear or hide based on earlier answers, such as the respondent's cyber-security knowledge
- Question types: single select, multi-select and slider
- The catalogue covers current security controls, data sensitivity, infrastructure complexity, previous incidents, organisation profile, industry, programme maturity, compliance requirements, investment flexibility, implementation timeline, threat concerns, service-delivery preferences, and follow-on questions for enterprise or startup contexts
- Compliance options in the questionnaire: GDPR, NIS2, ISO 27001, PCI DSS, SOX, HIPAA, Cyber Essentials and the NIST Framework
- Currency preference for pricing estimates: GBP, USD, EUR, CAD and AUD
- A live risk score while the assessment is in progress
- An optional contact form, or continue anonymously; answers are stored in the browser (`localStorage`) and shown on `/results`
- Results: an overall risk score and category, compliance-gap analysis, recommended services with an implementation roadmap, and an ROI estimate (with an assumptions disclaimer on the page)
- A contact path from the results page

## Stack

Next.js 16.4.6 (App Router, static export), React 18.2, TypeScript, Tailwind CSS, Zod, Radix UI and ESLint 9.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # next build --webpack; writes a static export to out/
```

## Licence

Licence not yet added.

Built by [Gouresh Kamble](https://github.com/gkambl).

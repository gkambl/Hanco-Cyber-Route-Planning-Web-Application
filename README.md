# Hanco-Cyber-Route-Planning-Web-Application


# Iter - Zoomable Cyber Flowchart App

An input-driven, interactive flowchart application that visualizes security issues and remediations for M365, Azure, and AWS, mapped to compliance frameworks including NIST CSF 2.0, NIST 800-53, MITRE ATT&CK, SOC 2, GDPR, HIPAA, GLBA, and CCPA/CPRA.

## Features

- **Input-Driven Generation**: Customize the flowchart based on your organization's specific context (industry, business units, environments, clouds, software, hardware)
- **Multi-Cloud Coverage**: Supports M365, Azure, and AWS with tailored security issues and remediations
- **Compliance Mapping**: Maps security controls to 8 major frameworks with real control IDs
- **Interactive Canvas**: Zoomable React Flow canvas with pan, zoom, and progressive disclosure
- **Search & Filter**: Full-text search across titles, services, and framework IDs; advanced filtering by cloud, status, severity, framework, BU, and environment
- **Coverage Heatmap**: Visual indication of framework coverage for each node
- **Export/Import**: Export to PNG, PDF, JSON, and CSV formats; import previous configurations
- **Dark Mode**: Accessible theme with Hanco brand color (#0399b8)
- **Keyboard Shortcuts**: Cmd/Ctrl+K for search, +/- for zoom, 0 to reset view

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Flow** (@xyflow/react) for node-based canvas
- **Zustand** for state management
- **Zod** for input validation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **html-to-image** and **jsPDF** for exports

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How to Use

### 1. Fill in the Input Panel

On the left side of the screen, enter your organization's information:

- **Company Name**: Your organization name
- **Industry**: e.g., "Financial Services", "Healthcare", "Technology"
- **Business Units**: Comma-separated list (e.g., "Engineering, Sales, Operations")
- **Environments**: Comma-separated list (e.g., "Production, Development, Test")
- **Data Classifications**: Comma-separated list (e.g., "Public, Internal, Confidential, Restricted")
- **Clouds in Scope**: Check M365, Azure, and/or AWS
- **Key Software/Services**: Comma-separated (e.g., "Okta, CrowdStrike, Snowflake")
- **Key Hardware/Platforms**: Comma-separated (e.g., "Palo Alto NGFW, Cisco ASA")
- **Compliance Frameworks**: Select relevant frameworks (default: NIST CSF 2.0, NIST 800-53, MITRE ATT&CK, SOC 2, GDPR)
- **Risk Weighting**: Set default impact, likelihood, and exposure values (1-5)

### 2. Generate Graph

Click the **"Generate Graph"** button to create your tailored flowchart. The app will:

- Filter issues by selected clouds
- Boost risk scores for industry-relevant issues
- Add business unit, environment, and data classification tags
- Include integration links for specified software/hardware
- Show only selected compliance frameworks

### 3. Explore the Canvas

- **Pan**: Click and drag the background
- **Zoom**: Use the controls, mouse wheel, or +/- keys
- **Search**: Use the search bar or press Cmd/Ctrl+K to find nodes by title, service, or framework ID (e.g., "AC-2", "T1110", "Art.32")
- **Filter**: Click the Filters button to narrow by cloud, status, severity, or framework
- **Coverage Heatmap**: Toggle to color nodes by framework coverage (green = high, yellow = medium, red = low)

### 4. Export & Import

- **Export PNG/PDF**: Capture the current viewport as an image or PDF
- **Export Coverage CSV**: Download a spreadsheet with all nodes and their framework mappings
- **Export JSON**: Save inputs for later use
- **Import JSON**: Load previously saved inputs

## Data Model

### Node Types

- **Issue**: Security problems or gaps
- **Detection**: Methods to identify the issue
- **Remediation**: Steps to fix the issue (includes detailed steps, guardrails, rollback, success criteria, automation hints)
- **Validation**: Confirmation that remediation worked
- **Control**: Security control reference
- **Reference**: External documentation

### Framework Mappings

Each node can be mapped to multiple frameworks with specific control IDs:

- **NIST CSF 2.0**: e.g., ID.AM-1, PR.AC-1, DE.CM-1
- **NIST 800-53**: e.g., AC-2, IA-2(1), SC-28
- **MITRE ATT&CK**: e.g., T1078, T1110, T1530
- **SOC 2**: e.g., CC6.1, CC7.2
- **GDPR**: e.g., Art.32
- **HIPAA**: e.g., 164.312(a)(1)
- **GLBA**: Various safeguards
- **CCPA/CPRA**: California privacy requirements

### Seed Catalog

The app ships with 60+ pre-built nodes covering common issues across M365, Azure, and AWS:

#### M365 Examples
- MFA disabled for admin accounts
- Legacy authentication enabled
- Guest user sprawl
- Unmanaged devices accessing data

#### Azure Examples
- Public storage accounts
- Unencrypted managed disks
- Overly permissive NSG rules
- Uncentralized logs

#### AWS Examples
- Public S3 buckets
- Root account with active keys
- Wildcard IAM policies
- Security groups allowing 0.0.0.0/0
- CloudTrail not enabled
- GuardDuty disabled

Each issue includes Detection, Remediation (with detailed steps), and Validation nodes.

## Customization

### Adding New Issues

Edit `src/data/seedCatalog.ts` to add new nodes:

```typescript
{
  id: 'custom-issue-1',
  type: 'issue',
  title: 'Your Issue Title',
  summary: 'Description of the issue',
  cloud: 'Azure',
  services: ['Service Name'],
  risk: { impact: 4, likelihood: 3, exposure: 4 },
  status: 'Open',
  frameworks: [
    { framework: 'NIST 800-53', id: 'AC-2', title: 'Account Management' },
    { framework: 'MITRE ATT&CK', id: 'T1078', title: 'Valid Accounts' },
  ],
}
```

### Adding New Frameworks

1. Update the `Framework` type in `src/types.ts`
2. Add the framework to `ALL_FRAMEWORKS` in `src/components/InputPanel.tsx`
3. Add framework mappings to relevant nodes in `src/data/seedCatalog.ts`

### Customizing Tailoring Logic

Edit `src/graphGenerator.ts` to adjust how inputs affect the generated graph:

- **INDUSTRY_FRAMEWORK_PRIORITIES**: Map industries to preferred frameworks
- **INDUSTRY_ISSUE_BOOST**: Map industries to keywords that increase risk scores
- Software/hardware integration logic

## Accessibility

- **Keyboard Navigation**: Full keyboard support with shortcuts
- **Screen Readers**: ARIA labels on interactive elements
- **Color Contrast**: All text meets WCAG AA contrast ratios (≥4.5:1) against backgrounds
- **Focus Indicators**: Clear focus rings on all interactive elements
- **Dark Mode**: High contrast dark theme available

## Theme

The app uses Hanco brand color **#0399b8** as the primary accent, with a carefully crafted color scale from 50-900 for both light and dark modes. All colors have been tested for accessibility.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Example Configurations

### Healthcare Organization

```json
{
  "company": "General Hospital",
  "industry": "Healthcare",
  "businessUnits": "Clinical, Administrative, IT",
  "environments": "Production, Test",
  "dataClasses": "Public, PHI, Restricted",
  "clouds": ["M365", "Azure"],
  "software": "Epic, Okta, CrowdStrike",
  "hardware": "Palo Alto NGFW",
  "frameworks": ["HIPAA", "NIST 800-53", "SOC 2"],
  "riskDefaults": { "impact": 5, "likelihood": 4, "exposure": 5 }
}
```

### Financial Services Company

```json
{
  "company": "Acme Financial",
  "industry": "Financial Services",
  "businessUnits": "Retail Banking, Investment, Compliance",
  "environments": "Production, UAT, Development",
  "dataClasses": "Public, Internal, Confidential, Restricted",
  "clouds": ["M365", "Azure", "AWS"],
  "software": "Okta, Snowflake, Fortinet",
  "hardware": "HSMs, Cisco ASA",
  "frameworks": ["GLBA", "SOC 2", "NIST 800-53", "NIST CSF 2.0"],
  "riskDefaults": { "impact": 4, "likelihood": 3, "exposure": 4 }
}
```

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- Code passes TypeScript checks (`npm run typecheck`)
- Linting passes (`npm run lint`)
- All framework IDs are accurate and current
- New nodes follow the existing schema

## Support

For issues or questions, please file an issue on the repository.

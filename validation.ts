import { z } from 'zod';

/* ---------------- Controlled vocabularies ---------------- */
export const ENV_ALLOW = [
  'Prod','Production','Dev','Development','Test','QA','UAT','Stage','Staging','DR','Sandbox'
] as const;

export const CLASS_ALLOW = [
  'Public','Internal','Confidential','Restricted','Highly Restricted'
] as const;

export const INDUSTRY_VALUES = [
  'healthcare',
  'financial services',
  'technology',
  'saas',
  'retail',
  'legal services',
  'government',
] as const;

/* ---------------- Helpers ---------------- */
const splitByComma = (val: string) =>
  val.split(',').map((s) => s.trim()).filter(Boolean);

const hasLetters = (s: string) => /[A-Za-z]/.test(s);
const notMostlyRepeats = (s: string) => {
  const t = s.replace(/[^A-Za-z]/g, '').toLowerCase();
  if (t.length <= 3) return true;
  const unique = new Set(t.split(''));
  return unique.size > 2; // reject 'dddd', 'aaaa', etc.
};

const BLOCKLIST = new Set([
  'test','testing','asdf','na','n/a','none','null','xxx','foo','bar'
]);

// Basic profanity screen (handles spacing/symbols between letters)
const PROFANITY_RE = /\b(f[\W_]*u[\W_]*c[\W_]*k|s[\W_]*h[\W_]*i[\W_]*t|b[\W_]*i[\W_]*t[\W_]*c[\W_]*h|a[\W_]*s[\W_]*s|c[\W_]*u[\W_]*n[\W_]*t|d[\W_]*a[\W_]*m[\W_]*n)\b/i;
const isProfane = (text: string) => PROFANITY_RE.test(text);

// Allow only letters/digits/space/&/-
const tokenRegex = /^[A-Za-z0-9][A-Za-z0-9 &\-]{1,}$/;

// Generic token validator for comma lists (BU, software, hardware)
const isValidToken = (t: string) => {
  const s = t.trim();
  return (
    s.length >= 2 &&
    hasLetters(s) &&
    notMostlyRepeats(s) &&
    tokenRegex.test(s) &&
    !BLOCKLIST.has(s.toLowerCase()) &&
    !isProfane(s)
  );
};

// Company: stricter than generic text (no punctuation beyond space/&/-), no profanity
const isValidCompany = (text: string): boolean => {
  const s = text.trim();
  if (!hasLetters(s)) return false;
  if (!notMostlyRepeats(s)) return false;
  if (BLOCKLIST.has(s.toLowerCase())) return false;
  if (isProfane(s)) return false;
  return tokenRegex.test(s) && s.length >= 2 && s.length <= 100;
};

/* ----- Accept string-or-array for envs/classes; clamp to allowlists ------- */
const EnvField = z.union([z.string().transform(splitByComma), z.array(z.string())])
  .transform(arr => arr.filter(v => ENV_ALLOW.includes(v as any)))
  .refine(arr => arr.length > 0, { message: 'Choose at least one Environment' });

const ClassField = z.union([z.string().transform(splitByComma), z.array(z.string())])
  .transform(arr => arr.filter(v => CLASS_ALLOW.includes(v as any)))
  .refine(arr => arr.length > 0, { message: 'Choose at least one Data Classification' });

/* ------------------------------ Schema ------------------------------------ */
export const inputsSchema = z.object({
  company: z.string().trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters')
    .refine(isValidCompany, {
      message: 'Use letters/numbers/space/&/-, no profanity.',
    }),

  // Industry is dropdown-only
  industry: z.enum(INDUSTRY_VALUES, {
    errorMap: () => ({ message: 'Choose a valid industry from the list' }),
  }),

  businessUnits: z.string()
    .min(1, 'Add at least one Business Unit')
    .transform(splitByComma)
    .refine(arr => arr.length > 0, { message: 'Add at least one Business Unit' })
    .refine(arr => arr.every(isValidToken), {
      message: 'Business Units contain invalid or profane entries',
    }),

  environments: EnvField,

  dataClasses: ClassField,

  clouds: z.array(z.enum(['M365','Azure','AWS'] as const))
    .min(1, 'Select at least one cloud'),

  software: z.string().transform(splitByComma)
    .refine(arr => arr.every(isValidToken), {
      message: 'Software contains invalid or profane entries',
    }),

  hardware: z.string().transform(splitByComma)
    .refine(arr => arr.every(isValidToken), {
      message: 'Hardware contains invalid or profane entries',
    }),

  frameworks: z.array(z.enum([
    'NIST CSF 2.0','NIST 800-53','MITRE ATT&CK','SOC 2','GDPR','HIPAA','GLBA','CCPA/CPRA'
  ] as const)).min(1, 'Select at least one compliance framework'),

  riskDefaults: z.object({
    impact: z.number().int().min(1).max(5),
    likelihood: z.number().int().min(1).max(5),
    exposure: z.number().int().min(1).max(5),
  }),
});

export type InputsFormData = z.input<typeof inputsSchema>;
export type InputsValidated = z.output<typeof inputsSchema>;

export function getFieldError(error: z.ZodError, field: string): string | undefined {
  const fieldError = error.issues.find((issue) => error && issue.path[0] === field);
  return fieldError?.message;
}

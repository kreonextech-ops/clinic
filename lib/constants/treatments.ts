export const PREDEFINED_TREATMENTS = [
  // Diagnostic
  'Routine Checkup',
  'Dental X-Ray',
  'Full Mouth Examination',
  'Oral Cancer Screening',

  // Preventive
  'Teeth Cleaning (Scaling)',
  'Polishing',
  'Fluoride Treatment',
  'Pit & Fissure Sealants',
  'Mouth Guard Fitting',

  // Restorative
  'Tooth Filling (Composite)',
  'Tooth Filling (Silver/Amalgam)',
  'Inlay / Onlay',
  'Dental Crown',
  'Dental Bridge',
  'Denture (Full)',
  'Denture (Partial)',

  // Endodontic
  'Root Canal Treatment (RCT)',
  'Pulpotomy (Kids)',
  'Re-Treatment of Root Canal',

  // Surgical
  'Tooth Extraction (Simple)',
  'Tooth Extraction (Surgical)',
  'Wisdom Tooth Removal',
  'Bone Grafting',

  // Periodontic
  'Gum Treatment (Deep Scaling)',
  'Gum Flap Surgery',
  'Gingivectomy',

  // Orthodontic
  'Braces Consultation',
  'Braces Installation (Metal)',
  'Braces Installation (Ceramic)',
  'Retainer Fitting',
  'Aligner (Invisalign-type)',

  // Cosmetic
  'Teeth Whitening',
  'Veneers',
  'Smile Makeover Consultation',
  'Composite Bonding',

  // Implants
  'Dental Implant Consultation',
  'Implant Placement',
  'Implant Crown',

  // Paediatric
  'Milk Tooth Extraction',
  'Space Maintainer',
  'Fluoride Varnish (Kids)',

  // Other
  'Emergency Visit',
  'Post-Procedure Follow-up',
  'Consultation Only',
  'Medication Prescription',
] as const;

export type PredefinedTreatment = (typeof PREDEFINED_TREATMENTS)[number];

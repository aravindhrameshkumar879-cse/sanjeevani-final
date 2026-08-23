/**
 * On-Device & Backend Unified Triage Decision Table Engine
 * 
 * Rule Table Specification:
 * - Chest pain + sweating + age > 40               => Critical
 * - Difficulty breathing OR fever > 3 days        => Critical
 * - Fever (<3 days) + cough, no other red flags   => Routine
 * - Mild cold / minor ache / no fever             => Self-care
 */

export function evaluateTriage({
  age = 0,
  chestPain = false,
  sweating = false,
  breathingDifficulty = false,
  fever = false,
  feverDays = 0,
  cough = false,
  minorAche = false
}) {
  const numAge = Number(age) || 0;
  const numFeverDays = Number(feverDays) || 0;
  const matchedRules = [];

  // Rule 1: Chest pain + sweating + age > 40 => Critical
  if (chestPain && sweating && numAge > 40) {
    matchedRules.push('Chest pain + sweating + age > 40 (Acute Coronary Syndrome Risk)');
    return {
      tag: 'Critical',
      reason: matchedRules.join('; '),
      matchedRuleIndex: 1,
      urgencyScore: 100,
      color: '#dc2626',
      icon: 'alert-triangle',
      actionAdvice: 'IMMEDIATE EMERGENCY: Keep patient at rest, prepare loading dose, alert PHC Doctor and call 108 Ambulance.'
    };
  }

  // Rule 2: Difficulty breathing OR fever > 3 days => Critical
  if (breathingDifficulty || (fever && numFeverDays > 3)) {
    if (breathingDifficulty) matchedRules.push('Difficulty in breathing / Dyspnea present');
    if (fever && numFeverDays > 3) matchedRules.push(`Fever duration > 3 days (${numFeverDays} days persistent)`);
    return {
      tag: 'Critical',
      reason: matchedRules.join('; '),
      matchedRuleIndex: 2,
      urgencyScore: 85,
      color: '#ea580c',
      icon: 'alert-circle',
      actionAdvice: 'HIGH PRIORITY: Monitor SpO2 and vitals, arrange expedited Doctor tele-consultation.'
    };
  }

  // Rule 3: Fever (<3 days) + cough, no other red flags => Routine
  if (fever && numFeverDays <= 3 && cough && !chestPain && !breathingDifficulty) {
    matchedRules.push(`Fever (${numFeverDays || 1} days) with cough without red flags`);
    return {
      tag: 'Routine',
      reason: matchedRules.join('; '),
      matchedRuleIndex: 3,
      urgencyScore: 50,
      color: '#2563eb',
      icon: 'clock',
      actionAdvice: 'ROUTINE CLINICAL REVIEW: Paracetamol antipyretic, warm fluids, scheduled tele-consultation.'
    };
  }

  // Rule 4: Mild cold / minor ache / no fever => Self-care
  if ((minorAche || (!fever && cough)) && !chestPain && !breathingDifficulty) {
    matchedRules.push('Mild cold / minor ache / no fever red flags');
    return {
      tag: 'Self-care',
      reason: matchedRules.join('; '),
      matchedRuleIndex: 4,
      urgencyScore: 20,
      color: '#16a34a',
      icon: 'check-circle',
      actionAdvice: 'HOME CARE & REST: Hydration, steam inhalation, ASHA follow-up in 48 hours if symptoms worsen.'
    };
  }

  // Fallback Rule for other generic symptoms
  if (fever) {
    return {
      tag: 'Routine',
      reason: `Fever present (${numFeverDays || 1} days) for clinical evaluation`,
      matchedRuleIndex: 3,
      urgencyScore: 45,
      color: '#2563eb',
      icon: 'clock',
      actionAdvice: 'ROUTINE: Doctor consultation recommended for symptomatic treatment.'
    };
  }

  return {
    tag: 'Self-care',
    reason: 'Mild non-specific symptoms, vitals stable',
    matchedRuleIndex: 4,
    urgencyScore: 15,
    color: '#16a34a',
    icon: 'check-circle',
    actionAdvice: 'HOME CARE: General health education and routine hydration.'
  };
}

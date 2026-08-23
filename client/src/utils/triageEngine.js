/**
 * Pure Deterministic On-Device Triage Rule Engine
 * Designed for offline-first ASHA worker mobile device.
 * 
 * Strict Decision Table:
 * 1. Chest pain + sweating + age > 40              => Critical
 * 2. Difficulty breathing OR fever > 3 days       => Critical
 * 3. Fever (<3 days) + cough, no other red flags  => Routine
 * 4. Mild cold / minor ache / no fever            => Self-care
 */

export function calculateTriage({
  age = 0,
  chestPain = false,
  sweating = false,
  breathingDifficulty = false,
  fever = false,
  feverDays = 0,
  cough = false,
  minorAche = false
}) {
  const patientAge = Number(age) || 0;
  const daysOfFever = Number(feverDays) || 0;
  const isChestPain = Boolean(chestPain);
  const isSweating = Boolean(sweating);
  const isBreathingDifficulty = Boolean(breathingDifficulty);
  const isFever = Boolean(fever);
  const isCough = Boolean(cough);
  const isMinorAche = Boolean(minorAche);

  const matchedRules = [];

  // RULE 1: Chest pain + sweating + age > 40 => Critical
  if (isChestPain && isSweating && patientAge > 40) {
    matchedRules.push(`Chest pain + Sweating + Age ${patientAge} (>40) [High Acute Coronary Syndrome Risk]`);
    return {
      tag: 'Critical',
      reason: matchedRules.join('; '),
      ruleId: 'RULE-1-ACS',
      urgencyScore: 100,
      priorityRank: 1,
      badgeColor: 'bg-red-600 text-white border-red-700',
      badgeClass: 'critical',
      actionAdvice: 'IMMEDIATE EMERGENCY: Keep patient seated/resting, call 108 Ambulance, notify Medical Officer.',
      icon: 'AlertTriangle'
    };
  }

  // RULE 2: Difficulty breathing OR fever > 3 days => Critical
  if (isBreathingDifficulty || (isFever && daysOfFever > 3)) {
    if (isBreathingDifficulty) {
      matchedRules.push('Difficulty breathing / Respiratory distress detected');
    }
    if (isFever && daysOfFever > 3) {
      matchedRules.push(`Persistent high fever duration > 3 days (${daysOfFever} days)`);
    }
    return {
      tag: 'Critical',
      reason: matchedRules.join('; '),
      ruleId: 'RULE-2-RESP-FEVER',
      urgencyScore: 85,
      priorityRank: 1,
      badgeColor: 'bg-red-600 text-white border-red-700',
      badgeClass: 'critical',
      actionAdvice: 'HIGH PRIORITY: Monitor SpO2 and pulse, arrange rapid tele-consultation with Medical Officer.',
      icon: 'AlertCircle'
    };
  }

  // RULE 3: Fever (<3 days) + cough, no other red flags => Routine
  if (isFever && daysOfFever <= 3 && isCough && !isChestPain && !isBreathingDifficulty) {
    matchedRules.push(`Fever (${daysOfFever || 1} day${daysOfFever > 1 ? 's' : ''}) + Cough without acute red flags`);
    return {
      tag: 'Routine',
      reason: matchedRules.join('; '),
      ruleId: 'RULE-3-ROUTINE-URTI',
      urgencyScore: 50,
      priorityRank: 2,
      badgeColor: 'bg-blue-600 text-white border-blue-700',
      badgeClass: 'routine',
      actionAdvice: 'ROUTINE CLINICAL REVIEW: Paracetamol, warm hydration, queue for doctor tele-prescription.',
      icon: 'Clock'
    };
  }

  // RULE 4: Mild cold / minor ache / no fever => Self-care
  if ((isMinorAche || (!isFever && isCough)) && !isChestPain && !isBreathingDifficulty && !isFever) {
    matchedRules.push('Mild cold / minor body ache / no fever present');
    return {
      tag: 'Self-care',
      reason: matchedRules.join('; '),
      ruleId: 'RULE-4-SELF-CARE',
      urgencyScore: 20,
      priorityRank: 3,
      badgeColor: 'bg-emerald-600 text-white border-emerald-700',
      badgeClass: 'selfcare',
      actionAdvice: 'HOME CARE: Rest, steam inhalation, warm fluids, follow-up if symptoms persist beyond 48 hours.',
      icon: 'CheckCircle'
    };
  }

  // Standard fallback for fever without cough or other combinations
  if (isFever) {
    return {
      tag: 'Routine',
      reason: `Fever present (${daysOfFever || 1} days) needing primary care evaluation`,
      ruleId: 'RULE-FALLBACK-FEVER',
      urgencyScore: 45,
      priorityRank: 2,
      badgeColor: 'bg-blue-600 text-white border-blue-700',
      badgeClass: 'routine',
      actionAdvice: 'ROUTINE: Doctor consultation scheduled for fever investigation.',
      icon: 'Clock'
    };
  }

  return {
    tag: 'Self-care',
    reason: 'Mild non-urgent condition, vitals stable',
    ruleId: 'RULE-DEFAULT-SELFCARE',
    urgencyScore: 15,
    priorityRank: 3,
    badgeColor: 'bg-emerald-600 text-white border-emerald-700',
    badgeClass: 'selfcare',
    actionAdvice: 'HOME CARE & REST: Routine hydration and nutrition counseling.',
    icon: 'CheckCircle'
  };
}

/**
 * Built-in Unit Tests for On-Device Rule Verification
 */
export function runTriageUnitTests() {
  const tests = [
    {
      name: 'Test 1: 45yo + Chest Pain + Sweating -> Must be Critical',
      input: { age: 45, chestPain: true, sweating: true, breathingDifficulty: false, fever: false, feverDays: 0, cough: false, minorAche: false },
      expected: 'Critical'
    },
    {
      name: 'Test 2: 35yo + Chest Pain + Sweating (Age <= 40) -> Not Rule 1, but if no breathing/fever -> fallback',
      input: { age: 35, chestPain: true, sweating: true, breathingDifficulty: false, fever: false, feverDays: 0, cough: false, minorAche: false },
      expected: 'Self-care' // Rule 1 requires age > 40
    },
    {
      name: 'Test 3: 25yo + Difficulty Breathing -> Must be Critical',
      input: { age: 25, chestPain: false, sweating: false, breathingDifficulty: true, fever: false, feverDays: 0, cough: false, minorAche: false },
      expected: 'Critical'
    },
    {
      name: 'Test 4: 50yo + Fever 4 days (Fever > 3) -> Must be Critical',
      input: { age: 50, chestPain: false, sweating: false, breathingDifficulty: false, fever: true, feverDays: 4, cough: true, minorAche: false },
      expected: 'Critical'
    },
    {
      name: 'Test 5: 30yo + Fever 2 days + Cough -> Must be Routine',
      input: { age: 30, chestPain: false, sweating: false, breathingDifficulty: false, fever: true, feverDays: 2, cough: true, minorAche: false },
      expected: 'Routine'
    },
    {
      name: 'Test 6: 28yo + Minor Ache only + No Fever -> Must be Self-care',
      input: { age: 28, chestPain: false, sweating: false, breathingDifficulty: false, fever: false, feverDays: 0, cough: false, minorAche: true },
      expected: 'Self-care'
    }
  ];

  const results = tests.map(t => {
    const res = calculateTriage(t.input);
    const passed = res.tag === t.expected;
    return { name: t.name, expected: t.expected, actual: res.tag, passed, reason: res.reason };
  });

  return results;
}

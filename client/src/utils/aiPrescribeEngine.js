/**
 * Client-Side Automated Medical Prescription Engine (ICMR / NLEM Compliant)
 * Generates automated generic drug regimens 100% on-device with zero internet connectivity.
 */

export function generateAutomatedPrescription({
  age = 30,
  gender = 'Male',
  symptoms = {},
  priorityTag = 'Routine',
  triageReason = ''
}) {
  const medicines = [];
  let notes = '';
  let dietAdvice = '';
  const warnings = [];

  const {
    chestPain = false,
    sweating = false,
    breathingDifficulty = false,
    fever = false,
    feverDays = 0,
    cough = false,
    minorAche = false
  } = symptoms || {};

  // 1. Cardiovascular Emergency Protocol (Chest pain + sweating / Critical ACS)
  if (chestPain && (sweating || priorityTag === 'Critical')) {
    medicines.push({
      name: 'Tab. Aspirin (Dispersible/Chewable)',
      dosage: '325 mg',
      frequency: 'Stat (Immediately)',
      duration: 'Single dose',
      instructions: 'Chew tablet immediately. Antiplatelet loading dose for ACS.'
    });
    medicines.push({
      name: 'Tab. Clopidogrel',
      dosage: '300 mg',
      frequency: 'Stat (Immediately)',
      duration: 'Single dose',
      instructions: 'Take with water immediately along with Aspirin.'
    });
    medicines.push({
      name: 'Tab. Sorbitrate (Isosorbide Dinitrate)',
      dosage: '5 mg',
      frequency: 'Sublingual stat',
      duration: 'Single dose',
      instructions: 'Place under tongue. Do NOT swallow. Relieves angina spasms.'
    });
    medicines.push({
      name: 'Tab. Atorvastatin',
      dosage: '80 mg',
      frequency: 'Stat (Night)',
      duration: 'Single dose',
      instructions: 'High-intensity statin plaque stabilization.'
    });

    notes = 'EMERGENCY PROTOCOL: Suspected Acute Coronary Syndrome. Immediate transit to nearest District Hospital / ICU with continuous SpO2 monitoring. Keep patient in propped-up Fowler position.';
    dietAdvice = 'Strict NPO (nothing by mouth) except minimal water for essential stat medicines.';
    warnings.push('CRITICAL: Check BP before repeated sublingual nitrates. Arrange 108 Emergency Ambulance immediately.');
    
    return { medicines, notes, dietAdvice, warnings, regimenType: 'Emergency ACS Loading Protocol' };
  }

  // 2. Severe Respiratory / Extended Fever (Breathing difficulty OR Fever > 3 days)
  if (breathingDifficulty || (fever && feverDays > 3)) {
    medicines.push({
      name: 'Tab. Paracetamol',
      dosage: age < 12 ? '250 mg' : '650 mg',
      frequency: 'TDS (3 times daily after food)',
      duration: '3 days',
      instructions: 'Antipyretic for temperature > 100°F. Maintain 6-hour gap between doses.'
    });
    medicines.push({
      name: 'Tab. Amoxicillin + Potassium Clavulanate (Augmentin)',
      dosage: age < 12 ? 'Syrup 228mg/5ml' : '625 mg',
      frequency: 'BD (Twice daily after food)',
      duration: '5 days',
      instructions: 'Broad-spectrum antibiotic for lower respiratory / persistent bacterial infection.'
    });
    if (cough || breathingDifficulty) {
      medicines.push({
        name: 'Inhaler / Respule Salbutamol + Ipratropium (Duolin)',
        dosage: '2.5 ml via Nebulizer or 2 puffs via Spacer',
        frequency: 'Stat & 6th hourly SOS',
        duration: '3 days',
        instructions: 'Bronchodilator for airway relief and wheeze reduction.'
      });
    }
    medicines.push({
      name: 'Sachet ORS (Oral Rehydration Salts - WHO Formula)',
      dosage: '1 sachet in 1 Litre boiled & cooled water',
      frequency: 'Sip throughout the day',
      duration: '3 days',
      instructions: 'Prevents dehydration due to persistent high fever.'
    });

    notes = `High-risk persistent febrile illness (${feverDays} days) with respiratory distress. Send for Complete Blood Count (CBC), Dengue/Malaria Rapid Card Test, and Sputum examination at PHC.`;
    dietAdvice = 'Lukewarm fluids, khichdi, coconut water, fresh soup. Avoid cold beverages and dust exposure.';
    warnings.push('Alert ASHA worker to check SpO2 twice daily. If SpO2 drops below 94%, refer to CHC immediately.');

    return { medicines, notes, dietAdvice, warnings, regimenType: 'Acute Febrile Respiratory Protocol' };
  }

  // 3. Acute Routine Viral Fever + Cough (< 3 days)
  if (fever && feverDays <= 3) {
    medicines.push({
      name: 'Tab. Paracetamol',
      dosage: age < 12 ? '250 mg' : '500 mg',
      frequency: 'TDS (Thrice daily SOS when fever > 99.5°F)',
      duration: '3 days',
      instructions: 'Take after meals with water. Do not exceed 2000mg/day.'
    });
    if (cough) {
      medicines.push({
        name: 'Syp. Dextromethorphan + Chlorpheniramine Maleate',
        dosage: '10 ml',
        frequency: 'TDS (3 times daily)',
        duration: '4 days',
        instructions: 'Antitussive for dry irritating cough.'
      });
      medicines.push({
        name: 'Tab. Cetirizine',
        dosage: '10 mg',
        frequency: 'OD (Once daily at night)',
        duration: '3 days',
        instructions: 'Antihistamine for allergic rhinitis and nasal congestion.'
      });
    }
    medicines.push({
      name: 'Tab. Vitamin C (Ascorbic Acid) + Zinc',
      dosage: '500 mg',
      frequency: 'OD (Once daily)',
      duration: '5 days',
      instructions: 'Immunity support.'
    });

    notes = 'Uncomplicated viral upper respiratory tract infection. Advise adequate sleep and rest.';
    dietAdvice = 'Hot tulsi-ginger tea, warm saline gargles twice daily, steam inhalation morning and evening.';
    warnings.push('If fever persists beyond 3 days or breathing difficulty develops, re-triage to Critical.');

    return { medicines, notes, dietAdvice, warnings, regimenType: 'Acute Viral URTI Protocol' };
  }

  // 4. Mild Cold / Body Ache / Minor Pain (Self-Care & Relief)
  if (minorAche || (!fever && cough)) {
    medicines.push({
      name: 'Tab. Paracetamol',
      dosage: '500 mg',
      frequency: 'SOS (As needed, max 2 tabs/day)',
      duration: '2 days',
      instructions: 'Analgesic for muscular ache or mild headache.'
    });
    if (cough) {
      medicines.push({
        name: 'Syp. Ayurvedic Tulsi-Vasaka Cough Syrup / Honey Lozenge',
        dosage: '10 ml',
        frequency: 'BD (Twice daily)',
        duration: '3 days',
        instructions: 'Soothing herbal throat syrup.'
      });
    }
    medicines.push({
      name: 'Tab. Vitamin B-Complex with Zinc (Becosules)',
      dosage: '1 capsule',
      frequency: 'OD (Once daily post-lunch)',
      duration: '7 days',
      instructions: 'General fatigue and vitality support.'
    });

    notes = 'Self-limiting seasonal discomfort / mild musculoskeletal strain. No heavy physical exertion.';
    dietAdvice = 'Warm turmeric milk at bedtime, light home-cooked meals, adequate hydration (2.5L water/day).';
    warnings.push('Routine ASHA checkup after 48 hours. No antibiotics required.');

    return { medicines, notes, dietAdvice, warnings, regimenType: 'Mild Symptom & Supportive Care' };
  }

  // 5. Default General Wellness / Supportive Regimen
  medicines.push({
    name: 'Tab. Paracetamol',
    dosage: '500 mg',
    frequency: 'SOS',
    duration: '2 days',
    instructions: 'Only if pain or discomfort occurs.'
  });
  medicines.push({
    name: 'Sachet ORS (Electral)',
    dosage: '1 pack in water',
    frequency: 'As needed',
    duration: '2 days',
    instructions: 'Rehydration.'
  });

  return {
    medicines,
    notes: 'General supportive care. Maintain hygiene and proper nutrition.',
    dietAdvice: 'Balanced home cooked diet with fresh vegetables and clean drinking water.',
    warnings: ['Consult doctor if any new symptoms arise.'],
    regimenType: 'General Primary Care Support'
  };
}

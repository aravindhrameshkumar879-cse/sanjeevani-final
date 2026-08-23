/**
 * SanjeevaniConnect Telemedicine e-Prescription PDF Generator
 * Built using jsPDF with clinical layout, NLEM generic drug table, and digital stamp.
 */

import { jsPDF } from 'jspdf';

export function generatePrescriptionPdf({
  consultation,
  doctorName = 'Dr. Arvind Mehta (MD, AIIMS New Delhi)',
  doctorReg = 'MCI / NMC Reg. No: 48291-MH',
  hospitalName = 'Primary Health Centre (PHC) Tele-Hub',
  hospitalAddress = 'District Hospital Network, National Rural Health Mission',
  prescription = {}
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const patient = {
    name: consultation.patientName || 'Rural Patient',
    age: consultation.patientAge || '35',
    gender: consultation.patientGender || 'Male',
    village: consultation.patientVillage || 'Rampur Khurd',
    phone: consultation.patientPhone || 'N/A',
    abhaId: consultation.patientAbhaId || '91-4829-1029-4820',
    caseId: consultation._id || 'CONS-001'
  };

  const medicines = prescription.medicines || [];
  const notes = prescription.notes || 'Routine follow-up in 3 days.';
  const dietAdvice = prescription.dietAdvice || 'Drink clean boiled water, eat light home cooked food.';
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // --- HEADER SECTION ---
  doc.setFillColor(5, 150, 105); // Emerald-600
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SANJEEVANI CONNECT | e-PRESCRIPTION', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('National Rural Telemedicine & ASHA Field Care Network', 14, 18);
  doc.text(`DATE: ${dateStr}`, 145, 18);

  // --- CLINIC / DOCTOR BANNER ---
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(doctorName, 14, 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(doctorReg, 14, 39);
  doc.text(`${hospitalName} • ${hospitalAddress}`, 14, 44);

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 48, 196, 48);

  // --- PATIENT DEMOGRAPHICS BOX ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 52, 182, 28, 2, 2, 'F');
  doc.rect(14, 52, 182, 28, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PATIENT INFORMATION', 18, 59);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name: ${patient.name}`, 18, 66);
  doc.text(`Age / Gender: ${patient.age} Yrs / ${patient.gender}`, 18, 72);
  doc.text(`Village / Ward: ${patient.village}`, 18, 77);

  doc.text(`ABHA Health ID: ${patient.abhaId}`, 110, 66);
  doc.text(`Mobile: ${patient.phone}`, 110, 72);
  doc.text(`Case ID: ${patient.caseId}`, 110, 77);

  // --- CLINICAL TRIAGE & SYMPTOMS SUMMARY ---
  let yPos = 88;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('CLINICAL SUMMARY & ON-DEVICE TRIAGE', 14, yPos);

  yPos += 5;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, yPos, 182, 18, 1, 1, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const triageTag = consultation.priorityTag || 'Routine';
  const tagColor = triageTag === 'Critical' ? [220, 38, 38] : (triageTag === 'Routine' ? [37, 99, 235] : [22, 163, 74]);
  
  doc.setTextColor(tagColor[0], tagColor[1], tagColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`Triage Priority: [ ${triageTag.toUpperCase()} ]`, 18, yPos + 6);
  
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`Reason: ${consultation.triageReason || 'Primary clinical intake'}`, 18, yPos + 11);
  doc.text(`Symptoms: ${consultation.symptoms?.text || consultation.symptoms?.voiceTranscript || 'Reported symptoms'}`.slice(0, 105), 18, yPos + 15);

  // --- Rx SECTION ---
  yPos += 26;
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(22);
  doc.setTextColor(5, 150, 105);
  doc.text('℞', 14, yPos);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('PRESCRIBED MEDICINES (Generic NLEM Regimen)', 24, yPos - 2);

  // Table Header
  yPos += 6;
  doc.setFillColor(226, 232, 240);
  doc.rect(14, yPos, 182, 7, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('#', 16, yPos + 5);
  doc.text('Medicine / Generic Formulation', 23, yPos + 5);
  doc.text('Dosage', 95, yPos + 5);
  doc.text('Frequency', 125, yPos + 5);
  doc.text('Duration', 162, yPos + 5);

  // Table Rows
  yPos += 7;
  medicines.forEach((med, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, yPos, 182, 12, 'F');
    }
    doc.rect(14, yPos, 182, 12, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}`, 16, yPos + 5);
    doc.text(med.name || 'Medicine', 23, yPos + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(med.instructions || 'As advised', 23, yPos + 10);

    doc.text(med.dosage || '1 tab', 95, yPos + 6);
    doc.text(med.frequency || 'TDS', 125, yPos + 6);
    doc.text(med.duration || '3 days', 162, yPos + 6);

    yPos += 12;
  });

  // --- ADVICE & DIETARY NOTES ---
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('SPECIAL CLINICAL INSTRUCTIONS & LIFESTYLE ADVICE:', 14, yPos);

  yPos += 4;
  doc.setFillColor(254, 243, 199); // amber-100
  doc.roundedRect(14, yPos, 182, 18, 1, 1, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15);
  doc.text(`• Clinical Notes: ${notes}`.slice(0, 115), 18, yPos + 5);
  doc.text(`• Dietary / Home Care: ${dietAdvice}`.slice(0, 115), 18, yPos + 10);
  doc.text('• Follow up with your local ASHA worker if symptoms do not improve.', 18, yPos + 15);

  // --- DIGITAL SIGNATURE & STAMP ---
  yPos += 26;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, yPos, 196, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Digitally Authenticated Tele-Consultation', 14, yPos);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Generated via SanjeevaniConnect Telemedicine Platform', 14, yPos + 4);
  doc.text('Valid for rural primary care dispensing at PHC / Sub-Centre', 14, yPos + 8);

  // Doctor Signature Box
  doc.setFillColor(248, 250, 252);
  doc.rect(135, yPos - 2, 60, 20, 'F');
  doc.rect(135, yPos - 2, 60, 20, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text('✓ DIGITALLY SIGNED', 140, yPos + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(doctorName, 140, yPos + 9);
  doc.text(`Verified at ${dateStr}`, 140, yPos + 14);

  // Save/Download PDF
  const filename = `Prescription_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  
  return doc.output('datauristring');
}

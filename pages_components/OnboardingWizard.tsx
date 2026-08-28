'use client';

import React, { useState } from 'react';
import { usePatient } from '@/lib/context/PatientContext';
import { COMMON_MEDICATIONS } from '@/lib/types/medication';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  Heart,
  User,
  Clock,
  Pill,
  Phone,
  Scale,
  Calendar,
  Activity,
  CheckCircle2,
  Plus,
  Trash2
} from 'lucide-react';

export interface MedicationTimingSlot {
  id: string;
  label: string;
  time: string;
  instructions?: string;
}

export const OnboardingWizard: React.FC = () => {
  const { profile, currentUser, adherence, updateProfileData, setActiveTab, calibrateIntakeWithAI } = usePatient();
  const [step, setStep] = useState(1);

  // Pre-load existing patient data if already present so the patient can edit existing data
  const initialName = (profile.name && !profile.name.includes('Lakshmi Devi')) ? profile.name : (currentUser?.name && !currentUser.name.includes('Lakshmi Devi') ? currentUser.name : '');
  const initialPrefName = (profile.preferred_name && !profile.preferred_name.includes('Lakshmi Amma')) ? profile.preferred_name : (currentUser?.preferred_name || initialName);
  const initialAge = (profile.age && profile.age > 0) ? profile.age : '';
  const initialGender = (profile.gender && profile.gender !== 'Not specified') ? profile.gender : 'Female';
  const initialHeight = (profile.height_cm && profile.height_cm > 0) ? profile.height_cm : '';
  const initialWeight = (profile.weight_kg && profile.weight_kg > 0) ? profile.weight_kg : '';
  const initialCondition = (profile.condition_severity && !profile.condition_severity.includes('Assessment')) ? profile.condition_severity : "Mild Cognitive Impairment / Early Support";
  const initialDiagnosis = (profile.diagnosis_date && !profile.diagnosis_date.includes('Pending')) ? profile.diagnosis_date : new Date().toISOString().slice(0, 7);
  const initialCaregiverName = (profile.caregiver?.name && !profile.caregiver.name.includes('Priya')) ? profile.caregiver.name : (profile.caregiver?.name || '');
  const initialCaregiverPhone = (profile.caregiver?.phone && !profile.caregiver.phone.includes('(555)')) ? profile.caregiver.phone : (profile.caregiver?.phone || '+91 ');
  const initialCaregiverRel = (profile.caregiver?.relation && !profile.caregiver.relation.includes('Daughter')) ? profile.caregiver.relation : (profile.caregiver?.relation || 'Primary Caregiver');

  const [name, setName] = useState(initialName);
  const [preferredName, setPreferredName] = useState(initialPrefName);
  const [age, setAge] = useState<number | string>(initialAge);
  const [gender, setGender] = useState<string>(initialGender);
  const [heightCm, setHeightCm] = useState<number | string>(initialHeight);
  const [weightKg, setWeightKg] = useState<number | string>(initialWeight);
  const [conditionSeverity, setConditionSeverity] = useState<string>(initialCondition);
  const [diagnosisDate, setDiagnosisDate] = useState<string>(initialDiagnosis);
  const [selectedMedId, setSelectedMedId] = useState<string>(() => {
    const medLower = (profile.primary_medication?.name || '').toLowerCase();
    const found = COMMON_MEDICATIONS.find((m) => m.name.toLowerCase().includes(medLower) || m.id.toLowerCase().includes(medLower));
    return found ? found.id : 'donepezil';
  });
  const [selectedDose, setSelectedDose] = useState<string>(profile.primary_medication?.dosage || '10 mg');
  const [caregiverName, setCaregiverName] = useState<string>(initialCaregiverName);
  const [caregiverRelation, setCaregiverRelation] = useState<string>(initialCaregiverRel);
  const [caregiverPhone, setCaregiverPhone] = useState<string>(initialCaregiverPhone);

  // Multi-dose medication timings pre-loaded from existing schedule or defaults
  const [medicationTimings, setMedicationTimings] = useState<MedicationTimingSlot[]>(() => {
    if (adherence.schedule && adherence.schedule.length > 0) {
      return adherence.schedule.map((item, idx) => ({
        id: item.id || `t_${idx + 1}`,
        label: item.time_slot ? item.time_slot.split(' (')[0] : `Dose Timing ${idx + 1}`,
        time: item.scheduled_time || '20:00',
        instructions: item.instructions || 'Take as prescribed with water'
      }));
    }
    return [
      { id: 't_1', label: 'Morning Dose (Breakfast)', time: '08:00', instructions: 'Take with water after morning tea or breakfast' },
      { id: 't_2', label: 'Evening Maintenance Dose', time: '20:00', instructions: 'Take with dinner or before retiring' }
    ];
  });

  const addMedicationTiming = () => {
    const nextNum = medicationTimings.length + 1;
    const defaultTime = nextNum === 3 ? '13:00' : nextNum === 4 ? '22:00' : '16:00';
    const defaultLabel = nextNum === 3 ? 'Afternoon Dose (Lunch)' : nextNum === 4 ? 'Night Dose (Bedtime)' : `Medication Timing ${nextNum}`;
    setMedicationTimings((prev) => [
      ...prev,
      {
        id: `t_${Date.now()}_${nextNum}`,
        label: defaultLabel,
        time: defaultTime,
        instructions: 'Take as prescribed with a glass of water'
      }
    ]);
  };

  const removeMedicationTiming = (id: string) => {
    if (medicationTimings.length <= 1) return;
    setMedicationTimings((prev) => prev.filter((t) => t.id !== id));
  };

  const updateMedicationTiming = (id: string, field: keyof MedicationTimingSlot, val: string) => {
    setMedicationTimings((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: val } : t))
    );
  };

  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationPlan, setCalibrationPlan] = useState<any>(null);

  const totalSteps = 7;

  const numHeight = Number(heightCm) || 0;
  const numWeight = Number(weightKg) || 0;
  const numAge = Number(age) || 0;

  const heightM = numHeight > 0 ? numHeight / 100 : 1.60;
  const bmi = numWeight > 0 ? Number((numWeight / (heightM * heightM)).toFixed(1)) : 22.0;
  const getBmiCategory = (b: number) => {
    if (b < 18.5) return { label: 'Underweight', color: 'text-[#D97706] bg-[#FEF3C7]' };
    if (b < 25.0) return { label: 'Normal Weight', color: 'text-[#16A34A] bg-[#DCFCE7]' };
    if (b < 30.0) return { label: 'Overweight', color: 'text-[#D97706] bg-[#FEF3C7]' };
    return { label: 'Obese Class', color: 'text-[#DC2626] bg-[#FEE2E2]' };
  };
  const bmiCat = getBmiCategory(bmi);

  const currentMed = COMMON_MEDICATIONS.find((m) => m.id === selectedMedId) || COMMON_MEDICATIONS[0];

  const handleNext = async () => {
    if (step === 6) {
      setIsCalibrating(true);
      setStep(7);
      try {
        const result = await calibrateIntakeWithAI({
          name: name || 'Patient',
          preferred_name: preferredName || name || 'Patient',
          age: numAge,
          gender,
          height_cm: numHeight,
          weight_kg: numWeight,
          condition_severity: conditionSeverity,
          diagnosis_date: diagnosisDate,
          daily_medications: [currentMed.name],
          caregiver_name: caregiverName,
          caregiver_phone: caregiverPhone,
          caregiver_relation: caregiverRelation,
          medication_timings: medicationTimings,
          physician_name: profile.physician.name,
          physician_phone: profile.physician.phone
        });
        setCalibrationPlan(result?.calibration || null);
      } finally {
        setIsCalibrating(false);
      }
    } else if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    const primaryTiming = medicationTimings[0]?.time || '20:00';
    await updateProfileData({
      name: name || 'Patient',
      preferred_name: preferredName || name || 'Patient',
      age: Number(age) || 0,
      gender,
      height_cm: Number(heightCm) || 0,
      weight_kg: Number(weightKg) || 0,
      bmi,
      condition: conditionSeverity,
      condition_severity: conditionSeverity,
      diagnosis_date: diagnosisDate,
      primary_medication: {
        name: currentMed.name,
        brand: currentMed.brand_name,
        dosage: selectedDose,
        schedule_time: primaryTiming,
        instructions: `Take as prescribed with water (${medicationTimings.map((t) => `${t.label}: ${t.time}`).join(', ')}). ${currentMed.with_food_rule}`
      },
      caregiver: {
        ...profile.caregiver,
        name: caregiverName,
        phone: caregiverPhone,
        relation: caregiverRelation
      }
    });

    setActiveTab('dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 animate-fade-in">
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs font-bold text-[#64748B] mb-1.5">
          <span className="flex items-center gap-1 text-[#2F80ED]">
            <Sparkles className="w-3.5 h-3.5" /> Step {step} of {totalSteps} • Clinical Intake Assessment
          </span>
          <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2F80ED] rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 sm:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        {step === 1 && (
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-[8px] bg-[#EAF3FF] text-[#2F80ED] flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                What is the patient's full name & preferred greeting?
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                We personalize all conversational AI interactions and gentle reminders with this name.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label htmlFor="intake-fullname" className="block text-xs font-semibold text-[#334155] mb-1">
                  Full Legal Name
                </label>
                <input
                  id="intake-fullname"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lakshmi Devi"
                  className="touch-target w-full h-[44px] text-sm px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                />
              </div>

              <div>
                <label htmlFor="intake-preferred" className="block text-xs font-semibold text-[#334155] mb-1">
                  Preferred / Friendly Greeting
                </label>
                <input
                  id="intake-preferred"
                  type="text"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  placeholder="e.g. Lakshmi Amma"
                  className="touch-target w-full h-[44px] text-sm px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-[8px] bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                What is your age and biological gender?
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Age helps our clinical AI calibrate therapeutic safety thresholds and pacing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label htmlFor="intake-age" className="block text-xs font-semibold text-[#334155] mb-1">
                  Age (in years)
                </label>
                <input
                  id="intake-age"
                  type="number"
                  min={1}
                  max={120}
                  value={age === 0 || age === '0' ? '' : age}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAge(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0) || '');
                  }}
                  placeholder="e.g. 65"
                  className="touch-target w-full h-[44px] text-lg font-bold px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] placeholder:font-normal placeholder:text-sm focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                />
              </div>

              <div>
                <label htmlFor="intake-gender" className="block text-xs font-semibold text-[#334155] mb-1">
                  Biological Gender
                </label>
                <select
                  id="intake-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="touch-target w-full h-[44px] text-sm px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other / Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-[8px] bg-[#EAF3FF] text-[#2F80ED] flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                What is your height and body weight?
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Physical metrics assist in detecting frailty, hydration needs, and anticholinergic sensitivity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label htmlFor="intake-height" className="block text-xs font-semibold text-[#334155] mb-1">
                  Height (cm)
                </label>
                <input
                  id="intake-height"
                  type="number"
                  min={50}
                  max={250}
                  value={heightCm === 0 || heightCm === '0' ? '' : heightCm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHeightCm(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0) || '');
                  }}
                  placeholder="e.g. 160"
                  className="touch-target w-full h-[44px] text-sm font-bold px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] placeholder:font-normal focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                />
              </div>

              <div>
                <label htmlFor="intake-weight" className="block text-xs font-semibold text-[#334155] mb-1">
                  Weight (kg)
                </label>
                <input
                  id="intake-weight"
                  type="number"
                  min={20}
                  max={250}
                  value={weightKg === 0 || weightKg === '0' ? '' : weightKg}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWeightKg(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0) || '');
                  }}
                  placeholder="e.g. 60"
                  className="touch-target w-full h-[44px] text-sm font-bold px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] placeholder:font-normal focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                />
              </div>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Calculated Body Mass Index (BMI)
                </span>
                <span className="text-lg font-bold text-[#0F172A]">
                  {numHeight > 0 && numWeight > 0 ? `${bmi} kg/m²` : '-- kg/m²'}
                </span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${bmiCat.color}`}>
                {numHeight > 0 && numWeight > 0 ? bmiCat.label : 'Pending Inputs'}
              </span>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-[8px] bg-[#EAF3FF] text-[#2F80ED] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                How severe is the memory condition, and when was it diagnosed?
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Calibrates cognitive guidance complexity and non-pharmacological BPSD recommendations.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {[
                { label: "Mild Cognitive Impairment (MCI)", desc: "Mild memory slips, independent daily living" },
                { label: "Mild Alzheimer's Disease", desc: "Short-term forgetfulness, requires gentle medication prompts" },
                { label: "Moderate Alzheimer's Disease", desc: "Needs structured daily routine and caregiver oversight" },
                { label: "Parkinson's Related Dementia", desc: "Motor symptoms paired with cognitive fluctuations" },
                { label: "General Age-Related Memory Support", desc: "Routine habit building and healthy aging" }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setConditionSeverity(item.label)}
                  className={`touch-target w-full text-left p-3 rounded-[8px] border transition flex items-center justify-between cursor-pointer ${
                    conditionSeverity === item.label
                      ? 'bg-[#EAF3FF] border-[#2F80ED] text-[#2F80ED]'
                      : 'bg-white border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold block text-[#0F172A]">{item.label}</span>
                    <span className="text-xs text-[#64748B] block mt-0.5">{item.desc}</span>
                  </div>
                  {conditionSeverity === item.label && <Check className="w-4 h-4 text-[#2F80ED] shrink-0" />}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label htmlFor="intake-diagnosis-date" className="block text-xs font-semibold text-[#334155] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#2F80ED]" /> Diagnosis Month & Year
              </label>
              <input
                id="intake-diagnosis-date"
                type="month"
                value={diagnosisDate}
                onChange={(e) => setDiagnosisDate(e.target.value)}
                className="touch-target w-full h-[44px] text-sm px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-[8px] bg-[#EAF3FF] text-[#2F80ED] flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                What medications do you take everyday?
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Our Agentic AI will retrieve verified monograph rules for your exact prescription.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {COMMON_MEDICATIONS.map((med) => (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => {
                    setSelectedMedId(med.id);
                    setSelectedDose(med.default_dosage);
                  }}
                  className={`touch-target w-full text-left p-3 rounded-[8px] border transition flex items-start justify-between cursor-pointer ${
                    selectedMedId === med.id
                      ? 'bg-[#EAF3FF] border-[#2F80ED] text-[#2F80ED]'
                      : 'bg-white border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold block text-[#0F172A]">
                      {med.name} ({med.brand_name})
                    </span>
                    <span className="text-xs text-[#64748B] block mt-0.5">
                      {med.schedule_recommendation} • {med.with_food_rule}
                    </span>
                  </div>
                  {selectedMedId === med.id && <Check className="w-4 h-4 text-[#2F80ED] shrink-0 mt-1" />}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Prescribed Strength / Dosage
              </label>
              <div className="flex flex-wrap gap-1.5">
                {currentMed.available_dosages.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDose(d)}
                    className={`touch-target px-3 py-1.5 rounded-[6px] text-xs font-semibold border transition cursor-pointer ${
                      selectedDose === d
                        ? 'bg-[#2F80ED] text-white border-[#2F80ED]'
                        : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-[8px] bg-[#EAF3FF] text-[#2F80ED] flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                Caregiver Contact & Medication Timings (IST)
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Instant Telegram verification alerts (@BversityCareBot) and India Standard Time (IST • UTC+5:30) dosing schedule.
              </p>
            </div>

            <div className="space-y-3.5 pt-1">
              <div>
                <label htmlFor="intake-caregiver-name" className="block text-xs font-semibold text-[#334155] mb-1">
                  Caregiver's Name & Relation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    id="intake-caregiver-name"
                    type="text"
                    value={caregiverName}
                    onChange={(e) => setCaregiverName(e.target.value)}
                    placeholder="e.g. Priya"
                    className="touch-target w-full h-[44px] text-sm px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                  />
                  <input
                    id="intake-caregiver-rel"
                    type="text"
                    value={caregiverRelation}
                    onChange={(e) => setCaregiverRelation(e.target.value)}
                    placeholder="e.g. Daughter"
                    className="touch-target w-full h-[44px] text-sm px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="intake-caregiver-phone" className="block text-xs font-semibold text-[#334155] mb-1">
                  Caregiver Mobile Number (India +91)
                </label>
                <div className="relative">
                  <input
                    id="intake-caregiver-phone"
                    type="tel"
                    value={caregiverPhone}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (!val.startsWith('+91')) {
                        val = '+91 ' + val.replace(/^\+91\s*/, '');
                      }
                      setCaregiverPhone(val);
                    }}
                    placeholder="+91 98765 43210"
                    className="touch-target w-full h-[44px] text-sm font-medium px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#16A34A]/20">
                    🇮🇳 India +91
                  </span>
                </div>
              </div>

              {/* Multiple Medication Timings List with Plus button */}
              <div className="pt-2 border-t border-[#E2E8F0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#2F80ED]" /> Prescribed Medication Dosing Times
                    </label>
                    <span className="text-[11px] text-[#64748B]">
                      Add all times throughout the day for this medication (India Standard Time).
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF3FF] text-[#2F80ED] border border-[#2F80ED]/30">
                    IST (UTC+5:30)
                  </span>
                </div>

                <div className="space-y-2">
                  {medicationTimings.map((slot, idx) => (
                    <div
                      key={slot.id}
                      className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[8px] space-y-2 relative transition hover:border-[#2F80ED]/50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[#2F80ED] uppercase tracking-wider flex items-center gap-1">
                          <Pill className="w-3 h-3" /> Timing #{idx + 1}
                        </span>
                        {medicationTimings.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicationTiming(slot.id)}
                            aria-label={`Remove dose timing ${idx + 1}`}
                            title="Remove this timing"
                            className="p-1 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-0.5">
                            Dose Label / Context
                          </label>
                          <input
                            type="text"
                            value={slot.label}
                            onChange={(e) => updateMedicationTiming(slot.id, 'label', e.target.value)}
                            placeholder="e.g. Morning Dose, Night Dose"
                            className="w-full h-[38px] text-xs px-2.5 rounded-[6px] border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#2F80ED]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-0.5 flex items-center justify-between">
                            <span>Time (IST)</span>
                            <span className="text-[#2F80ED] font-bold lowercase">
                              {parseInt(slot.time.split(':')[0] || '0', 10) >= 12 ? 'pm' : 'am'}
                            </span>
                          </label>
                          <input
                            type="time"
                            value={slot.time}
                            onChange={(e) => updateMedicationTiming(slot.id, 'time', e.target.value)}
                            className="w-full h-[38px] text-sm font-bold px-2.5 rounded-[6px] border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#2F80ED]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prominent Plus Button to Add Another Medication Timing */}
                <button
                  type="button"
                  onClick={addMedicationTiming}
                  className="touch-target w-full py-2.5 rounded-[8px] bg-[#EAF3FF] hover:bg-[#D4E8FF] border border-dashed border-[#2F80ED] text-[#2F80ED] font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.99] cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4 text-[#2F80ED]" />
                  <span>+ Add Another Medication Time</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-[8px] bg-[#EAF3FF] text-[#2F80ED] flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F80ED] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Mistral Agentic AI Care Plan
              </span>
              <h2 className="text-xl font-bold text-[#0F172A] mt-0.5">
                Calibrated Adherence Routine for {preferredName || name}
              </h2>
            </div>

            {isCalibrating ? (
              <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-center space-y-3 animate-pulse">
                <Activity className="w-8 h-8 text-[#2F80ED] animate-spin mx-auto" />
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Agentic AI is reasoning over physical stats & clinical monographs...
                </h3>
                <p className="text-xs text-[#64748B]">
                  Analyzing BMI ({bmi}), {conditionSeverity}, and {currentMed.name} guidelines.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-[#EAF3FF] border border-[#2F80ED]/20 rounded-[8px] space-y-1">
                  <span className="font-bold text-[#2F80ED] block">
                    🤖 Agentic Clinical Rationale:
                  </span>
                  <p className="text-[#0F172A] leading-relaxed">
                    {calibrationPlan?.routine_summary ||
                      `Calibrated for ${preferredName} (${age}y, BMI ${bmi} - ${bmiCat.label}) with ${conditionSeverity}. The routine emphasizes low cognitive stress, gentle evening pacing, and caregiver Telegram synchronization.`}
                  </p>
                </div>

                <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-[8px] space-y-1.5">
                  <span className="font-bold text-[#0F172A] flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-[#16A34A]" /> Tailored Adherence Rules:
                  </span>
                  <ul className="space-y-1 text-[#475569] pl-4 list-disc">
                    <li>Dose timings scheduled at: {medicationTimings.map((t) => `${t.label} (${t.time} IST)`).join(', ')}.</li>
                    <li>Strict rule: Never double-dose if a pill was forgotten yesterday.</li>
                    <li>Report severe dizziness or slow heartbeat to Dr. Mehta immediately.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-[#DCFCE7] border border-[#16A34A]/20 rounded-[8px] flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#16A34A]">
                      Routine Plan Ready
                    </h4>
                    <p className="text-[#334155] mt-0.5">
                      Your personalized routine schedule is calibrated and synced with primary caregiver {caregiverName}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-[#E2E8F0]">
          {step > 1 && step < 7 ? (
            <button
              type="button"
              onClick={handleBack}
              className="touch-target flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-white border border-[#CBD5E1] text-[#334155] font-semibold text-xs hover:bg-[#F8FAFC] transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={isCalibrating}
            className="touch-target flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#2F80ED] hover:bg-[#2563D9] text-white font-semibold text-sm shadow-sm transition active:scale-[0.98] ml-auto disabled:opacity-50 cursor-pointer"
          >
            <span>
              {step === 6
                ? 'Generate Agentic Care Plan'
                : step === 7
                ? 'Enter AegisCare Dashboard'
                : 'Next Step'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

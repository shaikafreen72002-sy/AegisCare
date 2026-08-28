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
  CheckCircle2
} from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { profile, currentUser, updateProfileData, setActiveTab, calibrateIntakeWithAI } = usePatient();
  const [step, setStep] = useState(1);

  const initialName = currentUser?.name || (profile.name && !profile.name.includes('Lakshmi') ? profile.name : '');
  const initialPrefName = currentUser?.preferred_name || (profile.preferred_name && !profile.preferred_name.includes('Lakshmi') ? profile.preferred_name : initialName);

  const [name, setName] = useState(initialName);
  const [preferredName, setPreferredName] = useState(initialPrefName);
  const [age, setAge] = useState<number | string>((profile.age || 0) > 0 ? profile.age! : '');
  const [gender, setGender] = useState<string>(profile.gender && profile.gender !== 'Not specified' ? profile.gender : 'Female');
  const [heightCm, setHeightCm] = useState<number | string>((profile.height_cm || 0) > 0 ? profile.height_cm! : 160);
  const [weightKg, setWeightKg] = useState<number | string>((profile.weight_kg || 0) > 0 ? profile.weight_kg! : 60);
  const [conditionSeverity, setConditionSeverity] = useState<string>(
    profile.condition_severity && !profile.condition_severity.includes('Assessment')
      ? profile.condition_severity
      : "Mild Cognitive Impairment / Early Support"
  );
  const [diagnosisDate, setDiagnosisDate] = useState<string>(
    profile.diagnosis_date && !profile.diagnosis_date.includes('Pending')
      ? profile.diagnosis_date
      : new Date().toISOString().slice(0, 7)
  );
  const [selectedMedId, setSelectedMedId] = useState<string>('donepezil');
  const [selectedDose, setSelectedDose] = useState<string>('10 mg');
  const [caregiverName, setCaregiverName] = useState<string>(
    profile.caregiver?.name && !profile.caregiver.name.includes('Priya') ? profile.caregiver.name : ''
  );
  const [caregiverPhone, setCaregiverPhone] = useState<string>(
    profile.caregiver?.phone && !profile.caregiver.phone.includes('(555)') ? profile.caregiver.phone : ''
  );
  const [caregiverRelation, setCaregiverRelation] = useState<string>(
    profile.caregiver?.relation && !profile.caregiver.relation.includes('Daughter') ? profile.caregiver.relation : 'Primary Caregiver'
  );
  const [eveningTime, setEveningTime] = useState<string>('20:00');

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
          name,
          preferred_name: preferredName,
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
    await updateProfileData({
      name,
      preferred_name: preferredName,
      age: Number(age),
      gender,
      height_cm: Number(heightCm),
      weight_kg: Number(weightKg),
      bmi,
      condition: conditionSeverity,
      condition_severity: conditionSeverity,
      diagnosis_date: diagnosisDate,
      primary_medication: {
        name: currentMed.name,
        brand: currentMed.brand_name,
        dosage: selectedDose,
        schedule_time: eveningTime,
        instructions: `Take at ${eveningTime} with water. ${currentMed.with_food_rule}`
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
                  min={18}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="touch-target w-full h-[44px] text-lg font-bold px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
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
                  min={100}
                  max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="touch-target w-full h-[44px] text-sm font-bold px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                />
              </div>

              <div>
                <label htmlFor="intake-weight" className="block text-xs font-semibold text-[#334155] mb-1">
                  Weight (kg)
                </label>
                <input
                  id="intake-weight"
                  type="number"
                  min={30}
                  max={200}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="touch-target w-full h-[44px] text-sm font-bold px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                />
              </div>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Calculated Body Mass Index (BMI)
                </span>
                <span className="text-lg font-bold text-[#0F172A]">
                  {bmi} kg/m²
                </span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${bmiCat.color}`}>
                {bmiCat.label}
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
                Caregiver Contact & Preferred Evening Time
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Instant Telegram verification alerts (@BversityCareBot) and reminder timing.
              </p>
            </div>

            <div className="space-y-3 pt-1">
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
                  Caregiver Mobile / Telegram Number
                </label>
                <input
                  id="intake-caregiver-phone"
                  type="tel"
                  value={caregiverPhone}
                  onChange={(e) => setCaregiverPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 234-5678"
                  className="touch-target w-full h-[44px] text-sm px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                />
              </div>

              <div>
                <label htmlFor="intake-evening-time" className="block text-xs font-semibold text-[#334155] mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#2F80ED]" /> Preferred Evening Medication Time
                </label>
                <input
                  id="intake-evening-time"
                  type="time"
                  value={eveningTime}
                  onChange={(e) => setEveningTime(e.target.value)}
                  className="touch-target w-full h-[44px] text-base font-bold px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
                />
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
                    <li>Take your dose at {eveningTime} every evening with a glass of water.</li>
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

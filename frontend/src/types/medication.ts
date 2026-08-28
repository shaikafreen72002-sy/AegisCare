export interface MedicationItem {
  id: string;
  name: string;
  generic_name: string;
  brand_name: string;
  default_dosage: string;
  available_dosages: string[];
  schedule_recommendation: string;
  with_food_rule: string;
  missed_dose_summary: string;
  description: string;
}

export const COMMON_MEDICATIONS: MedicationItem[] = [
  {
    id: 'donepezil',
    name: 'Donepezil Hydrochloride',
    generic_name: 'Donepezil',
    brand_name: 'Aricept',
    default_dosage: '5 mg',
    available_dosages: ['5 mg', '10 mg', '23 mg'],
    schedule_recommendation: 'Once daily in the evening, just prior to retiring',
    with_food_rule: 'Can be taken with or without food. Small snack helps if stomach is sensitive.',
    missed_dose_summary: 'Skip missed dose. Resume next evening. Never take double dose.',
    description: 'Cholinesterase inhibitor supporting memory, cognition, and daily functional clarity.'
  },
  {
    id: 'rivastigmine',
    name: 'Rivastigmine Tartrate',
    generic_name: 'Rivastigmine',
    brand_name: 'Exelon',
    default_dosage: '1.5 mg twice daily',
    available_dosages: ['1.5 mg', '3 mg', '4.5 mg', '6 mg', '4.6 mg/24hr Patch', '9.5 mg/24hr Patch'],
    schedule_recommendation: 'Twice daily with meals (morning breakfast and evening dinner) or daily transdermal patch',
    with_food_rule: 'Oral capsules MUST be taken with food to prevent gastrointestinal upset.',
    missed_dose_summary: 'Take next dose with scheduled meal. Do not take double dose.',
    description: 'Cholinesterase inhibitor available in oral capsules and continuous transdermal patches.'
  },
  {
    id: 'galantamine',
    name: 'Galantamine Hydrobromide Extended-Release',
    generic_name: 'Galantamine ER',
    brand_name: 'Razadyne / Reminyl',
    default_dosage: '8 mg once daily',
    available_dosages: ['8 mg', '16 mg', '24 mg'],
    schedule_recommendation: 'Once daily in the morning with breakfast',
    with_food_rule: 'Take with morning breakfast and plenty of fluids.',
    missed_dose_summary: 'Skip missed dose and take regular capsule next morning. Never double up.',
    description: 'Selective cholinesterase inhibitor and allosteric nicotinic modulator.'
  },
  {
    id: 'memantine',
    name: 'Memantine Hydrochloride',
    generic_name: 'Memantine',
    brand_name: 'Namenda / Ebixa',
    default_dosage: '10 mg once or twice daily',
    available_dosages: ['5 mg', '10 mg', '15 mg', '20 mg'],
    schedule_recommendation: 'Target maintenance 20 mg/day, once daily or divided twice daily',
    with_food_rule: 'Can be taken with or without food at consistent time.',
    missed_dose_summary: 'Skip forgotten dose and resume next regular dose. Never double dose.',
    description: 'NMDA receptor antagonist protecting neural cells against pathological glutamate excitation.'
  }
];

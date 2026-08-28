import { ragEngine } from './ragEngine';
import type { DocumentInventoryItem, MonographChunkItem } from '../types/document';

export class DocumentKnowledgeAgent {
  private inventory: DocumentInventoryItem[] = [];

  constructor() {
    this.buildInventory();
  }

  private buildInventory() {
    const chunks = ragEngine.getAllChunks();
    const map = new Map<string, DocumentInventoryItem>();

    for (const c of chunks) {
      const docName = c.document || 'Clinical Monograph';
      const med = c.medication || 'general';
      const brand = c.brand_name || '';

      if (!map.has(docName)) {
        const filename = med !== 'general_bpsd' ? `${med.toLowerCase()}_product_monograph.pdf` : 'bpsd_clinical_guidelines.pdf';
        map.set(docName, {
          document_id: `doc_${med.toLowerCase()}`,
          filename,
          title: docName,
          file_type: 'PDF / Monograph',
          source: 'Official Health Product Monograph',
          medications: [brand ? `${med.charAt(0).toUpperCase() + med.slice(1)} (${brand})` : med.charAt(0).toUpperCase() + med.slice(1)],
          topics: ['Dementia', 'Medication Adherence'],
          symptoms_discussed: [],
          dementia_relevance: "High — Core Pharmacotherapy for Alzheimer's & Dementia",
          adherence_rules: 'Strict No-Double-Dose protocol; routine timing guidelines',
          caregiver_guidance: 'Caregiver monitoring for cognitive changes and adverse event reporting',
          emergency_safety: 'Syncope, severe bradycardia, and suspected overdose escalation protocols',
          rag_eligible: true,
          pages_covered: [],
          sections_covered: [],
          chunks_count: 0,
          sample_excerpt: c.content.slice(0, 160) + '...'
        });
      }

      const item = map.get(docName)!;
      item.chunks_count++;
      if (!item.pages_covered.includes(c.page_number)) item.pages_covered.push(c.page_number);
      const secFormatted = c.section.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      if (!item.sections_covered.includes(secFormatted)) item.sections_covered.push(secFormatted);

      const cLow = c.content.toLowerCase();
      if ((cLow.includes('food') || cLow.includes('meal')) && !item.topics.includes('Meal Administration & Absorption')) {
        item.topics.push('Meal Administration & Absorption');
      }
      if ((cLow.includes('miss') || cLow.includes('skip') || cLow.includes('double')) && !item.topics.includes('Missed Dose Protocols')) {
        item.topics.push('Missed Dose Protocols');
      }
      if (cLow.includes('adverse') || cLow.includes('nausea') || cLow.includes('dizzy')) {
        if (!item.topics.includes('Side Effects & Safety')) item.topics.push('Side Effects & Safety');
        ['Nausea', 'Diarrhea', 'Insomnia', 'Dizziness', 'Fatigue', 'Muscle Cramps'].forEach((s) => {
          if (!item.symptoms_discussed.includes(s)) item.symptoms_discussed.push(s);
        });
      }
      if (cLow.includes('bradycardia') || cLow.includes('faint') || cLow.includes('syncope')) {
        ['Bradycardia (Slow Heart Rate)', 'Syncope (Fainting)'].forEach((s) => {
          if (!item.symptoms_discussed.includes(s)) item.symptoms_discussed.push(s);
        });
      }
    }

    this.inventory = Array.from(map.values()).map((d) => ({
      ...d,
      topics: d.topics.sort(),
      symptoms_discussed: d.symptoms_discussed.sort(),
      pages_covered: d.pages_covered.sort((a, b) => a - b),
      sections_covered: d.sections_covered.sort()
    }));
  }

  public getInventory(): DocumentInventoryItem[] {
    return this.inventory;
  }

  public retrieveChunksForQuery(query: string, medicationFilter?: string, topK: number = 3): MonographChunkItem[] {
    return ragEngine.retrieve(query, medicationFilter, topK);
  }
}

export const documentKnowledgeAgent = new DocumentKnowledgeAgent();

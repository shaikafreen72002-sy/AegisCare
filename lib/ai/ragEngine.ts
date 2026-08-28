import monographData from '../manifests/documentManifest.json';
import type { MonographChunkItem } from '../types/document';

export class RAGEngine {
  private chunks: MonographChunkItem[];

  constructor() {
    this.chunks = (monographData.monographs || []) as MonographChunkItem[];
  }

  public getAllChunks(): MonographChunkItem[] {
    return this.chunks;
  }

  public retrieve(query: string, medicationFilter?: string, topK: number = 3): MonographChunkItem[] {
    const qLower = query.toLowerCase();
    const queryTokens = qLower.split(/\W+/).filter(Boolean);

    const scored = this.chunks.map((chunk) => {
      let score = 0;
      const cMed = chunk.medication.toLowerCase();
      const cBrand = chunk.brand_name.toLowerCase();
      const cSection = chunk.section.toLowerCase();
      const cContent = chunk.content.toLowerCase();

      // Medication filter boost
      if (medicationFilter) {
        const medTarget = medicationFilter.toLowerCase();
        if (cMed.includes(medTarget) || cBrand.includes(medTarget)) {
          score += 5;
        } else if (cMed !== 'general_bpsd') {
          score -= 3;
        }
      }

      // Keyword token overlap
      for (const token of queryTokens) {
        if (token.length <= 2) continue;
        if (cContent.includes(token)) score += 2;
        if (cSection.includes(token)) score += 3;
        if (cBrand.includes(token)) score += 3;
      }

      // Domain phrase matching
      if (/miss|forgot|skip|late|double/.test(qLower) && /missed_dose/.test(cSection)) {
        score += 8;
      }
      if (/food|eat|meal|breakfast|dinner|snack|milk/.test(qLower) && /administration_with_food/.test(cSection)) {
        score += 8;
      }
      if (/side effect|dizzy|nausea|vomit|headache|cramp/.test(qLower) && /adverse_reactions/.test(cSection)) {
        score += 8;
      }
      if (/faint|blackout|slow pulse|bradycardia|syncope/.test(qLower) && (/adverse_reactions/.test(cSection) || /warning/.test(cSection))) {
        score += 10;
      }
      if (/what|why|indication|purpose|benefit|memory/.test(qLower) && /indications_and_clinical_use/.test(cSection)) {
        score += 7;
      }

      return { chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored
      .filter((s) => s.score > 0)
      .slice(0, topK)
      .map((s) => s.chunk);
  }
}

export const ragEngine = new RAGEngine();

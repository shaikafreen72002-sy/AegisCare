export interface DocumentInventoryItem {
  document_id: string;
  filename: string;
  title: string;
  file_type: string;
  source: string;
  medications: string[];
  topics: string[];
  symptoms_discussed: string[];
  dementia_relevance: string;
  adherence_rules: string;
  caregiver_guidance: string;
  emergency_safety: string;
  rag_eligible: boolean;
  pages_covered: number[];
  sections_covered: string[];
  chunks_count: number;
  sample_excerpt: string;
}

export interface MonographChunkItem {
  chunk_id: string;
  medication: string;
  brand_name: string;
  source_type: string;
  document: string;
  section: string;
  page_number: number;
  content: string;
}

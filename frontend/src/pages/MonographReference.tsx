import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { DocumentInventoryItem } from '../types/document';
import {
  BookOpen,
  Search,
  FileText,
  RefreshCw,
  UploadCloud,
  Layers
} from 'lucide-react';

interface MonographChunk {
  chunk_id: string;
  medication: string;
  brand_name: string;
  document: string;
  section: string;
  page_number: number;
  content: string;
}

const MONOGRAPH_DATA: MonographChunk[] = [
  {
    chunk_id: 'don_01_indication',
    medication: 'donepezil',
    brand_name: 'Aricept',
    document: 'Donepezil Hydrochloride Product Monograph',
    section: 'indications_and_clinical_use',
    page_number: 3,
    content: "Donepezil hydrochloride is indicated for the symptomatic treatment of mild, moderate, and severe dementia of the Alzheimer's type. It is a reversible, non-competitive inhibitor of acetylcholinesterase, thereby increasing acetylcholine concentrations in cerebral synapses to support cognitive and functional performance."
  },
  {
    chunk_id: 'don_02_dosing',
    medication: 'donepezil',
    brand_name: 'Aricept',
    document: 'Donepezil Hydrochloride Product Monograph',
    section: 'dosage_and_administration',
    page_number: 12,
    content: "Donepezil is taken orally once daily in the evening, just prior to retiring. Initial dosage is 5 mg once daily. After 4 to 6 weeks of clinical assessment at 5 mg/day, the dose may be increased to 10 mg once daily if clinically indicated. Maximum recommended daily dose is 10 mg/day."
  },
  {
    chunk_id: 'don_03_food',
    medication: 'donepezil',
    brand_name: 'Aricept',
    document: 'Donepezil Hydrochloride Product Monograph',
    section: 'administration_with_food',
    page_number: 13,
    content: "Donepezil can be taken with or without food. Food does not significantly alter the rate or extent of absorption of Donepezil hydrochloride. If gastrointestinal upset or mild nausea occurs, taking the dose with an evening snack or milk may help soothe stomach sensitivity."
  },
  {
    chunk_id: 'don_04_missed_dose',
    medication: 'donepezil',
    brand_name: 'Aricept',
    document: 'Donepezil Hydrochloride Product Monograph',
    section: 'missed_dose',
    page_number: 49,
    content: "If a dose of Donepezil is missed, do NOT take an extra dose or double the next dose to make up for the missed one. Skip the missed dose and resume your regular dosing schedule the next evening at the normal time. If Donepezil has been missed for 7 consecutive days or more, consult your physician before restarting."
  },
  {
    chunk_id: 'don_05_adverse_effects',
    medication: 'donepezil',
    brand_name: 'Aricept',
    document: 'Donepezil Hydrochloride Product Monograph',
    section: 'adverse_reactions',
    page_number: 18,
    content: "Most common adverse reactions are mild and transient: nausea, diarrhea, insomnia, fatigue, muscle cramps, anorexia, and vomiting. Cholinergic actions may cause bradycardia (slow heart rate) or syncope (fainting). Any severe dizziness, sudden slow pulse, blackouts, or chest pain must be reported immediately."
  },
  {
    chunk_id: 'riv_01_indication_dosing',
    medication: 'rivastigmine',
    brand_name: 'Exelon',
    document: 'Rivastigmine Tartrate Product Monograph',
    section: 'dosage_and_administration',
    page_number: 5,
    content: "Rivastigmine is a pseudo-irreversible inhibitor of acetylcholinesterase and butyrylcholinesterase indicated for mild to moderate dementia of the Alzheimer's type and Parkinson's disease dementia. Oral capsules are administered twice daily with meals (morning breakfast and evening dinner)."
  },
  {
    chunk_id: 'riv_02_food',
    medication: 'rivastigmine',
    brand_name: 'Exelon',
    document: 'Rivastigmine Tartrate Product Monograph',
    section: 'administration_with_food',
    page_number: 8,
    content: "Rivastigmine oral capsules MUST be taken with food (during breakfast and evening meal) to significantly reduce potential gastrointestinal adverse effects such as nausea, vomiting, and abdominal discomfort."
  },
  {
    chunk_id: 'riv_03_missed_dose',
    medication: 'rivastigmine',
    brand_name: 'Exelon',
    document: 'Rivastigmine Tartrate Product Monograph',
    section: 'missed_dose',
    page_number: 32,
    content: "If you miss a dose of oral Rivastigmine, take the next dose at the usual scheduled time with your next meal. Never take a double dose to compensate. If interrupted for more than 3 consecutive days, contact your prescribing physician."
  },
  {
    chunk_id: 'gal_01_indication_dosing',
    medication: 'galantamine',
    brand_name: 'Razadyne / Reminyl',
    document: 'Galantamine Hydrobromide Extended-Release Product Monograph',
    section: 'dosage_and_administration',
    page_number: 4,
    content: "Galantamine is a selective, competitive cholinesterase inhibitor and allosteric nicotinic receptor modulator indicated for mild to moderate dementia of the Alzheimer's type. Extended-Release (ER) capsules are taken once daily in the morning, preferably with breakfast."
  },
  {
    chunk_id: 'mem_01_indication_dosing',
    medication: 'memantine',
    brand_name: 'Namenda / Ebixa',
    document: 'Memantine Hydrochloride Product Monograph',
    section: 'dosage_and_administration',
    page_number: 6,
    content: "Memantine hydrochloride is a voltage-dependent, moderate-affinity uncompetitive NMDA receptor antagonist indicated for moderate to severe Alzheimer's disease. Target maintenance dose is 20 mg daily. Can be administered with or without food."
  },
  {
    chunk_id: 'bpsd_01_non_pharm',
    medication: 'general_bpsd',
    brand_name: 'Clinical Guidelines',
    document: 'BPSD & Dementia Care Best Practice Guidelines',
    section: 'non_pharmacological_approaches',
    page_number: 14,
    content: "Non-pharmacological strategies form the foundational first-line management for behavioral and psychological symptoms of dementia (BPSD). Prioritize quiet, familiar environments, calm reassurance, simplified daily pacing, and music therapy before initiating or altering psychotropic agents."
  }
];

export const MonographReference: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'chunks' | 'upload'>('inventory');
  const [documents, setDocuments] = useState<DocumentInventoryItem[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexSuccess, setReindexSuccess] = useState(false);

  // Upload Form State
  const [uploadFilename, setUploadFilename] = useState('');
  const [uploadMedName, setUploadMedName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      const data = await apiService.getDocuments();
      setDocuments(data);
    };
    fetchDocs();
  }, []);

  const handleReindex = async () => {
    setIsReindexing(true);
    try {
      await apiService.reindexDocuments();
      const updated = await apiService.getDocuments();
      setDocuments(updated);
      setReindexSuccess(true);
      setTimeout(() => setReindexSuccess(false), 3000);
    } finally {
      setIsReindexing(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFilename || !uploadContent || !uploadMedName) return;
    const res = await apiService.uploadDocument(uploadFilename, uploadContent, uploadMedName);
    setUploadMsg(res.message || 'Document indexed.');
    const updated = await apiService.getDocuments();
    setDocuments(updated);
    setUploadFilename('');
    setUploadMedName('');
    setUploadContent('');
  };

  const filteredChunks = MONOGRAPH_DATA.filter((chunk) => {
    const matchesMed =
      selectedMedication === 'all' ||
      chunk.medication.toLowerCase() === selectedMedication.toLowerCase();

    const matchesSearch =
      searchTerm.trim() === '' ||
      chunk.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chunk.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chunk.section.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesMed && matchesSearch;
  });

  const getSectionBadgeColor = (sec: string) => {
    switch (sec) {
      case 'missed_dose':
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/30';
      case 'administration_with_food':
        return 'bg-[#DCFCE7] text-[#16A34A] border-[#16A34A]/30';
      case 'adverse_reactions':
        return 'bg-[#FEF3C7] text-[#D97706] border-[#D97706]/30';
      case 'dosage_and_administration':
        return 'bg-[#EAF3FF] text-[#2F80ED] border-[#CBD5E1]';
      default:
        return 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] bg-[#2F80ED] text-white flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A]">
              Knowledge Base & Clinical Document Inventory
            </h1>
          </div>
          <p className="text-sm text-[#475569] mt-1 font-medium">
            Managed by Document Knowledge Agent • Grounded in official Product Monographs and BPSD Clinical Guidelines
          </p>
        </div>

        <button
          type="button"
          onClick={handleReindex}
          disabled={isReindexing}
          className="touch-target flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#EAF3FF] hover:bg-[#D4E8FF] text-[#2F80ED] font-semibold text-xs border border-[#CBD5E1]/60 transition active:scale-[0.98] cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isReindexing ? 'animate-spin' : ''}`} />
          <span>{isReindexing ? 'Synchronizing...' : reindexSuccess ? '✓ Synchronized' : 'Re-Index Knowledge Base'}</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('inventory')}
          className={`touch-target px-4 py-2 rounded-[8px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'inventory'
              ? 'bg-[#2F80ED] text-white shadow-sm'
              : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#CBD5E1]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Document Inventory ({documents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('chunks')}
          className={`touch-target px-4 py-2 rounded-[8px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'chunks'
              ? 'bg-[#2F80ED] text-white shadow-sm'
              : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#CBD5E1]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Monograph Chunks Explorer ({MONOGRAPH_DATA.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('upload')}
          className={`touch-target px-4 py-2 rounded-[8px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'upload'
              ? 'bg-[#2F80ED] text-white shadow-sm'
              : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#CBD5E1]'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload & Ingest Document</span>
        </button>
      </div>

      {/* TAB 1: Document Inventory */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.document_id}
                className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#2F80ED] shrink-0" />
                      <span className="font-bold text-sm text-[#0F172A] leading-tight">
                        {doc.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] shrink-0">
                      ✓ RAG Indexed
                    </span>
                  </div>

                  <div className="text-xs text-[#64748B] space-y-1">
                    <div>
                      <strong className="text-[#334155]">Filename:</strong> {doc.filename}
                    </div>
                    <div>
                      <strong className="text-[#334155]">Source:</strong> {doc.source}
                    </div>
                    <div>
                      <strong className="text-[#334155]">Pages Indexed:</strong> {doc.pages_covered.join(', ')}
                    </div>
                  </div>

                  {/* Topics Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {doc.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] text-[11px] text-[#475569] italic">
                  "{doc.sample_excerpt}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Monograph Chunks Explorer */}
      {activeSubTab === 'chunks' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-3">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Medications' },
                { id: 'donepezil', label: 'Donepezil (Aricept)' },
                { id: 'rivastigmine', label: 'Rivastigmine (Exelon)' },
                { id: 'galantamine', label: 'Galantamine (Reminyl)' },
                { id: 'memantine', label: 'Memantine (Namenda)' },
                { id: 'general_bpsd', label: 'BPSD Guidelines' }
              ].map((med) => (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => setSelectedMedication(med.id)}
                  className={`touch-target px-3.5 py-1.5 rounded-[8px] text-xs font-semibold border transition cursor-pointer ${
                    selectedMedication === med.id
                      ? 'bg-[#2F80ED] text-white border-[#2F80ED] shadow-sm'
                      : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {med.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#94A3B8]" />
              <input
                id="search-monographs"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search monograph chunks (e.g., 'missed dose', 'nausea', 'food', 'page 12')..."
                className="touch-target w-full h-[40px] pl-9 pr-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#EAF3FF]"
              />
            </div>
          </div>

          {/* Chunks List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChunks.map((chunk) => (
              <div
                key={chunk.chunk_id}
                className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">
                      {chunk.document}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      {chunk.medication.toUpperCase()} ({chunk.brand_name}) • Page {chunk.page_number}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getSectionBadgeColor(
                      chunk.section
                    )}`}
                  >
                    {chunk.section.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-[#334155] leading-relaxed bg-[#F8FAFC] p-3 rounded-[8px] border border-[#E2E8F0]">
                  "{chunk.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Upload & Ingest Simulator */}
      {activeSubTab === 'upload' && (
        <div className="max-w-xl mx-auto bg-white border border-[#E2E8F0] rounded-[12px] p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#0F172A]">
              Upload New Clinical Monograph or Guideline
            </h2>
            <p className="text-xs text-[#64748B]">
              Ingests document into the Document Discovery Agent for RAG chunking and indexing.
            </p>
          </div>

          {uploadMsg && (
            <div className="p-3 bg-[#DCFCE7] text-[#16A34A] text-xs font-bold rounded-[8px] border border-[#16A34A]/30">
              ✓ {uploadMsg}
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Document Filename (PDF)
              </label>
              <input
                type="text"
                value={uploadFilename}
                onChange={(e) => setUploadFilename(e.target.value)}
                placeholder="e.g. memantine_guidelines_2026.pdf"
                required
                className="touch-target w-full h-[40px] px-3 rounded-[8px] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#2F80ED]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Medication Name
              </label>
              <input
                type="text"
                value={uploadMedName}
                onChange={(e) => setUploadMedName(e.target.value)}
                placeholder="e.g. Memantine / Namenda"
                required
                className="touch-target w-full h-[40px] px-3 rounded-[8px] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#2F80ED]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Clinical Monograph Text Content
              </label>
              <textarea
                value={uploadContent}
                onChange={(e) => setUploadContent(e.target.value)}
                rows={4}
                placeholder="Paste verbatim excerpt from official prescribing information..."
                required
                className="w-full p-3 rounded-[8px] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#2F80ED]"
              />
            </div>

            <button
              type="submit"
              className="touch-target w-full h-[44px] rounded-[8px] bg-[#2F80ED] hover:bg-[#2563D9] text-white font-semibold text-xs shadow-sm transition cursor-pointer"
            >
              Parse, Chunk & Index Document
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

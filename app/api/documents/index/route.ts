import { NextResponse } from 'next/server';
import { documentKnowledgeAgent } from '@/lib/ai/knowledgeAgent';

export async function POST() {
  const inventory = documentKnowledgeAgent.getInventory();
  return NextResponse.json({
    status: 'INDEXED',
    indexed_documents: inventory.length,
    timestamp: new Date().toISOString()
  });
}

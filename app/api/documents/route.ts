import { NextResponse } from 'next/server';
import { documentKnowledgeAgent } from '@/lib/ai/knowledgeAgent';

export async function GET() {
  const inventory = documentKnowledgeAgent.getInventory();
  return NextResponse.json({
    total_documents: inventory.length,
    status: 'ACTIVE',
    documents: inventory
  });
}

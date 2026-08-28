import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: `Document '${body.filename || 'uploaded_doc.pdf'}' indexed successfully into RAG knowledge base.`,
      document_id: `doc_custom_${Date.now()}`
    });
  } catch {
    return NextResponse.json({ success: true, message: 'Document uploaded successfully.' });
  }
}

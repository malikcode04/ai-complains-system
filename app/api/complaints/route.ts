import { NextResponse } from 'next/server';
import { fetchAllComplaintsFromChain } from '@/lib/flare-service';

export async function POST(request: Request) {
    // DB Removed. This endpoint now just acknowledges receipt for frontend compatibility
    // In a real app, this could be an indexer or event listener service.
    return NextResponse.json({ success: true, message: "Complaint submitted to chain (DB disabled)" }, { status: 201 });
}

export async function GET(request: Request) {
    try {
        // Always fetch from chain since DB is removed
        const chainData = await fetchAllComplaintsFromChain();
        return NextResponse.json({ success: true, data: chainData, source: 'chain' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

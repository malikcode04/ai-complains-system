import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { description } = await request.json();

        // Simulating AI delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simple mock logic for demo
        let category = "General";
        let urgency = "Low";
        const lowerDesc = description.toLowerCase();

        if (lowerDesc.includes("water") || lowerDesc.includes("leak") || lowerDesc.includes("flood")) {
            category = "Water Supply";
            urgency = "High";
        } else if (lowerDesc.includes("road") || lowerDesc.includes("pothole") || lowerDesc.includes("accident")) {
            category = "Road infrastructure";
            urgency = "Medium";
        } else if (lowerDesc.includes("electric") || lowerDesc.includes("power") || lowerDesc.includes("light")) {
            category = "Electricity";
            urgency = "Critical";
        }

        return NextResponse.json({
            success: true,
            data: {
                category,
                urgency,
                summary: `Automated summary: Issue identified regarding ${category}.`,
                confidence: 0.95
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

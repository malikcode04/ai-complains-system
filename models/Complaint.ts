import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComplaint extends Document {
    description: string;
    location: string; // "lat,lon" or address
    category: string;
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Pending' | 'Verified' | 'InProgress' | 'Resolved' | 'Rejected';
    reporter: string; // Wallet address
    fAssetStake: number;
    proofMetadata: string;
    txHash: string; // On-chain transaction hash
    createdAt: Date;
}

const ComplaintSchema: Schema = new Schema({
    description: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, default: 'Uncategorized' },
    urgency: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'Verified', 'InProgress', 'Resolved', 'Rejected'], default: 'Pending' },
    reporter: { type: String, required: true },
    fAssetStake: { type: Number, default: 0 },
    proofMetadata: { type: String },
    txHash: { type: String },
}, { timestamps: true });

// Prevent overwrite on hot reload
const Complaint: Model<IComplaint> = mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);

export default Complaint;

# FLARE-AI Complaint Guardian

**AI-Powered Smart Complaint Portal with Flare Network Integration**

Built for the 24-hour Hackathon. The system leverages Flare's FAssets, FTSO, and Smart Accounts to create a trustless, verified, and efficient civic reporting platform.

## 🚀 Features

- **FAsset Integrity**: Users stake mocked FAssets (proof of stake) to file complaints, reducing spam.
- **FTSO Verification**: Location and Time are verified against the Flare Time Series Oracle (Mocked).
- **AI Agents**: Automated classification, urgency tagging, and summarization of complaints using LLM logic.
- **Gasless Transactions**: Abstracted Smart Accounts allow users to file without holding native tokens immediately.
- **Admin Command Center**: Real-time heatmap and AI-driven insights.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TailwindCSS, Framer Motion, Shadcn/UI
- **Backend**: Next.js API Routes, Mongoose (MongoDB)
- **Blockchain**: Hardhat, Solidity, Ethers.js
- **Design**: Premium "Cyberpunk/Smart City" Aesthetic

## 📦 Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   - Create a `.env` file (optional for mock mode).
   - `MONGODB_URI` (Optional, defaults to in-memory/mock if not set, but code expects connection)

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or 3001).

4. **Smart Contracts (Optional)**
   - Compile: `npx hardhat compile`
   - Deploy: `npx hardhat run scripts/deploy.js --network coston2`

## 🏗️ Architecture

- `contracts/`: Solidity Smart Contracts (ComplaintRegistry, SmartAccountManager)
- `app/`: Next.js App Router pages.
- `app/api/`: Backend logic.
- `components/`: UI Components (WalletProvider, Navbar).
- `models/`: Mongoose Schemas.

## 🏆 Hackathon Tracks Implemented
- [x] **FAssets**: Staking mechanism for complaints.
- [x] **FTSO**: Location verification oracle.
- [x] **FDC**: Data verification (Mocked integration).
- [x] **Smart Accounts**: Gasless UX.

# CredShield

A privacy-preserving academic credential verification system using zero-knowledge proofs and blockchain technology. CredShield allows students to prove their GPA meets a threshold requirement without revealing the actual GPA value.


## Architecture

### Components

**Mobile Application (React Native + Expo)**
- Cross-platform mobile app for iOS and Android
- Document capture and upload functionality
- ZK proof generation interface
- Proof history management
- On-chain verification

**Backend Server (Node.js + Express)**
- RESTful API for proof generation and verification
- AI-powered document parsing using Google Gemini
- Circom circuit integration for ZK proof generation
- Blockchain interaction via Ethers.js

**Smart Contracts (Solidity + Hardhat)**
- On-chain proof verification using Groth16
- Verifier contract generated from Circom circuit
- Immutable verification records

**Zero-Knowledge Circuits (Circom)**
- Custom GPA verification circuit
- Proves: `GPA >= threshold` without revealing GPA
- Scales values by 100 to handle decimals
- Compiled to Groth16 proof system

## Features

### Privacy-Preserving Verification
- Zero-knowledge proofs ensure actual GPA remains private
- Only proof of meeting threshold is revealed
- Cryptographically secure and tamper-proof

### AI Document Processing
- Automatic extraction of student information from documents
- Supports both images and PDFs
- Powered by Google Gemini AI

### Blockchain Verification
- Proofs verified on-chain using Ethereum smart contracts
- Permanent verification records
- Trustless verification by third parties

### User-Friendly Interface
- Modern, minimalist UI design
- Proof history with copyable verification codes
- Real-time backend health monitoring
- Secure local storage using device keychain

## Prerequisites

### Backend
- Node.js 18.x or higher
- Hardhat for smart contract deployment
- Circom compiler for circuit compilation
- Google Gemini API key

### Mobile App
- Node.js 18.x or higher
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

## Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `CONTRACT_ADDRESS`: Deployed verifier contract address (after deployment)
- `PRIVATE_KEY`: Ethereum wallet private key for deployment

4. Start local Hardhat node:
```bash
npm run node
```

5. Deploy smart contracts (in new terminal):
```bash
npm run deploy
```

6. Start development server:
```bash
npm run dev
```

Backend will run on `http://localhost:3000`

### Mobile App Setup

1. Navigate to app directory:
```bash
cd app
```

2. Install dependencies:
```bash
npm install
```

3. Start Expo development server:
```bash
npx expo start
```

4. Run on device:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app for physical device

## Usage

### Generating a Proof

1. Open the app and navigate to the Generate tab
2. Enter the required GPA threshold (e.g., 7.0)
3. Upload an academic document:
   - Take a photo of transcript
   - Upload PDF document
4. Wait for AI to extract GPA and generate proof
5. View verification code and proof details

### Verifying a Proof

1. Navigate to the Verify tab
2. Enter the 8-character verification code
3. System queries blockchain for proof verification
4. View verification results including:
   - Student name
   - Threshold requirement
   - Pass/Fail status
   - Transaction hash

### Managing Proofs

1. Navigate to Profile tab
2. View complete proof history
3. Tap verification codes to copy
4. Access individual proof details

## API Endpoints

### POST /api/proof/generate-from-document
Generate ZK proof from uploaded document

**Request:**
- `document`: Academic document file (image or PDF)
- `threshold`: GPA threshold value

**Response:**
```json
{
  "success": true,
  "studentName": "Student Name",
  "extractedGPA": 9.75,
  "verificationCode": "ABC12345",
  "proof": {...},
  "metadata": {
    "threshold": 7.0,
    "meetsRequirement": true,
    "generated": "2026-02-06T00:00:00.000Z"
  }
}
```

### GET /api/proof/verify/:code
Verify proof using verification code

**Response:**
```json
{
  "success": true,
  "verified": true,
  "txHash": "0x...",
  "metadata": {
    "studentName": "Student Name",
    "threshold": 7.0,
    "meetsRequirement": true
  }
}
```

### GET /health
Check backend health status

## Technology Stack

### Frontend
- React Native 0.76
- Expo SDK 54
- TypeScript
- Expo Router for navigation
- Expo SecureStore for encrypted storage
- Axios for HTTP requests

### Backend
- Node.js with Express
- SnarkJS for ZK proof generation
- Ethers.js for blockchain interaction
- Google Generative AI (Gemini)
- Multer for file uploads
- PDF Parse for document processing

### Blockchain
- Solidity smart contracts
- Hardhat development environment
- Groth16 proof verification
- Local Ethereum network

### Cryptography
- Circom for circuit definition
- SnarkJS for proof generation
- Groth16 proving system
- BN128 elliptic curve

## Project Structure

```
CredShield/
├── app/                        # React Native mobile application
│   ├── app/                    # Expo Router pages
│   │   ├── (tabs)/            # Tab navigation
│   │   │   ├── index.tsx      # Home screen
│   │   │   ├── generate.tsx   # Proof generation
│   │   │   ├── verify.tsx     # Proof verification
│   │   │   └── profile.tsx    # User profile
│   │   └── settings.tsx       # Settings screen
│   ├── components/            # Reusable UI components
│   ├── constants/             # Theme and constants
│   └── services/              # API service layer
│
└── backend/                   # Node.js backend server
    ├── circuits/              # Circom ZK circuits
    │   └── gpa_verifier.circom
    ├── contracts/             # Solidity smart contracts
    │   └── GPAVerifier.sol
    ├── scripts/               # Deployment scripts
    └── src/
        ├── routes/            # API routes
        ├── services/          # Business logic
        │   ├── geminiService.js    # AI document processing
        │   └── gpaCircuit.js       # ZK proof generation
        └── middleware/        # Express middleware
```

## Security Considerations

- Private keys and API keys stored in environment variables
- User data encrypted using device secure storage
- ZK proofs ensure GPA privacy
- Smart contracts are immutable once deployed
- No central database stores sensitive information

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# App tests
cd app
npm test
```

### Building for Production

**Backend:**
```bash
npm start
```

**Mobile App:**
```bash
# Android
npx expo build:android

# iOS
npx expo build:ios
```

## Troubleshooting

### Backend won't start
- Verify Node.js version (18.x+)
- Check `.env` file configuration
- Ensure Hardhat node is running
- Verify contract deployment

### App can't connect to backend
- Android emulator: Backend must listen on `0.0.0.0`
- Check `API_URL` in `app/services/api.ts`
- Verify backend is accessible from device/emulator

### Proof generation fails
- Verify Gemini API key is valid
- Check circuit files exist in `backend/circuits`
- Ensure document is clear and readable
- Check backend logs for errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Author

Pradyum Mistry
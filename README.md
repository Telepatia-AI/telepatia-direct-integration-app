# Telepatia Direct Integration App

This repository implements a direct integration application between a healthcare system and Telepatia's medical transcription service. It provides a split-screen interface that demonstrates the workflow for recording medical consultations and importing the transcribed sessions.

## API Documentation
The complete API documentation and interactive API explorer can be accessed at: https://integrations.test.telepatia.ai/api/docs

## Overview

The application consists of two synchronized interfaces:
- **Left Screen (Telepatia Interface)**: Simulates the Telepatia recording system
- **Right Screen (External System Interface)**: Represents your healthcare/clinical system

## Installation & Setup

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd telepatia-direct-integration-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Environment Variables (Optional)
You can configure the API base URL by creating a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://uzui-alb-1991166989.us-east-2.elb.amazonaws.com
```

## Direct Integration Workflow Steps

### Step 1: Authentication (🔐)
- Enter your Bearer token in the External System interface
- The token is validated against Telepatia's authentication endpoint
- Once authenticated, the system is ready to process patient data

### Step 2: Initialize Consultation (📋)
- The External System sends patient information to Telepatia
- Patient details include:
  - Name
  - Country (e.g., COLOMBIA)
  - ID Type (e.g., CC, CE, TI)
  - ID Value (document number)
- This updates the current patient context via `/api/account/external-system/current-patient`

### Step 3: Start Recording (🎙️)
- The Telepatia interface begins recording the medical consultation
- Audio capture simulates the real-time transcription process
- The recording interface shows elapsed time and audio visualization

### Step 4: End Recording (⏹️)
- Stop the recording when the consultation is complete
- The system processes the recorded audio
- A new session is created with the transcribed content

### Step 5: Confirm Patient (✅)
- Review and confirm the patient information
- Ensure the patient details match between both systems
- Option to reassign to a different patient if needed

### Step 6: Import Scribe Session (📥)
- The External System fetches the transcribed session from Telepatia
- Uses the `/api/scribe-sessions/find-by-patient` endpoint
- Retrieves the most recent session for the patient including:
  - Session metadata (ID, creation date, status)
  - Medical record data
  - Examination notes (oral examinations, odontogram)
- The transcribed medical notes are displayed in the External System

### Step 7: Completed (✓)
- The integration cycle is complete
- Medical notes are available in the External System
- Option to reset and start a new consultation

## Key Features

- **Multi-language Support**: Interface available in English, Spanish, and Portuguese
- **Real-time Synchronization**: Both interfaces update in sync as you progress through the workflow
- **Session Management**: View and select from multiple recording sessions
- **Error Handling**: Comprehensive error messages and recovery options
- **Patient Data Security**: Secure token-based authentication for all API calls

## Technical Implementation

The application uses:
- **Next.js 14** for the React-based frontend
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **REST API** integration with Telepatia's backend services
- **React Context** for state management
- **i18next** for internationalization

## API Endpoints Used

1. **Authentication**: `/api/auth/validate`
2. **Patient Management**: `/api/account/external-system/current-patient`
3. **Session Import**: `/api/scribe-sessions/find-by-patient`

## Project Structure

```
app/
├── components/
│   ├── external-system/     # External system interface components
│   ├── telepatia/           # Telepatia interface components
│   └── shared/              # Shared components (Header, WorkflowChecklist, etc.)
├── services/
│   └── api.ts              # API service layer
├── types/
│   ├── index.ts            # Main type definitions
│   └── patient-sessions-dto.ts  # API DTOs
├── i18n/                   # Internationalization configuration
│   └── locales/           # Translation files (en, es, pt)
└── enums/                 # Enumerations for countries and ID types
```

## Development

### Building for Production
```bash
npm run build
# or
yarn build
```

### Running Production Build
```bash
npm start
# or
yarn start
```

### Linting
```bash
npm run lint
# or
yarn lint
```

## Notes

- The application is designed as a demonstration of the direct integration workflow
- In production, replace the mock Bearer token validation with actual authentication
- Ensure proper CORS configuration when deploying to production environments

This direct integration ensures seamless data flow between your clinical system and Telepatia's transcription service, maintaining data consistency and providing an efficient workflow for healthcare professionals.

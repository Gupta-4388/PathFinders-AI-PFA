# PathFinders AI (PFA) 🚀

<div align="center">

![PathFinders AI](https://img.shields.io/badge/PathFinders-AI-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.3.8-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-11.9.1-orange?style=for-the-badge&logo=firebase)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Your Personal AI-Powered Career Navigator**

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Usage](#usage) • [Tech Stack](#tech-stack) • [Contributing](#contributing)

</div>

---

## 📋 Overview

PathFinders AI is a comprehensive career development platform that leverages artificial intelligence to help professionals navigate their career journey. From resume analysis to mock interviews and personalized mentorship, PFA provides an all-in-one solution for career advancement.

## ✨ Features

### 🎯 **Dashboard**
- Personalized career recommendations based on your resume
- Skills analysis and career path suggestions
- Quick access to all platform features
- Real-time progress tracking

### 📄 **Resume Analyzer**
- AI-powered resume analysis and feedback
- Skill extraction and categorization
- Career path recommendations based on your experience
- Resume validation (ensures uploaded files are actual resumes)
- File size limit: 2MB for optimal performance

### 🎤 **Mock Interview**
- **Three Interview Modes:**
  - 🎥 Video Interview with camera support
  - 🎙️ Audio Interview with voice recognition
  - ⌨️ Text-based Interview
- **Customizable Settings:**
  - Job role specification
  - Difficulty levels (Beginner, Intermediate, Advanced)
  - Interview types (Technical, HR, Behavioral, Mixed)
- Real-time AI feedback during interviews
- Comprehensive final performance report
- Resume compatibility validation
- 15 dynamic questions per session
- Text-to-speech for questions

### 🤖 **AI Mentor**
- Conversational AI mentor for career guidance
- Context-aware responses based on your resume
- Personalized resource recommendations
- Chat history maintenance
- Category-organized learning resources

### 📊 **Job Market Trends**
- Real-time job market analytics
- Role-specific trend analysis
- Salary insights and projections
- Geographic demand visualization
- Interactive charts (Bar, Pie, Line)
- Search functionality for specific roles

### ⚙️ **Settings & Profile**
- Profile customization
- Resume upload and management
- Password change functionality
- Profile photo upload
- Career path preferences

## 🚀 Demo

https://drive.google.com/file/d/1tq51mNULzATraTUANZt-M4Zwb1mK10P0/view?usp=sharing

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** Next.js 15.3.8 (with Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.4.1
- **UI Components:** Radix UI
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Icons:** Lucide React

### **Backend & AI**
- **AI Framework:** Google GenKit AI (v1.20.0)
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Email, Google, SSO)
- **AI Models:** Google Generative AI

### **Additional Tools**
- **File Upload:** React Dropzone
- **Date Handling:** date-fns
- **Carousel:** Embla Carousel
- **Utilities:** clsx, tailwind-merge

## 📦 Installation

### Prerequisites
- Node.js 20+ installed
- Firebase project set up
- Google Gemini API key

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gupta-4388/PathFinders-AI-PFA.git
   cd PathFinders-AI-PFA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google Gemini API
   GOOGLE_GENAI_API_KEY=your_gemini_api_key

   # Adzuna Job API (for job trends)
   ADZUNA_APP_ID=your_adzuna_app_id
   ADZUNA_API_KEY=your_adzuna_api_key
   ```

4. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google provider)
   - Create a Firestore database
   - Update Firebase configuration in your `.env.local`

5. **Deploy Firestore rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

## 🎮 Usage

### Development Mode

```bash
# Run Next.js development server (port 9002)
npm run dev

# Run GenKit AI in dev mode
npm run genkit:dev

# Run GenKit AI in watch mode
npm run genkit:watch
```

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Other Commands

```bash
# Run linter
npm run lint

# Type checking
npm run typecheck
```

## 📂 Project Structure

```
PathFinders-AI-PFA/
├── src/
│   ├── ai/                  # GenKit AI flows and configurations
│   │   ├── flows/          # AI flow definitions
│   │   └── dev.ts          # AI development setup
│   ├── app/                # Next.js app directory
│   │   ├── (app)/         # Protected routes
│   │   │   ├── dashboard/ # Dashboard page
│   │   │   ├── resume/    # Resume analyzer
│   │   │   ├── interview/ # Mock interview
│   │   │   ├── mentor/    # AI mentor chat
│   │   │   ├── trends/    # Job market trends
│   │   │   └── settings/  # User settings
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Landing page
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   └── dashboard/    # Dashboard-specific components
│   ├── firebase/         # Firebase configuration and hooks
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions
├── docs/                 # Documentation
├── firestore.rules       # Firestore security rules
├── apphosting.yaml       # Firebase App Hosting config
└── package.json
```

## 🔥 Key Features Explained

### AI Flows
PathFinders AI uses Google GenKit to power various AI capabilities:
- **Resume Analysis Flow:** Extracts skills, experience, and provides feedback
- **Career Path Recommendation Flow:** Suggests career paths based on skills
- **Mock Interview Flow:** Generates dynamic interview questions with real-time feedback
- **AI Mentor Flow:** Provides personalized career guidance
- **Job Trends Flow:** Fetches and analyzes job market data
- **Text-to-Speech Flow:** Converts text to speech for interview questions
- **Role Compatibility Validation:** Ensures resume matches the desired job role

### Authentication
- Email/Password authentication
- Google OAuth
- Password reset functionality
- Protected routes with automatic redirection

### Data Storage
- User profiles stored in Firestore
- Resume data stored as data URIs
- Career recommendations cached in localStorage
- Real-time synchronization between auth and Firestore

## 🔒 Security

- Firestore security rules implemented
- Client-side validation with Zod schemas
- Protected API routes
- Secure authentication flow
- File upload restrictions (size, type validation)

## 🌐 Deployment

This project is configured for deployment on **Firebase App Hosting**.

```bash
# Deploy to Firebase
firebase deploy
```

For other platforms (Vercel, Netlify), ensure environment variables are properly configured.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Gupta-4388** - [GitHub Profile](https://github.com/Gupta-4388)

## 🙏 Acknowledgments

- Google GenKit AI for the powerful AI framework
- Firebase for backend infrastructure
- Radix UI for accessible component primitives
- The Next.js team for an amazing framework
- All contributors and testers

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

<div align="center">

**Made with ❤️ by PathFinders AI Team**

⭐ Star this repo if you find it helpful!

</div>

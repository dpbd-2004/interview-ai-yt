# 🤖 AI Interview Prep & Resume Builder

A full-stack AI-powered web application designed to help job seekers ace their interviews. By analyzing a candidate's uploaded resume alongside a target job description, the application uses Google's Gemini AI to generate a highly tailored interview preparation roadmap and an optimized, ATS-friendly PDF resume.

## ✨ Features

- **🔐 User Authentication:** Secure sign-up and login system using JWT.
- **📄 Resume Parsing:** Upload existing PDF resumes to extract text and context automatically.
- **🎯 AI Match Analysis:** Generates a compatibility "Match Score" between the candidate's profile and the target job description.
- **🧠 Custom Interview Questions:** Uses Generative AI to create specific Technical and Behavioral questions (along with intended goals and model answers) based *exactly* on the user's past projects and experience.
- **📉 Skill Gap Identification:** Highlights missing skills required by the job description and categorizes them by severity.
- **📅 Preparation Roadmap:** Generates a custom, day-by-day study plan to bridge skill gaps before the interview.
- **🖨️ ATS Resume Generation:** Instructs AI to write a highly optimized HTML resume tailored to the specific job, which is then dynamically converted to a downloadable PDF using Puppeteer.
- **📂 Report History:** Saves all generated interview reports to a user dashboard for future reference.

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- React Router (for navigation)
- Context API (for state management)
- SCSS (for styling)
- Axios (for API requests)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (Database & ORM)
- `@google/genai` (Google Gemini API integration)
- `zod` & `zod-to-json-schema` (Strict AI JSON output validation)
- `puppeteer` (Headless browser for HTML-to-PDF generation)
- `pdf-parse` (For extracting text from uploaded PDFs)
- `multer` (For handling multipart/form-data file uploads)
- `jsonwebtoken` & `bcrypt` (For secure authentication)

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URL)
- A [Google Gemini API Key](https://aistudio.google.com/)

## 🚀 Installation & Setup

**1. Clone and Install Dependencies** Copy and run this entire block in your terminal to clone the repo and install all required packages for both the backend and frontend:

```bash
# Clone the repository
git clone [https://github.com/your-username/interview-ai-yt.git](https://github.com/your-username/interview-ai-yt.git)
cd interview-ai-yt

# Setup the Backend
cd Backend
npm install

# Setup the Frontend
cd ../Frontend
npm install
```

**2. Configure Environment Variables** Create a `.env` file in the root of the `Backend` directory and add the following:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
JWT_SECRET=your_super_secret_jwt_key
```

**3. Start the Servers** You will need two terminal windows to run the frontend and backend simultaneously.

Terminal 1 (Backend):
```bash
cd Backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd Frontend
npm run dev
```

**4. Access the App** Open your browser and navigate to `http://localhost:5173` (or the port Vite provides).

## 💡 How it Works (Under the Hood)
1. **Data Ingestion:** The frontend sends the PDF buffer (via Multer), the Job Description, and a Self Description to the Express backend.
2. **Text Extraction:** `pdf-parse` extracts the raw text from the candidate's PDF.
3. **Structured AI Generation:** The backend constructs a highly specific prompt utilizing a Zod JSON Schema. The AI evaluates the data and guarantees a perfectly structured JSON response containing the interview plan.
4. **Data Persistence:** The validated JSON is mapped and saved securely to MongoDB using Mongoose.
5. **PDF Rendering:** When a user requests an optimized resume, Gemini generates raw HTML/CSS styling. Puppeteer launches a headless Chromium instance, renders the HTML into an A4 format, and pipes the PDF buffer directly back to the client for download.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).

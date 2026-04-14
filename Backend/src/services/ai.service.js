const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  // By providing a perfect template with instructions inside the values,
  // the AI knows exactly what to do without needing the strict schema enforcer.
  const prompt = `You are an expert technical interviewer. Generate a JSON interview report for a candidate.

        Candidate Resume:
        ${resume}

        Candidate Self Description:
        ${selfDescription}

        Target Job Description:
        ${jobDescription}

        CRITICAL INSTRUCTIONS:
        You MUST return ONLY a valid JSON object. Do NOT wrap the JSON in Markdown.
        The JSON MUST perfectly match this exact structure and contain high-quality, specific content derived from the candidate's resume:

        {
            "matchScore": 85,
            "title": "Target Job Title",
            "technicalQuestions": [
                {
                    "question": "Ask a specific technical question based on their resume projects.",
                    "intention": "Explain what technical skill this tests.",
                    "answer": "Provide the ideal technical answer."
                }
            ],
            "behavioralQuestions": [
                {
                    "question": "Ask a behavioral question based on their experience.",
                    "intention": "Explain what soft skill this tests.",
                    "answer": "Provide the ideal STAR method answer."
                }
            ],
            "skillGaps": [
                {
                    "skill": "Name a missing skill required by the job description.",
                    "severity": "high"
                }
            ],
            "preparationPlan": [
                {
                    "day": 1,
                    "focus": "Topic to study",
                    "tasks": ["Task 1", "Task 2"]
                }
            ]
        }

        Generate exactly 5 technicalQuestions, 3 behavioralQuestions, 3 skillGaps, and a 5-day preparationPlan.
        Ensure all arrays contain objects with the exact keys shown above. Do not use generic text.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      // We REMOVED responseSchema here to prevent the character-array bug!
    },
  });

  // Clean any accidental markdown and parse
  const cleanJsonText = response.text
    .replace(/```json\n|\n```|```/g, "")
    .trim();
  let parsedData = JSON.parse(cleanJsonText);

  // Gentle fallback just to ensure Mongoose never crashes, without overwriting AI text
  parsedData.matchScore = parseInt(parsedData.matchScore) || 75;
  parsedData.title =
    typeof parsedData.title === "string"
      ? parsedData.title
      : "Interview Report";
  parsedData.technicalQuestions = Array.isArray(parsedData.technicalQuestions)
    ? parsedData.technicalQuestions
    : [];
  parsedData.behavioralQuestions = Array.isArray(parsedData.behavioralQuestions)
    ? parsedData.behavioralQuestions
    : [];
  parsedData.skillGaps = Array.isArray(parsedData.skillGaps)
    ? parsedData.skillGaps
    : [];
  parsedData.preparationPlan = Array.isArray(parsedData.preparationPlan)
    ? parsedData.preparationPlan
    : [];

  return parsedData;
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();
  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
      ),
  });

  const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumePdfSchema),
    },
  });

  const cleanJsonText = response.text
    .replace(/```json\n|\n```|```/g, "")
    .trim();
  const jsonContent = JSON.parse(cleanJsonText);

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };

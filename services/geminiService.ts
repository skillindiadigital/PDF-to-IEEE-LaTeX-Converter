import { GoogleGenAI } from "@google/genai";
import { fileToGenerativePart } from "../utils/fileUtils";
import { PaperMetadata } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Step 1: Analyze the PDF to find all papers contained within it.
 */
export const analyzePdfPapers = async (file: File): Promise<PaperMetadata[]> => {
  try {
    const base64Data = await fileToGenerativePart(file);

    const prompt = `
      This PDF contains one or more research papers. 
      Your task is to identify each distinct research paper in the file.
      
      Return a STRICT valid JSON array of objects. 
      Each object must contain:
      - "index": The 1-based sequential number of the paper as it appears in the file.
      - "title": The extracted title of the paper.

      If there is only one paper, return an array with one object.

      Example JSON Output:
      [
        {"index": 1, "title": "Deep Learning for Image Recognition"},
        {"index": 2, "title": "A Survey of Natural Language Processing"}
      ]

      Return ONLY raw JSON. Do not use Markdown formatting (no \`\`\`json blocks).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json'
      },
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: file.type, data: base64Data } }
        ]
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI for structure analysis.");
    }

    // Parse JSON
    let cleanText = text.trim();
    // Remove markdown code blocks if present despite instructions
    if (cleanText.startsWith("```")) {
       cleanText = cleanText.replace(/```json/g, "").replace(/```/g, "");
    }
    
    const papers: PaperMetadata[] = JSON.parse(cleanText);
    
    if (!Array.isArray(papers) || papers.length === 0) {
      throw new Error("Could not identify papers in the PDF.");
    }

    return papers;

  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw new Error("Failed to analyze PDF structure. " + error.message);
  }
};

/**
 * Step 2: Extract abstract for a specific paper.
 */
export const extractPaperAbstract = async (file: File, metadata: PaperMetadata): Promise<string> => {
  try {
    const base64Data = await fileToGenerativePart(file);

    const prompt = `
      You are an expert LaTeX formatter.
      
      CONTEXT:
      The attached file is a PDF that may contain multiple papers.
      Locate the paper number ${metadata.index} titled roughly "${metadata.title}".
      
      Your task is to convert this SPECIFIC research paper text into the following exact LaTeX block structure using my custom macro:

      \\paperentrynum{TITLE}{AUTHORS}{AFFILIATIONS}{ABSTRACT}{KEYWORDS}

      ⚠️ OUTPUT RULES (follow strictly):

      1. Do NOT summarize. Use the text EXACTLY as provided.
      2. Identify the paper’s:
         - Title
         - Authors (comma-separated)
         - Affiliations (semicolon-separated, matching each author)
         - Abstract
         - Keywords
      3. Put them inside:

      \\paperentrynum
        {TITLE}
        {Author 1, Author 2, ...}
        {Affiliation 1; Affiliation 2; ...}
        {Full abstract text without modification}
        {Keywords separated by semicolons}

      4. Do NOT add extra text, comments, explanations, or formatting.
      5. Use LaTeX-safe characters:
         - Replace “ ” with \`\` ''
         - Replace – with --
         - Escape & as \\&
         - Escape % as \\%
         - Escape $ as \\$
      6. Ensure no content spills outside the braces { }.
      7. Final output must ONLY contain the \\paperentrynum block, nothing else.
      8. If the specific paper is not found or unreadable, return ONLY: "ERROR: Unable to read PDF content."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: file.type, data: base64Data } }
        ]
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No output generated.");
    }

    let cleanText = text.trim();
    if (cleanText.startsWith("```latex")) {
      cleanText = cleanText.replace(/^```latex\n/, "").replace(/\n```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    return cleanText;
  } catch (error: any) {
    console.error(`Extraction Error (Paper ${metadata.index}):`, error);
    throw new Error(error.message || "Failed to extract abstract.");
  }
};
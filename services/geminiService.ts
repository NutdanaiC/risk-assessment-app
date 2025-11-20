import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AssessmentResult, RiskCategory, Severity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const analyzeImages = async (files: File[]): Promise<AssessmentResult> => {
  const imageParts = await Promise.all(files.map(fileToGenerativePart));

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      overallRiskLevel: {
        type: Type.STRING,
        enum: [Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL],
        description: "The overall calculated risk level of the scene."
      },
      overallScore: {
        type: Type.INTEGER,
        description: "A calculated risk score from 0 (safe) to 100 (extremely hazardous)."
      },
      summary: {
        type: Type.STRING,
        description: "A concise executive summary of the findings."
      },
      recommendedActions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of high-level recommended actions to mitigate risks."
      },
      findings: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            index: { type: Type.INTEGER, description: "Sequential numeric ID (1, 2, 3...)." },
            label: { type: Type.STRING, description: "Specific actionable label (e.g. 'Missing Eye Protection')." },
            category: { 
              type: Type.STRING,
              enum: [
                RiskCategory.WORKPLACE,
                RiskCategory.STRUCTURAL,
                RiskCategory.ELECTRICAL,
                RiskCategory.FIRE,
                RiskCategory.CHEMICAL,
                RiskCategory.ENVIRONMENTAL,
                RiskCategory.ERGONOMIC,
                RiskCategory.TRIP_FALL,
                RiskCategory.OTHER
              ]
            },
            severity: {
              type: Type.STRING,
              enum: [Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL]
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence score 0.0 to 1.0"
            },
            description: { type: Type.STRING, description: "Detailed explanation of the violation." },
            mitigation: { type: Type.STRING, description: "Corrective action required." },
            box_2d: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: "Tightly fitted bounding box [ymin, xmin, ymax, xmax] on a 1000x1000 scale."
            },
            mask: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER }
                }
              },
              description: "Detailed list of {x, y} coordinates (0-1000 scale) forming a polygon that TIGHTLY follows the contour."
            },
            imageIndex: {
              type: Type.INTEGER,
              description: "Index of the image (0-based) in the uploaded list."
            }
          },
          required: ["index", "label", "category", "severity", "confidence", "description", "mitigation", "box_2d", "mask"]
        }
      }
    },
    required: ["overallRiskLevel", "overallScore", "summary", "findings", "recommendedActions"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", 
    contents: {
      parts: [
        ...imageParts,
        {
          text: `You are a professional Safety Compliance Analyzer. Analyze this image for ALL safety violations and hazards.

          For EACH violation found:
          1. Provide a TIGHT segmentation mask that follows the actual body/object outline (not just rectangles).
          2. Identify the hazard category (vision, ppe, electrical, fire, equipment, hazard).
          3. Assign severity (HIGH, MEDIUM, or LOW).
          4. Estimate confidence (0.0 to 1.0).
          5. Provide clear description and mitigation.

          CRITICAL REQUIREMENTS:
          - The mask polygon must TIGHTLY follow the person/object contour.
          - NO extra background or floor area in the mask.
          - Use HIGH point density for complex shapes.
          - Each finding must have a unique index (1, 2, 3, etc.).
          - Label should be specific and actionable.
          `
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0,
      thinkingConfig: { thinkingBudget: 1024 } 
    }
  });

  if (response.text) {
    try {
      const data = JSON.parse(response.text);
      
      // Map the API response keys to the App's internal types
      // findings -> risks
      // index -> id
      // label -> title
      // box_2d -> boundingBox
      // mask -> polygon
      const mappedRisks = (data.findings || []).map((risk: any) => ({
        ...risk,
        id: String(risk.index),
        title: risk.label,
        category: risk.category,
        confidence: Math.round(risk.confidence * 100), // Convert 0-1 to 0-100
        boundingBox: risk.box_2d,
        polygon: risk.mask
      }));

      return { 
        ...data, 
        risks: mappedRisks,
        timestamp: new Date().toISOString() 
      };
    } catch (e) {
      console.error("Failed to parse JSON response", e);
      throw new Error("Invalid response format from AI model.");
    }
  }

  throw new Error("No response text generated.");
};
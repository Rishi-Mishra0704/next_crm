import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../constants";

export const askAi = async (prompt: string): Promise<string> => {
  const genAI = new GoogleGenerativeAI(
    GEMINI_API_KEY.first + GEMINI_API_KEY.second + GEMINI_API_KEY.third
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent(`make queries based on prompt: ${prompt}`);
    const response = await result.response.text();
    return response;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "AI response failed";
  }
};

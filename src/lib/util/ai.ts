import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../constants";

export const askAi = async (schemaInfo: string, prompt: string): Promise<string> => {
  const genAI = new GoogleGenerativeAI(
    GEMINI_API_KEY.first + GEMINI_API_KEY.second + GEMINI_API_KEY.third
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent(`
      You are a PostgreSQL AI. Generate a valid SQL query based on the given schema and prompt.
      STRICT RULES: 
      - Use ONLY tables and columns from the schema provided.
      - Return ONLY the SQL query. NO explanations, NO additional text.
      - Ensure correct SQL syntax.
      - use upper and lower functions to convert case.
      - workaround for words that are keywords and table names: wrap them in double quotes.
      Database Schema:
      ${schemaInfo}

      User Prompt:
      ${prompt}
    `);

    let response = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    console.log("Raw AI Response:", response);

    if (!response) {
      return "AI did not generate a valid SQL query";
    }

    response = response.replace(/^```sql/, "").replace(/```$/, "").trim();

    if (!/^SELECT|^INSERT|^UPDATE|^DELETE/i.test(response)) {
      return "AI did not generate a valid SQL query";
    }

    return response;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "";
  }
};




/**
 * llmService.js
 * Service d'abstraction pour l'interaction avec OpenAI et Google Gemini.
 */
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

class LLMService {
  constructor(provider = "gemini") {
    this.provider = provider;
    this.initializeClients();
  }

  initializeClients() {
    // Initialisation Gemini
    if (process.env.GEMINI_API_KEY) {
      this.geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    // Initialisation OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  /**
   * Génère une réponse via le fournisseur spécifié
   */
  async generateResponse(prompt, provider = this.provider) {
    try {
      if (provider === "gemini") {
        return await this.callGemini(prompt);
      } else if (provider === "openai") {
        return await this.callOpenAI(prompt);
      }
      return `Fournisseur ${provider} non supporté.`;
    } catch (error) {
      console.error(`Erreur LLM (${provider}):`, error.message);
      return `Erreur lors de la génération: ${error.message}`;
    }
  }

  async callGemini(prompt) {
    if (!this.geminiClient) return "Clé GEMINI_API_KEY manquante.";
    const model = this.geminiClient.getGenerativeModel({
      model: "gemini-1.5-pro",
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async callOpenAI(prompt) {
    if (!this.openaiClient) return "Clé OPENAI_API_KEY manquante.";
    const completion = await this.openaiClient.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    return completion.choices[0].message.content;
  }
}

export default LLMService;

/**
 * agents/geminiAgent.js
 * Agent Gemini spécialisé en intégration multi-IA et Architecture Master.
 */
import BaseAgent from "./baseAgent.js";

class GeminiAgent extends BaseAgent {
  constructor(memory, llmService) {
    super("Gemini Master Agent", memory, llmService);
    this.specialty =
      "Raisonnement avancé, Intégration multi-IA, Optimisation de prompts, Analyse de code complexe";
  }

  async execute(prompt) {
    console.log(`[${this.name}] Analyse stratégique en cours...`);

    // Je me sers de mon propre service pour répondre
    const llmPrompt = `En tant qu'Agent Maître Gemini, expert en ${this.specialty}, traite la demande suivante : ${prompt}. 
    Si la tâche nécessite d'autres agents, suggère une stratégie d'orchestration.`;

    const response = await this.llmService.generateResponse(
      llmPrompt,
      "gemini",
    );

    const result = `[Gemini Strategy] ${response}`;
    this.memory.addEntry(this.name, prompt, result);

    return result;
  }

  /**
   * Compétence unique : Analyse de l'état global du projet
   */
  async analyzeProjectHealth() {
    const history = this.memory.getAllHistory();
    const prompt = `Analyse l'historique suivant du projet scolaire et identifie les risques ou incohérences entre le frontend et le backend : ${JSON.stringify(history)}`;
    return await this.execute(prompt);
  }
}

export default GeminiAgent;

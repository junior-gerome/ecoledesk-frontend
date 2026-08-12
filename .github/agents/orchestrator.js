import Memory from "./memory.js";
import LLMService from "./llmService.js";
import FrontendAgent from "./agents/frontendAgent.js";
import BackendAgent from "./agents/backendAgent.js";
import LeadAgent from "./agents/leadAgent.js";
import TestAgent from "./agents/testAgent.js";
import DeploymentAgent from "./agents/deploymentAgent.js";
import GeminiAgent from "./agents/geminiAgent.js"; // Nouvel agent

class Orchestrator {
  constructor() {
    this.memory = new Memory();
    this.llmService = new LLMService("gemini"); // Par défaut sur Gemini

    this.agents = {
      frontend: new FrontendAgent(this.memory, this.llmService),
      backend: new BackendAgent(this.memory, this.llmService),
      lead: new LeadAgent(this.memory, this.llmService),
      test: new TestAgent(this.memory, this.llmService),
      deployment: new DeploymentAgent(this.memory, this.llmService),
      gemini: new GeminiAgent(this.memory, this.llmService), // Intégration
    };
  }

  async handleComplexTask(task) {
    console.log(`\n--- Démarrage de la super-tâche : ${task} ---`);

    // 1. Gemini définit la stratégie
    const strategy = await this.agents.gemini.execute(
      `Définis une roadmap pour : ${task}`,
    );

    // 2. Routage vers les agents spécialisés selon la stratégie
    if (task.includes("frontend")) {
      await this.agents.frontend.execute(task);
    }

    // 3. Revue finale par Gemini
    const review = await this.agents.gemini.analyzeProjectHealth();
    console.log("\n[Analyse Finale Gemini] :", review);
  }
}

// Exemple d'utilisation
const orchestrator = new Orchestrator();
orchestrator.handleComplexTask(
  "Refondre le système de gestion des bulletins scolaires avec une API sécurisée et une UI moderne.",
);

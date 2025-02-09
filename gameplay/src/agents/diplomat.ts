import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import type { Nation } from '../types';
import { getGame, updateGameStatus } from '../helpers';

// Define the structure for alliance decisions
interface AllianceDecision {
  aiNationName: string;
  chosenAlly: string;
  reasoning: string;
  compatibilityScore: number;
}

const llm = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

const verdict = z.object({
  chosenAlly: z.string().describe("The name of the human nation chosen as ally"),
  reasoning: z.string().describe("The numerical analysis and reasoning behind the alliance choice"),
  compatibilityScore: z.number().describe("A score from 0-100 indicating how compatible the nations are")
});

const structuredLlm = llm.withStructuredOutput(verdict, { name: "verdict" });

const allianceTemplate = PromptTemplate.fromTemplate(`
    You are the leader of {nation_name}, analyzing potential alliances based on national compatibility.
    
    Your nation's current metrics:
    Ideology: {nation_ideology}
    Economic Freedom: {economic_freedom}/100
    Civil Rights: {civil_rights}/100
    Political Freedom: {political_freedom}/100
    
    Potential human-led allies:
    {human_nations}
    
    Based on comparison of freedom metrics (Economic, Civil Rights, Political) and ideology alignment,
    which human nation would be the most compatible ally?
    
    Calculate compatibility based on:
    1. Economic Freedom alignment (similar levels)
    2. Civil Rights alignment
    3. Political Freedom alignment
    4. Overall ideology compatibility
    
    Provide your choice and reasoning based on metric comparison.
`);

function formatDecisions(nation: Nation): string {
    return nation.decisions
      .map(d => `- ${d.issueName}: ${d.chosenOptionName}`)
      .join('\n');
}

function formatHumanNations(player1: Nation, player2: Nation): string {
  const formatNationStats = (nation: Nation) => {
    const totalFreedom = nation.stats.economicFreedom + 
                        nation.stats.civilRights + 
                        nation.stats.politicalFreedom;
    
    return `
${nation.name} (${nation.ideology.name})
----------------------------------------
Economic Freedom: ${nation.stats.economicFreedom}/100
Civil Rights: ${nation.stats.civilRights}/100
Political Freedom: ${nation.stats.politicalFreedom}/100
Total Freedom Score: ${totalFreedom}/300

Recent Policy Decisions and Their Impacts:
${formatDecisions(nation)}
`;
  };

  return `
=== Potential Ally 1 ===
${formatNationStats(player1)}

=== Potential Ally 2 ===
${formatNationStats(player2)}

Compare these metrics with your nation's values to determine the best match.
Calculate absolute differences in each metric to assess compatibility.
`;
}

async function getAllianceDecision(
  aiNation: Nation,
  player1Nation: Nation,
  player2Nation: Nation
): Promise<AllianceDecision> {
  const totalFreedom = aiNation.stats.economicFreedom + 
                      aiNation.stats.civilRights + 
                      aiNation.stats.politicalFreedom;

  const prompt = await allianceTemplate.format({
    nation_name: aiNation.name,
    nation_ideology: aiNation.ideology.name,
    human_nations: formatHumanNations(player1Nation, player2Nation),
    economic_freedom: aiNation.stats.economicFreedom,
    civil_rights: aiNation.stats.civilRights,
    political_freedom: aiNation.stats.politicalFreedom,
    total_freedom: totalFreedom
  });

  const response = await structuredLlm.invoke(prompt);

  return {
    aiNationName: aiNation.name,
    chosenAlly: response.chosenAlly,
    reasoning: response.reasoning,
    compatibilityScore: response.compatibilityScore
  };
}

export async function processAlliances(gameId: string): Promise<AllianceDecision[]> {
  const game = getGame(gameId);
  if (!game || !game.player1Nation || !game.player2Nation) {
    throw new Error("Invalid game state for alliance processing");
  }

  const alliances: AllianceDecision[] = [];

  // Process each AI nation's alliance decision
  for (const aiNation of game.aiNations) {
    try {
      console.log(`\nAnalyzing alliance compatibility for ${aiNation.name}...`);
      const alliance = await getAllianceDecision(
        aiNation,
        game.player1Nation,
        game.player2Nation
      );
      alliances.push(alliance);
      console.log(`${aiNation.name} has chosen to ally with ${alliance.chosenAlly}`);
      console.log(`Compatibility Score: ${alliance.compatibilityScore}%`);
      console.log(`Analysis: ${alliance.reasoning}\n`);
    } catch (error) {
      console.error(`Error processing alliance for ${aiNation.name}:`, error);
    }
  }

  // Store alliances in game state and update status
  const currentGame = getGame(gameId);
  if (currentGame) {
    currentGame.alliances = alliances;
    updateGameStatus(gameId, 'completed_alliace_processing');
  }

  return alliances;
}
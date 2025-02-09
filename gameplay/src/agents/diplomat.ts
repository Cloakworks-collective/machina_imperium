// import { OpenAI } from 'langchain/llms/openai';
// import { PromptTemplate } from 'langchain/prompts';
// import type { Nation, Personality } from './types';
// import { euclideanDistance } from './helpers';

// const llm = new OpenAI({
//   temperature: 0.7,
//   modelName: 'gpt-4',
// });

// // Create prompt template for diplomatic decisions
// const diplomaticTemplate = PromptTemplate.fromTemplate(`
// You are the chief diplomat for {ai_nation_name}, led by {personality_name}. 
// Your leader's key traits are:
// {personality_traits}

// You must choose between two potential allies:

// Nation 1: {player1_name}
// Ideology: {player1_ideology}
// Economic Freedom: {player1_economic}
// Civil Rights: {player1_civil}
// Political Freedom: {player1_political}

// Nation 2: {player2_name}
// Ideology: {player2_ideology}
// Economic Freedom: {player2_economic}
// Civil Rights: {player2_civil}
// Political Freedom: {player2_political}

// The ideological distance calculations show:
// Distance to Nation 1: {distance1}
// Distance to Nation 2: {distance2}

// Based on your leader's personality and these nations' characteristics, which would you choose as an ally?
// Consider both ideological alignment and your leader's personality traits.
// Respond with either "1" or "2" followed by your diplomatic reasoning.
// `);

// function formatPersonalityTraits(personality: Personality): string {
//   return Object.entries(personality.attributes)
//     .map(([trait, value]) => `${trait}: ${value}/10`)
//     .join('\n');
// }

// function calculateIdeologicalDistance(nation1: Nation, nation2: Nation): number {
//   const point1 = {
//     x: nation1.stats.economicFreedom,
//     y: nation1.stats.civilRights,
//     z: nation1.stats.politicalFreedom
//   };
  
//   const point2 = {
//     x: nation2.stats.economicFreedom,
//     y: nation2.stats.civilRights,
//     z: nation2.stats.politicalFreedom
//   };

//   return euclideanDistance(point1, point2);
// }

// async function makeAllianceDecision(
//   aiNation: Nation,
//   player1Nation: Nation,
//   player2Nation: Nation
// ): Promise<{ chosenNation: Nation; reasoning: string }> {
//   if (!aiNation.personality) {
//     throw new Error('AI nation must have a personality');
//   }

//   const distance1 = calculateIdeologicalDistance(aiNation, player1Nation);
//   const distance2 = calculateIdeologicalDistance(aiNation, player2Nation);

//   const prompt = await diplomaticTemplate.format({
//     ai_nation_name: aiNation.name,
//     personality_name: aiNation.personality.name,
//     personality_traits: formatPersonalityTraits(aiNation.personality),
//     player1_name: player1Nation.name,
//     player1_ideology: player1Nation.ideology.name,
//     player1_economic: player1Nation.stats.economicFreedom,
//     player1_civil: player1Nation.stats.civilRights,
//     player1_political: player1Nation.stats.politicalFreedom,
//     player2_name: player2Nation.name,
//     player2_ideology: player2Nation.ideology.name,
//     player2_economic: player2Nation.stats.economicFreedom,
//     player2_civil: player2Nation.stats.civilRights,
//     player2_political: player2Nation.stats.politicalFreedom,
//     distance1: distance1.toFixed(2),
//     distance2: distance2.toFixed(2)
//   });

//   const response = await llm.predict(prompt);
//   const choice = response.trim().startsWith('1') ? player1Nation : player2Nation;
  
//   return {
//     chosenNation: choice,
//     reasoning: response.replace(/^[12]/, '').trim()
//   };
// }

// export async function calculateAlliances(gameId: string): Promise<void> {
//   const game = getGame(gameId);
//   if (!game || !game.player1Nation || !game.player2Nation) {
//     throw new Error('Invalid game state for alliance calculation');
//   }

//   console.log('\n=== FORMING INTERNATIONAL ALLIANCES ===\n');

//   const alliances = {
//     [game.player1Nation.name]: [] as string[],
//     [game.player2Nation.name]: [] as string[]
//   };

//   for (const aiNation of game.aiNations) {
//     const decision = await makeAllianceDecision(
//       aiNation,
//       game.player1Nation,
//       game.player2Nation
//     );

//     const allianceName = decision.chosenNation.name;
//     alliances[allianceName].push(aiNation.name);

//     console.log(`\n🤝 ${aiNation.name}'s Diplomatic Decision:`);
//     console.log(`Alliance formed with: ${allianceName}`);
//     console.log(`Diplomatic Reasoning: ${decision.reasoning}`);
//   }

//   console.log('\n=== FINAL ALLIANCE BREAKDOWN ===');
//   console.log(`\n${game.player1Nation.name}'s Alliance:`);
//   console.log(alliances[game.player1Nation.name].length > 0 
//     ? alliances[game.player1Nation.name].join(', ')
//     : 'No allies');

//   console.log(`\n${game.player2Nation.name}'s Alliance:`);
//   console.log(alliances[game.player2Nation.name].length > 0 
//     ? alliances[game.player2Nation.name].join(', ')
//     : 'No allies');
// }
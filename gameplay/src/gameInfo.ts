// gameInfo.ts
import { getStoredGame } from './gameStorage';

export function displayGameInfo(gameId: string) {
  const game = getStoredGame(gameId);
  if (!game) return;

  console.log("\n=== Game Status Update ===");
  
  if (game.player1Nation) {
    console.log("\nPlayer 1:", game.player1Nation.name);
    console.log("Ideology:", game.player1Nation.ideology.name);
    console.log("Economic Freedom:", game.player1Nation.stats.economicFreedom);
    console.log("Civil Rights:", game.player1Nation.stats.civilRights);
    console.log("Political Freedom:", game.player1Nation.stats.politicalFreedom);
    console.log("GDP:", game.player1Nation.stats.gdp);
  }

  if (game.player2Nation) {
    console.log("\nPlayer 2:", game.player2Nation.name);
    console.log("Ideology:", game.player2Nation.ideology.name);
    console.log("Economic Freedom:", game.player2Nation.stats.economicFreedom);
    console.log("Civil Rights:", game.player2Nation.stats.civilRights);
    console.log("Political Freedom:", game.player2Nation.stats.politicalFreedom);
    console.log("GDP:", game.player2Nation.stats.gdp);
  }

  if (game.aiNations.length > 0) {
    console.log("\nAI Nations:");
    game.aiNations.forEach(nation => {
      console.log(`\n${nation.name}`);
      console.log("Leader:", nation.personality?.name);
      console.log("Ideology:", nation.ideology.name);
      console.log("Economic Freedom:", nation.stats.economicFreedom);
      console.log("Civil Rights:", nation.stats.civilRights);
      console.log("Political Freedom:", nation.stats.politicalFreedom);
      console.log("GDP:", nation.stats.gdp);
    });
  }
}

export function compareNations(gameId: string) {
  const game = getStoredGame(gameId);
  if (!game) return;

  const allNations = [
    ...(game.player1Nation ? [game.player1Nation] : []),
    ...(game.player2Nation ? [game.player2Nation] : []),
    ...game.aiNations
  ];

  console.log("\n=== Nation Rankings ===");
  
  // GDP Ranking
  console.log("\nGDP Ranking:");
  [...allNations]
    .sort((a, b) => b.stats.gdp - a.stats.gdp)
    .forEach((nation, i) => {
      console.log(`${i + 1}. ${nation.name}: ${nation.stats.gdp}`);
    });

  // Freedom Rankings
  console.log("\nFreedom Index Ranking:");
  [...allNations]
    .sort((a, b) => {
      const totalA = a.stats.economicFreedom + a.stats.civilRights + a.stats.politicalFreedom;
      const totalB = b.stats.economicFreedom + b.stats.civilRights + b.stats.politicalFreedom;
      return totalB - totalA;
    })
    .forEach((nation, i) => {
      const total = nation.stats.economicFreedom + nation.stats.civilRights + nation.stats.politicalFreedom;
      console.log(`${i + 1}. ${nation.name}: ${total}`);
    });
}
// play.ts
import PromptSync = require("prompt-sync");
import { issuesData } from "./db/issues";
import { updateNationStats } from "./birth";
import type { Nation, Ideology, Personality } from './types';
import { euclideanDistance } from './helper';
import {ideologies} from './db/ideologies';
import { createGame, createNation, selectPersonalities, getGame, isGameReady } from './gameService';
import { storeGame } from './gameStorage';
import { displayGameInfo, compareNations } from './gameInfo';

const prompt = PromptSync({ sigint: true });

function replacePlaceholders(text: string, nationName: string): string {
  return text.replace(/\${nationName}/g, nationName);
}

function promptForIssue(issue: any, nationName: string): any | null {
  console.log(`\n=== ${issue.name} ===`);
  console.log(replacePlaceholders(issue.description, nationName));

  issue.options.forEach((option: any) => {
    console.log(`\nOption ${option.id}: ${option.name}`);
    console.log(`Description: ${replacePlaceholders(option.description, nationName)}`);
  });

  const input = prompt(`\nChoose an option (1 - ${issue.options.length}): `);
  const choice = parseInt(input, 10);

  if (isNaN(choice) || choice < 1 || choice > issue.options.length) {
    console.log("Invalid choice. Skipping this issue.");
    return null;
  }

  return issue.options.find((o: any) => o.id === choice) || null;
}

function chooseIdeologyForPersonality(personality: Personality): Ideology {
  const authScore = personality.attributes.authoritarianism;
  const progScore = personality.attributes.progressiveness;
  
  let bestMatch = ideologies[0];
  let smallestDiff = Number.MAX_VALUE;

  for (const ideology of ideologies) {
    const diff = Math.abs(ideology.politicalFreedom - (100 - authScore)) +
                Math.abs(ideology.civilRights - progScore);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      bestMatch = ideology;
    }
  }

  return bestMatch;
}

function findNewIdeology(stats: Nation['stats']): Ideology {
  const currentPoint = {
    x: stats.economicFreedom,
    y: stats.civilRights,
    z: stats.politicalFreedom
  };

  let closestIdeology = ideologies[0];
  let minDistance = Number.MAX_VALUE;

  for (const ideology of ideologies) {
    const ideologyPoint = {
      x: ideology.economicFreedom,
      y: ideology.civilRights,
      z: ideology.politicalFreedom
    };

    const distance = euclideanDistance(currentPoint, ideologyPoint);
    if (distance < minDistance) {
      minDistance = distance;
      closestIdeology = ideology;
    }
  }

  return closestIdeology;
}

function calculateChanges(originalNation: Nation, finalNation: Nation) {
  return {
    economicFreedom: finalNation.stats.economicFreedom - originalNation.stats.economicFreedom,
    civilRights: finalNation.stats.civilRights - originalNation.stats.civilRights,
    politicalFreedom: finalNation.stats.politicalFreedom - originalNation.stats.politicalFreedom,
    gdp: finalNation.stats.gdp - originalNation.stats.gdp
  };
}

function getImpactEmoji(value: number): string {
  if (value >= 5) return "🚀";
  if (value >= 2) return "📈";
  if (value >= -1) return "😐";
  if (value >= -4) return "📉";
  return "💥";
}

function getGDPEmoji(value: number): string {
  if (value >= 200) return "🤑";
  if (value >= 50) return "💰";
  if (value >= -49) return "💵";
  if (value >= -200) return "🪙";
  return "📉";
}

function displayNationStatus(nation: Nation) {
  console.log(`\n=== The State of ${nation.name} ===`);
  console.log(`Current Ideology: ${nation.ideology.name}`);
  console.log(`Ruler Type: ${nation.rulerType}`);
  if (nation.personality) {
    console.log(`Leader: ${nation.personality.name}`);
  }
  console.log(`Economic Freedom:    ${nation.stats.economicFreedom} ${getImpactEmoji(nation.stats.economicFreedom)}`);
  console.log(`Civil Rights:        ${nation.stats.civilRights} ${getImpactEmoji(nation.stats.civilRights)}`);
  console.log(`Political Freedom:   ${nation.stats.politicalFreedom} ${getImpactEmoji(nation.stats.politicalFreedom)}`);
  console.log(`GDP:                 ${nation.stats.gdp} ${getGDPEmoji(nation.stats.gdp)}`);
}

export async function setupGame(): Promise<string> {
  console.log("Welcome to Nation Builder 2025 - Multiplayer!\n");

  const personalities = selectPersonalities(3);
  console.log("\nSelected AI Leaders:");
  personalities.forEach((p, i) => {
    console.log(`\n${i + 1}. ${p.name} - ${p.description}`);
    console.log("Attributes:");
    Object.entries(p.attributes).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  });

  const gameId = createGame(personalities);
  console.log(`\nGame created! Your game ID is: ${gameId}`);
  return gameId;
}

async function promptForNationName(): Promise<string> {
  console.log("What would you like to name your nation?");
  const name = prompt("> ").trim();
  if (!name) {
    throw new Error("Nation name cannot be empty");
  }
  return name;
}

async function promptForIdeology(): Promise<Ideology> {
  console.log("\nChoose your ideology (enter number 1-27):");
  ideologies.forEach(i => {
    console.log(`${i.uid}. ${i.name}`);
  });

  while (true) {
    const choice = parseInt(prompt("> "));
    const ideology = ideologies.find(i => i.uid === choice);
    if (ideology) return ideology;
    console.log("Invalid choice. Please try again.");
  }
}

export async function createPlayerNation(gameId: string, isPlayer1: boolean = true): Promise<Nation | null> {
  const game = getGame(gameId);
  if (!game) {
    console.error("Game not found!");
    return null;
  }

  const nationName = await promptForNationName();
  const ideology = await promptForIdeology();
  
  return createNation(gameId, nationName, ideology, 'human');
}

export async function createAINations(gameId: string): Promise<void> {
  const game = getGame(gameId);
  if (!game) return;

  for (const personality of game.selectedPersonalities) {
    const ideology = chooseIdeologyForPersonality(personality);
    const nationName = `${personality.name}'s Domain`;
    createNation(gameId, nationName, ideology, 'AI', personality);
  }
}

export function generateRandomNationName(): string {
  const sillyPrefixes = ["United Republic of", "Democratic People's", "Glorious Empire of", "Most Serene Republic of", "Grand Duchy of"];
  const sillySuffixes = ["topia", "land", "stan", "ville", "vania"];
  
  const prefix = sillyPrefixes[Math.floor(Math.random() * sillyPrefixes.length)];
  const suffix = sillySuffixes[Math.floor(Math.random() * sillySuffixes.length)];
  return `${prefix} Banana${suffix}`;
}

export async function playGame(nation: Nation, gameId: string) {
  console.log(`\nWelcome to ${nation.name}!\n`);
  
  // Store initial state
  const originalNation = { ...nation };
  
  let currentNation = nation;
  for (const issue of issuesData.issues) {
    const selectedOption = promptForIssue(issue, nation.name);
    if (selectedOption) {
      currentNation = updateNationStats(currentNation, selectedOption.impact);
      console.log("\nAfter this decision:");
      displayNationStatus(currentNation);
    }
  }

  // Find new ideology based on final stats
  const newIdeology = findNewIdeology(currentNation.stats);
  
  // Calculate aggregate changes
  const changes = calculateChanges(originalNation, currentNation);
  
  console.log("\n=== Aggregate Changes ===");
  console.log(`Previous Government Type: ${originalNation.ideology.name}`);
  console.log(`New Government Type: ${newIdeology.name}`);
  console.log("\nChanges in Freedom Indices:");
  console.log(`Economic Freedom: ${changes.economicFreedom >= 0 ? '+' : ''}${changes.economicFreedom}`);
  console.log(`Civil Rights: ${changes.civilRights >= 0 ? '+' : ''}${changes.civilRights}`);
  console.log(`Political Freedom: ${changes.politicalFreedom >= 0 ? '+' : ''}${changes.politicalFreedom}`);
  console.log(`GDP: ${changes.gdp >= 0 ? '+' : ''}${changes.gdp}`);

  if (originalNation.ideology.name !== newIdeology.name) {
    console.log(`\n🔄 Your nation has evolved from a ${originalNation.ideology.name} to a ${newIdeology.name}!`);
  } else {
    console.log(`\n✨ Your nation remains a ${newIdeology.name}`);
  }

  // Update nation's ideology
  currentNation = {
    ...currentNation,
    ideology: newIdeology
  };

  // Store and display game info
  const game = getGame(gameId);
  if (game) {
    if (game.player1Nation?.name === nation.name) {
      game.player1Nation = currentNation;
    } else if (game.player2Nation?.name === nation.name) {
      game.player2Nation = currentNation;
    }
    
    storeGame(gameId, game);
    displayGameInfo(gameId);
    compareNations(gameId);
  }

  return currentNation;
}
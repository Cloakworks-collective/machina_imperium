// play.ts
import PromptSync = require("prompt-sync");
import { issuesData } from "./db/issues";
import { createNation, updateNationStats, type Nation, type Ideology } from "./birth";
import { euclideanDistance } from './helper';
import { ideologies } from './db/ideologies';

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
  console.log(`Economic Freedom:    ${nation.stats.economicFreedom} ${getImpactEmoji(nation.stats.economicFreedom)}`);
  console.log(`Civil Rights:        ${nation.stats.civilRights} ${getImpactEmoji(nation.stats.civilRights)}`);
  console.log(`Political Freedom:   ${nation.stats.politicalFreedom} ${getImpactEmoji(nation.stats.politicalFreedom)}`);
  console.log(`GDP:                 ${nation.stats.gdp} ${getGDPEmoji(nation.stats.gdp)}`);
}

function classifyNewIdeology(nation: Nation): Ideology {
  const { economicFreedom, civilRights, politicalFreedom } = nation.stats;
  
  const currentPoint = {
    x: economicFreedom,
    y: civilRights,
    z: politicalFreedom
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

export function generateRandomNationName(): string {
  const sillyPrefixes = ["United Republic of", "Democratic People's", "Glorious Empire of", "Most Serene Republic of", "Grand Duchy of"];
  const sillySuffixes = ["topia", "land", "stan", "ville", "vania"];
  
  const prefix = sillyPrefixes[Math.floor(Math.random() * sillyPrefixes.length)];
  const suffix = sillySuffixes[Math.floor(Math.random() * sillySuffixes.length)];
  return `${prefix} Banana${suffix}`;
}

export function playGame(nationName: string, ideology: Ideology) {
  const nation = createNation(nationName, ideology);
  if (!nation) {
    console.error("Failed to create nation");
    return;
  }

  console.log(`\nWelcome to ${nation.name}!\n`);
  displayNationStatus(nation);

  let currentNation = nation;
  for (const issue of issuesData.issues) {
    const selectedOption = promptForIssue(issue, nationName);
    if (selectedOption) {
      currentNation = updateNationStats(currentNation, selectedOption.impact);
      console.log("\nAfter this decision:");
      displayNationStatus(currentNation);
    }
  }

  const newIdeology = classifyNewIdeology(currentNation);
  
  console.log("\n=== Final Results ===");
  console.log(`\nStarting as: ${ideology.name}`);
  console.log(`Your nation has evolved into: ${newIdeology.name}!`);
  if (newIdeology.uid === ideology.uid) {
    console.log("You've maintained your original ideology!");
  } else {
    console.log("Your choices have led to an ideological shift!");
    console.log("\nIdeological Changes:");
    console.log(`Economic Freedom: ${ideology.economicFreedom} → ${newIdeology.economicFreedom}`);
    console.log(`Civil Rights: ${ideology.civilRights} → ${newIdeology.civilRights}`);
    console.log(`Political Freedom: ${ideology.politicalFreedom} → ${newIdeology.politicalFreedom}`);
  }
  
  displayNationStatus(currentNation);
}
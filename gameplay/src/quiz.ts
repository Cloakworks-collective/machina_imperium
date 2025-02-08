// src/quiz.ts

import PromptSync = require("prompt-sync");
// import * as PromptSync from 'prompt-sync';
import { issuesData } from "./db/issues";

interface Impact {
  economicFreedom: number;
  civilRights: number;
  politicalFreedom: number;
  gdp: number;
}

interface Option {
  id: number;
  name: string;
  description: string;
  impact: Impact;
}

interface Issue {
  id: number;
  name: string;
  description: string;
  options: Option[];
}

interface IssuesData {
  issues: Issue[];
}

const prompt = PromptSync({ sigint: true });

const data: IssuesData = issuesData;

function replacePlaceholders(text: string, nationName: string): string {
  return text.replace(/\${nationName}/g, nationName);
}

function promptForIssue(issue: Issue, nationName: string): Option | null {
  console.log(`\n=== ${issue.name} ===`);
  console.log(replacePlaceholders(issue.description, nationName));

  issue.options.forEach((option) => {
    console.log(`\nOption ${option.id}: ${option.name}`);
    console.log(`Description: ${replacePlaceholders(option.description, nationName)}`);
  });

  const input = prompt(`\nChoose an option (1 - ${issue.options.length}): `);
  const choice = parseInt(input, 10);

  if (isNaN(choice) || choice < 1 || choice > issue.options.length) {
    console.log("Invalid choice. Skipping this issue.");
    return null;
  }

  return issue.options.find((o) => o.id === choice) || null;
}

function accumulateImpacts(selectedOptions: Option[]): Impact {
  return selectedOptions.reduce(
    (acc, option) => {
      acc.economicFreedom += option.impact.economicFreedom;
      acc.civilRights += option.impact.civilRights;
      acc.politicalFreedom += option.impact.politicalFreedom;
      acc.gdp += option.impact.gdp;
      return acc;
    },
    {
      economicFreedom: 0,
      civilRights: 0,
      politicalFreedom: 0,
      gdp: 0
    }
  );
}

function runQuiz() {
  console.log("Welcome to the Nation Builder Quiz!\n");
  
  const sillyPrefixes = ["United Republic of", "Democratic People's", "Glorious Empire of", "Most Serene Republic of", "Grand Duchy of"];
  const sillySuffixes = ["topia", "land", "stan", "ville", "vania"];
  
  console.log("Before we begin, what's your nation called?");
  console.log("(Press Enter for a random silly name)");
  let nationName = prompt("> ").trim();
  
  if (!nationName) {
    const prefix = sillyPrefixes[Math.floor(Math.random() * sillyPrefixes.length)];
    const suffix = sillySuffixes[Math.floor(Math.random() * sillySuffixes.length)];
    nationName = `${prefix} Banana${suffix}`;
    console.log(`\nYour randomly generated nation name is: ${nationName}!`);
  }

  console.log(`\nExcellent! Let's shape the destiny of ${nationName}!\n`);

  const chosenOptions: Option[] = [];

  for (const issue of data.issues) {
    const selectedOption = promptForIssue(issue, nationName);
    if (selectedOption) {
      chosenOptions.push(selectedOption);
    }
  }

  const finalImpacts = accumulateImpacts(chosenOptions);

  console.log(`\n=== The State of ${nationName} ===`);
  console.log("Your decisions have led to these impacts:");
  console.log(`- Economic Freedom:    ${finalImpacts.economicFreedom} ${getImpactEmoji(finalImpacts.economicFreedom)}`);
  console.log(`- Civil Rights:        ${finalImpacts.civilRights} ${getImpactEmoji(finalImpacts.civilRights)}`);
  console.log(`- Political Freedom:   ${finalImpacts.politicalFreedom} ${getImpactEmoji(finalImpacts.politicalFreedom)}`);
  console.log(`- GDP Impact:          ${finalImpacts.gdp} ${getGDPEmoji(finalImpacts.gdp)}`);
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

// Run the quiz
runQuiz();
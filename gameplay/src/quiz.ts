// src/quiz.ts

// CommonJS-compatible import to avoid "is not a function" errors
import PromptSync = require("prompt-sync");
import { issuesData } from "./db/issues";

/**
 * We define TypeScript interfaces to match our data structure.
 * (Optional but recommended for type safety.)
 */
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

/**
 * Create the prompt function using prompt-sync.
 * We pass { sigint: true } so that Ctrl+C interrupts the prompt.
 */
const prompt = PromptSync({ sigint: true });

// Grab the data
const data: IssuesData = issuesData;

/**
 * Prompt the user to choose an option for a given issue.
 */
function promptForIssue(issue: Issue): Option | null {
  console.log(`\n=== ${issue.name} ===`);
  console.log(issue.description);

  issue.options.forEach((option) => {
    console.log(`\nOption ${option.id}: ${option.name}`);
    console.log(`Description: ${option.description}`);
  });

  const input = prompt(`\nChoose an option (1 - ${issue.options.length}): `);
  const choice = parseInt(input, 10);

  if (isNaN(choice) || choice < 1 || choice > issue.options.length) {
    console.log("Invalid choice. Skipping this issue.");
    return null;
  }

  // Return the chosen option
  return issue.options.find((o) => o.id === choice) || null;
}

/**
 * Accumulate the total impact from all chosen options.
 */
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

/**
 * Main function to run the quiz
 */
function runQuiz() {
  console.log("Welcome to the Freedonia Policy Quiz!\n");

  const chosenOptions: Option[] = [];

  // Iterate over each issue
  for (const issue of data.issues) {
    const selectedOption = promptForIssue(issue);
    if (selectedOption) {
      chosenOptions.push(selectedOption);
    }
  }

  // Compute final results
  const finalImpacts = accumulateImpacts(chosenOptions);

  // Display summary
  console.log("\n=== Quiz Complete! ===");
  console.log("Your total impacts are:");
  console.log(`- Economic Freedom:    ${finalImpacts.economicFreedom}`);
  console.log(`- Civil Rights:        ${finalImpacts.civilRights}`);
  console.log(`- Political Freedom:   ${finalImpacts.politicalFreedom}`);
  console.log(`- GDP:                 ${finalImpacts.gdp}`);
}

// Run the quiz
runQuiz();
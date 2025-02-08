import PromptSync = require("prompt-sync");
import { playGame, generateRandomNationName } from './play';
import { listIdeologies, getIdeologyByUID, getRandomIdeology } from './birth';

const prompt = PromptSync({ sigint: true });

function startGame() {
  console.log("Welcome to Nation Builder 2025!\n");

  console.log("What would you like to name your nation?");
  console.log("(Press Enter for a random silly name)");
  let nationName = prompt("> ").trim();
  
  if (!nationName) {
    nationName = generateRandomNationName();
    console.log(`\nYour randomly generated nation name is: ${nationName}!`);
  }

  console.log("\nChoose your starting ideology:");
  console.log("1. Show me all ideologies");
  console.log("2. Give me a random ideology");
  console.log("3. I know the ideology number I want");

  const choice = prompt("\nEnter your choice (1-3): ");

  let chosenIdeology = null;

  switch (choice) {
    case "1":
      listIdeologies();
      console.log("\nEnter the number (UID) of your chosen ideology:");
      const ideologyNumber = parseInt(prompt("> "));
      chosenIdeology = getIdeologyByUID(ideologyNumber);
      while (!chosenIdeology) {
        console.log("Invalid ideology number. Please try again:");
        const newNumber = parseInt(prompt("> "));
        chosenIdeology = getIdeologyByUID(newNumber);
      }
      break;

    case "2":
      chosenIdeology = getRandomIdeology();
      console.log(`\nYou got: ${chosenIdeology.name}!`);
      console.log(`Economic Freedom: ${chosenIdeology.economicFreedom}`);
      console.log(`Civil Rights: ${chosenIdeology.civilRights}`);
      console.log(`Political Freedom: ${chosenIdeology.politicalFreedom}`);
      break;

    case "3":
      console.log("\nEnter the ideology number (1-27):");
      const specificNumber = parseInt(prompt("> "));
      chosenIdeology = getIdeologyByUID(specificNumber);
      while (!chosenIdeology) {
        console.log("Invalid ideology number. Please enter a number between 1 and 27:");
        const newNumber = parseInt(prompt("> "));
        chosenIdeology = getIdeologyByUID(newNumber);
      }
      break;

    default:
      console.log("\nInvalid choice. Using random ideology...");
      chosenIdeology = getRandomIdeology();
      console.log(`\nYou got: ${chosenIdeology.name}!`);
  }

  console.log("\nPreparing to create your nation...");
  console.log(`Name: ${nationName}`);
  console.log(`Starting Ideology: ${chosenIdeology.name}`);
  
  const ready = prompt("\nReady to begin? (Press Enter to start or Ctrl+C to quit) ");
  
  playGame(nationName, chosenIdeology);
}

startGame();
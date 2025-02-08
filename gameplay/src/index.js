"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PromptSync = require("prompt-sync");
var play_1 = require("./play");
var birth_1 = require("./birth");
var prompt = PromptSync({ sigint: true });
function startGame() {
    console.log("Welcome to Nation Builder 2025!\n");
    console.log("What would you like to name your nation?");
    console.log("(Press Enter for a random silly name)");
    var nationName = prompt("> ").trim();
    if (!nationName) {
        nationName = (0, play_1.generateRandomNationName)();
        console.log("\nYour randomly generated nation name is: ".concat(nationName, "!"));
    }
    console.log("\nChoose your starting ideology:");
    console.log("1. Show me all ideologies");
    console.log("2. Give me a random ideology");
    console.log("3. I know the ideology number I want");
    var choice = prompt("\nEnter your choice (1-3): ");
    var chosenIdeology = null;
    switch (choice) {
        case "1":
            (0, birth_1.listIdeologies)();
            console.log("\nEnter the number (UID) of your chosen ideology:");
            var ideologyNumber = parseInt(prompt("> "));
            chosenIdeology = (0, birth_1.getIdeologyByUID)(ideologyNumber);
            while (!chosenIdeology) {
                console.log("Invalid ideology number. Please try again:");
                var newNumber = parseInt(prompt("> "));
                chosenIdeology = (0, birth_1.getIdeologyByUID)(newNumber);
            }
            break;
        case "2":
            chosenIdeology = (0, birth_1.getRandomIdeology)();
            console.log("\nYou got: ".concat(chosenIdeology.name, "!"));
            console.log("Economic Freedom: ".concat(chosenIdeology.economicFreedom));
            console.log("Civil Rights: ".concat(chosenIdeology.civilRights));
            console.log("Political Freedom: ".concat(chosenIdeology.politicalFreedom));
            break;
        case "3":
            console.log("\nEnter the ideology number (1-27):");
            var specificNumber = parseInt(prompt("> "));
            chosenIdeology = (0, birth_1.getIdeologyByUID)(specificNumber);
            while (!chosenIdeology) {
                console.log("Invalid ideology number. Please enter a number between 1 and 27:");
                var newNumber = parseInt(prompt("> "));
                chosenIdeology = (0, birth_1.getIdeologyByUID)(newNumber);
            }
            break;
        default:
            console.log("\nInvalid choice. Using random ideology...");
            chosenIdeology = (0, birth_1.getRandomIdeology)();
            console.log("\nYou got: ".concat(chosenIdeology.name, "!"));
    }
    console.log("\nPreparing to create your nation...");
    console.log("Name: ".concat(nationName));
    console.log("Starting Ideology: ".concat(chosenIdeology.name));
    var ready = prompt("\nReady to begin? (Press Enter to start or Ctrl+C to quit) ");
    (0, play_1.playGame)(nationName, chosenIdeology);
}
startGame();

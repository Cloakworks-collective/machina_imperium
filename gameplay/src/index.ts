import PromptSync = require("prompt-sync");
import { setupGame, createPlayerNation, createAINations, playGame } from './play';
import { getGame, isGameReady, listActiveGames } from './gameHelpers';

const prompt = PromptSync({ sigint: true });

async function startGame() {
  while (true) {
    console.clear();
    console.log("Nation Builder 2025 - Multiplayer\n");
    console.log("1. Create new game");
    console.log("2. Join existing game");
    console.log("3. List active games");
    console.log("4. Exit");
    
    const choice = prompt("\nSelect an option: ");

    try {
      if (choice === "1") {
        // Create new game
        const gameId = await setupGame();
        const player1Nation = await createPlayerNation(gameId, true);
        if (player1Nation) {
          console.log("\nWaiting for Player 2 to join with game ID:", gameId);
          console.log("\nYour turn to play!");
          await playGame(player1Nation, gameId);
          console.log("\nYour turn is complete! Waiting for Player 2 to join...");
          console.log("Remember your Game ID:", gameId);
          prompt("\nPress Enter to return to menu...");
        }
      } else if (choice === "2") {
        // Join existing game
        console.log("\nEnter game ID:");
        const gameId = prompt("> ").trim().toUpperCase();
        const game = getGame(gameId);
        
        if (!game) {
          console.log("Game not found!");
          prompt("\nPress Enter to continue...");
          continue;
        }

        if (game.player2Nation) {
          console.log("Game is full!");
          prompt("\nPress Enter to continue...");
          continue;
        }

        const player2Nation = await createPlayerNation(gameId, false);
        if (player2Nation) {
          await createAINations(gameId);
          
          if (isGameReady(gameId)) {
            console.log("\nGame is ready! All nations have been created.");
            console.log("\nYour turn to play!");
            await playGame(player2Nation, gameId);
            console.log("\nGame completed!");
            prompt("\nPress Enter to return to menu...");
          }
        }
      } else if (choice === "3") {
        listActiveGames();
        prompt("\nPress Enter to continue...");
      } else if (choice === "4") {
        console.log("\nThanks for playing!");
        break;
      }
    } catch (error) {
      console.error("An error occurred:", error);
      prompt("\nPress Enter to continue...");
    }
  }
}

startGame().catch(console.error);
// index.ts
import PromptSync = require("prompt-sync");
import { setupGame, createPlayerNation, createAINations, playGame } from './play';
import { getGame, isGameReady, listActiveGames, updateGameStatus, calculateWinner } from './helpers';
import { processAlliances } from './agents/diplomat';
import type { Nation } from './types';

const prompt = PromptSync({ sigint: true });

function displayNationDecisions(nation: Nation) {
  console.log(`\n=== Decisions made by ${nation.name} ===`);
  if (!nation.decisions || nation.decisions.length === 0) {
    console.log("No decisions recorded yet.");
    return;
  }

  nation.decisions.forEach((decision, index) => {
    console.log(`\nIssue ${index + 1}: ${decision.issueName}`);
    console.log(`Choice: ${decision.chosenOptionName}`);
    console.log(`Details: ${decision.description}`);
  });
}

function showGameDecisions(gameId: string) {
  const game = getGame(gameId);
  if (!game) {
    console.log("Game not found!");
    return;
  }

  console.log("\n=== Game Decision History ===");
  
  if (game.player1Nation) {
    console.log("\nPlayer 1 Nation:");
    displayNationDecisions(game.player1Nation);
  }

  if (game.player2Nation) {
    console.log("\nPlayer 2 Nation:");
    displayNationDecisions(game.player2Nation);
  }

  if (game.aiNations.length > 0) {
    console.log("\nAI Nations:");
    game.aiNations.forEach(nation => {
      displayNationDecisions(nation);
    });
  }
}

async function processGame(gameId: string) {
  const game = getGame(gameId);
  if (!game) {
    console.log("Game not found!");
    return;
  }

  if (!isGameReady(gameId)) {
    console.log("Game is not ready for processing! Both players must complete their decisions first.");
    console.log(`Current game status: ${game.status}`);
    return;
  }

  try {
    console.log("\nProcessing game...");
    updateGameStatus(gameId, 'processing');
    await createAINations(gameId);
    updateGameStatus(gameId, 'ready_for_processing_alliance');
    console.log("\nAI nations have made their decisions!");
    
    const finalGame = getGame(gameId);
    if (finalGame) {
      console.log("\nFinal Game Results:");
      console.log("\nPlayer Nations:");
      console.log(`Player 1: ${finalGame.player1Nation?.name} - ${finalGame.player1Nation?.ideology.name}`);
      console.log(`Player 2: ${finalGame.player2Nation?.name} - ${finalGame.player2Nation?.ideology.name}`);
      
      console.log("\nAI Nations:");
      finalGame.aiNations.forEach(nation => {
        console.log(`${nation.name} - ${nation.ideology.name}`);
      });
    }
  } catch (error) {
    console.error("Error processing game:", error);
    updateGameStatus(gameId, 'ready');
  }
}

async function processAllianceDecisions(gameId: string) {
  const game = getGame(gameId);
  if (!game) {
    console.log("Game not found!");
    return;
  }

  if (game.status !== 'ready_for_processing_alliance') {
    console.log("Game is not ready for alliance processing!");
    console.log(`Current game status: ${game.status}`);
    return;
  }

  try {
    console.log("\nProcessing AI nation alliances...");
    const alliances = await processAlliances(gameId);
    
    console.log("\nAlliance Results:");
    alliances.forEach(alliance => {
      console.log(`\n${alliance.aiNationName} has allied with ${alliance.chosenAlly}`);
      console.log(`Reasoning: ${alliance.reasoning}`);
      console.log(`Compatibility Score: ${alliance.compatibilityScore}%`);
    });
  } catch (error) {
    console.error("Error processing alliances:", error);
  }
}

async function processWinner(gameId: string) {
  const game = getGame(gameId);
  if (!game) {
    console.log("Game not found!");
    return;
  }

  if (game.status !== 'completed_alliance_processing') {
    console.log("Cannot calculate winner yet! Game must complete alliance processing first.");
    console.log(`Current game status: ${game.status}`);
    return;
  }

  const result = calculateWinner(gameId);
  if (!result) {
    console.log("Error calculating winner!");
    return;
  }

  console.log("\n=== Game Results ===");
  console.log(result.breakdown);
  if (result.winner === 'Tie') {
    console.log("\n🤝 The game is a tie!");
  } else {
    console.log(`\n👑 The winner is: ${result.winner}! 🎉`);
  }
}

async function startGame() {
  while (true) {
    console.clear();
    console.log("Machina Imperium\n");
    console.log("1. Create new game");
    console.log("2. Join existing game");
    console.log("3. List active games");
    console.log("4. Process the Game");
    console.log("5. Show Nation Decisions");
    console.log("6. Process Alliances");
    console.log("7. Calculate Winner");
    console.log("8. Exit");
    
    const choice = prompt("\nSelect an option: ");

    try {
      if (choice === "1") {
        const gameId = await setupGame();
        const player1Nation = await createPlayerNation(gameId, true);
        if (player1Nation) {
          console.log("\nYour turn to play!");
          await playGame(player1Nation, gameId);
          updateGameStatus(gameId, 'player1_completed');
          console.log("\nYour turn is complete! Waiting for Player 2 to join...");
          console.log("Remember your Game ID:", gameId);
          prompt("\nPress Enter to return to menu...");
        }
      } else if (choice === "2") {
        console.log("\nEnter game ID:");
        const gameId = prompt("> ").trim().toUpperCase();
        const game = getGame(gameId);
        
        if (!game) {
          console.log("Game not found!");
          prompt("\nPress Enter to continue...");
          continue;
        }

        if (game.status !== 'player1_completed') {
          console.log("Cannot join - Player 1 hasn't completed their turn yet!");
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
          console.log("\nYour turn to play!");
          await playGame(player2Nation, gameId);
          updateGameStatus(gameId, 'ready');
          console.log("\nGame is ready for processing!");
          console.log("Use option 4 'Process the Game' to simulate AI nations and complete the game.");
          prompt("\nPress Enter to return to menu...");
        }
      } else if (choice === "3") {
        listActiveGames();
        prompt("\nPress Enter to continue...");
      } else if (choice === "4") {
        console.log("\nEnter game ID to process:");
        const gameId = prompt("> ").trim().toUpperCase();
        await processGame(gameId);
        prompt("\nPress Enter to continue...");
      } else if (choice === "5") {
        console.log("\nEnter game ID to view decisions:");
        const gameId = prompt("> ").trim().toUpperCase();
        showGameDecisions(gameId);
        prompt("\nPress Enter to continue...");
      } else if (choice === "6") {
        console.log("\nEnter game ID to process alliances:");
        const gameId = prompt("> ").trim().toUpperCase();
        await processAllianceDecisions(gameId);
        prompt("\nPress Enter to continue...");
      } else if (choice === "7") {
        console.log("\nEnter game ID to calculate winner:");
        const gameId = prompt("> ").trim().toUpperCase();
        await processWinner(gameId);
        prompt("\nPress Enter to continue...");
      } else if (choice === "8") {
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
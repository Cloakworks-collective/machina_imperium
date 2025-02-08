// gameService.ts
import type { GameState, Nation, Ideology, Personality } from './types';
import { createNation as createBasicNation } from './birth';
import personalities from './db/personalities';

const games = new Map<string, GameState>();

// Add this function
export function selectPersonalities(count: number = 3): Personality[] {
  const shuffled = [...personalities].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateGameId(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function createGame(selectedPersonalities: Personality[]): string {
  let gameId;
  do {
    gameId = generateGameId();
  } while (games.has(gameId));

  games.set(gameId, {
    id: gameId,
    status: 'created',
    player1Nation: null,
    player2Nation: null,
    aiNations: [],
    selectedPersonalities
  });
  return gameId;
}

export function createNation(
  gameId: string,
  name: string,
  ideology: Ideology,
  rulerType: 'human' | 'AI',
  personality?: Personality
): Nation | null {
  const game = games.get(gameId);
  if (!game) return null;

  const basicNation = createBasicNation(name, ideology);
  if (!basicNation) return null;

  const nation: Nation = {
    ...basicNation,
    rulerType,
    personality
  };

  if (rulerType === 'human') {
    if (!game.player1Nation) {
      game.player1Nation = nation;
      game.status = 'created';
    } else if (!game.player2Nation) {
      game.player2Nation = nation;
      game.status = 'player2_joined';
    }
  } else if (rulerType === 'AI') {
    game.aiNations.push(nation);
    if (game.aiNations.length === game.selectedPersonalities.length &&
        game.player1Nation && game.player2Nation) {
      game.status = 'ready';
    }
  }

  games.set(gameId, game);
  return nation;
}

export function updateNationInGame(gameId: string, updatedNation: Nation): boolean {
  const game = games.get(gameId);
  if (!game) return false;

  if (game.player1Nation?.name === updatedNation.name) {
    game.player1Nation = updatedNation;
  } else if (game.player2Nation?.name === updatedNation.name) {
    game.player2Nation = updatedNation;
  } else {
    return false;
  }

  games.set(gameId, game);
  return true;
}

export function getGame(gameId: string): GameState | null {
  return games.get(gameId) || null;
}

export function isGameReady(gameId: string): boolean {
  const game = games.get(gameId);
  return game?.status === 'ready';
}

export function listActiveGames(): void {
  console.log("\nActive Games:");
  games.forEach((game, id) => {
    if (game.status !== 'ready') {
      console.log(`\nGame ID: ${id}`);
      console.log(`Status: ${game.status}`);
      console.log(`Player 1: ${game.player1Nation ? game.player1Nation.name : 'Waiting...'}`);
      console.log(`Player 2: ${game.player2Nation ? game.player2Nation.name : 'Waiting...'}`);
    }
  });
}
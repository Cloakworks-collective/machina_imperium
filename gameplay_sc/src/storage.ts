import type { GameStatus, GameState } from './types';

const gameStore = new Map<string, GameState>();

export function storeGame(gameId: string, gameData: GameState) {
  gameStore.set(gameId, gameData);
}

export function getStoredGame(gameId: string) {
  return gameStore.get(gameId);
}

export function getAllGames() {
  return Array.from(gameStore.values());
}
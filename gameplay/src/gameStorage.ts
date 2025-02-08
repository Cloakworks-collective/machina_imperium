// gameStorage.ts
type GameData = {
    id: string;
    status: 'created' | 'player2_joined' | 'ready';
    player1Nation: any; // Using any to match existing data structure
    player2Nation: any;
    aiNations: any[];
    selectedPersonalities: any[];
  };
  
  const gameStore = new Map<string, GameData>();
  
  export function storeGame(gameId: string, gameData: GameData) {
    gameStore.set(gameId, gameData);
  }
  
  export function getStoredGame(gameId: string) {
    return gameStore.get(gameId);
  }
  
  export function getAllGames() {
    return Array.from(gameStore.values());
  }
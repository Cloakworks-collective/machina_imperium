import type { GameState, GameStatus, Nation, Ideology, Personality, Vector3D } from './types';
import { getStoredGame } from './storage';
import personalities from './db/personalities';
import { ideologies } from './db/ideologies';
import { 
    createGameOnChain, 
    joinGameOnChain, 
    submitDecisionsOnChain, 
    updateGameStatusOnChain, 
    setWinnerOnChain,
    getGameStateFromChain,
    generateGameId as generateChainGameId
} from './contractHelpers';

// Default initial GDP value
const DEFAULT_GDP = 5000;

// Local state for features not in smart contract
const games = new Map<string, GameState>();

/**
 * Calculates the Euclidean distance between two points in 3D space.
 */
export function euclideanDistance(a: Vector3D, b: Vector3D): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2) +
    Math.pow(a.z - b.z, 2)
  );
}

export function selectPersonalities(count: number = 3): Personality[] {
  const shuffled = [...personalities].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Generates a random game ID.
 */
function generateGameId(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Creates a new game with selected personalities
 */
export async function createGame(selectedPersonalities: Personality[]): Promise<string> {
  let gameId;
  do {
    gameId = generateGameId();
  } while (games.has(gameId));

  // Create game on blockchain
  await createGameOnChain(gameId);

  // Store additional data locally
  games.set(gameId, {
    id: gameId,
    status: 'created',
    player1Nation: null,
    player2Nation: null,
    aiNations: [],
    selectedPersonalities,
    alliances: []
  });

  return gameId;
}

export function validateNationName(name: string): boolean {
  return name.length > 0 && name.length <= 50;
}

function createInitialStats(ideology: Ideology) {
  return {
    economicFreedom: ideology.economicFreedom,
    civilRights: ideology.civilRights,
    politicalFreedom: ideology.politicalFreedom,
    gdp: DEFAULT_GDP
  };
}

export function createBasicNation(
  name: string, 
  ideology: Ideology, 
  rulerType: 'human' | 'AI' = 'human',
  personality?: Personality
): Nation | null {
  if (!validateNationName(name)) {
    console.error("Invalid nation name");
    return null;
  }

  return {
    name,
    ideology,
    rulerType,
    personality,
    stats: createInitialStats(ideology),
    decisions: []
  };
}

export async function createNation(
  gameId: string,
  name: string,
  ideology: Ideology,
  rulerType: 'human' | 'AI',
  personality?: Personality
): Promise<Nation | null> {
  const game = games.get(gameId);
  if (!game) return null;

  const basicNation = createBasicNation(name, ideology, rulerType, personality);
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
      // Join game on blockchain
      await joinGameOnChain(gameId);
      game.player2Nation = nation;
      game.status = 'player2_completed';
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

export async function updateNationStats(
  nation: Nation,
  impacts: {
    economicFreedom: number;
    civilRights: number;
    politicalFreedom: number;
    gdp: number;
  }
): Promise<Nation> {
  const newStats = {
    economicFreedom: Math.max(0, Math.min(100, nation.stats.economicFreedom + impacts.economicFreedom)),
    civilRights: Math.max(0, Math.min(100, nation.stats.civilRights + impacts.civilRights)),
    politicalFreedom: Math.max(0, Math.min(100, nation.stats.politicalFreedom + impacts.politicalFreedom)),
    gdp: nation.stats.gdp + impacts.gdp
  };

  const updatedNation = {
    ...nation,
    stats: newStats,
    decisions: nation.decisions || []
  };

  // If this is a player nation, update the blockchain
  if (nation.rulerType === 'human') {
    // Get the current game state to determine if this is player1 or player2
    const game = await getGame(nation.name); // assuming name is unique
    if (game) {
      const isPlayer1 = game.player1Nation?.name === nation.name;
      await submitDecisionsOnChain(nation.name, updatedNation, isPlayer1);
    }
  }

  return updatedNation;
}

export async function getGame(gameId: string): Promise<GameState | null> {
  try {
    // Get blockchain state
    const chainState = await getGameStateFromChain(gameId);
    if (!chainState) return null;

    // Get local state
    const localGame = games.get(gameId);
    if (!localGame) return chainState;

    // Combine states
    return {
      ...localGame,
      status: chainState.status,
      player1Nation: chainState.player1Nation || localGame.player1Nation,
      player2Nation: chainState.player2Nation || localGame.player2Nation
    };
  } catch (error) {
    console.error("Error fetching game:", error);
    return games.get(gameId) || null;
  }
}

export async function isGameReady(gameId: string): Promise<boolean> {
  const game = await getGame(gameId);
  if (!game) return false;
  return game.status === 'ready';
}

export async function updateGameStatus(gameId: string, status: GameStatus): Promise<void> {
  // Update blockchain
  await updateGameStatusOnChain(gameId, status);

  // Update local state
  const game = games.get(gameId);
  if (game) {
    game.status = status;
    games.set(gameId, game);
  }
}

/**
 * Lists all games where Player 1 has completed their turn and Player 2 hasn't joined yet.
 */
export function listActiveGames(): void {
  console.log("\nGames Waiting for Player 2:");
  console.log("==========================");
  
  let gamesFound = false;
  
  games.forEach((game, id) => {
    if (game.status === 'player1_completed' && !game.player2Nation) {
      gamesFound = true;
      console.log(`\nGame ID: ${id}`);
      console.log(`Status: Waiting for Player 2`);
      console.log(`Player 1: ${game.player1Nation?.name} - ${game.player1Nation?.ideology.name}`);
      console.log(`Selected AI Leaders:`);
      game.selectedPersonalities.forEach(personality => {
        console.log(`  - ${personality.name} (${personality.description})`);
      });
    }
  });

  if (!gamesFound) {
    console.log("\nNo games currently waiting for Player 2 to join.");
  }
}

/**
 * Displays game information including nations and their stats.
 * @param gameId ID of the game
 */
export function displayGameInfo(gameId: string) {
  const game = getStoredGame(gameId);
  if (!game) return;

  console.log("\n=== Game Status Update ===");
  
  if (game.player1Nation) {
    console.log("\nPlayer 1:", game.player1Nation.name);
    console.log("Ideology:", game.player1Nation.ideology.name);
    console.log("Economic Freedom:", game.player1Nation.stats.economicFreedom);
    console.log("Civil Rights:", game.player1Nation.stats.civilRights);
    console.log("Political Freedom:", game.player1Nation.stats.politicalFreedom);
    console.log("GDP:", game.player1Nation.stats.gdp);
  }

  if (game.player2Nation) {
    console.log("\nPlayer 2:", game.player2Nation.name);
    console.log("Ideology:", game.player2Nation.ideology.name);
    console.log("Economic Freedom:", game.player2Nation.stats.economicFreedom);
    console.log("Civil Rights:", game.player2Nation.stats.civilRights);
    console.log("Political Freedom:", game.player2Nation.stats.politicalFreedom);
    console.log("GDP:", game.player2Nation.stats.gdp);
  }

  if (game.aiNations.length > 0) {
    console.log("\nAI Nations:");
    game.aiNations.forEach(nation => {
      console.log(`\n${nation.name}`);
      console.log("Leader:", nation.personality?.name);
      console.log("Ideology:", nation.ideology.name);
      console.log("Economic Freedom:", nation.stats.economicFreedom);
      console.log("Civil Rights:", nation.stats.civilRights);
      console.log("Political Freedom:", nation.stats.politicalFreedom);
      console.log("GDP:", nation.stats.gdp);
    });
  }
}

/**
 * Compares nations based on GDP and Freedom Index.
 * @param gameId ID of the game
 */
export function compareNations(gameId: string) {
  const game = getStoredGame(gameId);
  if (!game) return;

  const allNations = [
    ...(game.player1Nation ? [game.player1Nation] : []),
    ...(game.player2Nation ? [game.player2Nation] : []),
    ...game.aiNations
  ];

  console.log("\n=== Nation Rankings ===");
  
  // GDP Ranking
  console.log("\nGDP Ranking:");
  [...allNations]
    .sort((a, b) => b.stats.gdp - a.stats.gdp)
    .forEach((nation, i) => {
      console.log(`${i + 1}. ${nation.name}: ${nation.stats.gdp}`);
    });

  // Freedom Rankings
  console.log("\nFreedom Index Ranking:");
  [...allNations]
    .sort((a, b) => {
      const totalA = a.stats.economicFreedom + a.stats.civilRights + a.stats.politicalFreedom;
      const totalB = b.stats.economicFreedom + b.stats.civilRights + b.stats.politicalFreedom;
      return totalB - totalA;
    })
    .forEach((nation, i) => {
      const total = nation.stats.economicFreedom + nation.stats.civilRights + nation.stats.politicalFreedom;
      console.log(`${i + 1}. ${nation.name}: ${total}`);
    });
}

// Ideology functions

/**
 * Returns a random ideology
 * @returns Random ideology
 */
export function getRandomIdeology(): Ideology {
  return ideologies[Math.floor(Math.random() * ideologies.length)];
}


export function chooseIdeologyForPersonality(personality: Personality): Ideology {
  const authScore = personality.attributes.authoritarianism;
  const progScore = personality.attributes.progressiveness;
  
  let bestMatch = ideologies[0];
  let smallestDiff = Number.MAX_VALUE;

  for (const ideology of ideologies) {
    const diff = Math.abs(ideology.politicalFreedom - (100 - authScore)) +
                Math.abs(ideology.civilRights - progScore);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      bestMatch = ideology;
    }
  }

  return bestMatch;
}

/**
 * Lists all available ideologies
 */
export function listIdeologies(): void {
  console.log("\nAvailable Ideologies:");
  for (const ideology of ideologies) {
    console.log(`\n#${ideology.uid} - ${ideology.name}`);
    console.log(`  Economic Freedom: ${ideology.economicFreedom}`);
    console.log(`  Civil Rights: ${ideology.civilRights}`);
    console.log(`  Political Freedom: ${ideology.politicalFreedom}`);
  }
}

/**
 * Gets an ideology by its UID
 * @param uid Ideology UID
 * @returns Ideology object or null if not found
 */
export function getIdeologyByUID(uid: number): Ideology | null {
  return ideologies.find(ideology => ideology.uid === uid) || null;
}

export async function calculateWinner(gameId: string): Promise<{ 
  winner: string;
  player1Score: number;
  player2Score: number;
  breakdown: string;
} | null> {
  const game = await getGame(gameId);
  if (!game || !game.player1Nation || !game.player2Nation || !game.alliances) {
    return null;
  }

  let player1Score = 0;
  let player2Score = 0;

  // Calculate GDP points
  const gdp1 = game.player1Nation.stats.gdp;
  const gdp2 = game.player2Nation.stats.gdp;
  if (gdp1 > gdp2) {
    player1Score += 20;
  } else if (gdp2 > gdp1) {
    player2Score += 20;
  }

  // Calculate alliance points
  game.alliances.forEach(alliance => {
    if (alliance.chosenAlly === game.player1Nation!.name) {
      player1Score += 10;
    } else if (alliance.chosenAlly === game.player2Nation!.name) {
      player2Score += 10;
    }
  });

  const breakdown = `
Score Breakdown:
---------------
${game.player1Nation.name}:
GDP Points: ${gdp1 > gdp2 ? 20 : 0} (GDP: ${gdp1})
Alliance Points: ${Math.floor((player1Score - (gdp1 > gdp2 ? 20 : 0)))} (${Math.floor((player1Score - (gdp1 > gdp2 ? 20 : 0)) / 10)} allies)
Total: ${player1Score}

${game.player2Nation.name}:
GDP Points: ${gdp2 > gdp1 ? 20 : 0} (GDP: ${gdp2})
Alliance Points: ${Math.floor((player2Score - (gdp2 > gdp1 ? 20 : 0)))} (${Math.floor((player2Score - (gdp2 > gdp1 ? 20 : 0)) / 10)} allies)
Total: ${player2Score}
`;

  // Update winner on chain
  const winner = player1Score > player2Score ? game.player1Nation.name : game.player2Nation.name;
  const winningScore = Math.max(player1Score, player2Score);
  await setWinnerOnChain(gameId, winner, winningScore);

  return {
    winner,
    player1Score,
    player2Score,
    breakdown
  };
}
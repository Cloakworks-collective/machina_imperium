// contractHelpers.ts
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import type { GameState, GameStatus, Nation, Decision } from './types';

dotenv.config();

// Contract setup
const CONTRACT_ADDRESS = "0x18975871ab7E57e0f26fdF429592238541051Fb0"; // Base Sepolia address
const CONTRACT_ABI = [{"type":"function","name":"addDecision","inputs":[{"name":"gameId","type":"bytes32","internalType":"bytes32"},{"name":"issueId","type":"uint8","internalType":"uint8"},{"name":"chosenOptionId","type":"uint8","internalType":"uint8"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"createGame","inputs":[{"name":"gameId","type":"bytes32","internalType":"bytes32"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"games","inputs":[{"name":"","type":"bytes32","internalType":"bytes32"}],"outputs":[{"name":"status","type":"uint8","internalType":"enum NationBuilder.GameStatus"},{"name":"player1","type":"address","internalType":"address"},{"name":"player2","type":"address","internalType":"address"},{"name":"player1Moved","type":"bool","internalType":"bool"},{"name":"player2Moved","type":"bool","internalType":"bool"},{"name":"player1Stats","type":"tuple","internalType":"struct NationBuilder.NationStats","components":[{"name":"economicFreedom","type":"uint8","internalType":"uint8"},{"name":"civilRights","type":"uint8","internalType":"uint8"},{"name":"politicalFreedom","type":"uint8","internalType":"uint8"},{"name":"gdp","type":"int256","internalType":"int256"}]},{"name":"player2Stats","type":"tuple","internalType":"struct NationBuilder.NationStats","components":[{"name":"economicFreedom","type":"uint8","internalType":"uint8"},{"name":"civilRights","type":"uint8","internalType":"uint8"},{"name":"politicalFreedom","type":"uint8","internalType":"uint8"},{"name":"gdp","type":"int256","internalType":"int256"}]},{"name":"lastUpdateTime","type":"uint256","internalType":"uint256"},{"name":"winner","type":"address","internalType":"address"},{"name":"winningScore","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"getGameState","inputs":[{"name":"gameId","type":"bytes32","internalType":"bytes32"}],"outputs":[{"name":"status","type":"uint8","internalType":"enum NationBuilder.GameStatus"},{"name":"player1","type":"address","internalType":"address"},{"name":"player2","type":"address","internalType":"address"},{"name":"player1Moved","type":"bool","internalType":"bool"},{"name":"player2Moved","type":"bool","internalType":"bool"},{"name":"lastUpdateTime","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"getPlayerDecisions","inputs":[{"name":"gameId","type":"bytes32","internalType":"bytes32"},{"name":"player","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"tuple[]","internalType":"struct NationBuilder.Decision[]","components":[{"name":"issueId","type":"uint8","internalType":"uint8"},{"name":"chosenOptionId","type":"uint8","internalType":"uint8"}]}],"stateMutability":"view"},{"type":"function","name":"getPlayerGames","inputs":[{"name":"player","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"bytes32[]","internalType":"bytes32[]"}],"stateMutability":"view"},{"type":"function","name":"getPlayerStats","inputs":[{"name":"gameId","type":"bytes32","internalType":"bytes32"},{"name":"isPlayer1","type":"bool","internalType":"bool"}],"outputs":[{"name":"","type":"tuple","internalType":"struct NationBuilder.NationStats","components":[{"name":"economicFreedom","type":"uint8","internalType":"uint8"},{"name":"civilRights","type":"uint8","internalType":"uint8"},{"name":"politicalFreedom","type":"uint8","internalType":"uint8"},{"name":"gdp","type":"int256","internalType":"int256"}]}],"stateMutability":"view"},{"type":"function","name":"getWinner","inputs":[{"name":"gameId","type":"bytes32","internalType":"bytes32"}],"outputs":[{"name":"winner","type":"address","internalType":"address"},{"name":"winningScore","type":"uint256","internalType":"uint256"},{"name":"isGameCompleted","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"joinGame","inputs":[{"name":"gameId","type":"bytes32","internalType":"bytes32"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"playerDecisions","inputs":[{"name":"","type":"bytes32","internalType":"bytes32"},{"name":"","type":"address","internalType":"address"},{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"issueId","type":"uint8","internalType":"uint8"},{"name":"chosenOptionId","type":"uint8","internalType":"uint8"}],"stateMutability":"view"},{"type":"function","name":"playerGames","inputs":[{"name":"","type":"address","internalType":"address"},{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bytes32","internalType":"bytes32"}],"stateMutability":"view"},{"type":"function","name":"setWinner","inputs":[{"name":"gameId","type":"bytes32","internalType":"bytes32"},{"name":"winner","type":"address","internalType":"address"},{"name":"score","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"submitStats","inputs":[{"name":"gameId","type":"bytes32","internalType":"bytes32"},{"name":"stats","type":"tuple","internalType":"struct NationBuilder.NationStats","components":[{"name":"economicFreedom","type":"uint8","internalType":"uint8"},{"name":"civilRights","type":"uint8","internalType":"uint8"},{"name":"politicalFreedom","type":"uint8","internalType":"uint8"},{"name":"gdp","type":"int256","internalType":"int256"}]}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"updateGameStatus","inputs":[{"name":"gameId","type":"bytes32","internalType":"bytes32"},{"name":"newStatus","type":"uint8","internalType":"enum NationBuilder.GameStatus"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"event","name":"DecisionsMade","inputs":[{"name":"gameId","type":"bytes32","indexed":true,"internalType":"bytes32"},{"name":"player","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},{"type":"event","name":"GameCreated","inputs":[{"name":"gameId","type":"bytes32","indexed":true,"internalType":"bytes32"},{"name":"player1","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},{"type":"event","name":"GameStatusUpdated","inputs":[{"name":"gameId","type":"bytes32","indexed":true,"internalType":"bytes32"},{"name":"newStatus","type":"uint8","indexed":false,"internalType":"enum NationBuilder.GameStatus"}],"anonymous":false},{"type":"event","name":"Player2Joined","inputs":[{"name":"gameId","type":"bytes32","indexed":true,"internalType":"bytes32"},{"name":"player2","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},{"type":"event","name":"WinnerDeclared","inputs":[{"name":"gameId","type":"bytes32","indexed":true,"internalType":"bytes32"},{"name":"winner","type":"address","indexed":true,"internalType":"address"},{"name":"score","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false}];


// RPC URL from environment variables
const RPC_URL = process.env.ETH_SEPOLIA_RPC_URL;
if (!RPC_URL) throw new Error("RPC_URL not found in environment variables");

// Initialize provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Player wallets setup
const player1PrivateKey = process.env.PLAYER1_PRIVATE_KEY;
const player2PrivateKey = process.env.PLAYER2_PRIVATE_KEY;

if (!player1PrivateKey) throw new Error("PLAYER1_PRIVATE_KEY not found in environment variables");
if (!player2PrivateKey) throw new Error("PLAYER2_PRIVATE_KEY not found in environment variables");

const player1Wallet = new ethers.Wallet(player1PrivateKey, provider);
const player2Wallet = new ethers.Wallet(player2PrivateKey, provider);

// Contract instances for each player
const player1Contract = new ethers.Contract(CONTRACT_ADDRESS!, CONTRACT_ABI, player1Wallet);
const player2Contract = new ethers.Contract(CONTRACT_ADDRESS!, CONTRACT_ABI, player2Wallet);

// Helper to get the appropriate contract instance based on player
function getPlayerContract(isPlayer1: boolean) {
    return isPlayer1 ? player1Contract : player2Contract;
}

// Helper function to generate gameId from string
export function generateGameId(gameId: string): string {
    return ethers.id(gameId);
}

// Helper to convert game state from contract to our format
function convertContractGameState(contractState: any): GameState {
    return {
        id: contractState.gameId,
        status: contractState.status as GameStatus,
        player1Nation: null,
        player2Nation: null,
        aiNations: [],
        selectedPersonalities: [],
        alliances: []
    };
}

// Convert our decision format to contract format
function convertDecisionsToContract(decisions: Decision[]): any[] {
    return decisions.map(d => ({
        issueId: d.issueId,
        chosenOptionId: d.chosenOptionId
    }));
}

// Convert nation stats to contract format
function convertStatsToContract(nation: Nation): any {
    return {
        economicFreedom: nation.stats.economicFreedom,
        civilRights: nation.stats.civilRights,
        politicalFreedom: nation.stats.politicalFreedom,
        gdp: nation.stats.gdp
    };
}

export async function createGameOnChain(gameId: string): Promise<string> {
    const tx = await player1Contract.createGame(generateGameId(gameId));
    await tx.wait();
    return gameId;
}

export async function joinGameOnChain(gameId: string): Promise<void> {
    const tx = await player2Contract.joinGame(generateGameId(gameId));
    await tx.wait();
}

export async function submitDecisionsOnChain(
    gameId: string,
    nation: Nation,
    isPlayer1: boolean
): Promise<void> {
    const contract = getPlayerContract(isPlayer1);
    
    // First submit each decision individually
    for (const decision of nation.decisions) {
        const tx = await contract.addDecision(
            generateGameId(gameId),
            decision.issueId,
            decision.chosenOptionId
        );
        await tx.wait();
    }
    
    // Then submit the final stats
    const contractStats = convertStatsToContract(nation);
    const tx = await contract.submitStats(generateGameId(gameId), contractStats);
    await tx.wait();
}

export async function updateGameStatusOnChain(
    gameId: string,
    status: GameStatus,
    isPlayer1: boolean = true
): Promise<void> {
    const contract = getPlayerContract(isPlayer1);
    const tx = await contract.updateGameStatus(generateGameId(gameId), status);
    await tx.wait();
}

export async function setWinnerOnChain(
    gameId: string,
    winner: string,
    score: number,
    isPlayer1: boolean = true
): Promise<void> {
    const contract = getPlayerContract(isPlayer1);
    const tx = await contract.setWinner(generateGameId(gameId), winner, score);
    await tx.wait();
}

export async function getGameStateFromChain(gameId: string): Promise<GameState | null> {
    try {
        // We can use either contract since this is a view function
        const contractState = await player1Contract.getGameState(generateGameId(gameId));
        return convertContractGameState(contractState);
    } catch (error) {
        console.error("Error fetching game state:", error);
        return null;
    }
}

// Get player addresses for reference
export const getPlayerAddresses = () => ({
    player1: player1Wallet.address,
    player2: player2Wallet.address
});

// Helper to check wallet balances
export async function checkWalletBalances(): Promise<void> {
    const player1Balance = await provider.getBalance(player1Wallet.address);
    const player2Balance = await provider.getBalance(player2Wallet.address);
    
    console.log("\nWallet Balances:");
    console.log(`Player 1 (${player1Wallet.address}): ${ethers.formatEther(player1Balance)} ETH`);
    console.log(`Player 2 (${player2Wallet.address}): ${ethers.formatEther(player2Balance)} ETH`);
}
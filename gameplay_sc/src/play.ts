// play.ts
import PromptSync = require("prompt-sync");
import { issuesData } from "./db/issues";
import { ideologies } from './db/ideologies';
import type { Nation, Ideology, Personality, Issue, Option, Decision, GameState } from './types';
import { 
    createGame, 
    createNation,
    updateNationStats, 
    selectPersonalities, 
    getGame, 
    euclideanDistance, 
    displayGameInfo, 
    compareNations,
    getRandomIdeology,
} from './helpers';
import { playAINation } from './agents/governor';
import { storeGame } from './storage';

const prompt = PromptSync({ sigint: true });

function replacePlaceholders(text: string, nationName: string): string {
    return text.replace(/\${nationName}/g, nationName);
}

function promptForIssue(issue: Issue, nationName: string): { option: Option; decision: Decision } | null {
    console.log(`\n=== ${issue.name} ===`);
    console.log(replacePlaceholders(issue.description, nationName));

    issue.options.forEach((option: Option) => {
        console.log(`\nOption ${option.id}: ${option.name}`);
        console.log(`Description: ${replacePlaceholders(option.description, nationName)}`);
    });

    const input = prompt(`\nChoose an option (1 - ${issue.options.length}): `);
    const choice = parseInt(input, 10);

    if (isNaN(choice) || choice < 1 || choice > issue.options.length) {
        console.log("Invalid choice. Skipping this issue.");
        return null;
    }

    const chosenOption = issue.options.find(o => o.id === choice);
    if (!chosenOption) return null;

    const decision: Decision = {
        issueId: issue.id,
        issueName: issue.name,
        chosenOptionId: chosenOption.id,
        chosenOptionName: chosenOption.name,
        description: replacePlaceholders(chosenOption.description, nationName)
    };

    return { option: chosenOption, decision };
}

function determineNearestIdeology(stats: Nation['stats']): Ideology {
    const currentPoint = {
        x: stats.economicFreedom,
        y: stats.civilRights,
        z: stats.politicalFreedom
    };

    let closestIdeology = ideologies[0];
    let minDistance = Number.MAX_VALUE;

    for (const ideology of ideologies) {
        const ideologyPoint = {
            x: ideology.economicFreedom,
            y: ideology.civilRights,
            z: ideology.politicalFreedom
        };

        const distance = euclideanDistance(currentPoint, ideologyPoint);
        if (distance < minDistance) {
            minDistance = distance;
            closestIdeology = ideology;
        }
    }

    return closestIdeology;
}

function calculateChanges(originalNation: Nation, finalNation: Nation) {
    return {
        economicFreedom: finalNation.stats.economicFreedom - originalNation.stats.economicFreedom,
        civilRights: finalNation.stats.civilRights - originalNation.stats.civilRights,
        politicalFreedom: finalNation.stats.politicalFreedom - originalNation.stats.politicalFreedom,
        gdp: finalNation.stats.gdp - originalNation.stats.gdp
    };
}

function getImpactEmoji(value: number): string {
    if (value >= 5) return "🚀";
    if (value >= 2) return "📈";
    if (value >= -1) return "😐";
    if (value >= -4) return "📉";
    return "💥";
}

function getGDPEmoji(value: number): string {
    if (value >= 200) return "🤑";
    if (value >= 50) return "💰";
    if (value >= -49) return "💵";
    if (value >= -200) return "🪙";
    return "📉";
}

function displayNationStatus(nation: Nation) {
    console.log(`\n=== The State of ${nation.name} ===`);
    console.log(`Current Ideology: ${nation.ideology.name}`);
    console.log(`Ruler Type: ${nation.rulerType}`);
    if (nation.personality) {
        console.log(`Leader: ${nation.personality.name}`);
    }
    console.log(`Economic Freedom:    ${nation.stats.economicFreedom} ${getImpactEmoji(nation.stats.economicFreedom)}`);
    console.log(`Civil Rights:        ${nation.stats.civilRights} ${getImpactEmoji(nation.stats.civilRights)}`);
    console.log(`Political Freedom:   ${nation.stats.politicalFreedom} ${getImpactEmoji(nation.stats.politicalFreedom)}`);
    console.log(`GDP:                 ${nation.stats.gdp} ${getGDPEmoji(nation.stats.gdp)}`);
}

export async function setupGame(): Promise<string> {
    console.log("Welcome to Machina Imperium - Multiplayer!\n");

    const personalities = selectPersonalities(3);
    console.log("\nSelected Random AI Leaders:");
    personalities.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name} - ${p.description}`);
    });

    const gameId = await createGame(personalities);
    console.log(`\nGame created! Your game ID is: ${gameId}`);
    return gameId;
}

async function promptForNationName(): Promise<string> {
    console.log("What would you like to name your nation?");
    const name = prompt("> ").trim();
    if (!name) {
        throw new Error("Nation name cannot be empty");
    }
    return name;
}

async function promptForIdeology(): Promise<Ideology> {
    console.log("\nChoose your ideology (enter number 1-27):");
    ideologies.forEach(i => {
        console.log(`${i.uid}. ${i.name}`);
    });

    while (true) {
        const choice = parseInt(prompt("> "));
        const ideology = ideologies.find(i => i.uid === choice);
        if (ideology) return ideology;
        console.log("Invalid choice. Please try again.");
    }
}

export async function createPlayerNation(gameId: string, isPlayer1: boolean = true): Promise<Nation | null> {
    const game = await getGame(gameId);
    if (!game) {
        console.error("Game not found!");
        return null;
    }

    const nationName = await promptForNationName();
    const ideology = await promptForIdeology();
    
    return await createNation(gameId, nationName, ideology, 'human');
}

export async function createAINations(gameId: string): Promise<void> {
    const game = await getGame(gameId);
    if (!game) return;

    for (const personality of game.selectedPersonalities) {
        const initialIdeology = getRandomIdeology();
        const aiNation = await createNation(gameId, personality.nationName, initialIdeology, 'AI', personality);

        if (aiNation) {
            const updatedAiNation = await playAINation(aiNation);
            
            const currentGame = await getGame(gameId);
            if (currentGame) {
                const gameToUpdate: GameState = {
                    ...currentGame,
                    aiNations: currentGame.aiNations.map(n => 
                        n.name === personality.nationName ? updatedAiNation : n
                    )
                };
                storeGame(gameId, gameToUpdate);
            }
        }
    }
}

export async function playGame(nation: Nation, gameId: string): Promise<Nation> {
    console.log(`\nWelcome to ${nation.name}!\n`);
    
    const originalNation: Nation = { ...nation };
    let currentNation: Nation = { 
        ...nation, 
        decisions: [] 
    };
    
    for (const issue of issuesData.issues) {
        const result = promptForIssue(issue, nation.name);
        if (result) {
            const updatedNation = await updateNationStats(currentNation, result.option.impact);
            currentNation = {
                ...updatedNation,
                decisions: [...currentNation.decisions, result.decision]
            };
        }
    }

    const newIdeology = determineNearestIdeology(currentNation.stats);
    const changes = calculateChanges(originalNation, currentNation);
    
    console.log("\n=== Aggregate Changes ===");
    console.log(`Previous Government Type: ${originalNation.ideology.name}`);
    console.log(`New Government Type: ${newIdeology.name}`);
    console.log("\nChanges in Freedom Indices:");
    console.log(`Economic Freedom: ${changes.economicFreedom >= 0 ? '+' : ''}${changes.economicFreedom}`);
    console.log(`Civil Rights: ${changes.civilRights >= 0 ? '+' : ''}${changes.civilRights}`);
    console.log(`Political Freedom: ${changes.politicalFreedom >= 0 ? '+' : ''}${changes.politicalFreedom}`);
    console.log(`GDP: ${changes.gdp >= 0 ? '+' : ''}${changes.gdp}`);

    if (originalNation.ideology.name !== newIdeology.name) {
        console.log(`\n🔄 Your nation has evolved from a ${originalNation.ideology.name} to a ${newIdeology.name}!`);
    } else {
        console.log(`\n✨ Your nation remains a ${newIdeology.name}`);
    }

    currentNation = {
        ...currentNation,
        ideology: newIdeology
    };

    const game = await getGame(gameId);
    if (game) {
        const updatedGame: GameState = {
            ...game,
            player1Nation: game.player1Nation?.name === nation.name ? currentNation : game.player1Nation,
            player2Nation: game.player2Nation?.name === nation.name ? currentNation : game.player2Nation
        };
        
        storeGame(gameId, updatedGame);
        displayGameInfo(gameId);
        compareNations(gameId);
    }

    return currentNation;
}
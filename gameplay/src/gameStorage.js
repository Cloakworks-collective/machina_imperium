"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeGame = storeGame;
exports.getStoredGame = getStoredGame;
exports.getAllGames = getAllGames;
var gameStore = new Map();
function storeGame(gameId, gameData) {
    gameStore.set(gameId, gameData);
}
function getStoredGame(gameId) {
    return gameStore.get(gameId);
}
function getAllGames() {
    return Array.from(gameStore.values());
}

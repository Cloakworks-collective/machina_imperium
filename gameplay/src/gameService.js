"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectPersonalities = selectPersonalities;
exports.createGame = createGame;
exports.createNation = createNation;
exports.updateNationInGame = updateNationInGame;
exports.getGame = getGame;
exports.isGameReady = isGameReady;
exports.listActiveGames = listActiveGames;
var birth_1 = require("./birth");
var personalities_1 = require("./db/personalities");
var games = new Map();
// Add this function
function selectPersonalities(count) {
    if (count === void 0) { count = 3; }
    var shuffled = __spreadArray([], personalities_1.default, true).sort(function () { return 0.5 - Math.random(); });
    return shuffled.slice(0, count);
}
function generateGameId() {
    var characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var result = '';
    for (var i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
function createGame(selectedPersonalities) {
    var gameId;
    do {
        gameId = generateGameId();
    } while (games.has(gameId));
    games.set(gameId, {
        id: gameId,
        status: 'created',
        player1Nation: null,
        player2Nation: null,
        aiNations: [],
        selectedPersonalities: selectedPersonalities
    });
    return gameId;
}
function createNation(gameId, name, ideology, rulerType, personality) {
    var game = games.get(gameId);
    if (!game)
        return null;
    var basicNation = (0, birth_1.createNation)(name, ideology);
    if (!basicNation)
        return null;
    var nation = __assign(__assign({}, basicNation), { rulerType: rulerType, personality: personality });
    if (rulerType === 'human') {
        if (!game.player1Nation) {
            game.player1Nation = nation;
            game.status = 'created';
        }
        else if (!game.player2Nation) {
            game.player2Nation = nation;
            game.status = 'player2_joined';
        }
    }
    else if (rulerType === 'AI') {
        game.aiNations.push(nation);
        if (game.aiNations.length === game.selectedPersonalities.length &&
            game.player1Nation && game.player2Nation) {
            game.status = 'ready';
        }
    }
    games.set(gameId, game);
    return nation;
}
function updateNationInGame(gameId, updatedNation) {
    var _a, _b;
    var game = games.get(gameId);
    if (!game)
        return false;
    if (((_a = game.player1Nation) === null || _a === void 0 ? void 0 : _a.name) === updatedNation.name) {
        game.player1Nation = updatedNation;
    }
    else if (((_b = game.player2Nation) === null || _b === void 0 ? void 0 : _b.name) === updatedNation.name) {
        game.player2Nation = updatedNation;
    }
    else {
        return false;
    }
    games.set(gameId, game);
    return true;
}
function getGame(gameId) {
    return games.get(gameId) || null;
}
function isGameReady(gameId) {
    var game = games.get(gameId);
    return (game === null || game === void 0 ? void 0 : game.status) === 'ready';
}
function listActiveGames() {
    console.log("\nActive Games:");
    games.forEach(function (game, id) {
        if (game.status !== 'ready') {
            console.log("\nGame ID: ".concat(id));
            console.log("Status: ".concat(game.status));
            console.log("Player 1: ".concat(game.player1Nation ? game.player1Nation.name : 'Waiting...'));
            console.log("Player 2: ".concat(game.player2Nation ? game.player2Nation.name : 'Waiting...'));
        }
    });
}

"use strict";
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
exports.displayGameInfo = displayGameInfo;
exports.compareNations = compareNations;
// gameInfo.ts
var gameStorage_1 = require("./gameStorage");
function displayGameInfo(gameId) {
    var game = (0, gameStorage_1.getStoredGame)(gameId);
    if (!game)
        return;
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
        game.aiNations.forEach(function (nation) {
            var _a;
            console.log("\n".concat(nation.name));
            console.log("Leader:", (_a = nation.personality) === null || _a === void 0 ? void 0 : _a.name);
            console.log("Ideology:", nation.ideology.name);
            console.log("Economic Freedom:", nation.stats.economicFreedom);
            console.log("Civil Rights:", nation.stats.civilRights);
            console.log("Political Freedom:", nation.stats.politicalFreedom);
            console.log("GDP:", nation.stats.gdp);
        });
    }
}
function compareNations(gameId) {
    var game = (0, gameStorage_1.getStoredGame)(gameId);
    if (!game)
        return;
    var allNations = __spreadArray(__spreadArray(__spreadArray([], (game.player1Nation ? [game.player1Nation] : []), true), (game.player2Nation ? [game.player2Nation] : []), true), game.aiNations, true);
    console.log("\n=== Nation Rankings ===");
    // GDP Ranking
    console.log("\nGDP Ranking:");
    __spreadArray([], allNations, true).sort(function (a, b) { return b.stats.gdp - a.stats.gdp; })
        .forEach(function (nation, i) {
        console.log("".concat(i + 1, ". ").concat(nation.name, ": ").concat(nation.stats.gdp));
    });
    // Freedom Rankings
    console.log("\nFreedom Index Ranking:");
    __spreadArray([], allNations, true).sort(function (a, b) {
        var totalA = a.stats.economicFreedom + a.stats.civilRights + a.stats.politicalFreedom;
        var totalB = b.stats.economicFreedom + b.stats.civilRights + b.stats.politicalFreedom;
        return totalB - totalA;
    })
        .forEach(function (nation, i) {
        var total = nation.stats.economicFreedom + nation.stats.civilRights + nation.stats.politicalFreedom;
        console.log("".concat(i + 1, ". ").concat(nation.name, ": ").concat(total));
    });
}

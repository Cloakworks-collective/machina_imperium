"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var PromptSync = require("prompt-sync");
var play_1 = require("./play");
var gameService_1 = require("./gameService");
var prompt = PromptSync({ sigint: true });
function startGame() {
    return __awaiter(this, void 0, void 0, function () {
        var choice, gameId, player1Nation, gameId, game, player2Nation, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!true) return [3 /*break*/, 15];
                    console.clear();
                    console.log("Nation Builder 2025 - Multiplayer\n");
                    console.log("1. Create new game");
                    console.log("2. Join existing game");
                    console.log("3. List active games");
                    console.log("4. Exit");
                    choice = prompt("\nSelect an option: ");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 13, , 14]);
                    if (!(choice === "1")) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, play_1.setupGame)()];
                case 2:
                    gameId = _a.sent();
                    return [4 /*yield*/, (0, play_1.createPlayerNation)(gameId, true)];
                case 3:
                    player1Nation = _a.sent();
                    if (!player1Nation) return [3 /*break*/, 5];
                    console.log("\nWaiting for Player 2 to join with game ID:", gameId);
                    console.log("\nYour turn to play!");
                    return [4 /*yield*/, (0, play_1.playGame)(player1Nation, gameId)];
                case 4:
                    _a.sent();
                    console.log("\nYour turn is complete! Waiting for Player 2 to join...");
                    console.log("Remember your Game ID:", gameId);
                    prompt("\nPress Enter to return to menu...");
                    _a.label = 5;
                case 5: return [3 /*break*/, 12];
                case 6:
                    if (!(choice === "2")) return [3 /*break*/, 11];
                    // Join existing game
                    console.log("\nEnter game ID:");
                    gameId = prompt("> ").trim().toUpperCase();
                    game = (0, gameService_1.getGame)(gameId);
                    if (!game) {
                        console.log("Game not found!");
                        prompt("\nPress Enter to continue...");
                        return [3 /*break*/, 0];
                    }
                    if (game.player2Nation) {
                        console.log("Game is full!");
                        prompt("\nPress Enter to continue...");
                        return [3 /*break*/, 0];
                    }
                    return [4 /*yield*/, (0, play_1.createPlayerNation)(gameId, false)];
                case 7:
                    player2Nation = _a.sent();
                    if (!player2Nation) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, play_1.createAINations)(gameId)];
                case 8:
                    _a.sent();
                    if (!(0, gameService_1.isGameReady)(gameId)) return [3 /*break*/, 10];
                    console.log("\nGame is ready! All nations have been created.");
                    console.log("\nYour turn to play!");
                    return [4 /*yield*/, (0, play_1.playGame)(player2Nation, gameId)];
                case 9:
                    _a.sent();
                    console.log("\nGame completed!");
                    prompt("\nPress Enter to return to menu...");
                    _a.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (choice === "3") {
                        (0, gameService_1.listActiveGames)();
                        prompt("\nPress Enter to continue...");
                    }
                    else if (choice === "4") {
                        console.log("\nThanks for playing!");
                        return [3 /*break*/, 15];
                    }
                    _a.label = 12;
                case 12: return [3 /*break*/, 14];
                case 13:
                    error_1 = _a.sent();
                    console.error("An error occurred:", error_1);
                    prompt("\nPress Enter to continue...");
                    return [3 /*break*/, 14];
                case 14: return [3 /*break*/, 0];
                case 15: return [2 /*return*/];
            }
        });
    });
}
startGame().catch(console.error);

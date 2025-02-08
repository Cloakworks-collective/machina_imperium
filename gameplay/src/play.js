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
exports.setupGame = setupGame;
exports.createPlayerNation = createPlayerNation;
exports.createAINations = createAINations;
exports.generateRandomNationName = generateRandomNationName;
exports.playGame = playGame;
// play.ts
var PromptSync = require("prompt-sync");
var issues_1 = require("./db/issues");
var birth_1 = require("./birth");
var helper_1 = require("./helper");
var ideologies_1 = require("./db/ideologies");
var gameService_1 = require("./gameService");
var gameStorage_1 = require("./gameStorage");
var gameInfo_1 = require("./gameInfo");
var prompt = PromptSync({ sigint: true });
function replacePlaceholders(text, nationName) {
    return text.replace(/\${nationName}/g, nationName);
}
function promptForIssue(issue, nationName) {
    console.log("\n=== ".concat(issue.name, " ==="));
    console.log(replacePlaceholders(issue.description, nationName));
    issue.options.forEach(function (option) {
        console.log("\nOption ".concat(option.id, ": ").concat(option.name));
        console.log("Description: ".concat(replacePlaceholders(option.description, nationName)));
    });
    var input = prompt("\nChoose an option (1 - ".concat(issue.options.length, "): "));
    var choice = parseInt(input, 10);
    if (isNaN(choice) || choice < 1 || choice > issue.options.length) {
        console.log("Invalid choice. Skipping this issue.");
        return null;
    }
    return issue.options.find(function (o) { return o.id === choice; }) || null;
}
function chooseIdeologyForPersonality(personality) {
    var authScore = personality.attributes.authoritarianism;
    var progScore = personality.attributes.progressiveness;
    var bestMatch = ideologies_1.ideologies[0];
    var smallestDiff = Number.MAX_VALUE;
    for (var _i = 0, ideologies_2 = ideologies_1.ideologies; _i < ideologies_2.length; _i++) {
        var ideology = ideologies_2[_i];
        var diff = Math.abs(ideology.politicalFreedom - (100 - authScore)) +
            Math.abs(ideology.civilRights - progScore);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            bestMatch = ideology;
        }
    }
    return bestMatch;
}
function findNewIdeology(stats) {
    var currentPoint = {
        x: stats.economicFreedom,
        y: stats.civilRights,
        z: stats.politicalFreedom
    };
    var closestIdeology = ideologies_1.ideologies[0];
    var minDistance = Number.MAX_VALUE;
    for (var _i = 0, ideologies_3 = ideologies_1.ideologies; _i < ideologies_3.length; _i++) {
        var ideology = ideologies_3[_i];
        var ideologyPoint = {
            x: ideology.economicFreedom,
            y: ideology.civilRights,
            z: ideology.politicalFreedom
        };
        var distance = (0, helper_1.euclideanDistance)(currentPoint, ideologyPoint);
        if (distance < minDistance) {
            minDistance = distance;
            closestIdeology = ideology;
        }
    }
    return closestIdeology;
}
function calculateChanges(originalNation, finalNation) {
    return {
        economicFreedom: finalNation.stats.economicFreedom - originalNation.stats.economicFreedom,
        civilRights: finalNation.stats.civilRights - originalNation.stats.civilRights,
        politicalFreedom: finalNation.stats.politicalFreedom - originalNation.stats.politicalFreedom,
        gdp: finalNation.stats.gdp - originalNation.stats.gdp
    };
}
function getImpactEmoji(value) {
    if (value >= 5)
        return "🚀";
    if (value >= 2)
        return "📈";
    if (value >= -1)
        return "😐";
    if (value >= -4)
        return "📉";
    return "💥";
}
function getGDPEmoji(value) {
    if (value >= 200)
        return "🤑";
    if (value >= 50)
        return "💰";
    if (value >= -49)
        return "💵";
    if (value >= -200)
        return "🪙";
    return "📉";
}
function displayNationStatus(nation) {
    console.log("\n=== The State of ".concat(nation.name, " ==="));
    console.log("Current Ideology: ".concat(nation.ideology.name));
    console.log("Ruler Type: ".concat(nation.rulerType));
    if (nation.personality) {
        console.log("Leader: ".concat(nation.personality.name));
    }
    console.log("Economic Freedom:    ".concat(nation.stats.economicFreedom, " ").concat(getImpactEmoji(nation.stats.economicFreedom)));
    console.log("Civil Rights:        ".concat(nation.stats.civilRights, " ").concat(getImpactEmoji(nation.stats.civilRights)));
    console.log("Political Freedom:   ".concat(nation.stats.politicalFreedom, " ").concat(getImpactEmoji(nation.stats.politicalFreedom)));
    console.log("GDP:                 ".concat(nation.stats.gdp, " ").concat(getGDPEmoji(nation.stats.gdp)));
}
function setupGame() {
    return __awaiter(this, void 0, void 0, function () {
        var personalities, gameId;
        return __generator(this, function (_a) {
            console.log("Welcome to Nation Builder 2025 - Multiplayer!\n");
            personalities = (0, gameService_1.selectPersonalities)(3);
            console.log("\nSelected AI Leaders:");
            personalities.forEach(function (p, i) {
                console.log("\n".concat(i + 1, ". ").concat(p.name, " - ").concat(p.description));
                console.log("Attributes:");
                Object.entries(p.attributes).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    console.log("  ".concat(key, ": ").concat(value));
                });
            });
            gameId = (0, gameService_1.createGame)(personalities);
            console.log("\nGame created! Your game ID is: ".concat(gameId));
            return [2 /*return*/, gameId];
        });
    });
}
function promptForNationName() {
    return __awaiter(this, void 0, void 0, function () {
        var name;
        return __generator(this, function (_a) {
            console.log("What would you like to name your nation?");
            name = prompt("> ").trim();
            if (!name) {
                throw new Error("Nation name cannot be empty");
            }
            return [2 /*return*/, name];
        });
    });
}
function promptForIdeology() {
    return __awaiter(this, void 0, void 0, function () {
        var _loop_1, state_1;
        return __generator(this, function (_a) {
            console.log("\nChoose your ideology (enter number 1-27):");
            ideologies_1.ideologies.forEach(function (i) {
                console.log("".concat(i.uid, ". ").concat(i.name));
            });
            _loop_1 = function () {
                var choice = parseInt(prompt("> "));
                var ideology = ideologies_1.ideologies.find(function (i) { return i.uid === choice; });
                if (ideology)
                    return { value: ideology };
                console.log("Invalid choice. Please try again.");
            };
            while (true) {
                state_1 = _loop_1();
                if (typeof state_1 === "object")
                    return [2 /*return*/, state_1.value];
            }
            return [2 /*return*/];
        });
    });
}
function createPlayerNation(gameId_1) {
    return __awaiter(this, arguments, void 0, function (gameId, isPlayer1) {
        var game, nationName, ideology;
        if (isPlayer1 === void 0) { isPlayer1 = true; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    game = (0, gameService_1.getGame)(gameId);
                    if (!game) {
                        console.error("Game not found!");
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, promptForNationName()];
                case 1:
                    nationName = _a.sent();
                    return [4 /*yield*/, promptForIdeology()];
                case 2:
                    ideology = _a.sent();
                    return [2 /*return*/, (0, gameService_1.createNation)(gameId, nationName, ideology, 'human')];
            }
        });
    });
}
function createAINations(gameId) {
    return __awaiter(this, void 0, void 0, function () {
        var game, _i, _a, personality, ideology, nationName;
        return __generator(this, function (_b) {
            game = (0, gameService_1.getGame)(gameId);
            if (!game)
                return [2 /*return*/];
            for (_i = 0, _a = game.selectedPersonalities; _i < _a.length; _i++) {
                personality = _a[_i];
                ideology = chooseIdeologyForPersonality(personality);
                nationName = "".concat(personality.name, "'s Domain");
                (0, gameService_1.createNation)(gameId, nationName, ideology, 'AI', personality);
            }
            return [2 /*return*/];
        });
    });
}
function generateRandomNationName() {
    var sillyPrefixes = ["United Republic of", "Democratic People's", "Glorious Empire of", "Most Serene Republic of", "Grand Duchy of"];
    var sillySuffixes = ["topia", "land", "stan", "ville", "vania"];
    var prefix = sillyPrefixes[Math.floor(Math.random() * sillyPrefixes.length)];
    var suffix = sillySuffixes[Math.floor(Math.random() * sillySuffixes.length)];
    return "".concat(prefix, " Banana").concat(suffix);
}
function playGame(nation, gameId) {
    return __awaiter(this, void 0, void 0, function () {
        var originalNation, currentNation, _i, _a, issue, selectedOption, newIdeology, changes, game;
        var _b, _c;
        return __generator(this, function (_d) {
            console.log("\nWelcome to ".concat(nation.name, "!\n"));
            originalNation = __assign({}, nation);
            currentNation = nation;
            for (_i = 0, _a = issues_1.issuesData.issues; _i < _a.length; _i++) {
                issue = _a[_i];
                selectedOption = promptForIssue(issue, nation.name);
                if (selectedOption) {
                    currentNation = (0, birth_1.updateNationStats)(currentNation, selectedOption.impact);
                    console.log("\nAfter this decision:");
                    displayNationStatus(currentNation);
                }
            }
            newIdeology = findNewIdeology(currentNation.stats);
            changes = calculateChanges(originalNation, currentNation);
            console.log("\n=== Aggregate Changes ===");
            console.log("Previous Government Type: ".concat(originalNation.ideology.name));
            console.log("New Government Type: ".concat(newIdeology.name));
            console.log("\nChanges in Freedom Indices:");
            console.log("Economic Freedom: ".concat(changes.economicFreedom >= 0 ? '+' : '').concat(changes.economicFreedom));
            console.log("Civil Rights: ".concat(changes.civilRights >= 0 ? '+' : '').concat(changes.civilRights));
            console.log("Political Freedom: ".concat(changes.politicalFreedom >= 0 ? '+' : '').concat(changes.politicalFreedom));
            console.log("GDP: ".concat(changes.gdp >= 0 ? '+' : '').concat(changes.gdp));
            if (originalNation.ideology.name !== newIdeology.name) {
                console.log("\n\uD83D\uDD04 Your nation has evolved from a ".concat(originalNation.ideology.name, " to a ").concat(newIdeology.name, "!"));
            }
            else {
                console.log("\n\u2728 Your nation remains a ".concat(newIdeology.name));
            }
            // Update nation's ideology
            currentNation = __assign(__assign({}, currentNation), { ideology: newIdeology });
            game = (0, gameService_1.getGame)(gameId);
            if (game) {
                if (((_b = game.player1Nation) === null || _b === void 0 ? void 0 : _b.name) === nation.name) {
                    game.player1Nation = currentNation;
                }
                else if (((_c = game.player2Nation) === null || _c === void 0 ? void 0 : _c.name) === nation.name) {
                    game.player2Nation = currentNation;
                }
                (0, gameStorage_1.storeGame)(gameId, game);
                (0, gameInfo_1.displayGameInfo)(gameId);
                (0, gameInfo_1.compareNations)(gameId);
            }
            return [2 /*return*/, currentNation];
        });
    });
}

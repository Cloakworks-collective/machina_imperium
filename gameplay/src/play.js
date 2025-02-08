"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomNationName = generateRandomNationName;
exports.playGame = playGame;
// play.ts
var PromptSync = require("prompt-sync");
var issues_1 = require("./db/issues");
var birth_1 = require("./birth");
var helper_1 = require("./helper");
var ideologies_1 = require("./db/ideologies");
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
    console.log("Economic Freedom:    ".concat(nation.stats.economicFreedom, " ").concat(getImpactEmoji(nation.stats.economicFreedom)));
    console.log("Civil Rights:        ".concat(nation.stats.civilRights, " ").concat(getImpactEmoji(nation.stats.civilRights)));
    console.log("Political Freedom:   ".concat(nation.stats.politicalFreedom, " ").concat(getImpactEmoji(nation.stats.politicalFreedom)));
    console.log("GDP:                 ".concat(nation.stats.gdp, " ").concat(getGDPEmoji(nation.stats.gdp)));
}
function classifyNewIdeology(nation) {
    var _a = nation.stats, economicFreedom = _a.economicFreedom, civilRights = _a.civilRights, politicalFreedom = _a.politicalFreedom;
    var currentPoint = {
        x: economicFreedom,
        y: civilRights,
        z: politicalFreedom
    };
    var closestIdeology = ideologies_1.ideologies[0];
    var minDistance = Number.MAX_VALUE;
    for (var _i = 0, ideologies_2 = ideologies_1.ideologies; _i < ideologies_2.length; _i++) {
        var ideology = ideologies_2[_i];
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
function generateRandomNationName() {
    var sillyPrefixes = ["United Republic of", "Democratic People's", "Glorious Empire of", "Most Serene Republic of", "Grand Duchy of"];
    var sillySuffixes = ["topia", "land", "stan", "ville", "vania"];
    var prefix = sillyPrefixes[Math.floor(Math.random() * sillyPrefixes.length)];
    var suffix = sillySuffixes[Math.floor(Math.random() * sillySuffixes.length)];
    return "".concat(prefix, " Banana").concat(suffix);
}
function playGame(nationName, ideology) {
    var nation = (0, birth_1.createNation)(nationName, ideology);
    if (!nation) {
        console.error("Failed to create nation");
        return;
    }
    console.log("\nWelcome to ".concat(nation.name, "!\n"));
    displayNationStatus(nation);
    var currentNation = nation;
    for (var _i = 0, _a = issues_1.issuesData.issues; _i < _a.length; _i++) {
        var issue = _a[_i];
        var selectedOption = promptForIssue(issue, nationName);
        if (selectedOption) {
            currentNation = (0, birth_1.updateNationStats)(currentNation, selectedOption.impact);
            console.log("\nAfter this decision:");
            displayNationStatus(currentNation);
        }
    }
    var newIdeology = classifyNewIdeology(currentNation);
    console.log("\n=== Final Results ===");
    console.log("\nStarting as: ".concat(ideology.name));
    console.log("Your nation has evolved into: ".concat(newIdeology.name, "!"));
    if (newIdeology.uid === ideology.uid) {
        console.log("You've maintained your original ideology!");
    }
    else {
        console.log("Your choices have led to an ideological shift!");
        console.log("\nIdeological Changes:");
        console.log("Economic Freedom: ".concat(ideology.economicFreedom, " \u2192 ").concat(newIdeology.economicFreedom));
        console.log("Civil Rights: ".concat(ideology.civilRights, " \u2192 ").concat(newIdeology.civilRights));
        console.log("Political Freedom: ".concat(ideology.politicalFreedom, " \u2192 ").concat(newIdeology.politicalFreedom));
    }
    displayNationStatus(currentNation);
}

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNationName = validateNationName;
exports.createNation = createNation;
exports.updateNationStats = updateNationStats;
exports.getRandomIdeology = getRandomIdeology;
exports.listIdeologies = listIdeologies;
exports.getIdeologyByUID = getIdeologyByUID;
// birth.ts
var ideologies_1 = require("./db/ideologies");
// Default initial GDP value
var DEFAULT_GDP = 5000;
/**
 * Validates a nation name
 * @param name The proposed nation name
 * @returns boolean indicating if name is valid
 */
function validateNationName(name) {
    return name.length > 0 && name.length <= 50;
}
/**
 * Creates initial nation stats based on ideology
 * @param ideology The chosen ideology
 * @returns Initial nation stats
 */
function createInitialStats(ideology) {
    return {
        economicFreedom: ideology.economicFreedom,
        civilRights: ideology.civilRights,
        politicalFreedom: ideology.politicalFreedom,
        gdp: DEFAULT_GDP
    };
}
/**
 * Creates a new nation with given name and ideology
 * @param name Nation name
 * @param ideology Chosen ideology
 * @returns New nation object
 */
function createNation(name, ideology, rulerType, personality) {
    if (rulerType === void 0) { rulerType = 'human'; }
    if (!validateNationName(name)) {
        console.error("Invalid nation name");
        return null;
    }
    return {
        name: name,
        ideology: ideology,
        rulerType: rulerType,
        personality: personality,
        stats: createInitialStats(ideology)
    };
}
/**
 * Updates nation stats based on impacts
 * @param nation Current nation
 * @param impacts Impact values to apply
 * @returns Updated nation
 */
function updateNationStats(nation, impacts) {
    var newStats = {
        economicFreedom: Math.max(0, Math.min(100, nation.stats.economicFreedom + impacts.economicFreedom)),
        civilRights: Math.max(0, Math.min(100, nation.stats.civilRights + impacts.civilRights)),
        politicalFreedom: Math.max(0, Math.min(100, nation.stats.politicalFreedom + impacts.politicalFreedom)),
        gdp: nation.stats.gdp + impacts.gdp
    };
    return __assign(__assign({}, nation), { stats: newStats });
}
function getRandomIdeology() {
    return ideologies_1.ideologies[Math.floor(Math.random() * ideologies_1.ideologies.length)];
}
function listIdeologies() {
    console.log("\nAvailable Ideologies:");
    for (var _i = 0, ideologies_2 = ideologies_1.ideologies; _i < ideologies_2.length; _i++) {
        var ideology = ideologies_2[_i];
        console.log("\n#".concat(ideology.uid, " - ").concat(ideology.name));
        console.log("  Economic Freedom: ".concat(ideology.economicFreedom));
        console.log("  Civil Rights: ".concat(ideology.civilRights));
        console.log("  Political Freedom: ".concat(ideology.politicalFreedom));
    }
}
function getIdeologyByUID(uid) {
    return ideologies_1.ideologies.find(function (ideology) { return ideology.uid === uid; }) || null;
}

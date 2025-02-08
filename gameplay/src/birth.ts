import { ideologies } from "./db/ideologies";

interface Ideology {
  uid: number;
  name: string;
  economicFreedom: number;
  civilRights: number;
  politicalFreedom: number;
}

interface Nation {
  name: string;
  ideology: Ideology;
  stats: {
    economicFreedom: number;
    civilRights: number;
    politicalFreedom: number;
    gdp: number;
  };
}

// Default initial GDP value
const DEFAULT_GDP = 5000;

/**
 * Gets a random ideology from the available options
 */
export function getRandomIdeology(): Ideology {
  return ideologies[Math.floor(Math.random() * ideologies.length)];
}

/**
 * Lists all available ideologies with their values
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
 * @param uid The unique identifier of the ideology
 * @returns The ideology or null if not found
 */
export function getIdeologyByUID(uid: number): Ideology | null {
  return ideologies.find(ideology => ideology.uid === uid) || null;
}

/**
 * Validates a nation name
 * @param name The proposed nation name
 * @returns boolean indicating if name is valid
 */
export function validateNationName(name: string): boolean {
  return name.length > 0 && name.length <= 50;
}

/**
 * Creates initial nation stats based on ideology
 * @param ideology The chosen ideology
 * @returns Initial nation stats
 */
function createInitialStats(ideology: Ideology) {
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
export function createNation(name: string, ideology: Ideology): Nation | null {
  if (!validateNationName(name)) {
    console.error("Invalid nation name");
    return null;
  }

  return {
    name,
    ideology,
    stats: createInitialStats(ideology)
  };
}

/**
 * Updates nation stats based on impacts
 * @param nation Current nation
 * @param impacts Impact values to apply
 * @returns Updated nation
 */
export function updateNationStats(
  nation: Nation,
  impacts: {
    economicFreedom: number;
    civilRights: number;
    politicalFreedom: number;
    gdp: number;
  }
): Nation {
  const newStats = {
    economicFreedom: Math.max(0, Math.min(100, nation.stats.economicFreedom + impacts.economicFreedom)),
    civilRights: Math.max(0, Math.min(100, nation.stats.civilRights + impacts.civilRights)),
    politicalFreedom: Math.max(0, Math.min(100, nation.stats.politicalFreedom + impacts.politicalFreedom)),
    gdp: nation.stats.gdp + impacts.gdp
  };

  return {
    ...nation,
    stats: newStats
  };
}

export { ideologies };
export type { Nation, Ideology };
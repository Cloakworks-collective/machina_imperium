export type GameStatus = 'created' | 'player1_completed' | 
  'player2_completed' | 'ready' | 'processing' | 
  'ready_for_processing_alliance' | 'completed_alliance_processing' | 'completed';

interface Decision {
  issueId: number;
  issueName: string;
  chosenOptionId: number;
  chosenOptionName: string;
  description: string;
}

interface Personality {
  uid: number;
  name: string;
  nationName: string;
  description: string;
  attributes: {
    progressiveness: number;
    authoritarianism: number;
    pragmatism: number;
    economicFocus: number;
    visionary: number;
    flexibility: number;
    loyalty: number;
  };
}

interface Ideology {
  uid: number;
  name: string;
  economicFreedom: number;
  civilRights: number;
  politicalFreedom: number;
}

interface GameState {
  id: string;
  status: GameStatus;
  player1Nation: Nation | null;
  player2Nation: Nation | null;
  aiNations: Nation[];
  selectedPersonalities: Personality[];
  alliances: {
    aiNationName: string;
    chosenAlly: string;
    reasoning: string;
  }[];
}

interface Nation {
  name: string;
  ideology: Ideology;
  rulerType: 'human' | 'AI';
  personality?: Personality;
  stats: {
    economicFreedom: number;
    civilRights: number;
    politicalFreedom: number;
    gdp: number;
  };
  decisions: Decision[];
}

interface Impact {
  economicFreedom: number;
  civilRights: number;
  politicalFreedom: number;
  gdp: number;
}

interface Option {
  id: number;
  name: string;
  description: string;
  impact: Impact;
}

interface Issue {
  id: number;
  name: string;
  description: string;
  options: Option[];
}

interface IssuesData {
  issues: Issue[];
}

interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type { 
  GameState, 
  Nation, 
  Ideology, 
  Personality, 
  Vector3D, 
  Impact, 
  Option, 
  Issue, 
  IssuesData,
  Decision 
};
interface Personality {
    uid: number;
    name: string;
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
    status: 'created' | 'player2_joined' | 'ready';
    player1Nation: Nation | null;
    player2Nation: Nation | null;
    aiNations: Nation[];
    selectedPersonalities: Personality[];
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
  }
  
  interface Vector3D {
    x: number;
    y: number;
    z: number;
  }
  
  export type { GameState, Nation, Ideology, Personality, Vector3D };
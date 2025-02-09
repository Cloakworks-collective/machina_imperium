# Machina Imperium

A multiplayer nation simulation game where players compete against AI-controlled nations led by historical personalities. Each decision shapes your nation's future and influences potential alliances.

## Game Overview

In Nation Builder 2025, players create and manage their own nations while competing and potentially allying with AI-controlled nations led by historical figures. The game combines strategic decision-making with dynamic AI interactions.

### Key Features

- Multiplayer gameplay with 2 human players
- AI-controlled nations with historical leader personalities
- Dynamic decision-making system
- Alliance formation based on national compatibility
- Ideology evolution based on decisions
- Statistical nation tracking and comparison

## Game Flow

1. **Game Creation**
   - Player 1 creates a game
   - Selects nation name and initial ideology
   - Makes decisions on various national issues
   - Receives a unique game ID

2. **Player 2 Joining**
   - Joins using the game ID
   - Creates their own nation
   - Makes national decisions
   
3. **AI Processing**
   - Historical AI leaders make decisions for their nations
   - Each AI personality influences decision-making
   - Nations evolve based on choices

4. **Alliance Formation**
   - AI nations analyze compatibility with human nations
   - Form alliances based on:
     - Economic Freedom alignment
     - Civil Rights compatibility
     - Political Freedom similarity
     - Overall ideology match

## AI Agents

### The Governor (governor.ts)
An AI agent responsible for nation management and decision-making.

**Features:**
- Makes decisions based on leader personality
- Considers nation's current metrics
- Evaluates options impact on:
  - Economic freedom
  - Civil rights
  - Political freedom
  - GDP

### The Diplomat (diplomat.ts)
An AI agent handling international relations and alliance formation.

**Features:**
- Analyzes nation compatibility
- Compares freedom metrics
- Forms alliances based on:
  - Statistical alignment
  - Ideological compatibility
  - National metrics

## Ideologies and Metrics

Nations are measured on three key metrics:
- **Economic Freedom** (0-100)
- **Civil Rights** (0-100)
- **Political Freedom** (0-100)

These metrics evolve based on decisions and determine the nation's governing ideology, ranging from "Psychotic Dictatorship" to "Anarchy" with 27 possible forms of government.

## Historical Leaders

The game features various historical personalities including:
- Genghis Khan (The Mongol Empire)
- Napoleon Bonaparte (Imperial France)
- Alexander the Great (Macedonian Empire)
- Winston Churchill (British Empire)
- Nelson Mandela (New South Africa)
- Margaret Thatcher (Neo-Britain)
- Joseph Stalin (Soviet Union)
- Jawaharlal Nehru (Modern India)

Each leader has unique attributes affecting their decision-making:
- Progressiveness
- Authoritarianism
- Pragmatism
- Economic Focus
- Visionary Thinking
- Flexibility
- Loyalty

## Game States

The game progresses through various states:
1. `created` - Initial game creation
2. `player1_completed` - First player finished
3. `player2_completed` - Second player finished
4. `ready` - Ready for AI processing
5. `processing` - AI nations making decisions
6. `ready_for_processing_alliance` - Ready for alliance formation

## Technical Implementation

Built using:
- TypeScript
- LangChain for AI decision-making
- Zod for type validation
- OpenAI's GPT for AI personality simulation

## Command Menu Options

1. Create new game
2. Join existing game
3. List active games
4. Process the Game (AI decisions)
5. Show Nation Decisions
6. Process Alliances
7. Exit

## Future Enhancements

Potential areas for expansion:
- More historical personalities
- Additional policy decisions
- Economic simulation
- Military conflicts
- Trade agreements
- Cultural influence mechanics

## Getting Started

```bash
npm install
npm run dev
```

Follow the on-screen prompts to create or join a game.
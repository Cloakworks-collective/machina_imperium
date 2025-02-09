import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

import type { Nation, Personality, Issue, Option, Decision } from '../types';
import { issuesData } from '../db/issues';
import { updateNationStats } from '../helpers';
import { z } from "zod";

import dotenv from 'dotenv'; 
dotenv.config();

const llm = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

const verdict = z.object({
  issue: z.string().describe("The issue at hand"),
  chosen: z.number().describe("The chosen option identifier"),
  chosenStatement: z.string().describe("The chosen option statement"),
  reasoning: z.string().describe("The reasoning behind the choice"),
});

const structuredLlm = llm.withStructuredOutput(verdict, { name: "verdict" });

const decisionTemplate = PromptTemplate.fromTemplate(`
You are roleplaying as {personality_name}. Given your personality traits:
{personality_traits}

You are faced with this issue:
{issue_description}

Your options are:
{options}

Based on your personality and leadership style, which option would you choose.
`);

function formatPersonalityTraits(personality: Personality): string {
  return Object.entries(personality.attributes)
    .map(([trait, value]) => `${trait}: ${value}/10`)
    .join('\n');
}

function formatOptions(options: Option[]): string {
  return options
    .map(opt => `${opt.id}: ${opt.name}\n${opt.description}`)
    .join('\n\n');
}

async function getPersonalityDecision(
  personality: Personality,
  issue: Issue
): Promise<{ option: Option; decision: Decision }> {
  
  const prompt = await decisionTemplate.format({
    personality_name: personality.name,
    personality_traits: formatPersonalityTraits(personality),
    issue_description: issue.description.replace(/\${nationName}/g, personality.nationName),
    options: formatOptions(issue.options),
  });

  const response = await structuredLlm.invoke(prompt);

  console.log('response ------>', response);

  const chosenOption = issue.options.find(option => option.id === response.chosen) || issue.options[0];
  
  const decision: Decision = {
    issueId: issue.id,
    issueName: issue.name,
    chosenOptionId: chosenOption.id,
    chosenOptionName: chosenOption.name,
    description: chosenOption.description.replace(/\${nationName}/g, personality.nationName)
  };

  return { option: chosenOption, decision };
}

export async function playAINation(nation: Nation): Promise<Nation> {
  if (!nation.personality) {
    console.error("Nation does not have a personality assigned.");
    return nation;
  }

  const personality = nation.personality;
  console.log(`\n=== ${personality.name}'s Turn ===`);
  
  let currentNation: Nation = { 
    ...nation, 
    decisions: [] 
  };

  const issuesToHandle = issuesData.issues.slice(0, 2);

  for (const issue of issuesToHandle) {
    const result = await getPersonalityDecision(personality, issue);
    currentNation = updateNationStats(currentNation, result.option.impact);
    currentNation.decisions.push(result.decision);
  }

  return currentNation;
}
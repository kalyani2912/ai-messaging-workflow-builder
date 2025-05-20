// backend/src/services/agent1Service.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import openai from '../config/openaiConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// 1. Load and compile your JSON schema
const schemaPath = path.resolve(__dirname, '../schemas/workflowSpec.schema.json');
const schema     = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

// 2. Load your system prompt
const promptPath   = path.resolve(__dirname, '../prompts/agent1Prompt.txt');
const systemPrompt = fs.readFileSync(promptPath, 'utf8');

/**
 * Chat with OpenAI and extract a valid workflow spec.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<{assistantMessage: string, specComplete: boolean, spec: object|null}>}
 */
async function chat(messages) {
  // Prepend the system prompt
  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  // Call OpenAI
  const resp = await openai.createChatCompletion({
    model:    'gpt-3.5-turbo',
    messages: chatMessages,
  });

  const assistantMessage =
    resp.data.choices?.[0]?.message?.content?.trim() || '';

  // Try to parse & validate
  let spec         = null;
  let specComplete = false;

  try {
    const candidate = JSON.parse(assistantMessage);
    const valid     = validate(candidate);

    if (!valid) {
      console.error('Schema validation errors:', validate.errors);
    } else {
      spec         = candidate;
      specComplete = true;
    }
  } catch (err) {
    console.error('Failed to parse JSON from assistant:', err);
  }

  return { assistantMessage, specComplete, spec };
}

export default { 
    chat,
};

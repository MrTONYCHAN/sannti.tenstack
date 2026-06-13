import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  type UIMessage,
} from "ai";
import {
  buildCompanionSystemPrompt,
  createCompanionModel,
  getGoogleAiApiKey,
} from "./ai-gateway.server";
import { buildFallbackCompanionReply } from "./companion-fallback";
import { containsCrisisLanguage } from "./wellness-safety";

type FinishHandler = (args: {
  messages: UIMessage[];
  responseMessage?: UIMessage;
}) => void | Promise<void>;

function safeFinish(onFinish?: FinishHandler): FinishHandler | undefined {
  if (!onFinish) return undefined;
  return async (args) => {
    try {
      await onFinish(args);
    } catch (error) {
      console.error("[chat] onFinish failed", error);
    }
  };
}

function fallbackStreamResponse(
  messages: UIMessage[],
  text: string,
  onFinish?: FinishHandler,
) {
  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: ({ writer }) => {
      const id = crypto.randomUUID();
      writer.write({ type: "text-start", id });
      writer.write({ type: "text-delta", id, delta: text });
      writer.write({ type: "text-end", id });
    },
    onFinish: safeFinish(onFinish),
  });

  return createUIMessageStreamResponse({ stream });
}

async function generateCompanionReply(
  messages: UIMessage[],
  system: string,
  apiKey: string,
) {
  const modelMessages = await convertToModelMessages(messages);
  const { text } = await generateText({
    model: createCompanionModel(apiKey),
    system,
    messages: modelMessages,
  });
  return text.trim();
}

export async function createCompanionChatResponse(options: {
  messages: UIMessage[];
  latestUserText: string;
  onFinish?: FinishHandler;
}) {
  const { messages, latestUserText, onFinish } = options;
  const crisisDetected = containsCrisisLanguage(latestUserText);
  const system = buildCompanionSystemPrompt({ crisisDetected });
  const apiKey = getGoogleAiApiKey();

  if (apiKey) {
    try {
      const reply = await generateCompanionReply(messages, system, apiKey);
      if (reply) {
        return fallbackStreamResponse(messages, reply, onFinish);
      }
    } catch (error) {
      console.error("[chat] generateText failed, using offline reply", error);
    }
  } else {
    console.warn("[chat] GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }

  const fallback = buildFallbackCompanionReply(latestUserText, crisisDetected);
  return fallbackStreamResponse(messages, fallback, onFinish);
}

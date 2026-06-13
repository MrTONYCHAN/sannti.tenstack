import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  streamText,
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
    onFinish,
  });

  return createUIMessageStreamResponse({ stream });
}

export async function createCompanionChatResponse(options: {
  messages: UIMessage[];
  latestUserText: string;
  onFinish?: FinishHandler;
}) {
  const { messages, latestUserText, onFinish } = options;
  const crisisDetected = containsCrisisLanguage(latestUserText);
  const system = buildCompanionSystemPrompt({ crisisDetected });
  const modelMessages = await convertToModelMessages(messages);
  const key = getGoogleAiApiKey();

  if (key) {
    try {
      const result = streamText({
        model: createCompanionModel(key),
        system,
        messages: modelMessages,
      });

      return result.toUIMessageStreamResponse({
        originalMessages: messages,
        onFinish,
      });
    } catch (error) {
      console.error(
        "[chat] streaming failed, trying non-stream fallback",
        error,
      );
    }

    try {
      const { text } = await generateText({
        model: createCompanionModel(key),
        system,
        messages: modelMessages,
      });
      if (text.trim()) {
        return fallbackStreamResponse(messages, text.trim(), onFinish);
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

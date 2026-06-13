import fs from "node:fs";
import path from "node:path";
import type { Database } from "@/integrations/supabase/types";

type ChatThread = Database["public"]["Tables"]["chat_threads"]["Row"];
type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];
type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];

type StoreSnapshot = {
  threads: Record<string, ChatThread>;
  messages: Record<string, ChatMessage[]>;
  journals: Record<string, JournalEntry[]>;
};

const STORE_PATH = path.join(process.cwd(), ".saanti-local-store.json");

const threads = new Map<string, ChatThread>();
const messages = new Map<string, ChatMessage[]>();
const journals = new Map<string, JournalEntry[]>();

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  return crypto.randomUUID();
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function hydrateMaps(snapshot: StoreSnapshot) {
  threads.clear();
  messages.clear();
  journals.clear();

  for (const [id, thread] of Object.entries(snapshot.threads ?? {})) {
    threads.set(id, thread);
  }
  for (const [id, rows] of Object.entries(snapshot.messages ?? {})) {
    messages.set(id, rows);
  }
  for (const [userId, rows] of Object.entries(snapshot.journals ?? {})) {
    journals.set(userId, rows);
  }
}

function persistStore() {
  const snapshot: StoreSnapshot = {
    threads: Object.fromEntries(threads.entries()),
    messages: Object.fromEntries(messages.entries()),
    journals: Object.fromEntries(journals.entries()),
  };
  fs.writeFileSync(STORE_PATH, JSON.stringify(snapshot, null, 2), "utf8");
}

function loadStore() {
  if (!fs.existsSync(STORE_PATH)) return;
  try {
    const snapshot = JSON.parse(
      fs.readFileSync(STORE_PATH, "utf8"),
    ) as StoreSnapshot;
    hydrateMaps(snapshot);
  } catch (error) {
    console.error("[local-data] failed to load store", error);
  }
}

loadStore();

export function listThreads(userId: string) {
  return [...threads.values()]
    .filter((thread) => thread.user_id === userId)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function createThread(userId: string, title = "New conversation") {
  const timestamp = nowIso();
  const row: ChatThread = {
    id: newId(),
    user_id: userId,
    title,
    created_at: timestamp,
    updated_at: timestamp,
  };
  threads.set(row.id, row);
  messages.set(row.id, []);
  persistStore();
  return row;
}

export function ensureThread(
  userId: string,
  threadId: string,
  title = "Conversation",
) {
  const existing = threads.get(threadId);
  if (existing) {
    if (existing.user_id !== userId) {
      throw new Error("Thread not found");
    }
    return existing;
  }

  const timestamp = nowIso();
  const row: ChatThread = {
    id: threadId,
    user_id: userId,
    title,
    created_at: timestamp,
    updated_at: timestamp,
  };
  threads.set(threadId, row);
  if (!messages.has(threadId)) messages.set(threadId, []);
  persistStore();
  return row;
}

export function deleteThread(userId: string, id: string) {
  const thread = threads.get(id);
  if (!thread || thread.user_id !== userId) {
    throw new Error("Thread not found");
  }
  threads.delete(id);
  messages.delete(id);
  persistStore();
  return { ok: true as const };
}

export function renameThread(userId: string, id: string, title: string) {
  const thread = threads.get(id);
  if (!thread || thread.user_id !== userId) {
    throw new Error("Thread not found");
  }
  const updated = { ...thread, title, updated_at: nowIso() };
  threads.set(id, updated);
  persistStore();
  return { ok: true as const };
}

export function getThreadMessages(userId: string, threadId: string) {
  ensureThread(userId, threadId);
  return [...(messages.get(threadId) ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
}

export function getThread(userId: string, threadId: string) {
  const thread = threads.get(threadId);
  if (!thread || thread.user_id !== userId) return null;
  return thread;
}

export function insertChatMessage(
  userId: string,
  threadId: string,
  role: string,
  content: string,
) {
  const thread = ensureThread(userId, threadId);

  const row: ChatMessage = {
    id: newId(),
    thread_id: threadId,
    user_id: userId,
    role,
    content,
    created_at: nowIso(),
  };
  const threadMessages = messages.get(threadId) ?? [];
  threadMessages.push(row);
  messages.set(threadId, threadMessages);
  threads.set(threadId, { ...thread, updated_at: row.created_at });
  persistStore();
  return row;
}

export function listJournalEntries(userId: string) {
  return [...(journals.get(userId) ?? [])].sort((a, b) => {
    const dateCompare = b.entry_date.localeCompare(a.entry_date);
    if (dateCompare !== 0) return dateCompare;
    return b.created_at.localeCompare(a.created_at);
  });
}

export function insertJournalEntry(
  userId: string,
  entry: Omit<JournalEntry, "id" | "user_id" | "created_at" | "entry_date">,
) {
  const row: JournalEntry = {
    id: newId(),
    user_id: userId,
    created_at: nowIso(),
    entry_date: todayDate(),
    ...entry,
  };
  const userEntries = journals.get(userId) ?? [];
  userEntries.unshift(row);
  journals.set(userId, userEntries);
  persistStore();
  return row;
}

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

type LocalStoreState = {
  threads: Map<string, ChatThread>;
  messages: Map<string, ChatMessage[]>;
  journals: Map<string, JournalEntry[]>;
  hydrated: boolean;
};

const STORE_PATH =
  process.env.VERCEL === "1"
    ? path.join("/tmp", ".saanti-local-store.json")
    : path.join(process.cwd(), ".saanti-local-store.json");

const GLOBAL_KEY = "__saantiLocalStore";

function getStoreState(): LocalStoreState {
  const globalStore = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: LocalStoreState;
  };

  if (!globalStore[GLOBAL_KEY]) {
    globalStore[GLOBAL_KEY] = {
      threads: new Map(),
      messages: new Map(),
      journals: new Map(),
      hydrated: false,
    };
  }

  const store = globalStore[GLOBAL_KEY];
  if (!store.hydrated) {
    hydrateFromDisk(store);
    store.hydrated = true;
  }

  return store;
}

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  return crypto.randomUUID();
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function hydrateMaps(store: LocalStoreState, snapshot: StoreSnapshot) {
  store.threads.clear();
  store.messages.clear();
  store.journals.clear();

  for (const [id, thread] of Object.entries(snapshot.threads ?? {})) {
    store.threads.set(id, thread);
  }
  for (const [id, rows] of Object.entries(snapshot.messages ?? {})) {
    store.messages.set(id, rows);
  }
  for (const [userId, rows] of Object.entries(snapshot.journals ?? {})) {
    store.journals.set(userId, rows);
  }
}

function snapshotFromStore(store: LocalStoreState): StoreSnapshot {
  return {
    threads: Object.fromEntries(store.threads.entries()),
    messages: Object.fromEntries(store.messages.entries()),
    journals: Object.fromEntries(store.journals.entries()),
  };
}

function persistStore(store: LocalStoreState) {
  try {
    fs.writeFileSync(
      STORE_PATH,
      JSON.stringify(snapshotFromStore(store), null, 2),
      "utf8",
    );
  } catch (error) {
    console.warn("[local-data] could not persist store", error);
  }
}

function hydrateFromDisk(store: LocalStoreState) {
  try {
    if (!fs.existsSync(STORE_PATH)) return;
    const snapshot = JSON.parse(
      fs.readFileSync(STORE_PATH, "utf8"),
    ) as StoreSnapshot;
    hydrateMaps(store, snapshot);
  } catch (error) {
    console.warn("[local-data] could not load store", error);
  }
}

export function listThreads(userId: string) {
  const store = getStoreState();
  return [...store.threads.values()]
    .filter((thread) => thread.user_id === userId)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function createThread(userId: string, title = "New conversation") {
  const store = getStoreState();
  const timestamp = nowIso();
  const row: ChatThread = {
    id: newId(),
    user_id: userId,
    title,
    created_at: timestamp,
    updated_at: timestamp,
  };
  store.threads.set(row.id, row);
  store.messages.set(row.id, []);
  persistStore(store);
  return row;
}

export function ensureThread(
  userId: string,
  threadId: string,
  title = "Conversation",
) {
  const store = getStoreState();
  const existing = store.threads.get(threadId);
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
  store.threads.set(threadId, row);
  if (!store.messages.has(threadId)) store.messages.set(threadId, []);
  persistStore(store);
  return row;
}

export function deleteThread(userId: string, id: string) {
  const store = getStoreState();
  const thread = store.threads.get(id);
  if (!thread || thread.user_id !== userId) {
    throw new Error("Thread not found");
  }
  store.threads.delete(id);
  store.messages.delete(id);
  persistStore(store);
  return { ok: true as const };
}

export function renameThread(userId: string, id: string, title: string) {
  const store = getStoreState();
  const thread = store.threads.get(id);
  if (!thread || thread.user_id !== userId) {
    throw new Error("Thread not found");
  }
  const updated = { ...thread, title, updated_at: nowIso() };
  store.threads.set(id, updated);
  persistStore(store);
  return { ok: true as const };
}

export function getThreadMessages(userId: string, threadId: string) {
  ensureThread(userId, threadId);
  const store = getStoreState();
  return [...(store.messages.get(threadId) ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
}

export function getThread(userId: string, threadId: string) {
  const store = getStoreState();
  const thread = store.threads.get(threadId);
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
  const store = getStoreState();

  const row: ChatMessage = {
    id: newId(),
    thread_id: threadId,
    user_id: userId,
    role,
    content,
    created_at: nowIso(),
  };
  const threadMessages = store.messages.get(threadId) ?? [];
  threadMessages.push(row);
  store.messages.set(threadId, threadMessages);
  store.threads.set(threadId, { ...thread, updated_at: row.created_at });
  persistStore(store);
  return row;
}

export function listJournalEntries(userId: string) {
  const store = getStoreState();
  return [...(store.journals.get(userId) ?? [])].sort((a, b) => {
    const dateCompare = b.entry_date.localeCompare(a.entry_date);
    if (dateCompare !== 0) return dateCompare;
    return b.created_at.localeCompare(a.created_at);
  });
}

export function insertJournalEntry(
  userId: string,
  entry: Omit<JournalEntry, "id" | "user_id" | "created_at" | "entry_date">,
) {
  const store = getStoreState();
  const row: JournalEntry = {
    id: newId(),
    user_id: userId,
    created_at: nowIso(),
    entry_date: todayDate(),
    ...entry,
  };
  const userEntries = store.journals.get(userId) ?? [];
  userEntries.unshift(row);
  store.journals.set(userId, userEntries);
  persistStore(store);
  return row;
}

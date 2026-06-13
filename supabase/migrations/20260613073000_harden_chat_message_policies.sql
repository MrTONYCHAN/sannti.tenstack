DROP POLICY IF EXISTS "own messages" ON public.chat_messages;

CREATE POLICY "select own messages in own threads"
ON public.chat_messages
FOR SELECT
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.chat_threads
    WHERE chat_threads.id = chat_messages.thread_id
      AND chat_threads.user_id = auth.uid()
  )
);

CREATE POLICY "insert own messages in own threads"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.chat_threads
    WHERE chat_threads.id = chat_messages.thread_id
      AND chat_threads.user_id = auth.uid()
  )
);

CREATE POLICY "update own messages in own threads"
ON public.chat_messages
FOR UPDATE
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.chat_threads
    WHERE chat_threads.id = chat_messages.thread_id
      AND chat_threads.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.chat_threads
    WHERE chat_threads.id = chat_messages.thread_id
      AND chat_threads.user_id = auth.uid()
  )
);

CREATE POLICY "delete own messages in own threads"
ON public.chat_messages
FOR DELETE
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.chat_threads
    WHERE chat_threads.id = chat_messages.thread_id
      AND chat_threads.user_id = auth.uid()
  )
);

ALTER TABLE public.journal_entries
  ADD CONSTRAINT journal_entries_ai_sentiment_check
  CHECK (
    ai_sentiment IS NULL
    OR ai_sentiment IN ('positive', 'neutral', 'mixed', 'negative', 'distressed')
  );

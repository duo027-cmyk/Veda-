import { Message } from '../types';

/**
 * Robust alignment and merging protocol for chat history (Anti-loss & Self-healing sync).
 * It prioritizes local messages for newer typed/pending segments while fully syncing completed
 * and finalized server segments, eliminating stuck streaming loaders on page refreshes.
 */
export function mergeChatHistory(localMsgs: Message[], serverMsgs: Message[]): Message[] {
  if (!serverMsgs || serverMsgs.length === 0) {
    // If server has cleared its history, we should also clear the local messages,
    // EXCEPT if we are currently streaming or have active local-only messages.
    const isStreamingAny = localMsgs.some(m => m.isStreaming);
    if (isStreamingAny) {
      return localMsgs;
    }
    return [];
  }

  // Optimize: if local has nothing, just return server
  if (localMsgs.length === 0) {
    return serverMsgs;
  }

  // Establish a timeline.
  // The server's list is the source of truth for the absolute latest up to 10 messages.
  const oldestServer = serverMsgs[0];
  const oldestServerTime = oldestServer.ts || 0;
  const latestServerTime = serverMsgs[serverMsgs.length - 1].ts || 0;

  // Split local messages into distinct chronological vectors:
  // 1. "Historic" messages: messages that are strictly older than oldestServerTime.
  // 2. "Active/Reconcilable" messages: messages that overlap with the server's time window.
  // 3. "Dangling/Newer" messages: messages that are newer than the latest server message.
  const historicLocal = localMsgs.filter(m => (m.ts || 0) < oldestServerTime);
  const reconcilableLocal = localMsgs.filter(m => (m.ts || 0) >= oldestServerTime && (m.ts || 0) <= latestServerTime);
  const newerLocal = localMsgs.filter(m => (m.ts || 0) > latestServerTime && !m.isStreaming);

  const reconciledMiddle: Message[] = [];
  const processedLocalIds = new Set<string>();

  for (const sMsg of serverMsgs) {
    // Find matching local message
    const match = reconcilableLocal.find(lMsg => 
      !processedLocalIds.has(lMsg.id || "") &&
      lMsg.role === sMsg.role &&
      (lMsg.id === sMsg.id || lMsg.text === sMsg.text || lMsg.isStreaming || sMsg.text.startsWith(lMsg.text))
    );

    if (match) {
      processedLocalIds.add(match.id || "");
      
      // Merge: preserve local ID if client-created, but update with server's finalized fields
      // and explicitly align isStreaming with server's status (healing reloads/network failures)
      reconciledMiddle.push({
        ...match,
        ...sMsg,
        id: sMsg.id || match.id,
        isStreaming: sMsg.isStreaming !== undefined ? sMsg.isStreaming : false
      });
    } else {
      reconciledMiddle.push(sMsg);
    }
  }

  // Combine they in order: historic + reconciled + newer local
  return [...historicLocal, ...reconciledMiddle, ...newerLocal];
}

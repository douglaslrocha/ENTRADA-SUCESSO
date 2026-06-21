import { useState, useCallback, useEffect } from 'react';
import { GlobalMemoryService, Conversation } from '../services/GlobalMemoryService';
import { haptics } from '../services/HapticService';
import { orchestrator } from '../core/orchestrator';
import { cognitiveSyncPlugin } from '../plugins/CognitiveSyncPlugin';

export function useAmparadora() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [lastSeenVersion, setLastSeenVersion] = useState<number>(() => {
    return cognitiveSyncPlugin.getVersion().version;
  });

  // Load initial conversations
  useEffect(() => {
    const all = GlobalMemoryService.getConversations();
    setConversations(all);
    
    let activeId = GlobalMemoryService.getActiveConversationId();
    // If we have an activeId but it's not in the list, clear it
    if (activeId && !all.find(c => c.id === activeId)) {
      activeId = null;
    }
    // If no activeId and we have conversations, pick the first one
    if (!activeId && all.length > 0) {
      activeId = all[0].id;
    }
    
    setActiveConversationId(activeId);
  }, []);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  const switchConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    GlobalMemoryService.setActiveConversationId(id);
  }, []);

  const createNewChat = useCallback((title: string = 'Nova Conversa') => {
    const newConv = GlobalMemoryService.createConversation(title);
    setConversations(GlobalMemoryService.getConversations());
    setActiveConversationId(newConv.id);
    return newConv.id;
  }, []);

  const sendMessage = useCallback(async (content: string, file?: File | null) => {
    if (!content.trim() && !file) return;
    if (isLoading) return;

    let targetId = activeConversationId;
    if (!targetId) targetId = createNewChat();

    const attachments = file ? [{
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }] : undefined;

    // 1. Add user message
    GlobalMemoryService.addEntry(targetId!, { 
      role: 'user', 
      content: content.trim() || (file ? `[Arquivo: ${file.name}]` : ''),
      attachments
    });
    
    setConversations(GlobalMemoryService.getConversations());
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // 2. Antes de responder: verificar global_cognitive_state e aguardar se estiver rebuilding
      console.log("[useAmparadora] Checking consistency lock before processing message...");
      await cognitiveSyncPlugin.waitForReady();

      const latestVer = cognitiveSyncPlugin.getVersion();
      if (latestVer.version !== lastSeenVersion) {
        console.log(`[useAmparadora] Cognitive Version changed from ${lastSeenVersion} to ${latestVer.version}. Updating tracking state.`);
        setLastSeenVersion(latestVer.version);
      }

      // Call the Central Orchestrator
      // Note: We're passing the raw content. The orchestrator uses aiEngine -> aiProvider (Gemini)
      const orchestratorResponse = await orchestrator.processUserInput(content);
      
      const aiText = orchestratorResponse.meta?.text || "Processado com sucesso.";

      // 3. Save assistant response
      haptics.notification();
      GlobalMemoryService.addEntry(targetId!, {
        role: 'assistant',
        content: aiText,
        metadata: {
          suggestions: orchestratorResponse.meta?.suggestions || []
        }
      });
      
      setConversations(GlobalMemoryService.getConversations());
    } catch (error) {
      console.error("useAmparadora error:", error);
      haptics.error();
      
      GlobalMemoryService.addEntry(targetId!, {
        role: 'assistant',
        content: "Houve uma interferência na minha conexão com o organismo no nível do Orquestrador. Por favor, tente novamente."
      });
      setConversations(GlobalMemoryService.getConversations());
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, activeConversationId, createNewChat]);

  const removeConversation = useCallback((id: string) => {
    GlobalMemoryService.deleteConversation(id);
    const updated = GlobalMemoryService.getConversations();
    setConversations(updated);
    setActiveConversationId(GlobalMemoryService.getActiveConversationId());
  }, []);

  const renameConversation = useCallback((id: string, newTitle: string) => {
    GlobalMemoryService.updateConversation(id, { title: newTitle });
    setConversations(GlobalMemoryService.getConversations());
  }, []);

  const clearHistory = useCallback(() => {
    GlobalMemoryService.clearAll();
    setConversations([]);
    setActiveConversationId(null);
  }, []);

  return {
    conversations,
    activeConversationId,
    activeConversation,
    messages,
    isLoading,
    streamingMessage,
    sendMessage,
    switchConversation,
    createNewChat,
    removeConversation,
    renameConversation,
    clearHistory
  };
}

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  fetchAssistantConversations,
  fetchConversationMessages,
  sendAssistantChat,
  type AssistantSource,
} from "../api";
import { useWorkspaceStore } from "../store/workspaceStore";
import { useOnboardingStore } from "../store/onboardingStore";
import { useAuthSession } from "../auth/useAuthSession";

const CONVERSATION_STORAGE_KEY = "ai-assistant-conversation-id";
const conversationListQueryKey = (
  companyId: string | null,
  workspaceId: string | null,
) => ["assistant-conversations", companyId, workspaceId] as const;
const conversationMessagesQueryKey = (
  companyId: string | null,
  workspaceId: string | null,
  conversationId?: string,
) =>
  [
    "assistant-conversation-messages",
    companyId,
    workspaceId,
    conversationId,
  ] as const;

export function ChatPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthSession();
  const companyId = useWorkspaceStore((state) => state.companyId);
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const assistantProfile = useOnboardingStore((state) =>
    state.getAssistantProfile(companyId, workspaceId),
  );
  const [message, setMessage] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >(sessionStorage.getItem(CONVERSATION_STORAGE_KEY) ?? undefined);
  const [latestSources, setLatestSources] = useState<AssistantSource[]>([]);
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const conversationsQuery = useQuery({
    queryKey: conversationListQueryKey(companyId, workspaceId),
    queryFn: () => fetchAssistantConversations({ companyId, workspaceId }),
    enabled: Boolean(isAuthenticated && companyId && workspaceId),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: false,
  });

  const messagesQuery = useQuery({
    queryKey: conversationMessagesQueryKey(
      companyId,
      workspaceId,
      selectedConversationId,
    ),
    queryFn: () =>
      fetchConversationMessages({
        companyId,
        workspaceId,
        conversationId: selectedConversationId as string,
      }),
    enabled: Boolean(isAuthenticated && companyId && workspaceId && selectedConversationId),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: false,
  });

  useEffect(() => {
    if (!(messagesQuery.error instanceof AxiosError)) {
      return;
    }
    const status = messagesQuery.error.response?.status;
    if (status !== 403 && status !== 404) {
      return;
    }
    setSelectedConversationId(undefined);
    sessionStorage.removeItem(CONVERSATION_STORAGE_KEY);
  }, [messagesQuery.error]);

  useEffect(() => {
    if (!conversationsQuery.data?.items) {
      return;
    }

    const availableConversationIds = new Set(
      conversationsQuery.data.items.map((item) => item.id),
    );
    if (
      selectedConversationId &&
      availableConversationIds.has(selectedConversationId)
    ) {
      return;
    }

    const firstConversation = conversationsQuery.data.items[0];
    if (firstConversation) {
      setSelectedConversationId(firstConversation.id);
      sessionStorage.setItem(CONVERSATION_STORAGE_KEY, firstConversation.id);
      return;
    }

    setSelectedConversationId(undefined);
    sessionStorage.removeItem(CONVERSATION_STORAGE_KEY);
  }, [conversationsQuery.data?.items, selectedConversationId]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }, [messagesQuery.data?.items, conversationsQuery.data?.items]);

  const chatMutation = useMutation({
    mutationFn: sendAssistantChat,
    onMutate: async (variables) => {
      setPendingUserMessage(variables.message);
      setMessage("");
    },
    onSuccess: async (data) => {
      const nextConversationId =
        data.conversationId ?? selectedConversationId ?? undefined;
      if (nextConversationId) {
        setSelectedConversationId(nextConversationId);
        sessionStorage.setItem(CONVERSATION_STORAGE_KEY, nextConversationId);
      }
      setLatestSources(data.sources ?? []);
      setPendingUserMessage(null);

      const listKey = conversationListQueryKey(companyId, workspaceId);
      const messagesKey = conversationMessagesQueryKey(
        companyId,
        workspaceId,
        nextConversationId,
      );
      await queryClient.invalidateQueries({
        queryKey: listKey,
      });
      if (nextConversationId) {
        await queryClient.invalidateQueries({
          queryKey: messagesKey,
        });
        await queryClient.refetchQueries({
          queryKey: messagesKey,
          exact: true,
        });
      }
      await queryClient.refetchQueries({
        queryKey: listKey,
        exact: true,
      });
    },
    onError: () => {
      setPendingUserMessage(null);
    },
  });

  const chatError =
    chatMutation.error instanceof AxiosError
      ? chatMutation.error.response?.data?.message || "Assistant chat failed."
      : null;

  const sendMessage = () => {
    if (!message.trim() || !companyId || !workspaceId) {
      return;
    }

    chatMutation.mutate({
      companyId,
      workspaceId,
      message: message.trim(),
      conversationId: selectedConversationId,
    });
  };

  const startNewConversation = () => {
    setSelectedConversationId(undefined);
    setLatestSources([]);
    sessionStorage.removeItem(CONVERSATION_STORAGE_KEY);
  };

  const selectedConversationMessages = messagesQuery.data?.items ?? [];
  const orderedConversations = useMemo(
    () => conversationsQuery.data?.items ?? [],
    [conversationsQuery.data?.items],
  );

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Typography variant="h5">Assistant Chat</Typography>
        <Chip
          size="small"
          color={selectedConversationId ? "success" : "default"}
          label={selectedConversationId ? "Conversation active" : "New conversation"}
        />
      </Stack>

      <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={0.75}>
          <Typography variant="subtitle2">What this system is</Typography>
          <Typography variant="body2" color="text.secondary">
            {assistantProfile?.assistantName || "Your assistant"} supports employees
            with company answers grounded in uploaded business knowledge.
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Assistant role
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {assistantProfile?.roleDescription ||
              "General company knowledge and process assistant"}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Response style
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {assistantProfile?.answerStyle || "balanced"} responses. Sources are shown
            when document chunks are retrieved.
          </Typography>
        </Stack>
      </Paper>
      {!companyId || !workspaceId ? (
        <Alert severity="warning">
          Set company/workspace IDs on Dashboard first.
        </Alert>
      ) : null}
      {chatError ? <Alert severity="error">{String(chatError)}</Alert> : null}

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ minHeight: "70vh" }}
      >
        <Paper
          elevation={0}
          sx={{
            width: { xs: "100%", md: 320 },
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Button variant="outlined" fullWidth onClick={startNewConversation}>
              New conversation
            </Button>
          </Box>
          {conversationsQuery.isLoading ? <LinearProgress /> : null}
          <List sx={{ p: 0, overflowY: "auto" }}>
            {orderedConversations.map((conversation) => (
              <ListItemButton
                key={conversation.id}
                selected={conversation.id === selectedConversationId}
                onClick={() => {
                  setSelectedConversationId(conversation.id);
                  sessionStorage.setItem(CONVERSATION_STORAGE_KEY, conversation.id);
                }}
                sx={{
                  alignItems: "flex-start",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <ListItemText
                  primary={
                    conversation.lastMessage?.content?.slice(0, 50) ||
                    "New conversation"
                  }
                  secondary={new Date(conversation.updatedAt).toLocaleString()}
                />
              </ListItemButton>
            ))}
            {orderedConversations.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No conversations yet.
                </Typography>
              </Box>
            ) : null}
          </List>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            ref={messagesContainerRef}
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {messagesQuery.isLoading ? <LinearProgress /> : null}
            {selectedConversationMessages.length === 0 ? (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Start with a regular question like:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • “Summarize our refund policy”
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • “What are onboarding steps for new employees?”
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • “Create a checklist from the uploaded SOP”
                </Typography>
              </Stack>
            ) : (
              selectedConversationMessages.map((item) => {
                const isUser = item.role === "USER";
                return (
                  <Box
                    key={item.id}
                    sx={{
                      alignSelf: isUser ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      px: 1.5,
                      py: 1.2,
                      borderRadius: 2,
                      bgcolor: isUser ? "primary.main" : "grey.100",
                      color: isUser ? "primary.contrastText" : "text.primary",
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {item.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.8, display: "block", mt: 0.75 }}
                    >
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </Typography>
                  </Box>
                );
              })
            )}
            {pendingUserMessage ? (
              <Box
                sx={{
                  alignSelf: "flex-end",
                  maxWidth: "85%",
                  px: 1.5,
                  py: 1.2,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {pendingUserMessage}
                </Typography>
              </Box>
            ) : null}
            {chatMutation.isPending ? (
              <Box
                sx={{
                  alignSelf: "flex-start",
                  maxWidth: "85%",
                  px: 1.5,
                  py: 1.2,
                  borderRadius: 2,
                  bgcolor: "grey.100",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Assistant is thinking...
                </Typography>
              </Box>
            ) : null}
          </Box>

          <Divider />
          <Box sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <TextField
                label="Ask your assistant..."
                multiline
                minRows={2}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                disabled={
                  !message.trim() ||
                  !companyId ||
                  !workspaceId ||
                  chatMutation.isPending
                }
              >
                {chatMutation.isPending ? "Sending..." : "Send"}
              </Button>
              {latestSources.length > 0 ? (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Sources from latest answer:
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    {latestSources.map((source) => (
                      <Typography
                        key={`${source.chunkId}-${source.assetId}`}
                        variant="body2"
                        color="text.secondary"
                      >
                        {source.filename} — relevance{" "}
                        {source.similarityScore.toFixed(3)}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Stack>
  );
}

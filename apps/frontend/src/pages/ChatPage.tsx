import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
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
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const conversationsQuery = useQuery({
    queryKey: conversationListQueryKey(companyId, workspaceId),
    queryFn: () => fetchAssistantConversations({ companyId, workspaceId }),
    enabled: Boolean(isAuthenticated && companyId && workspaceId),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: false,
  });
  const availableConversationIds = useMemo(
    () => new Set((conversationsQuery.data?.items ?? []).map((item) => item.id)),
    [conversationsQuery.data?.items],
  );
  const canLoadSelectedConversation = Boolean(
    selectedConversationId &&
      (availableConversationIds.has(selectedConversationId) ||
        conversationsQuery.isLoading),
  );

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
    enabled: Boolean(
      isAuthenticated &&
        companyId &&
        workspaceId &&
        selectedConversationId &&
        canLoadSelectedConversation,
    ),
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
      setLatestSources([]);
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

  useEffect(() => {
    if (!chatMutation.isPending) {
      inputRef.current?.focus();
    }
  }, [chatMutation.isPending]);

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
    <Stack spacing={2} sx={{ height: "calc(100vh - 140px)", minHeight: 640 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Typography variant="h5">{assistantProfile?.assistantName || "Assistant"}</Typography>
        <Chip
          size="small"
          color={selectedConversationId ? "success" : "default"}
          label={selectedConversationId ? "Conversation active" : "New conversation"}
        />
      </Stack>
      {!companyId || !workspaceId ? (
        <Alert severity="warning">Select company/workspace first from top bar.</Alert>
      ) : null}
      {chatError ? <Alert severity="error">{String(chatError)}</Alert> : null}

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ minHeight: 0, flex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            width: { xs: "100%", md: 320 },
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              fullWidth
              onClick={startNewConversation}
            >
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
                  secondary={
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {new Date(conversation.updatedAt).toLocaleString()}
                    </Typography>
                  }
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
            minHeight: 0,
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
            {selectedConversationMessages.length === 0 && !pendingUserMessage ? (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Start a conversation:
                </Typography>
                <Stack spacing={0.75}>
                  {[
                    "Summarize our refund policy",
                    "What are onboarding steps for new employees?",
                    "Create a checklist from the uploaded SOP",
                  ].map((example) => (
                    <Button
                      key={example}
                      variant="text"
                      sx={{ justifyContent: "flex-start" }}
                      onClick={() => setMessage(example)}
                    >
                      {example}
                    </Button>
                  ))}
                </Stack>
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
                  maxWidth: 220,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "grey.100",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CircularProgress size={14} />
                <Typography variant="body2" color="text.secondary">Thinking…</Typography>
              </Box>
            ) : null}
          </Box>

          <Divider />
          <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "flex-end" }}>
                <TextField
                  label="Message assistant..."
                  multiline
                  minRows={1}
                  maxRows={6}
                  value={message}
                  inputRef={inputRef}
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
                  sx={{ minWidth: 52, height: 56 }}
                >
                  <SendRoundedIcon fontSize="small" />
                </Button>
              </Stack>
              {latestSources.length > 0 ? (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Sources:
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 0.5, maxHeight: 120, overflowY: "auto" }}>
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

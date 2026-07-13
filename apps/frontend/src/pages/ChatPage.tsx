import { useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
  List,
  ListItem,
  Divider,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { sendAssistantChat, type AssistantSource } from "../services/api";
import { useWorkspaceStore } from "../store/workspaceStore";

const CONVERSATION_STORAGE_KEY = "ai-assistant-conversation-id";

type ChatRecord = {
  id: string;
  question: string;
  answer: string;
  sources: AssistantSource[];
};

export function ChatPage() {
  const companyId = useWorkspaceStore((state) => state.companyId);
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const [message, setMessage] = useState("");
  const [records, setRecords] = useState<ChatRecord[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(
    sessionStorage.getItem(CONVERSATION_STORAGE_KEY) ?? undefined,
  );

  const chatMutation = useMutation({
    mutationFn: sendAssistantChat,
    onSuccess: (data, variables) => {
      if (data.conversationId) {
        sessionStorage.setItem(CONVERSATION_STORAGE_KEY, data.conversationId);
        setConversationId(data.conversationId);
      }
      setRecords((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          question: variables.message,
          answer: data.answer,
          sources: data.sources ?? [],
        },
      ]);
      setMessage("");
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
      conversationId,
    });
  };

  const resetConversation = () => {
    sessionStorage.removeItem(CONVERSATION_STORAGE_KEY);
    setConversationId(undefined);
    setRecords([]);
  };

  return (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={2}>
          <Typography variant="h5">Assistant Chat</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography variant="body2">Step 5 of 5: Ask, then continue same conversation</Typography>
            <Chip
              size="small"
              color={conversationId ? "success" : "default"}
              label={conversationId ? "Conversation active" : "New conversation"}
            />
          </Stack>
          {conversationId ? (
            <Typography variant="caption" color="text.secondary">
              conversationId: {conversationId}
            </Typography>
          ) : null}
          {!companyId || !workspaceId ? (
            <Alert severity="warning">Set company/workspace IDs on Dashboard first.</Alert>
          ) : null}
          {chatError ? <Alert severity="error">{String(chatError)}</Alert> : null}
          <TextField
            label="Message"
            multiline
            minRows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            fullWidth
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!message.trim() || !companyId || !workspaceId || chatMutation.isPending}
            >
              {chatMutation.isPending ? "Sending..." : "Send"}
            </Button>
            <Button variant="outlined" onClick={resetConversation}>
              New Conversation
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={2}>
          <Typography variant="h6">Responses</Typography>
          {records.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No messages yet.
            </Typography>
          ) : (
            <List disablePadding>
              {records.map((record) => (
                <Stack key={record.id} spacing={1.5} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Q: {record.question}</Typography>
                  <Typography variant="body1">A: {record.answer}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sources:
                  </Typography>
                  <Stack spacing={0.75}>
                    {record.sources.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No sources returned.
                      </Typography>
                    ) : (
                      record.sources.map((source) => (
                        <ListItem
                          key={`${record.id}-${source.chunkId}`}
                          sx={{ px: 1.5, py: 0.75, border: "1px solid", borderColor: "divider" }}
                        >
                          <Typography variant="body2">
                            {source.filename} — relevance {source.similarityScore.toFixed(3)}
                          </Typography>
                        </ListItem>
                      ))
                    )}
                  </Stack>
                  <Divider />
                </Stack>
              ))}
            </List>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

export const FUTURE_TOOL_NAMES = [
  'calendar.create_event',
  'calendar.delete_event',
  'gmail.send_email',
  'gmail.read_email',
  'web.search',
  'http.request',
  'database.query',
  'crm.search_customer',
  'erp.get_invoice',
] as const;

export type FutureToolName = (typeof FUTURE_TOOL_NAMES)[number];

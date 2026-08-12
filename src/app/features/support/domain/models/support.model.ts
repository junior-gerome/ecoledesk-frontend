export interface HelpCategory {
  id: number;
  name: string;
}

export interface HelpArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

export interface HelpCenterData {
  categories: HelpCategory[];
  articles: HelpArticle[];
}

export type SupportPriority = "LOW" | "MEDIUM" | "HIGH";

export interface SupportTicketPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: SupportPriority;
}

export interface SupportTicket {
  id: number;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  createdAt: string;
}

// ─── Shared PM Tool Types ─────────────────────────────────────────────────────

export type PMToolType = 'jira' | 'linear' | 'monday' | 'azure-devops' | null;

export interface PMIssue {
  id: string;
  key: string;         // e.g. "PROJ-123"
  title: string;
  status: string;
  assignee: string | null;
  priority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest' | null;
  type: string;        // "Story" | "Bug" | "Task" etc
  url: string;
  storyPoints: number | null;
}

export interface PMSprint {
  id: string;
  name: string;
  state: 'active' | 'closed' | 'future';
  startDate: string | null;
  endDate: string | null;
}

export interface PMProjectData {
  issues: PMIssue[];
  activeSprint: PMSprint | null;
  totalIssues: number;
  openIssues: number;
  closedIssues: number;
}

export interface PMToolConfig {
  type: PMToolType;
  apiToken: string;
  baseUrl: string;    // e.g. "https://yourorg.atlassian.net" for Jira
  projectKey: string; // e.g. "PROJ"
  email: string;      // required for Jira basic auth
}

export interface PMToolConnector {
  type: PMToolType;
  testConnection: (config: PMToolConfig) => Promise<{ ok: boolean; error?: string }>;
  fetchProjectData: (config: PMToolConfig) => Promise<PMProjectData>;
}

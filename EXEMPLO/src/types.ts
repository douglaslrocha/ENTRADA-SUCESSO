export enum CategoryType {
  ESSENTIAL = 'ESSENTIAL',
  CUTTABLE = 'CUTTABLE',
  INCOME = 'INCOME'
}

export interface ExistentialInsight {
  runwayMonths: number;
  evolutionRatio: number; // 0 to 1, percentage toward Proexis goal
  status: 'critical' | 'stable' | 'thriving';
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
}

export interface Transaction {
  id: string;
  value: number;
  category_id: string;
  date: string;
  note?: string;
}

export interface FinancialRecord {
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description: string;
}

export type IntentType = 
  | 'task' | 'project' | 'document' | 'query' | 'finance' | 'chat' | 'activity_log' | 'flow'
  | 'create_task' | 'create_project' | 'create_document' | 'financial_entry' | 'log_activity' | 'general';

export interface CanvasResponse {
  intent: IntentType;
  content: string;
  data?: any;
  render?: {
    type: 'card' | 'list' | 'dashboard' | 'carousel' | 'action_buttons';
    props: any;
  };
  suggestions?: string[];
}

export interface Workspace {
  id: string;
  name: string;
  folders: Folder[];
  isPinned?: boolean;
  isHidden?: boolean;
  color?: string;
  icon?: string;
  iconType?: 'emoji' | 'lucide' | 'image';
  imageUrl?: string;
}

export interface Folder {
  id: string;
  name: string;
  pages: Page[];
  isPinned?: boolean;
  color?: string;
  icon?: string;
  iconType?: 'emoji' | 'lucide' | 'image';
  imageUrl?: string;
}

export interface Page {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  coverImage?: string | null;
  coverPosition?: number;
  icon?: string | null;
  isPinned?: boolean;
}

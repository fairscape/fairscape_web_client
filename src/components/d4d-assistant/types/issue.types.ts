export interface Issue {
  number: number;
  title: string;
  state: string;
  created_at: string;
  updated_at: string;
  user: string;
  labels: string[];
  comments_count: number;
}

export interface Comment {
  id: number;
  user: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface IssueDetail extends Issue {
  body: string;
  comments: Comment[];
}

export interface IssueFormData {
  project: string;
  urls: string;
  instructions: string;
  files: File[];
}

export interface D4DConversionResult {
  rocrate: any;
  issueNumber: number;
}

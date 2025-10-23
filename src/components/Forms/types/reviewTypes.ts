export enum ReviewStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface FieldReviewState {
  fieldName: string;
  status: ReviewStatus;
  originalValue: any;
  llmValue: any;
  timestamp: number;
}

export interface ReviewStates {
  [fieldName: string]: FieldReviewState;
}

export interface LLMProcessingState {
  isProcessing: boolean;
  error: string | null;
  progress: number;
}

export interface LLMResponse {
  suggestions: {
    [fieldName: string]: any;
  };
  confidence: {
    [fieldName: string]: number;
  };
}

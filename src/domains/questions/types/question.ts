export type QuestionTag = "internal" | "external";
export type QuestionStatus = "open" | "answered";

export interface Question {
  id: string;
  title: string;
  body?: string;
  tags: QuestionTag[];
  status: QuestionStatus;
  source?: string;
  answer?: string;
  createdAt: string;
  answeredAt?: string;
  projectKey: string;
}

export interface CreateQuestionDTO {
  title: string;
  body?: string;
  tags: QuestionTag[];
  source?: string;
  projectKey: string;
}

export interface UpdateQuestionDTO {
  title?: string;
  body?: string;
  tags?: QuestionTag[];
  status?: QuestionStatus;
  source?: string;
  answer?: string;
}

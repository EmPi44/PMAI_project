import type { Question, CreateQuestionDTO, UpdateQuestionDTO } from "../types";

let questions: Question[] = [
  {
    id: "q-1",
    title: "What is the expected latency SLA for the payment gateway?",
    body: "Customer mentioned they need sub-200ms p99 for checkout. Need to confirm if this applies to the full round-trip or just our service.",
    tags: ["external"],
    status: "open",
    source: "Customer call — Mar 18",
    projectKey: "NOVA",
    createdAt: "2026-03-18T10:30:00Z",
  },
  {
    id: "q-2",
    title: "Should we support multi-currency in v1 or defer to v2?",
    body: "Scope discussion in sprint planning — unclear if this is in scope for the current milestone.",
    tags: ["internal"],
    status: "answered",
    answer: "Deferred to v2. v1 will be USD only with a currency field reserved for future use.",
    source: "Sprint planning — Mar 15",
    projectKey: "NOVA",
    createdAt: "2026-03-15T14:00:00Z",
    answeredAt: "2026-03-16T09:00:00Z",
  },
  {
    id: "q-3",
    title: "Does the customer need GDPR-compliant data export for payment history?",
    tags: ["external"],
    status: "open",
    source: "Customer call — Mar 18",
    projectKey: "NOVA",
    createdAt: "2026-03-18T11:00:00Z",
  },
  {
    id: "q-4",
    title: "Which team owns the Stripe webhook secret rotation process?",
    tags: ["internal"],
    status: "open",
    projectKey: "NOVA",
    createdAt: "2026-03-19T09:15:00Z",
  },
];

let nextId = 5;
const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));

export async function fetchQuestions(projectKey: string): Promise<Question[]> {
  await delay();
  return questions.filter((q) => q.projectKey === projectKey);
}

export async function createQuestion(dto: CreateQuestionDTO): Promise<Question> {
  await delay();
  const question: Question = {
    id: `q-${nextId++}`,
    title: dto.title,
    body: dto.body,
    tags: dto.tags,
    status: "open",
    source: dto.source,
    projectKey: dto.projectKey,
    createdAt: new Date().toISOString(),
  };
  questions = [...questions, question];
  return question;
}

export async function updateQuestion(id: string, dto: UpdateQuestionDTO): Promise<Question> {
  await delay();
  let updated: Question | undefined;
  questions = questions.map((q) => {
    if (q.id === id) {
      updated = {
        ...q,
        ...dto,
        answeredAt: dto.status === "answered" && q.status !== "answered"
          ? new Date().toISOString()
          : q.answeredAt,
      };
      return updated;
    }
    return q;
  });
  if (!updated) throw new Error(`Question ${id} not found`);
  return updated;
}

export async function deleteQuestion(id: string): Promise<void> {
  await delay();
  questions = questions.filter((q) => q.id !== id);
}

import type { Project } from "../types";

const PROJECT: Project = {
  key: "NOVA",
  name: "Nova Platform",
  type: "Software project",
  charter: {
    vision:
      "Build the most intelligent payment infrastructure platform that empowers businesses to process, analyze, and optimize every transaction with AI-driven precision.",
    problemStatement:
      "Businesses struggle with fragmented payment systems that lack real-time insights, leading to revenue loss, high failure rates, and poor developer experience when integrating payment flows.",
    lead: "Sofia Chen",
    startDate: "Jan 6, 2025",
    targetDate: "Jun 30, 2025",
    status: "on-track",
    objectives: [
      { id: "obj-1", text: "Reduce payment failure rate from 4.2% to under 1%", progress: 62 },
      { id: "obj-2", text: "Launch real-time transaction analytics dashboard for all merchants", progress: 35 },
      { id: "obj-3", text: "Support 5 new payment methods including Apple Pay and BNPL", progress: 20 },
      { id: "obj-4", text: "Achieve 99.99% uptime SLA across all payment endpoints", progress: 80 },
    ],
    inScope: [
      "Stripe v2 API integration and webhook overhaul",
      "Payment analytics dashboard (web + mobile)",
      "Subscription management and upgrade flows",
      "Refund and dispute resolution workflows",
      "Guest checkout and Apple Pay support",
    ],
    outOfScope: [
      "Crypto payment methods",
      "Point-of-sale (POS) hardware integration",
      "Multi-currency conversion engine (Phase 2)",
      "White-label payment portal for resellers",
    ],
    milestones: [
      { id: "ms-1", name: "Discovery & Architecture", date: "Jan 31, 2025", status: "completed" },
      { id: "ms-2", name: "Core Payment Flows", date: "Mar 14, 2025", status: "in-progress" },
      { id: "ms-3", name: "Analytics & Reporting", date: "Apr 25, 2025", status: "upcoming" },
      { id: "ms-4", name: "Beta Launch & QA", date: "Jun 13, 2025", status: "upcoming" },
    ],
  },
};

const delay = (ms: number = 100) => new Promise((r) => setTimeout(r, ms));

export async function fetchProject(key: string): Promise<Project | null> {
  await delay();
  if (key === PROJECT.key) {
    return { ...PROJECT };
  }
  return null;
}

export function getProjectSync(): Project {
  return { ...PROJECT };
}

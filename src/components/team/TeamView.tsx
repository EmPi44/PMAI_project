"use client";

import { useState, useCallback } from "react";
import { T } from "@/lib/tokens";
import { INITIAL_AGENTS } from "./types";
import type { Agent } from "./types";
import { AgentList } from "./AgentList";
import { AgentDetail } from "./AgentDetail";

export function TeamView() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_AGENTS[0].id);

  const selectedAgent = agents.find((a) => a.id === selectedId) ?? agents[0];

  const handleUpdate = useCallback((updated: Agent) => {
    setAgents((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }, []);

  const handleNew = useCallback(() => {
    const id = `agent-${Date.now()}`;
    const newAgent: Agent = {
      id,
      name: "New Agent",
      description: "",
      status: "idle",
      model: "claude-sonnet-4-6",
      effort: "medium",
      systemPrompt: "",
      tools: ["Read"],
      mcpServers: [],
      skills: [],
      memory: false,
      extendedThinking: false,
      maxTurns: null,
      maxBudget: null,
      permissionMode: "default",
    };
    setAgents((prev) => [...prev, newAgent]);
    setSelectedId(id);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      setAgents((prev) => {
        const next = prev.filter((a) => a.id !== id);
        if (selectedId === id && next.length > 0) {
          setSelectedId(next[0].id);
        }
        return next;
      });
    },
    [selectedId]
  );

  if (agents.length === 0) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center"
        style={{ background: T.surfaceSunken }}
      >
        <div style={{ textAlign: "center", color: T.textSubtlest, marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: T.textSubtle, marginBottom: 6 }}>
            No agents yet
          </p>
          <p style={{ fontSize: 13 }}>Create your first AI agent to get started.</p>
        </div>
        <button
          onClick={handleNew}
          style={{
            padding: "8px 18px",
            borderRadius: 4,
            border: "none",
            background: T.brandBold,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + New Agent
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden" style={{ background: T.surfaceSunken }}>
      <AgentList
        agents={agents}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNew={handleNew}
      />
      <AgentDetail
        key={selectedAgent.id}
        agent={selectedAgent}
        onChange={handleUpdate}
        onDelete={() => handleDelete(selectedAgent.id)}
      />
    </div>
  );
}

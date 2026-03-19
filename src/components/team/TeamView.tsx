"use client";

import { useState, useCallback } from "react";
import { T } from "@/lib/tokens";
import type { Agent } from "./types";
import { AgentList } from "./AgentList";
import { AgentDetail } from "./AgentDetail";

interface Props {
  initialAgents: Agent[];
}

export function TeamView({ initialAgents }: Props) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [selectedId, setSelectedId] = useState<string>(
    initialAgents.length > 0 ? initialAgents[0].id : ""
  );

  const selectedAgent = agents.find((a) => a.id === selectedId);

  const handleUpdate = useCallback((updated: Agent) => {
    setAgents((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }, []);

  const handleSave = useCallback(async (agent: Agent) => {
    await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agent),
    });
  }, []);

  const handleNew = useCallback(async () => {
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
    await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAgent),
    });
    setAgents((prev) => [...prev, newAgent]);
    setSelectedId(id);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      await fetch(`/api/agents/${id}`, { method: "DELETE" });
      setAgents((prev) => {
        const next = prev.filter((a) => a.id !== id);
        if (selectedId === id && next.length > 0) {
          setSelectedId(next[0].id);
        } else if (next.length === 0) {
          setSelectedId("");
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
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: T.textSubtle, marginBottom: 6 }}>
            No agents yet
          </p>
          <p style={{ fontSize: 13, color: T.textSubtlest }}>
            Create your first AI agent to get started.
          </p>
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
      {selectedAgent && (
        <AgentDetail
          key={selectedAgent.id}
          agent={selectedAgent}
          onChange={handleUpdate}
          onSave={handleSave}
          onDelete={() => handleDelete(selectedAgent.id)}
        />
      )}
    </div>
  );
}

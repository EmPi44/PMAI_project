#!/usr/bin/env python3
"""
Run an AI agent on a task using the Claude Code CLI.

Agent configs live in .claude/agents/<id>.json and are managed
via the Team page in the web UI. No API key needed — uses your
existing Claude Code subscription auth (claude auth login).

Usage:
    python backend/run_agent.py <agent-id> "<task description>"

Examples:
    python backend/run_agent.py code-reviewer "Review the changes in src/auth.ts"
    python backend/run_agent.py backlog-groomer "Groom the issues in the current sprint"
    python backend/run_agent.py sprint-planner "Plan the next two-week sprint"

List available agents:
    python backend/run_agent.py --list
"""

import json
import sys
import subprocess
import pathlib

AGENTS_DIR = pathlib.Path(".claude") / "agents"


def list_agents() -> None:
    if not AGENTS_DIR.exists():
        print("No agents found. Create agents via the Team page in the web UI.")
        return
    agents = sorted(AGENTS_DIR.glob("*.json"))
    if not agents:
        print("No agents found. Create agents via the Team page in the web UI.")
        return
    print(f"Available agents ({len(agents)}):")
    for path in agents:
        config = json.loads(path.read_text())
        print(f"  {config['id']:<24} {config['model']:<20} {config.get('description', '')}")


def load_agent(agent_id: str) -> dict:
    config_path = AGENTS_DIR / f"{agent_id}.json"
    if not config_path.exists():
        print(f"Error: agent '{agent_id}' not found.", file=sys.stderr)
        print("", file=sys.stderr)
        list_agents()
        sys.exit(1)
    return json.loads(config_path.read_text())


def run_agent(agent_id: str, task: str) -> None:
    config = load_agent(agent_id)

    print(f"Agent  : {config['name']}")
    print(f"Model  : {config['model']}  |  Effort: {config['effort']}")
    print(f"Tools  : {', '.join(config.get('tools', []))}")
    print(f"Task   : {task}")
    print("-" * 60)

    cmd = [
        "claude",
        "-p", task,
        "--model", config["model"],
        "--output-format", "stream-json",
    ]

    if config.get("systemPrompt"):
        cmd += ["--append-system-prompt", config["systemPrompt"]]

    if config.get("tools"):
        cmd += ["--allowedTools", ",".join(config["tools"])]

    if config.get("maxTurns"):
        cmd += ["--max-turns", str(config["maxTurns"])]

    try:
        subprocess.run(cmd, check=True)
    except FileNotFoundError:
        print(
            "\nError: 'claude' CLI not found.\n"
            "Install it: npm install -g @anthropic-ai/claude-code\n"
            "Then login: claude auth login",
            file=sys.stderr,
        )
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        sys.exit(e.returncode)


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--list":
        list_agents()
        sys.exit(0)

    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    run_agent(agent_id=sys.argv[1], task=" ".join(sys.argv[2:]))

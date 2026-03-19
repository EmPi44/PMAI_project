import type { Client, CreateClientDTO, UpdateClientDTO } from "../types";

let clients: Client[] = [
  {
    id: "c-1",
    name: "Acme Corp",
    industry: "SaaS / Cloud Infrastructure",
    website: "https://acme.com",
    logoUrl: "",
    primaryColor: "#E2341D",
    secondaryColor: "#F5A623",
    contactName: "Jane Hollis",
    contactEmail: "jane.hollis@acme.com",
    contactPhone: "+1 415 555 0101",
    notes: "Key enterprise account. Requires SOC 2 compliance. Prefer async comms over Slack.",
    status: "active",
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "c-2",
    name: "Finovo",
    industry: "FinTech / Payments",
    website: "https://finovo.io",
    logoUrl: "",
    primaryColor: "#1A56DB",
    secondaryColor: "#7E3AF2",
    contactName: "Marcus Chen",
    contactEmail: "m.chen@finovo.io",
    contactPhone: "+1 646 555 0188",
    notes: "Currently evaluating PMAI vs Linear. Decision expected end of Q1. Strong interest in AI agent workflows.",
    status: "prospect",
    createdAt: "2026-02-14T11:30:00Z",
  },
  {
    id: "c-3",
    name: "Oldbridge Systems",
    industry: "Enterprise / Legacy Tech",
    website: "https://oldbridge.co",
    logoUrl: "",
    primaryColor: "#374151",
    secondaryColor: "#6B7280",
    contactName: "Patricia Moore",
    contactEmail: "p.moore@oldbridge.co",
    contactPhone: "",
    notes: "Contract ended March 2025. May revisit in H2 when they complete their cloud migration.",
    status: "inactive",
    createdAt: "2025-06-01T08:00:00Z",
  },
];

let nextId = 4;
const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));

export async function fetchClients(): Promise<Client[]> {
  await delay();
  return [...clients];
}

export async function createClient(dto: CreateClientDTO): Promise<Client> {
  await delay();
  const client: Client = {
    id: `c-${nextId++}`,
    name: dto.name,
    industry: dto.industry,
    website: dto.website,
    logoUrl: dto.logoUrl,
    primaryColor: dto.primaryColor,
    secondaryColor: dto.secondaryColor,
    contactName: dto.contactName,
    contactEmail: dto.contactEmail,
    contactPhone: dto.contactPhone,
    notes: dto.notes,
    status: dto.status,
    createdAt: new Date().toISOString(),
  };
  clients = [...clients, client];
  return client;
}

export async function updateClient(id: string, dto: UpdateClientDTO): Promise<Client> {
  await delay();
  let updated: Client | undefined;
  clients = clients.map((c) => {
    if (c.id === id) {
      updated = { ...c, ...dto };
      return updated;
    }
    return c;
  });
  if (!updated) throw new Error(`Client ${id} not found`);
  return updated;
}

export async function deleteClient(id: string): Promise<void> {
  await delay();
  clients = clients.filter((c) => c.id !== id);
}

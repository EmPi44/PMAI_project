"use client";

import { useState } from "react";
import { T, FONT_STACK } from "@/lib/tokens";
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from "@/domains/clients";
import type { Client, ClientStatus, CreateClientDTO, UpdateClientDTO } from "@/domains/clients";

const STATUS_STYLES: Record<ClientStatus, { bg: string; text: string; label: string }> = {
  active:   { bg: "#DFFCF0", text: "#1F845A", label: "Active" },
  prospect: { bg: "#E9F2FF", text: "#0C66E4", label: "Prospect" },
  inactive: { bg: "#091E420F", text: "#44546F", label: "Inactive" },
};

type FilterTab = "all" | ClientStatus;

function clientInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function ClientAvatar({
  client,
  size = 36,
}: {
  client: Pick<Client, "name" | "logoUrl" | "primaryColor">;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const showImg = client.logoUrl && !imgError;
  const bg = client.primaryColor ?? T.brandBold;

  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: showImg ? "#fff" : bg,
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        fontSize: Math.round(size * 0.38),
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "-0.02em",
      }}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={client.logoUrl}
          alt={client.name}
          onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
        />
      ) : (
        clientInitials(client.name)
      )}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────
   Add Client Form
────────────────────────────────────────────────────────── */

interface AddClientFormProps {
  onSubmit: (dto: CreateClientDTO) => void;
  onCancel: () => void;
}

function AddClientForm({ onSubmit, onCancel }: AddClientFormProps) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<ClientStatus>("prospect");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const inputStyle = {
    width: "100%",
    border: `1px solid ${T.border}`,
    borderRadius: 4,
    padding: "6px 9px",
    fontSize: 13,
    color: T.text,
    fontFamily: FONT_STACK,
    outline: "none",
    boxSizing: "border-box" as const,
    background: T.surface,
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 600,
    color: T.textSubtle,
    display: "block",
    marginBottom: 3,
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      industry: industry.trim() || undefined,
      website: website.trim() || undefined,
      contactName: contactName.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      status,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: 14,
        marginBottom: 10,
        boxShadow: "0 2px 8px rgba(9,30,66,0.1)",
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Client name *</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Acme Corp"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; e.currentTarget.style.boxShadow = `0 0 0 2px ${T.brandSubtle}`; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Industry</label>
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. FinTech"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ClientStatus)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Website</label>
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Contact name</label>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Jane Smith"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Contact email</label>
          <input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="jane@example.com"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "6px 14px",
            borderRadius: 4,
            border: `1px solid ${T.border}`,
            background: T.surface,
            color: T.text,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: FONT_STACK,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = T.surface; }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          style={{
            padding: "6px 14px",
            borderRadius: 4,
            border: "none",
            background: name.trim() ? T.brandBold : T.surfaceHovered,
            color: name.trim() ? "#fff" : T.textDisabled,
            fontSize: 13,
            fontWeight: 600,
            cursor: name.trim() ? "pointer" : "not-allowed",
            fontFamily: FONT_STACK,
          }}
          onMouseEnter={(e) => { if (name.trim()) e.currentTarget.style.background = T.brandBoldHover; }}
          onMouseLeave={(e) => { if (name.trim()) e.currentTarget.style.background = T.brandBold; }}
        >
          Add Client
        </button>
      </div>
    </form>
  );
}

/* ──────────────────────────────────────────────────────────
   Client List Panel (left)
────────────────────────────────────────────────────────── */

interface ClientListProps {
  clients: Client[];
  selectedId: string | null;
  filter: FilterTab;
  onFilterChange: (f: FilterTab) => void;
  onSelect: (id: string) => void;
  showAddForm: boolean;
  onAddClick: () => void;
  onAddSubmit: (dto: CreateClientDTO) => void;
  onAddCancel: () => void;
}

function ClientList({
  clients,
  selectedId,
  filter,
  onFilterChange,
  onSelect,
  showAddForm,
  onAddClick,
  onAddSubmit,
  onAddCancel,
}: ClientListProps) {
  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all",      label: "All" },
    { key: "active",   label: "Active" },
    { key: "prospect", label: "Prospect" },
    { key: "inactive", label: "Inactive" },
  ];

  const counts: Record<FilterTab, number> = {
    all:      clients.length,
    active:   clients.filter((c) => c.status === "active").length,
    prospect: clients.filter((c) => c.status === "prospect").length,
    inactive: clients.filter((c) => c.status === "inactive").length,
  };

  const filtered =
    filter === "all" ? clients : clients.filter((c) => c.status === filter);

  return (
    <div
      style={{
        width: 272,
        flexShrink: 0,
        borderRight: `1px solid ${T.border}`,
        background: T.surfaceSunken,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 14px 0",
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
            Clients
            <span
              style={{
                marginLeft: 7,
                padding: "1px 7px",
                borderRadius: 10,
                background: T.surfaceHovered,
                color: T.textSubtle,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {clients.length}
            </span>
          </span>
          <button
            onClick={onAddClick}
            disabled={showAddForm}
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              border: "none",
              background: T.brandBold,
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              cursor: showAddForm ? "default" : "pointer",
              opacity: showAddForm ? 0.5 : 1,
              fontFamily: FONT_STACK,
            }}
            onMouseEnter={(e) => { if (!showAddForm) e.currentTarget.style.background = T.brandBoldHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = T.brandBold; }}
          >
            + Add
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex" }}>
          {filterTabs.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => onFilterChange(key)}
                style={{
                  flex: 1,
                  padding: "6px 4px",
                  border: "none",
                  borderBottom: active ? `2px solid ${T.brandBold}` : "2px solid transparent",
                  background: "transparent",
                  color: active ? T.brandBold : T.textSubtle,
                  fontSize: 11,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: FONT_STACK,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <span>{label}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: active ? T.brandBold : T.textSubtlest,
                  }}
                >
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
        {showAddForm && (
          <AddClientForm onSubmit={onAddSubmit} onCancel={onAddCancel} />
        )}

        {filtered.length === 0 ? (
          <div
            style={{
              padding: "32px 12px",
              textAlign: "center",
              color: T.textSubtlest,
              fontSize: 12,
            }}
          >
            No clients in this category.
          </div>
        ) : (
          filtered.map((client) => {
            const isSelected = client.id === selectedId;
            const st = STATUS_STYLES[client.status];
            return (
              <button
                key={client.id}
                onClick={() => onSelect(client.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 10px",
                  borderRadius: 6,
                  border: isSelected ? `1px solid ${T.brandBold}` : `1px solid transparent`,
                  background: isSelected ? T.brandSubtle : T.surface,
                  marginBottom: 4,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: FONT_STACK,
                  transition: "all 100ms",
                  boxShadow: isSelected ? `0 0 0 1px ${T.brandBold}` : "0 1px 2px rgba(9,30,66,0.06)",
                }}
                onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.background = T.surfaceHovered; e.currentTarget.style.borderColor = T.border; } }}
                onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.background = T.surface; e.currentTarget.style.borderColor = "transparent"; } }}
              >
                <ClientAvatar client={client} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.text,
                      lineHeight: "18px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {client.name}
                  </div>
                  {client.industry && (
                    <div
                      style={{
                        fontSize: 11,
                        color: T.textSubtlest,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {client.industry}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: 3,
                    fontSize: 10,
                    fontWeight: 700,
                    background: st.bg,
                    color: st.text,
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                    flexShrink: 0,
                  }}
                >
                  {st.label}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Client Detail Panel (right)
────────────────────────────────────────────────────────── */

interface EditState {
  name: string;
  industry: string;
  website: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  status: ClientStatus;
}

function clientToEditState(c: Client): EditState {
  return {
    name:           c.name,
    industry:       c.industry ?? "",
    website:        c.website ?? "",
    logoUrl:        c.logoUrl ?? "",
    primaryColor:   c.primaryColor ?? "#0C66E4",
    secondaryColor: c.secondaryColor ?? "#626F86",
    contactName:    c.contactName ?? "",
    contactEmail:   c.contactEmail ?? "",
    contactPhone:   c.contactPhone ?? "",
    notes:          c.notes ?? "",
    status:         c.status,
  };
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: T.textSubtlest,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  editing: boolean;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: "text" | "url" | "email" | "tel" | "textarea" | "color" | "select";
  selectOptions?: { value: ClientStatus; label: string }[];
  link?: boolean;
}

function Field({ label, value, editing, onChange, placeholder, type = "text", selectOptions, link }: FieldProps) {
  const inputBase = {
    width: "100%",
    border: `1px solid ${T.border}`,
    borderRadius: 4,
    padding: "6px 9px",
    fontSize: 13,
    color: T.text,
    fontFamily: FONT_STACK,
    outline: "none",
    background: T.surface,
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.textSubtle, marginBottom: 3 }}>
        {label}
      </div>
      {editing ? (
        type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            rows={4}
            style={{ ...inputBase, resize: "vertical" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; e.currentTarget.style.boxShadow = `0 0 0 2px ${T.brandSubtle}`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
          />
        ) : type === "select" && selectOptions ? (
          <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            style={{ ...inputBase, cursor: "pointer" }}
          >
            {selectOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <input
            type={type === "color" ? "text" : type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            style={inputBase}
            onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; e.currentTarget.style.boxShadow = `0 0 0 2px ${T.brandSubtle}`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
          />
        )
      ) : (
        <div style={{ fontSize: 13, color: value ? T.text : T.textSubtlest, lineHeight: "20px" }}>
          {value ? (
            link ? (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: T.brandBold, textDecoration: "none" }}
                onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
              >
                {value}
              </a>
            ) : (
              value
            )
          ) : (
            placeholder ?? "—"
          )}
        </div>
      )}
    </div>
  );
}

function ColorSwatch({ color, label, editing, onChange }: { color: string; label: string; editing: boolean; onChange?: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.textSubtle, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: color || "#ccc",
            border: `1px solid ${T.border}`,
            flexShrink: 0,
            display: "block",
          }}
        />
        {editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
            <input
              type="color"
              value={color || "#000000"}
              onChange={(e) => onChange?.(e.target.value)}
              style={{ width: 32, height: 28, border: "none", background: "none", cursor: "pointer", padding: 0 }}
            />
            <input
              type="text"
              value={color}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder="#000000"
              style={{
                flex: 1,
                border: `1px solid ${T.border}`,
                borderRadius: 4,
                padding: "5px 8px",
                fontSize: 12,
                fontFamily: "monospace",
                outline: "none",
                color: T.text,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
            />
          </div>
        ) : (
          <span style={{ fontSize: 12, fontFamily: "monospace", color: T.textSubtle }}>
            {color || "—"}
          </span>
        )}
      </div>
    </div>
  );
}

interface ClientDetailProps {
  client: Client;
  onUpdate: (dto: UpdateClientDTO) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function ClientDetail({ client, onUpdate, onDelete, isDeleting }: ClientDetailProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditState>(clientToEditState(client));

  // Reset draft when client changes
  const clientId = client.id;
  const [lastClientId, setLastClientId] = useState(clientId);
  if (clientId !== lastClientId) {
    setLastClientId(clientId);
    setDraft(clientToEditState(client));
    setEditing(false);
  }

  function patch<K extends keyof EditState>(key: K, value: EditState[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const dto: UpdateClientDTO = {
      name:           draft.name.trim() || client.name,
      industry:       draft.industry.trim() || undefined,
      website:        draft.website.trim() || undefined,
      logoUrl:        draft.logoUrl.trim() || undefined,
      primaryColor:   draft.primaryColor || undefined,
      secondaryColor: draft.secondaryColor || undefined,
      contactName:    draft.contactName.trim() || undefined,
      contactEmail:   draft.contactEmail.trim() || undefined,
      contactPhone:   draft.contactPhone.trim() || undefined,
      notes:          draft.notes.trim() || undefined,
      status:         draft.status,
    };
    onUpdate(dto);
    setEditing(false);
  }

  function handleCancel() {
    setDraft(clientToEditState(client));
    setEditing(false);
  }

  const st = STATUS_STYLES[client.status];

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: T.surface,
      }}
    >
      {/* Detail header */}
      <div
        style={{
          padding: "20px 28px 16px",
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
          background: T.surface,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ClientAvatar client={editing ? { ...client, logoUrl: draft.logoUrl, primaryColor: draft.primaryColor } : client} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <input
                value={draft.name}
                onChange={(e) => patch("name", e.target.value)}
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: T.text,
                  border: `1px solid ${T.border}`,
                  borderRadius: 4,
                  padding: "2px 8px",
                  fontFamily: FONT_STACK,
                  outline: "none",
                  width: "100%",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
              />
            ) : (
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: T.text,
                  lineHeight: "26px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {client.name}
              </h2>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 3,
                  fontSize: 11,
                  fontWeight: 700,
                  background: st.bg,
                  color: st.text,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {st.label}
              </span>
              {client.industry && (
                <span style={{ fontSize: 12, color: T.textSubtle }}>
                  {client.industry}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 4,
                    border: `1px solid ${T.border}`,
                    background: T.surface,
                    color: T.text,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: FONT_STACK,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = T.surface; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 4,
                    border: "none",
                    background: T.brandBold,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: FONT_STACK,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = T.brandBoldHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = T.brandBold; }}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 4,
                    border: `1px solid ${T.border}`,
                    background: T.surface,
                    color: T.text,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: FONT_STACK,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = T.surface; }}
                >
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 4,
                    border: `1px solid ${T.border}`,
                    background: T.surface,
                    color: T.textSubtle,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: isDeleting ? "not-allowed" : "pointer",
                    fontFamily: FONT_STACK,
                    opacity: isDeleting ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => { if (!isDeleting) { e.currentTarget.style.background = T.bgDangerSubtle; e.currentTarget.style.color = T.textDanger; e.currentTarget.style.borderColor = "#FFBDAD"; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.textSubtle; e.currentTarget.style.borderColor = T.border; }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        <Section title="Branding">
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <ColorSwatch
                color={editing ? draft.primaryColor : (client.primaryColor ?? "")}
                label="Primary color"
                editing={editing}
                onChange={(v) => patch("primaryColor", v)}
              />
              <ColorSwatch
                color={editing ? draft.secondaryColor : (client.secondaryColor ?? "")}
                label="Secondary color"
                editing={editing}
                onChange={(v) => patch("secondaryColor", v)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Field
                label="Logo URL"
                value={editing ? draft.logoUrl : (client.logoUrl ?? "")}
                editing={editing}
                onChange={(v) => patch("logoUrl", v)}
                placeholder="https://example.com/logo.png"
                type="url"
              />
              <Field
                label="Website"
                value={editing ? draft.website : (client.website ?? "")}
                editing={editing}
                onChange={(v) => patch("website", v)}
                placeholder="https://example.com"
                type="url"
                link={!editing}
              />
            </div>
          </div>
        </Section>

        <Section title="Contact">
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <Field
                label="Contact name"
                value={editing ? draft.contactName : (client.contactName ?? "")}
                editing={editing}
                onChange={(v) => patch("contactName", v)}
                placeholder="Jane Smith"
              />
              <Field
                label="Email"
                value={editing ? draft.contactEmail : (client.contactEmail ?? "")}
                editing={editing}
                onChange={(v) => patch("contactEmail", v)}
                placeholder="jane@example.com"
                type="email"
                link={!editing && !!client.contactEmail}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Field
                label="Phone"
                value={editing ? draft.contactPhone : (client.contactPhone ?? "")}
                editing={editing}
                onChange={(v) => patch("contactPhone", v)}
                placeholder="+1 555 0100"
                type="tel"
              />
              <Field
                label="Industry"
                value={editing ? draft.industry : (client.industry ?? "")}
                editing={editing}
                onChange={(v) => patch("industry", v)}
                placeholder="e.g. FinTech"
              />
            </div>
          </div>

          {editing && (
            <Field
              label="Status"
              value={draft.status}
              editing={editing}
              onChange={(v) => patch("status", v as ClientStatus)}
              type="select"
              selectOptions={[
                { value: "active",   label: "Active" },
                { value: "prospect", label: "Prospect" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          )}
        </Section>

        <Section title="Notes">
          <Field
            label="Internal notes"
            value={editing ? draft.notes : (client.notes ?? "")}
            editing={editing}
            onChange={(v) => patch("notes", v)}
            placeholder="Add notes about this client — preferences, key details, context for the team…"
            type="textarea"
          />
        </Section>

        {/* Meta */}
        <div style={{ fontSize: 11, color: T.textSubtlest }}>
          Added {new Date(client.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Main View
────────────────────────────────────────────────────────── */

export function ClientsView() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: clients = [], isLoading } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const selectedClient = clients.find((c) => c.id === selectedId) ?? null;

  // Auto-select first client
  if (!selectedId && clients.length > 0) {
    setSelectedId(clients[0].id);
  }

  async function handleAdd(dto: CreateClientDTO) {
    const created = await createClient.mutateAsync(dto);
    setShowAddForm(false);
    setSelectedId(created.id);
  }

  async function handleUpdate(dto: UpdateClientDTO) {
    if (!selectedId) return;
    await updateClient.mutateAsync({ id: selectedId, dto });
  }

  async function handleDelete() {
    if (!selectedId) return;
    await deleteClient.mutateAsync(selectedId);
    setSelectedId(null);
  }

  if (isLoading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.textSubtlest,
          fontSize: 14,
          fontFamily: FONT_STACK,
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        overflow: "hidden",
        fontFamily: FONT_STACK,
        background: T.surfaceSunken,
      }}
    >
      <ClientList
        clients={clients}
        selectedId={selectedId}
        filter={filter}
        onFilterChange={setFilter}
        onSelect={setSelectedId}
        showAddForm={showAddForm}
        onAddClick={() => setShowAddForm(true)}
        onAddSubmit={handleAdd}
        onAddCancel={() => setShowAddForm(false)}
      />

      {selectedClient ? (
        <ClientDetail
          key={selectedClient.id}
          client={selectedClient}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          isDeleting={deleteClient.isPending}
        />
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: T.textSubtlest,
            fontSize: 14,
            gap: 8,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 4 }}>🏢</div>
          <div style={{ fontWeight: 600, color: T.textSubtle }}>No client selected</div>
          <div style={{ fontSize: 13 }}>Select a client from the list or add a new one.</div>
        </div>
      )}
    </div>
  );
}

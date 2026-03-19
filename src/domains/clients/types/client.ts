export type ClientStatus = "active" | "prospect" | "inactive";

export interface Client {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  status: ClientStatus;
  createdAt: string;
}

export interface CreateClientDTO {
  name: string;
  industry?: string;
  website?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  status: ClientStatus;
}

export interface UpdateClientDTO {
  name?: string;
  industry?: string;
  website?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  status?: ClientStatus;
}

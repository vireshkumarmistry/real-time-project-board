import api from "./axios";

export interface OrganizationOption {
  _id: string;
  name: string;
}

export const fetchOrganizations = async (): Promise<OrganizationOption[]> => {
  const res = await api.get("/api/auth/organizations");
  return res.data as OrganizationOption[];
};

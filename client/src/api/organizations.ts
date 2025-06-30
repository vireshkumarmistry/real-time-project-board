import axios from "axios";

export interface OrganizationOption {
  _id: string;
  name: string;
}

export const fetchOrganizations = async (): Promise<OrganizationOption[]> => {
  const res = await axios.get("/api/auth/organizations");
  return res.data as OrganizationOption[];
};

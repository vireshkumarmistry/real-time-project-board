import api from "./axios";

export const fetchOrgUsers = async (token: string) => {
  const res = await api.get("api/auth/org-users", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

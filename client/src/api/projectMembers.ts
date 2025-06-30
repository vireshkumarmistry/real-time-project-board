import axios from "axios";

export const fetchProjectMembers = async (projectId: string, token: string) => {
  const res = await axios.get(`/api/projects/${projectId}/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

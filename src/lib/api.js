export const API_URL = 'https://real-time-chat-application-backend-4ykn.onrender.com';

const normalizeUser = (user) => {
  if (!user) return user;
  return {
    ...user,
    fullName: user.fullName || user.fullname,
  };
};

export function normalizeUsers(users = []) {
  return users.map(normalizeUser);
}

export function normalizeGroups(groups = []) {
  return groups.map((group) => ({
    ...group,
    isGroup: true,
    members: normalizeUsers(group.members || []),
  }));
}

export function normalizeContactRequests(requests = []) {
  return requests.map((request) => ({
    ...request,
    requester: normalizeUser(request.requester),
    recipient: normalizeUser(request.recipient),
  }));
}

export async function apiRequest(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

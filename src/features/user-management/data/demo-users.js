import { mockUsers } from './mock-data';

// In-memory preview data shared between the list and create routes.
let users = [...mockUsers];

export const getDemoUsers = () => users;

export const updateDemoUser = (
  id,
  { name, username, email, roleId, status }
) => {
  const existing = users.find((user) => user.id === id);
  if (!existing) return null;
  const updated = { ...existing, name, username, email, roleId, status };
  users = users.map((user) => (user.id === id ? updated : user));
  return updated;
};

export const addDemoUser = ({ name, username, email, roleId, status }) => {
  const nextId =
    Math.max(0, ...users.map((user) => Number(user.id.replace('USR-', '')))) +
    1;
  const user = {
    id: `USR-${String(nextId).padStart(3, '0')}`,
    name,
    username,
    email,
    roleId,
    status,
    lastLogin: null,
  };
  users = [user, ...users];
  return user;
};

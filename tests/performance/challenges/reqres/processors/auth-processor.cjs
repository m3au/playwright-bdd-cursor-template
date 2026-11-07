module.exports = {
  getUsersFlow,
  getUserByIdFlow,
};

async function getUsersFlow(page) {
  const response = await page.request.get('/api/users');

  if (!response.ok()) {
    throw new Error(`Failed to fetch users: ${response.status()}`);
  }

  const data = await response.json();

  if (!data || !data.data || !Array.isArray(data.data)) {
    throw new Error('Expected users array but got invalid response');
  }

  return data;
}

async function getUserByIdFlow(page) {
  const userId = Math.floor(Math.random() * 12) + 1;
  const response = await page.request.get(`/api/users/${userId}`);

  if (!response.ok()) {
    throw new Error(`Failed to fetch user ${userId}: ${response.status()}`);
  }

  const data = await response.json();

  if (!data || !data.data || !data.data.id) {
    throw new Error('Invalid user response');
  }

  return data;
}

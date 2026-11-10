module.exports = {
  getUsersPaginatedFlow,
};

async function getUsersPaginatedFlow(page) {
  const pageNumber = Math.floor(Math.random() * 2) + 1;
  const response = await page.request.get(`/api/users?page=${pageNumber}`);
  
  if (!response.ok()) {
    throw new Error(`Failed to fetch users page ${pageNumber}: ${response.status()}`);
  }
  
  const data = await response.json();
  
  if (!data || !data.data || !Array.isArray(data.data)) {
    throw new Error('Expected users array but got invalid response');
  }
  
  if (!data.page || data.page !== pageNumber) {
    throw new Error(`Expected page ${pageNumber} but got ${data.page}`);
  }
  
  return data;
}

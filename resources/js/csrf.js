import axios from 'axios';

// Function to update CSRF token
export async function updateCsrfToken() {
  try {
    const response = await axios.get('/csrf-token');
    axios.defaults.headers.common['X-CSRF-TOKEN'] = response.data.csrfToken;
  } catch (error) {
    console.error('Error updating CSRF token:', error);
  }
}

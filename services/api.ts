export const api = {
  get: async <T>(url: string): Promise<T> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.message || json.error || `Error: ${response.statusText} (${response.status})`);
        } catch (e) {
          if (e instanceof Error && e.message.startsWith('Error:')) throw e;
          throw new Error(text || `Error: ${response.statusText} (${response.status})`);
        }
      }
      return await response.json();
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },

  post: async <T>(url: string, data: any): Promise<T> => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.message || json.error || `Error: ${response.statusText} (${response.status})`);
        } catch (e) {
          if (e instanceof Error && e.message.startsWith('Error:')) throw e;
          throw new Error(text || `Error: ${response.statusText} (${response.status})`);
        }
      }
      return await response.json();
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  },

  put: async <T>(url: string, data: any): Promise<T> => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.message || json.error || `Error: ${response.statusText} (${response.status})`);
        } catch (e) {
          if (e instanceof Error && e.message.startsWith('Error:')) throw e;
          throw new Error(text || `Error: ${response.statusText} (${response.status})`);
        }
      }
      return await response.json();
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  },

  delete: async (url: string): Promise<void> => {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.message || json.error || `Error: ${response.statusText} (${response.status})`);
        } catch (e) {
          if (e instanceof Error && e.message.startsWith('Error:')) throw e;
          throw new Error(text || `Error: ${response.statusText} (${response.status})`);
        }
      }
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  },
};
import { useState, useEffect, useCallback } from 'react';

// You'll need to create a Google Cloud project and get these credentials
// See README.md for setup instructions
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_API_KEY';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const FILE_NAME = 'hit-tracker-data.json';

export function useGoogleDrive() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [tokenClient, setTokenClient] = useState(null);
  const [gapiInited, setGapiInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);

  // Initialize Google API
  useEffect(() => {
    const initGapi = async () => {
      try {
        await new Promise((resolve) => {
          if (window.gapi) {
            window.gapi.load('client', resolve);
          } else {
            // Wait for gapi to load
            const checkGapi = setInterval(() => {
              if (window.gapi) {
                clearInterval(checkGapi);
                window.gapi.load('client', resolve);
              }
            }, 100);
          }
        });

        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });

        setGapiInited(true);
      } catch (err) {
        console.error('Error initializing GAPI:', err);
        setError('Failed to initialize Google API');
      }
    };

    const initGis = () => {
      try {
        if (!window.google?.accounts?.oauth2) {
          // Wait for GIS to load
          const checkGis = setInterval(() => {
            if (window.google?.accounts?.oauth2) {
              clearInterval(checkGis);
              initGis();
            }
          }, 100);
          return;
        }

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.error) {
              setError(response.error);
              return;
            }
            setIsSignedIn(true);
            // Get user info
            getUserInfo();
          },
        });

        setTokenClient(client);
        setGisInited(true);
      } catch (err) {
        console.error('Error initializing GIS:', err);
        setError('Failed to initialize Google Sign-In');
      }
    };

    initGapi();
    initGis();
  }, []);

  // Check if we're ready
  useEffect(() => {
    if (gapiInited && gisInited) {
      setIsLoading(false);
      // Check if we have a valid token
      const token = window.gapi.client.getToken();
      if (token) {
        setIsSignedIn(true);
        getUserInfo();
      }
    }
  }, [gapiInited, gisInited]);

  // Get user info
  const getUserInfo = async () => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${window.gapi.client.getToken().access_token}`,
        },
      });
      const data = await response.json();
      setUser({
        name: data.name,
        email: data.email,
        picture: data.picture,
      });
    } catch (err) {
      console.error('Error getting user info:', err);
    }
  };

  // Sign in
  const signIn = useCallback(() => {
    if (!tokenClient) {
      setError('Google Sign-In not initialized');
      return;
    }

    // Check if we need to prompt for consent or just get a token
    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  }, [tokenClient]);

  // Sign out
  const signOut = useCallback(() => {
    const token = window.gapi.client.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
    }
    setIsSignedIn(false);
    setUser(null);
  }, []);

  // Find or create data file
  const getFileId = async () => {
    try {
      const response = await window.gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        fields: 'files(id, name)',
        q: `name='${FILE_NAME}'`,
      });

      const files = response.result.files;
      if (files && files.length > 0) {
        return files[0].id;
      }

      // Create new file
      const createResponse = await window.gapi.client.drive.files.create({
        resource: {
          name: FILE_NAME,
          parents: ['appDataFolder'],
        },
        fields: 'id',
      });

      return createResponse.result.id;
    } catch (err) {
      console.error('Error getting file ID:', err);
      throw err;
    }
  };

  // Load data from Drive
  const loadData = useCallback(async () => {
    if (!isSignedIn) return null;

    try {
      setIsLoading(true);
      const fileId = await getFileId();

      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });

      // If empty file, return null
      if (!response.body || response.body === '') {
        return null;
      }

      return JSON.parse(response.body);
    } catch (err) {
      // If file is empty or doesn't exist, return null
      if (err.status === 404 || err.result?.error?.code === 404) {
        return null;
      }
      console.error('Error loading data:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  // Save data to Drive
  const saveData = useCallback(async (data) => {
    if (!isSignedIn) return;

    try {
      const fileId = await getFileId();
      const content = JSON.stringify(data, null, 2);

      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${window.gapi.client.getToken().access_token}`,
          'Content-Type': 'application/json',
        },
        body: content,
      });

      return true;
    } catch (err) {
      console.error('Error saving data:', err);
      throw err;
    }
  }, [isSignedIn]);

  return {
    isSignedIn,
    isLoading,
    error,
    user,
    signIn,
    signOut,
    loadData,
    saveData,
  };
}

export default useGoogleDrive;

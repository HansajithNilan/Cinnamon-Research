import { database } from '../config/firebase';
import { ref, get, onValue } from 'firebase/database';

/**
 * Get the latest sensor reading from Firebase Realtime Database
 * @returns {Promise<Object>} Latest sensor data
 */
export const getLatestReading = async () => {
  try {
    const latestReadingRef = ref(database, 'latest_reading');
    const snapshot = await get(latestReadingRef);

    if (snapshot.exists()) {
      const data = snapshot.val();

      // Handle Firebase server timestamp
      let timestamp = data.timestamp;
      if (timestamp && typeof timestamp === 'object' && timestamp['.sv'] === 'timestamp') {
        timestamp = Date.now();
      } else if (typeof timestamp !== 'number') {
        timestamp = Date.now();
      }

      return {
        success: true,
        data: {
          measurement: data.measurement,
          temperature: data.temperature,
          moisture: data.moisture,
          ec: data.ec,
          ph: data.ph,
          nitrogen: data.nitrogen,
          phosphorus: data.phosphorus,
          potassium: data.potassium,
          timestamp: timestamp,
          device_uptime_millis: data.device_uptime_millis,
          device_timestamp: data.device_timestamp, // Legacy
          upload_time: data.upload_time,
          device_id: data.device_id,
        },
      };
    } else {
      return {
        success: false,
        error: 'No sensor data available',
      };
    }
  } catch (error) {
    console.error('Firebase read error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch sensor data',
    };
  }
};

/**
 * Get all sensor readings with optional limit
 * @param {number} limit - Maximum number of readings to fetch (default: 10)
 * @returns {Promise<Object>} Array of sensor readings
 */
export const getSensorReadings = async (limit = 10) => {
  try {
    const sensorDataRef = ref(database, 'sensor_data');

    // Get all data without ordering (to avoid index requirement)
    const snapshot = await get(sensorDataRef);

    if (snapshot.exists()) {
      const readings = [];
      snapshot.forEach((childSnapshot) => {
        readings.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });

      // Sort by timestamp descending (newest first)
      readings.sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return timeB - timeA;
      });

      // Limit after sorting
      const limitedReadings = readings.slice(0, limit);

      return {
        success: true,
        data: limitedReadings,
      };
    } else {
      return {
        success: false,
        error: 'No sensor data available',
      };
    }
  } catch (error) {
    console.error('Firebase read error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch sensor readings',
    };
  }
};

/**
 * Subscribe to real-time updates of the latest sensor reading
 * @param {Function} callback - Function to call when data updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToLatestReading = (callback) => {
  const latestReadingRef = ref(database, 'latest_reading');

  const unsubscribe = onValue(
    latestReadingRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Handle Firebase server timestamp - it may be an object with .sv property initially
        let timestamp = data.timestamp;
        if (timestamp && typeof timestamp === 'object' && timestamp['.sv'] === 'timestamp') {
          // Server timestamp not yet resolved, use current time
          timestamp = Date.now();
        } else if (typeof timestamp === 'number') {
          // Already a number, use as is (Firebase timestamps are in milliseconds)
          timestamp = timestamp;
        } else {
          // Fallback to current time
          timestamp = Date.now();
        }

        callback({
          success: true,
          data: {
            measurement: data.measurement,
            temperature: data.temperature,
            moisture: data.moisture,
            ec: data.ec,
            ph: data.ph,
            nitrogen: data.nitrogen,
            phosphorus: data.phosphorus,
            potassium: data.potassium,
            timestamp: timestamp,
            device_uptime_millis: data.device_uptime_millis,
            device_timestamp: data.device_timestamp, // Legacy
            upload_time: data.upload_time,
            device_id: data.device_id,
          },
        });
      } else {
        callback({
          success: false,
          error: 'No sensor data available',
        });
      }
    },
    (error) => {
      console.error('Firebase subscription error:', error);
      callback({
        success: false,
        error: error.message || 'Failed to subscribe to sensor data',
      });
    }
  );

  return unsubscribe;
};

/**
 * Format timestamp to readable date string
 * @param {number} timestamp - Unix timestamp in milliseconds or seconds
 * @returns {string} Formatted date string
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';

  const date = new Date(timestamp);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Just now';
  }

  // Format to local time with timezone
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format timestamp as relative time (e.g., "2 minutes ago", "just now")
 * @param {number} timestamp - Unix timestamp in milliseconds or seconds
 * @returns {string} Relative time string
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Never';

  const now = Date.now();
  const diff = now - timestamp;

  // Handle negative differences (future timestamps or clock skew)
  if (diff < 0) return 'just now';

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

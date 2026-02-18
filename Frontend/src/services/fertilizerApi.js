import axios from 'axios';

const API_BASE_URL = 'https://smartcinnamon-api-94717x.azurewebsites.net';

/**
 * Get fertilizer recommendations based on soil parameters
 * @param {Object} sensorData - Soil sensor data
 * @param {number} sensorData.N - Nitrogen level
 * @param {number} sensorData.P - Phosphorus level
 * @param {number} sensorData.K - Potassium level
 * @param {number} sensorData.pH - pH level
 * @param {number} sensorData.EC - Electrical conductivity
 * @param {number} sensorData.Moisture - Moisture percentage
 * @param {number} sensorData.Temperature - Temperature in Celsius
 * @param {number} sensorData.Organic_Matter - Organic matter percentage
 * @param {string} sensorData.Soil_Quality - Soil quality (Poor, Fair, Good, Excellent)
 * @param {string} sensorData.Stage - Crop stage (Young, Mature, Flowering, etc.)
 * @returns {Promise<Object>} Fertilizer recommendation data
 */
export const getFertilizerRecommendation = async (sensorData) => {
  try {
    console.log('Calling API:', `${API_BASE_URL}/recommend`);
    console.log('Request data:', JSON.stringify(sensorData, null, 2));

    const response = await axios.post(`${API_BASE_URL}/recommend`, sensorData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });

    console.log('API Response status:', response.status);
    console.log('API Response data:', JSON.stringify(response.data, null, 2));

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Fertilizer recommendation API error:', error);

    let errorMessage = 'Failed to get fertilizer recommendations';

    if (error.response) {
      // Server responded with error
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;

      // If 400 error, show more details
      if (error.response.status === 400) {
        const details = error.response.data?.details || error.response.data;
        errorMessage = `Invalid data: ${typeof details === 'string' ? details : JSON.stringify(details)}`;
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
      errorMessage = 'No response from server. Please check your internet connection.';
    } else {
      // Error in request setup
      console.error('Request setup error:', error.message);
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Calculate soil quality based on sensor readings
 * This is a helper function to determine soil quality if not provided
 *
 * API accepts ONLY: 'Medium', 'Poor', 'Rich'
 */
export const calculateSoilQuality = (N, P, K, pH, organicMatter) => {
  let score = 0;

  // Nitrogen scoring (0-100 range)
  if (N >= 40 && N <= 80) score += 25;
  else if (N >= 20 && N < 40) score += 15;
  else if (N > 80 && N <= 100) score += 20;
  else score += 10;

  // Phosphorus scoring (0-60 range)
  if (P >= 20 && P <= 40) score += 25;
  else if (P >= 10 && P < 20) score += 15;
  else if (P > 40 && P <= 60) score += 20;
  else score += 10;

  // Potassium scoring (0-120 range)
  if (K >= 60 && K <= 100) score += 25;
  else if (K >= 30 && K < 60) score += 15;
  else if (K > 100 && K <= 120) score += 20;
  else score += 10;

  // pH scoring (optimal 5.5-7.0 for cinnamon)
  if (pH >= 5.5 && pH <= 7.0) score += 15;
  else if (pH >= 5.0 && pH < 5.5) score += 10;
  else if (pH > 7.0 && pH <= 7.5) score += 10;
  else score += 5;

  // Organic matter scoring
  if (organicMatter >= 3 && organicMatter <= 5) score += 10;
  else if (organicMatter >= 2 && organicMatter < 3) score += 7;
  else if (organicMatter > 5) score += 8;
  else score += 3;

  // Determine quality based on score
  // API only accepts: 'Rich', 'Medium', 'Poor'
  if (score >= 70) return 'Rich';
  if (score >= 40) return 'Medium';
  return 'Poor';
};

/**
 * Estimate organic matter from EC and moisture (rough estimation)
 */
export const estimateOrganicMatter = (ec, moisture) => {
  // This is a rough estimation - adjust based on your specific soil conditions
  // Higher EC and moderate moisture often correlate with organic matter
  let organicMatter = 1.5; // Base value

  if (ec > 0.8 && ec < 2.0) organicMatter += 0.5;
  if (ec >= 2.0) organicMatter += 1.0;

  if (moisture >= 30 && moisture <= 50) organicMatter += 0.5;
  if (moisture > 50 && moisture <= 70) organicMatter += 0.3;

  return parseFloat(organicMatter.toFixed(1));
};

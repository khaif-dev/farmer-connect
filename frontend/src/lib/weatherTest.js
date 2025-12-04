import { WeatherAPI } from './weatherAPI';

// Test the weather API integration
export const testWeatherAPI = async () => {
  console.log('Testing weather API...');
  
  try {
    // Test current weather
    console.log('Fetching current weather...');
    const current = await WeatherAPI.getCurrentWeather();
    console.log('Current weather:', current);
    
    // Test forecast
    console.log('Fetching forecast...');
    const forecast = await WeatherAPI.getForecast();
    console.log('Forecast:', forecast);
    
    // Test alerts
    console.log('Fetching weather alerts...');
    const alerts = await WeatherAPI.getWeatherAlerts();
    console.log('Weather alerts:', alerts);
    
    if (current && forecast) {
      console.log('✅ Weather API test successful!');
      return {
        success: true,
        current,
        forecast: forecast.slice(0, 3), // First 3 days
        alerts
      };
    } else {
      console.log('❌ Weather API test failed - incomplete data');
      return { success: false, error: 'Incomplete weather data' };
    }
  } catch (error) {
    console.error('❌ Weather API test failed:', error);
    return { success: false, error: error.message };
  }
};

// Auto-test if this file is imported
console.log('Weather API test ready. Run testWeatherAPI() in browser console to test.');
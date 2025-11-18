const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Kenya's approximate coordinates (center of country)
const KENYA_COORDS = {
  lat: -0.0236,
  lon: 37.9062
};

export class WeatherAPI {
  static async getCurrentWeather(lat = KENYA_COORDS.lat, lon = KENYA_COORDS.lon) {
    try {
      const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,pressure_msl,weather_code&timezone=auto`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert Open-Meteo weather code to description and icon
      const weatherInfo = this.getWeatherInfoFromCode(data.current.weather_code);
      
      return {
        temperature: Math.round(data.current.temperature_2m),
        description: weatherInfo.description,
        humidity: Math.round(data.current.relative_humidity_2m),
        windSpeed: Math.round(data.current.wind_speed_10m * 3.6), // Convert m/s to km/h
        pressure: Math.round(data.current.pressure_msl),
        icon: weatherInfo.icon,
        city: 'Kenya'
      };
    } catch (error) {
      console.error('Failed to fetch current weather:', error);
      return null;
    }
  }

  static async getForecast(lat = KENYA_COORDS.lat, lon = KENYA_COORDS.lon) {
    try {
      const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean,weather_code&timezone=auto&forecast_days=7`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process forecast data to get daily summaries
      const dailyForecasts = [];
      const today = new Date();
      
      for (let i = 0; i < data.daily.time.length; i++) {
        const date = new Date(data.daily.time[i]);
        const dayDiff = Math.floor((date - today) / (1000 * 60 * 60 * 24));
        
        if (dayDiff >= 0 && dayDiff <= 7) { // Next 7 days
          const weatherInfo = this.getWeatherInfoFromCode(data.daily.weather_code[i]);
          
          dailyForecasts.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            temp: Math.round(data.daily.temperature_2m_max[i]),
            minTemp: Math.round(data.daily.temperature_2m_min[i]),
            maxTemp: Math.round(data.daily.temperature_2m_max[i]),
            description: weatherInfo.description,
            icon: weatherInfo.icon,
            humidity: Math.round(data.daily.relative_humidity_2m_mean[i]),
            windSpeed: Math.round(data.daily.wind_speed_10m_max[i] * 3.6),
            precipitation: data.daily.precipitation_sum[i] || 0
          });
        }
      }
      
      return dailyForecasts;
    } catch (error) {
      console.error('Failed to fetch weather forecast:', error);
      return null;
    }
  }

  static async getWeatherAlerts(lat = KENYA_COORDS.lat, lon = KENYA_COORDS.lon) {
    try {
      const current = await this.getCurrentWeather(lat, lon);
      const forecast = await this.getForecast(lat, lon);
      
      if (!current || !forecast) {
        return [];
      }
      
      const alerts = [];
      
      // Check for heavy rainfall alerts
      const heavyRainDays = forecast.filter(day => 
        day.precipitation > 10 || 
        day.description.includes('rain') || 
        day.description.includes('drizzle')
      );
      
      if (heavyRainDays.length > 0) {
        alerts.push({
          type: 'rain',
          severity: 'warning',
          title: 'Rainfall Alert',
          message: `Heavy rainfall expected in the next ${heavyRainDays.length} day(s). Prepare drainage and harvest ripe crops.`,
          days: heavyRainDays.map(day => day.date)
        });
      }
      
      // Check for high temperature alerts
      const hotDays = forecast.filter(day => day.maxTemp > 35);
      if (hotDays.length > 0) {
        alerts.push({
          type: 'heat',
          severity: 'warning',
          title: 'High Temperature Alert',
          message: `Extreme heat (${hotDays[0].maxTemp}°C) expected. Ensure adequate watering and provide shade for livestock.`,
          days: hotDays.map(day => day.date)
        });
      }
      
      // Check for low humidity alerts
      const lowHumidityDays = forecast.filter(day => day.humidity < 30);
      if (lowHumidityDays.length > 0) {
        alerts.push({
          type: 'drought',
          severity: 'info',
          title: 'Low Humidity Alert',
          message: `Low humidity (${lowHumidityDays[0].humidity}%) expected. Monitor irrigation needs carefully.`,
          days: lowHumidityDays.map(day => day.date)
        });
      }
      
      // Check for strong wind alerts
      const windyDays = forecast.filter(day => day.windSpeed > 30);
      if (windyDays.length > 0) {
        alerts.push({
          type: 'wind',
          severity: 'info',
          title: 'Strong Wind Alert',
          message: `Strong winds (${windyDays[0].windSpeed} km/h) expected. Secure loose items and avoid spraying chemicals.`,
          days: windyDays.map(day => day.date)
        });
      }
      
      return alerts;
    } catch (error) {
      console.error('Failed to generate weather alerts:', error);
      return [];
    }
  }

  static getWeatherInfoFromCode(code) {
    // Open-Meteo weather code mapping
    const weatherCodes = {
      0: { description: 'Clear sky', icon: '☀️' },
      1: { description: 'Mainly clear', icon: '🌤️' },
      2: { description: 'Partly cloudy', icon: '⛅' },
      3: { description: 'Overcast', icon: '☁️' },
      45: { description: 'Fog', icon: '🌫️' },
      48: { description: 'Depositing rime fog', icon: '🌫️' },
      51: { description: 'Light drizzle', icon: '🌦️' },
      53: { description: 'Moderate drizzle', icon: '🌦️' },
      55: { description: 'Dense drizzle', icon: '🌧️' },
      56: { description: 'Light freezing drizzle', icon: '🌧️' },
      57: { description: 'Dense freezing drizzle', icon: '🌧️' },
      61: { description: 'Slight rain', icon: '🌦️' },
      63: { description: 'Moderate rain', icon: '🌧️' },
      65: { description: 'Heavy rain', icon: '🌧️' },
      66: { description: 'Light freezing rain', icon: '🌧️' },
      67: { description: 'Heavy freezing rain', icon: '🌧️' },
      71: { description: 'Slight snow fall', icon: '🌨️' },
      73: { description: 'Moderate snow fall', icon: '❄️' },
      75: { description: 'Heavy snow fall', icon: '❄️' },
      77: { description: 'Snow grains', icon: '❄️' },
      80: { description: 'Slight rain showers', icon: '🌦️' },
      81: { description: 'Moderate rain showers', icon: '🌧️' },
      82: { description: 'Violent rain showers', icon: '🌧️' },
      85: { description: 'Slight snow showers', icon: '🌨️' },
      86: { description: 'Heavy snow showers', icon: '❄️' },
      95: { description: 'Thunderstorm', icon: '⛈️' },
      96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
      99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' }
    };
    
    return weatherCodes[code] || { description: 'Clear sky', icon: '☀️' };
  }

  static getWeatherIcon(iconCode) {
    return this.getWeatherInfoFromCode(iconCode).icon;
  }

  static formatTemperature(temp) {
    return `${temp}°C`;
  }

  static getWeatherAdvice(weather, forecast = []) {
    const advice = [];
    
    // Temperature-based advice
    if (weather.temperature > 30) {
      advice.push('High temperature - increase irrigation frequency');
    } else if (weather.temperature < 10) {
      advice.push('Low temperature - protect sensitive crops');
    }
    
    // Humidity-based advice
    if (weather.humidity < 40) {
      advice.push('Low humidity - monitor soil moisture closely');
    } else if (weather.humidity > 80) {
      advice.push('High humidity - watch for fungal diseases');
    }
    
    // Wind-based advice
    if (weather.windSpeed > 25) {
      advice.push('Strong winds - avoid spraying operations');
    }
    
    // Forecast-based advice
    const rainyDays = forecast.filter(day => 
      day.precipitation > 0 || day.description.includes('rain')
    );
    if (rainyDays.length > 1) {
      advice.push('Multiple rainy days expected - plan harvesting accordingly');
    }
    
    return advice;
  }
}
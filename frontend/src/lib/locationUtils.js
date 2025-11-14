// Location utilities for Kenya administrative boundaries
import { kenyaSubcounties } from '../data/kenyaSubcounties.js';

// Point-in-polygon algorithm using ray casting
function pointInPolygon(point, vs) {
    const x = point[0], y = point[1];
    let inside = false;

    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];

        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }

    return inside;
}

// Check if point is within a MultiPolygon
function pointInMultiPolygon(point, multiPolygon) {
    for (const polygon of multiPolygon) {
        if (pointInPolygon(point, polygon[0])) { // polygon[0] contains the outer ring
            return true;
        }
    }
    return false;
}

// Load GeoJSON and find administrative area for coordinates
async function findAdministrativeArea(latitude, longitude) {
    try {
        // Kenya bounding box for quick validation
        if (latitude < -5 || latitude > 5 || longitude < 33 || longitude > 42) {
            console.warn('Coordinates outside Kenya bounds');
            return null;
        }

        // Load and parse county data
        const countiesResponse = await fetch('/counties.geojson');
        if (!countiesResponse.ok) {
            console.warn('Could not load counties.geojson');
            return null;
        }
        const countiesData = await countiesResponse.json();

        // Find county containing the point
        let foundCounty = null;
        for (const feature of countiesData.features) {
            if (pointInMultiPolygon([longitude, latitude], feature.geometry.coordinates)) {
                foundCounty = {
                    name: feature.properties.ADM1_EN,
                    code: feature.properties.ADM1_PCODE
                };
                break;
            }
        }

        if (!foundCounty) {
            console.warn('Could not find county for coordinates');
            return null;
        }

        // Load and parse sub-county data
        const subCountiesResponse = await fetch('/sub_county.geojson');
        if (!subCountiesResponse.ok) {
            console.warn('Could not load sub_county.geojson');
            return { county: foundCounty, subCounty: null };
        }
        const subCountiesData = await subCountiesResponse.json();

        // Find sub-county containing the point
        let foundSubCounty = null;
        for (const feature of subCountiesData.features) {
            if (pointInMultiPolygon([longitude, latitude], feature.geometry.coordinates)) {
                foundSubCounty = {
                    name: feature.properties.ADM2_EN,
                    code: feature.properties.ADM2_PCODE,
                    countyName: feature.properties.ADM1_EN,
                    countyCode: feature.properties.ADM1_PCODE
                };
                break;
            }
        }

        // Validate that sub-county belongs to found county
        if (foundSubCounty && foundSubCounty.countyName !== foundCounty.name) {
            console.warn('Sub-county county mismatch, using sub-county county');
            foundCounty = {
                name: foundSubCounty.countyName,
                code: foundSubCounty.countyCode
            };
        }

        return {
            county: foundCounty,
            subCounty: foundSubCounty
        };

    } catch (error) {
        console.error('Error finding administrative area:', error);
        return null;
    }
}

// Smart matching using fallback dataset when GeoJSON is unavailable
function findLocationByName(countyName, subCountyName) {
  if (!countyName && !subCountyName) return null;

  // Find county in our local dataset (kenyaSubcounties is an object)
  const countyKeys = Object.keys(kenyaSubcounties);
  
  // First try exact match
  if (countyName) {
    const exactCounty = countyKeys.find(county =>
      county.toLowerCase() === countyName.toLowerCase()
    );
    
    if (exactCounty) {
      let subCounty = null;
      if (subCountyName) {
        const subCounties = kenyaSubcounties[exactCounty];
        const exactSubCounty = subCounties.find(sub =>
          sub.toLowerCase() === subCountyName.toLowerCase()
        );
        if (exactSubCounty) {
          subCounty = { name: exactSubCounty, code: exactSubCounty };
        }
      }
      
      return {
        county: {
          name: exactCounty,
          code: exactCounty
        },
        subCounty: subCounty
      };
    }
  }

  // Fuzzy matching as fallback
  if (countyName) {
    const fuzzyCounty = countyKeys.find(county =>
      county.toLowerCase().includes(countyName.toLowerCase()) ||
      countyName.toLowerCase().includes(county.toLowerCase())
    );
    
    if (fuzzyCounty) {
      let subCounty = null;
      if (subCountyName) {
        const subCounties = kenyaSubcounties[fuzzyCounty];
        const fuzzySubCounty = subCounties.find(sub =>
          sub.toLowerCase().includes(subCountyName.toLowerCase()) ||
          subCountyName.toLowerCase().includes(sub.toLowerCase())
        );
        if (fuzzySubCounty) {
          subCounty = { name: fuzzySubCounty, code: fuzzySubCounty };
        }
      }
      
      return {
        county: {
          name: fuzzyCounty,
          code: fuzzyCounty
        },
        subCounty: subCounty
      };
    }
  }

  return null;
}

// Get location suggestions based on partial text
function getLocationSuggestions(query, type = 'both') {
  if (!query || query.length < 2) return [];

  const suggestions = [];
  const queryLower = query.toLowerCase();

  // Convert object to entries for iteration
  const countyEntries = Object.entries(kenyaSubcounties);

  for (const [countyName, subCounties] of countyEntries) {
    // County suggestions
    if (type === 'county' || type === 'both') {
      if (countyName.toLowerCase().includes(queryLower)) {
        suggestions.push({
          type: 'county',
          name: countyName,
          code: countyName,
          display: `County: ${countyName}`
        });
      }
    }

    // Sub-county suggestions
    if (type === 'subcounty' || type === 'both') {
      for (const subCounty of subCounties) {
        if (subCounty.toLowerCase().includes(queryLower)) {
          suggestions.push({
            type: 'subcounty',
            name: subCounty,
            code: subCounty,
            countyName: countyName,
            countyCode: countyName,
            display: `Sub-county: ${subCounty}, ${countyName}`
          });
        }
      }
    }
  }

  return suggestions.slice(0, 10); // Limit to 10 suggestions
}

// Validate if coordinates are within Kenya bounds
function isValidKenyaCoordinates(latitude, longitude) {
    return (
        latitude >= -5 && latitude <= 5 &&
        longitude >= 33 && longitude <= 42
    );
}

// Reverse geocode using browser geolocation (with fallback)
function reverseGeocode(latitude, longitude) {
    return new Promise((resolve) => {
        // Try browser geolocation API first
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };

                    // Try to find administrative area
                    const adminArea = await findAdministrativeArea(coords.latitude, coords.longitude);
                    resolve({
                        ...coords,
                        ...adminArea,
                        source: 'gps'
                    });
                },
                (error) => {
                    console.warn('GPS location failed:', error);
                    // Use provided coordinates as fallback
                    resolve({
                        latitude,
                        longitude,
                        source: 'manual'
                    });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        } else {
            // Fallback for browsers without geolocation
            resolve({
                latitude,
                longitude,
                source: 'manual'
            });
        }
    });
}

export {
    findAdministrativeArea,
    findLocationByName,
    getLocationSuggestions,
    isValidKenyaCoordinates,
    reverseGeocode,
    pointInPolygon,
    pointInMultiPolygon
};
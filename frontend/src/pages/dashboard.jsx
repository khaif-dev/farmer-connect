// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFarms, getAnimals, getCrops, createFarm, updateFarm, deleteFarm, createAnimal, updateAnimal, deleteAnimal, createCrop, updateCrop, deleteCrop, marketAPI } from '../lib/API';
import { WeatherAPI } from '../lib/weatherAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { kenyaSubcounties } from '../data/kenyaSubcounties';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const Dashboard = () => {
  const { user } = useAuth();
  const [farms, setFarms] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [marketListings, setMarketListings] = useState([]);
  // Modal states
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [showEditFarmModal, setShowEditFarmModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [showEditAnimalModal, setShowEditAnimalModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showEditCropModal, setShowEditCropModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showListingModal, setShowListingModal] = useState(false);
  const [showEditListingModal, setShowEditListingModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  // Form data states
  const [farmFormData, setFarmFormData] = useState({
    name: '',
    size: '',
    county: '',
    subCounty: '',
    description: ''
  });
  const [animalFormData, setAnimalFormData] = useState({
    farmId: '',
    type: '',
    breed: '',
    number: '',
    ageGroup: '',
    lastVaccinationDate: '',
    nextVaccinationDate: '',
    notes: ''
  });
  const [cropFormData, setCropFormData] = useState({
    farmId: '',
    type: '',
    variety: '',
    plantingDate: '',
    expectedHarvestingDate: '',
    area: '',
    status: 'planted',
    notes: ''
  });
  const [listingFormData, setListingFormData] = useState({
    farmId: '',
    productName: '',
    productType: '',
    productStatus: 'harvested',
    quantityAmount: '',
    quantityUnit: 'kg',
    pricePerUnit: '',
    description: ''
  });
  const [selectedCounty, setSelectedCounty] = useState('');
  const [crops, setCrops] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isBuyer = user?.userType === 'buyer';
  
  // Weather states
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherForecast, setWeatherForecast] = useState([]);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchWeatherData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (isBuyer) {
        // For buyers: get all available listings (from farmers) and their own listings (should be empty)
        const [availableRes, userListingsRes] = await Promise.all([
          marketAPI.getListings(), // All listings from farmers
          marketAPI.getUserListings() // Their own listings (buyers shouldn't have any)
        ]);

        setMarketListings(availableRes.data || []);
        setListings(userListingsRes.data || []);
      } else {
        // For farmers: get all farm data and their own listings
        const [farmsRes, animalsRes, cropsRes, userListingsRes] = await Promise.all([
          getFarms(),
          getAnimals(),
          getCrops(),
          marketAPI.getUserListings() // Their own listings
        ]);

        setFarms(farmsRes.data || []);
        setAnimals(animalsRes.data || []);
        setCrops(cropsRes.data || []);
        setMarketListings(userListingsRes.data || []); // For farmers, marketListings contains their own listings
        setListings(userListingsRes.data || []);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async () => {
    try {
      setWeatherLoading(true);
      setWeatherError('');
      
      // Use user's location if available, otherwise use Kenya coordinates
      const userLocation = user?.location;
      const lat = userLocation?.coordinates?.lat || -0.0236;
      const lon = userLocation?.coordinates?.lon || 37.9062;
      
      const [current, forecast, alerts] = await Promise.all([
        WeatherAPI.getCurrentWeather(lat, lon),
        WeatherAPI.getForecast(lat, lon),
        WeatherAPI.getWeatherAlerts(lat, lon)
      ]);
      
      setCurrentWeather(current);
      setWeatherForecast(forecast || []);
      setWeatherAlerts(alerts || []);
    } catch (err) {
      setWeatherError('Failed to load weather data');
      console.error('Weather error:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    
    try {
      if (!farmFormData.name || !selectedCounty || !farmFormData.subCounty) {
        setError('Please fill in all required fields');
        return;
      }

      const farmData = {
        name: farmFormData.name,
        size: parseFloat(farmFormData.size) || 0,
        location: {
          county: selectedCounty,
          subCounty: farmFormData.subCounty
        },
        description: farmFormData.description
      };

      await createFarm(farmData);
      setShowFarmModal(false);
      setFarmFormData({ name: '', size: '', county: '', subCounty: '', description: '' });
      setSelectedCounty('');
      setError('');
      fetchDashboardData(); // Refresh the data
    } catch (err) {
      setError('Failed to create farm: ' + err.message);
    }
  };

  const handleCreateAnimal = async (e) => {
    e.preventDefault();
    
    try {
      if (!animalFormData.farmId || !animalFormData.type) {
        setError('Please fill in all required fields');
        return;
      }

      const animalData = {
        farmId: animalFormData.farmId,
        type: animalFormData.type,
        breed: animalFormData.breed || '',
        number: parseInt(animalFormData.number) || 1,
        ageGroup: animalFormData.ageGroup || '',
        lastVaccinationDate: animalFormData.lastVaccinationDate || null,
        nextVaccinationDate: animalFormData.nextVaccinationDate || null,
        notes: animalFormData.notes || ''
      };

      await createAnimal(animalData);
      setShowAnimalModal(false);
      setAnimalFormData({
        farmId: '',
        type: '',
        breed: '',
        number: '',
        ageGroup: '',
        lastVaccinationDate: '',
        nextVaccinationDate: '',
        notes: ''
      });
      setError('');
      fetchDashboardData(); // Refresh the data
    } catch (err) {
      setError('Failed to create animal: ' + err.message);
    }
  };

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    
    try {
      if (!cropFormData.farmId || !cropFormData.type) {
        setError('Please fill in all required fields');
        return;
      }

      const cropData = {
        farmId: cropFormData.farmId,
        type: cropFormData.type,
        variety: cropFormData.variety || '',
        plantingDate: cropFormData.plantingDate || null,
        expectedHarvestingDate: cropFormData.expectedHarvestingDate || null,
        area: parseFloat(cropFormData.area) || 0,
        status: cropFormData.status,
        notes: cropFormData.notes || ''
      };

      await createCrop(cropData);
      setShowCropModal(false);
      setCropFormData({
        farmId: '',
        type: '',
        variety: '',
        plantingDate: '',
        expectedHarvestingDate: '',
        area: '',
        status: 'planted',
        notes: ''
      });
      setError('');
      fetchDashboardData(); // Refresh the data
    } catch (err) {
      setError('Failed to create crop: ' + err.message);
    }
  };

  const handleEditFarm = (farm) => {
    setEditingFarm(farm);
    setFarmFormData({
      name: farm.name || '',
      size: farm.size?.toString() || '',
      county: farm.location?.county || '',
      subCounty: farm.location?.subCounty || '',
      description: farm.description || ''
    });
    setSelectedCounty(farm.location?.county || '');
    setShowEditFarmModal(true);
  };

  const handleUpdateFarm = async (e) => {
    e.preventDefault();
    
    try {
      if (!editingFarm || !farmFormData.name || !selectedCounty || !farmFormData.subCounty) {
        setError('Please fill in all required fields');
        return;
      }

      const farmData = {
        name: farmFormData.name,
        size: parseFloat(farmFormData.size) || 0,
        location: {
          county: selectedCounty,
          subCounty: farmFormData.subCounty
        },
        description: farmFormData.description
      };

      await updateFarm(editingFarm._id, farmData);
      setShowEditFarmModal(false);
      setEditingFarm(null);
      setFarmFormData({ name: '', size: '', county: '', subCounty: '', description: '' });
      setSelectedCounty('');
      setError('');
      fetchDashboardData(); // Refresh the data
    } catch (err) {
      setError('Failed to update farm: ' + err.message);
    }
  };

  const handleDeleteFarm = async (farmId) => {
    if (!window.confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteFarm(farmId);
      setError('');
      fetchDashboardData(); // Refresh the data
    } catch (err) {
      setError('Failed to delete farm: ' + err.message);
    }
  };

  const handleEditAnimal = (animal) => {
    setEditingAnimal(animal);
    setAnimalFormData({
      farmId: animal.farmId || '',
      type: animal.type || '',
      breed: animal.breed || '',
      number: animal.number?.toString() || '',
      ageGroup: animal.ageGroup || '',
      lastVaccinationDate: animal.lastVaccinationDate || '',
      nextVaccinationDate: animal.nextVaccinationDate || '',
      notes: animal.notes || ''
    });
    setShowEditAnimalModal(true);
  };

  const handleUpdateAnimal = async (e) => {
    e.preventDefault();
    
    try {
      if (!editingAnimal || !animalFormData.farmId || !animalFormData.type) {
        setError('Please fill in all required fields');
        return;
      }

      const animalData = {
        farmId: animalFormData.farmId,
        type: animalFormData.type,
        breed: animalFormData.breed || '',
        number: parseInt(animalFormData.number) || 1,
        ageGroup: animalFormData.ageGroup || '',
        lastVaccinationDate: animalFormData.lastVaccinationDate || null,
        nextVaccinationDate: animalFormData.nextVaccinationDate || null,
        notes: animalFormData.notes || ''
      };

      await updateAnimal(editingAnimal._id, animalData);
      setShowEditAnimalModal(false);
      setEditingAnimal(null);
      setAnimalFormData({
        farmId: '',
        type: '',
        breed: '',
        number: '',
        ageGroup: '',
        lastVaccinationDate: '',
        nextVaccinationDate: '',
        notes: ''
      });
      setError('');
      fetchDashboardData(); // Refresh the data
    } catch (err) {
      setError('Failed to update animal: ' + err.message);
    }
  };

  const handleDeleteAnimal = async (animalId) => {
    if (!window.confirm('Are you sure you want to delete this animal? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteAnimal(animalId);
      setError('');
      fetchDashboardData(); // Refresh the data
    } catch (err) {
      setError('Failed to delete animal: ' + err.message);
    }
  };

  const handleEditCrop = (crop) => {
    setEditingCrop(crop);
    setCropFormData({
      farmId: crop.farmId || '',
      type: crop.type || '',
      variety: crop.variety || '',
      plantingDate: crop.plantingDate || '',
      expectedHarvestingDate: crop.expectedHarvestingDate || '',
      area: crop.area?.toString() || '',
      status: crop.status || 'planted',
      notes: crop.notes || ''
    });
    setShowEditCropModal(true);
  };

  const handleUpdateCrop = async (e) => {
    e.preventDefault();
    
    try {
      if (!editingCrop || !cropFormData.farmId || !cropFormData.type) {
        setError('Please fill in all required fields');
        return;
      }

      const cropData = {
        farmId: cropFormData.farmId,
        type: cropFormData.type,
        variety: cropFormData.variety || '',
        plantingDate: cropFormData.plantingDate || null,
        expectedHarvestingDate: cropFormData.expectedHarvestingDate || null,
        area: parseFloat(cropFormData.area) || 0,
        status: cropFormData.status,
        notes: cropFormData.notes || ''
      };

      await updateCrop(editingCrop._id, cropData);
      setShowEditCropModal(false);
      setEditingCrop(null);
      setCropFormData({
        farmId: '',
        type: '',
        variety: '',
        plantingDate: '',
        expectedHarvestingDate: '',
        area: '',
        status: 'planted',
        notes: ''
      });
      setError('');
      fetchDashboardData(); // Refresh the data
    } catch (err) {
      setError('Failed to update crop: ' + err.message);
    }
  };

  const handleDeleteCrop = async (cropId) => {
    if (!window.confirm('Are you sure you want to delete this crop? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteCrop(cropId);
      setError('');
      fetchDashboardData(); // Refresh the data
    } catch (err) {
      setError('Failed to delete crop: ' + err.message);
    }
  };

  const handleEditListing = (listing) => {
    setEditingListing(listing);
    setListingFormData({
      farmId: listing.farmId || '',
      productName: listing.product?.name || '',
      productType: listing.product?.name || '',
      productStatus: listing.product?.status || 'harvested',
      quantityAmount: listing.quantity?.amount?.toString() || '',
      quantityUnit: listing.quantity?.unit || 'kg',
      pricePerUnit: listing.pricePerUnit?.toString() || '',
      description: listing.description || ''
    });
    setShowEditListingModal(true);
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    
    try {
      if (!editingListing || !listingFormData.farmId || !listingFormData.productName || !listingFormData.quantityAmount || !listingFormData.pricePerUnit) {
        setError('Please fill in all required fields');
        return;
      }

      const selectedFarm = farms.find(f => f._id === listingFormData.farmId);
      if (!selectedFarm) {
        setError('Selected farm not found');
        return;
      }

      const listingData = {
        farmId: listingFormData.farmId,
        location: {
          county: selectedFarm.location?.county || '',
          subCounty: selectedFarm.location?.subCounty || ''
        },
        product: {
          name: listingFormData.productName,
          status: listingFormData.productStatus
        },
        quantity: {
          amount: parseFloat(listingFormData.quantityAmount),
          unit: listingFormData.quantityUnit
        },
        pricePerUnit: parseFloat(listingFormData.pricePerUnit),
        description: listingFormData.description || ''
      };

      await marketAPI.updateListing(editingListing._id, listingData);
      setShowEditListingModal(false);
      setEditingListing(null);
      setListingFormData({
        farmId: '',
        productName: '',
        productType: '',
        productStatus: 'harvested',
        quantityAmount: '',
        quantityUnit: 'kg',
        pricePerUnit: '',
        description: ''
      });
      setError('');
      fetchDashboardData(); // Refresh the data
    } catch (err) {
      setError('Failed to update listing: ' + err.message);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }
    
    try {
      await marketAPI.deleteListing(listingId);
      setError('');
      fetchDashboardData(); // Refresh the data
    } catch (err) {
      setError('Failed to delete listing: ' + err.message);
    }
  };

  

  const handleCreateListing = async (e) => {
    e.preventDefault();
    
    try {
      if (!listingFormData.farmId || !listingFormData.productName || !listingFormData.quantityAmount || !listingFormData.pricePerUnit) {
        setError('Please fill in all required fields');
        return;
      }

      const selectedFarm = farms.find(f => f._id === listingFormData.farmId);
      if (!selectedFarm) {
        setError('Selected farm not found');
        return;
      }

      const listingData = {
        farmId: listingFormData.farmId,
        location: {
          county: selectedFarm.location?.county || '',
          subCounty: selectedFarm.location?.subCounty || ''
        },
        product: {
          name: listingFormData.productName,
          status: listingFormData.productStatus
        },
        quantity: {
          amount: parseFloat(listingFormData.quantityAmount),
          unit: listingFormData.quantityUnit
        },
        pricePerUnit: parseFloat(listingFormData.pricePerUnit),
        description: listingFormData.description || ''
      };

      await marketAPI.createListing(listingData);
      setShowListingModal(false);
      setListingFormData({
        farmId: '',
        productName: '',
        productType: '',
        productStatus: 'harvested',
        quantityAmount: '',
        quantityUnit: 'kg',
        pricePerUnit: '',
        description: ''
      });
      setError('');
      fetchDashboardData(); // Refresh the data
    } catch (err) {
      setError('Failed to create listing: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg text-gray-700 dark:text-gray-300">Loading your farm data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            {isBuyer ? "Here's your buying overview" : "Here's your farming overview"}
          </p>
          {isBuyer && user?.buyerDetails?.institutionType && (
            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">
              {user.buyerDetails.institutionType} • {user.location?.county}, {user.location?.subCounty}
            </p>
          )}
        </div>
        <Button
          onClick={() => { fetchDashboardData(); fetchWeatherData(); }}
          variant="outline"
          className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 w-fit sm:w-auto self-start sm:self-auto"
          size="sm"
        >
          Refresh Data
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Weather Section */}
      {currentWeather && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Current Weather Card */}
          <Card className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <span className="text-lg sm:text-2xl">{WeatherAPI.getWeatherIcon(currentWeather.icon)}</span>
                Current Weather
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {WeatherAPI.formatTemperature(currentWeather.temperature)}
                  </span>
                  <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 capitalize">
                    {currentWeather.description}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-600 dark:text-blue-400">
                  <div>Humidity: {currentWeather.humidity}%</div>
                  <div>Wind: {currentWeather.windSpeed} km/h</div>
                  <div>Pressure: {currentWeather.pressure} hPa</div>
                  <div>{currentWeather.city}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Alerts */}
          <div className="lg:col-span-2 space-y-4">
            {weatherAlerts.length > 0 ? (
              weatherAlerts.map((alert, index) => (
                <Alert
                  key={index}
                  className={`${
                    alert.severity === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <AlertDescription className={`text-xs sm:text-sm ${
                    alert.severity === 'warning'
                      ? 'text-amber-800 dark:text-amber-300'
                      : 'text-blue-800 dark:text-blue-300'
                  }`}>
                    <strong>{alert.title}:</strong> {alert.message}
                    {alert.days.length > 0 && (
                      <span className="block text-xs mt-1 opacity-75">
                        Affected dates: {alert.days.join(', ')}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              ))
            ) : (
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <AlertDescription className="text-xs sm:text-sm text-green-800 dark:text-green-300">
                  <strong>No Weather Alerts:</strong> Current conditions are favorable for farming activities.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      {/* Weather Loading State */}
      {weatherLoading && (
        <Alert className="bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700">
          <AlertDescription className="text-gray-600 dark:text-gray-400">
            Loading current weather conditions...
          </AlertDescription>
        </Alert>
      )}

      {/* Weather Error State */}
      {weatherError && (
        <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertDescription className="text-red-700 dark:text-red-300">
            <strong>Weather Error:</strong> {weatherError}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {isBuyer ? (
          // Buyer Stats - Original Basic Version
          <>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">My Listings</CardTitle>
                <i className="fas fa-list text-blue-600 dark:text-blue-500"></i>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{listings.length}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">My active listings</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Buying Status</CardTitle>
                <i className="fas fa-shopping-cart text-green-600 dark:text-green-500"></i>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user?.buyerDetails?.institutionType ? 'Active' : 'Pending'}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {user?.buyerDetails?.institutionType ? 'Ready to buy' : 'Setup required'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Available Products</CardTitle>
                <i className="fas fa-store text-orange-600 dark:text-orange-500"></i>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{marketListings.length}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">From farmers</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Interest Categories</CardTitle>
                <i className="fas fa-tags text-purple-600 dark:text-purple-500"></i>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user?.buyerDetails?.purchaseInterests?.length || 0}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Product interests</p>
              </CardContent>
            </Card>
          </>
        ) : (
          // Farmer Stats
          <>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Total Farms</CardTitle>
                <div className="flex items-center gap-2">
                  <i className="fas fa-tractor text-green-600 dark:text-green-500"></i>
                  <Button
                    onClick={() => setShowFarmModal(true)}
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{farms.length}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Active farms</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Active Crops</CardTitle>
                <div className="flex items-center gap-2">
                  <i className="fas fa-seedling text-green-600 dark:text-green-500"></i>
                  <Button
                    onClick={() => setShowCropModal(true)}
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{crops.length}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Crops growing</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Livestock</CardTitle>
                <div className="flex items-center gap-2">
                  <i className="fas fa-paw text-green-600 dark:text-green-500"></i>
                  <Button
                    onClick={() => setShowAnimalModal(true)}
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{animals.length}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Animals registered</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Market Listings</CardTitle>
                <div className="flex items-center gap-2">
                  <i className="fas fa-shopping-cart text-green-600 dark:text-green-500"></i>
                  <Button
                    onClick={() => setShowListingModal(true)}
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{listings.length}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Active listings</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue={isBuyer ? "market" : "farms"} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 h-auto">
          {isBuyer ? (
            <>
              <TabsTrigger value="market" className="text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2">Available Products</TabsTrigger>
              <TabsTrigger value="interests" className="text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2">My Interests</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="farms" className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2">Farms</TabsTrigger>
              <TabsTrigger value="livestock" className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2">Livestock</TabsTrigger>
              <TabsTrigger value="crops" className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2">Crops</TabsTrigger>
              <TabsTrigger value="market" className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2">My Listings</TabsTrigger>
            </>
          )}
        </TabsList>

        {isBuyer ? (
          <>
            <TabsContent value="market" className="space-y-3 sm:space-y-4">
              {marketListings.length === 0 ? (
                <Card>
                  <CardContent className="p-4 sm:p-6 text-center">
                    <p className="text-gray-500 text-sm sm:text-base">No products available from local farmers yet.</p>
                  </CardContent>
                </Card>
              ) : (
                marketListings.map(listing => (
                  <Card key={listing._id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg">{listing.title || 'Product Listing'}</h3>
                          <p className="text-gray-600 text-sm">{listing.description || 'No description'}</p>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                            <span>Price: {listing.pricePerUnit || 'N/A'} KSh/{listing.quantity?.unit || 'unit'}</span>
                            <span>Quantity: {listing.quantity?.amount || '0'} {listing.quantity?.unit || 'units'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="interests" className="space-y-3 sm:space-y-4">
              {user?.buyerDetails?.purchaseInterests?.length > 0 ? (
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Your Purchase Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.buyerDetails.purchaseInterests.map(interest => (
                        <span key={interest} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-4 sm:p-6 text-center">
                    <p className="text-gray-500 text-sm sm:text-base">No purchase interests set. Complete your onboarding to set preferences.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </>
        ) : (
          <>
            <TabsContent value="farms" className="space-y-3 sm:space-y-4">
              {farms.length === 0 ? (
                <Card>
                  <CardContent className="p-4 sm:p-6 text-center">
                    <p className="text-gray-500 text-sm sm:text-base">No farms registered yet. Complete your onboarding to add your farm.</p>
                  </CardContent>
                </Card>
              ) : (
                farms.map(farm => (
                  <Card key={farm._id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg">{farm.name}</h3>
                          <p className="text-gray-600 text-sm">{farm.location?.county}</p>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                            <span>{farm.cropsCount || 0} crops</span>
                            <span>{farm.animalsCount || 0} animals</span>
                          </div>
                        </div>
                        <div className="flex gap-2 self-start sm:self-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => handleEditFarm(farm)}
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteFarm(farm._id)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="livestock" className="space-y-3 sm:space-y-4">
              {animals.length === 0 ? (
                <Card>
                  <CardContent className="p-4 sm:p-6 text-center">
                    <p className="text-gray-500 text-sm sm:text-base">No livestock registered yet.</p>
                  </CardContent>
                </Card>
              ) : (
                animals.map(animal => (
                  <Card key={animal._id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg">{animal.type}</h3>
                          <p className="text-gray-600 text-sm">{animal.breed || 'No breed specified'}</p>
                        </div>
                        <div className="flex gap-2 self-start sm:self-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => handleEditAnimal(animal)}
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteAnimal(animal._id)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="crops" className="space-y-3 sm:space-y-4">
              {crops.length === 0 ? (
                <Card>
                  <CardContent className="p-4 sm:p-6 text-center">
                    <p className="text-gray-500 text-sm sm:text-base">No crops registered yet.</p>
                  </CardContent>
                </Card>
              ) : (
                crops.map(crop => (
                  <Card key={crop._id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg">{crop.type}</h3>
                          <p className="text-gray-600 text-sm">{crop.variety || 'No variety specified'}</p>
                        </div>
                        <div className="flex gap-2 self-start sm:self-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => handleEditCrop(crop)}
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteCrop(crop._id)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="market" className="space-y-3 sm:space-y-4">
              {listings.length === 0 ? (
                <Card>
                  <CardContent className="p-4 sm:p-6 text-center">
                    <p className="text-gray-500 text-sm sm:text-base">No market listings yet.</p>
                  </CardContent>
                </Card>
              ) : (
                listings.map(listing => (
                  <Card key={listing._id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg">{listing.title || 'Product Listing'}</h3>
                          <p className="text-gray-600 text-sm">{listing.description || 'No description'}</p>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                            <span>Price: {listing.pricePerUnit || 'N/A'} KSh/{listing.quantity?.unit || 'unit'}</span>
                            <span>Quantity: {listing.quantity?.amount || '0'} {listing.quantity?.unit || 'units'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 self-start sm:self-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => handleEditListing(listing)}
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteListing(listing._id)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
      
      {/* Modals for Adding New Items */}
      
      {/* Add Farm Modal */}
      <Dialog open={showFarmModal} onOpenChange={setShowFarmModal}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100">Add New Farm</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFarm} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="farmName" className="text-sm text-gray-700 dark:text-gray-300">Farm Name *</Label>
                <Input
                  id="farmName"
                  value={farmFormData.name}
                  onChange={(e) => setFarmFormData({...farmFormData, name: e.target.value})}
                  placeholder="e.g., Green Valley Farm"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="farmSize" className="text-sm text-gray-700 dark:text-gray-300">Farm Size (acres)</Label>
                <Input
                  id="farmSize"
                  type="number"
                  value={farmFormData.size}
                  onChange={(e) => setFarmFormData({...farmFormData, size: e.target.value})}
                  placeholder="e.g., 50"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="county" className="text-sm text-gray-700 dark:text-gray-300">County *</Label>
                <Select value={selectedCounty} onValueChange={setSelectedCounty} required>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    {Object.keys(kenyaSubcounties).map(county => (
                      <SelectItem key={county} value={county} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subCounty" className="text-sm text-gray-700 dark:text-gray-300">Sub-County *</Label>
                <Select
                  value={farmFormData.subCounty}
                  onValueChange={(value) => setFarmFormData({...farmFormData, subCounty: value})}
                  required
                  disabled={!selectedCounty}
                >
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select sub-county" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    {selectedCounty && kenyaSubcounties[selectedCounty]?.map(subCounty => (
                      <SelectItem key={subCounty} value={subCounty} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                        {subCounty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description" className="text-sm text-gray-700 dark:text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={farmFormData.description}
                  onChange={(e) => setFarmFormData({...farmFormData, description: e.target.value})}
                  placeholder="Describe your farm..."
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowFarmModal(false)} className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white">
                Add Farm
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Farm Modal */}
      <Dialog open={showEditFarmModal} onOpenChange={setShowEditFarmModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Farm</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateFarm} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFarmName" className="text-gray-700 dark:text-gray-300">Farm Name *</Label>
                <Input
                  id="editFarmName"
                  value={farmFormData.name}
                  onChange={(e) => setFarmFormData({...farmFormData, name: e.target.value})}
                  placeholder="e.g., Green Valley Farm"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="editFarmSize" className="text-gray-700 dark:text-gray-300">Farm Size (acres)</Label>
                <Input
                  id="editFarmSize"
                  type="number"
                  value={farmFormData.size}
                  onChange={(e) => setFarmFormData({...farmFormData, size: e.target.value})}
                  placeholder="e.g., 50"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editCounty" className="text-gray-700 dark:text-gray-300">County *</Label>
                <Select value={selectedCounty} onValueChange={setSelectedCounty} required>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    {Object.keys(kenyaSubcounties).map(county => (
                      <SelectItem key={county} value={county} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editSubCounty" className="text-gray-700 dark:text-gray-300">Sub-County *</Label>
                <Select
                  value={farmFormData.subCounty}
                  onValueChange={(value) => setFarmFormData({...farmFormData, subCounty: value})}
                  required
                  disabled={!selectedCounty}
                >
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select sub-county" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    {selectedCounty && kenyaSubcounties[selectedCounty]?.map(subCounty => (
                      <SelectItem key={subCounty} value={subCounty} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                        {subCounty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="editDescription" className="text-gray-700 dark:text-gray-300">Description</Label>
              <Textarea
                id="editDescription"
                value={farmFormData.description}
                onChange={(e) => setFarmFormData({...farmFormData, description: e.target.value})}
                placeholder="Describe your farm..."
                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditFarmModal(false)} className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white">
                Update Farm
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Animal Modal */}
      <Dialog open={showAnimalModal} onOpenChange={setShowAnimalModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Add New Animal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAnimal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="animalFarm" className="text-gray-700 dark:text-gray-300">Farm *</Label>
                <Select value={animalFormData.farmId} onValueChange={(value) => setAnimalFormData({...animalFormData, farmId: value})} required>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select farm" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    {farms.map(farm => (
                      <SelectItem key={farm._id} value={farm._id} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                        {farm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="animalType" className="text-gray-700 dark:text-gray-300">Animal Type *</Label>
                <Input
                  id="animalType"
                  value={animalFormData.type}
                  onChange={(e) => setAnimalFormData({...animalFormData, type: e.target.value})}
                  placeholder="e.g., Cattle, Goat, Chicken"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="animalBreed" className="text-gray-700 dark:text-gray-300">Breed</Label>
                <Input
                  id="animalBreed"
                  value={animalFormData.breed}
                  onChange={(e) => setAnimalFormData({...animalFormData, breed: e.target.value})}
                  placeholder="e.g., Friesian, Boer"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="animalNumber" className="text-gray-700 dark:text-gray-300">Number</Label>
                <Input
                  id="animalNumber"
                  type="number"
                  value={animalFormData.number}
                  onChange={(e) => setAnimalFormData({...animalFormData, number: e.target.value})}
                  placeholder="e.g., 10"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="animalAgeGroup" className="text-gray-700 dark:text-gray-300">Age Group</Label>
                <Select value={animalFormData.ageGroup} onValueChange={(value) => setAnimalFormData({...animalFormData, ageGroup: value})}>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectItem value="Young" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Young</SelectItem>
                    <SelectItem value="Adult" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Adult</SelectItem>
                    <SelectItem value="Mature" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Mature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lastVaccination" className="text-gray-700 dark:text-gray-300">Last Vaccination</Label>
                <Input
                  id="lastVaccination"
                  type="date"
                  value={animalFormData.lastVaccinationDate}
                  onChange={(e) => setAnimalFormData({...animalFormData, lastVaccinationDate: e.target.value})}
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="nextVaccination" className="text-gray-700 dark:text-gray-300">Next Vaccination</Label>
                <Input
                  id="nextVaccination"
                  type="date"
                  value={animalFormData.nextVaccinationDate}
                  onChange={(e) => setAnimalFormData({...animalFormData, nextVaccinationDate: e.target.value})}
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="animalNotes" className="text-gray-700 dark:text-gray-300">Notes</Label>
              <Textarea
                id="animalNotes"
                value={animalFormData.notes}
                onChange={(e) => setAnimalFormData({...animalFormData, notes: e.target.value})}
                placeholder="Additional notes about the animal..."
                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAnimalModal(false)} className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white">
                Add Animal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Crop Modal */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Add New Crop</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCrop} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cropFarm" className="text-gray-700 dark:text-gray-300">Farm *</Label>
                <Select value={cropFormData.farmId} onValueChange={(value) => setCropFormData({...cropFormData, farmId: value})} required>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select farm" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    {farms.map(farm => (
                      <SelectItem key={farm._id} value={farm._id} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                        {farm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cropType" className="text-gray-700 dark:text-gray-300">Crop Type *</Label>
                <Input
                  id="cropType"
                  value={cropFormData.type}
                  onChange={(e) => setCropFormData({...cropFormData, type: e.target.value})}
                  placeholder="e.g., Maize, Tomatoes, Beans"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cropVariety" className="text-gray-700 dark:text-gray-300">Variety</Label>
                <Input
                  id="cropVariety"
                  value={cropFormData.variety}
                  onChange={(e) => setCropFormData({...cropFormData, variety: e.target.value})}
                  placeholder="e.g., Hybrid 622, KSTP 94"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="cropArea" className="text-gray-700 dark:text-gray-300">Area (acres)</Label>
                <Input
                  id="cropArea"
                  type="number"
                  step="0.1"
                  value={cropFormData.area}
                  onChange={(e) => setCropFormData({...cropFormData, area: e.target.value})}
                  placeholder="e.g., 2.5"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="plantingDate" className="text-gray-700 dark:text-gray-300">Planting Date</Label>
                <Input
                  id="plantingDate"
                  type="date"
                  value={cropFormData.plantingDate}
                  onChange={(e) => setCropFormData({...cropFormData, plantingDate: e.target.value})}
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="harvestDate" className="text-gray-700 dark:text-gray-300">Expected Harvest Date</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={cropFormData.expectedHarvestingDate}
                  onChange={(e) => setCropFormData({...cropFormData, expectedHarvestingDate: e.target.value})}
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="cropStatus" className="text-gray-700 dark:text-gray-300">Status</Label>
                <Select value={cropFormData.status} onValueChange={(value) => setCropFormData({...cropFormData, status: value})}>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectItem value="planted" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Planted</SelectItem>
                    <SelectItem value="growing" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Growing</SelectItem>
                    <SelectItem value="ready" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Ready</SelectItem>
                    <SelectItem value="harvested" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Harvested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="cropNotes" className="text-gray-700 dark:text-gray-300">Notes</Label>
              <Textarea
                id="cropNotes"
                value={cropFormData.notes}
                onChange={(e) => setCropFormData({...cropFormData, notes: e.target.value})}
                placeholder="Additional notes about the crop..."
                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCropModal(false)} className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white">
                Add Crop
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Market Listing Modal */}
      <Dialog open={showListingModal} onOpenChange={setShowListingModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Add New Market Listing</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateListing} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="listingFarm" className="text-gray-700 dark:text-gray-300">Farm *</Label>
                <Select value={listingFormData.farmId} onValueChange={(value) => setListingFormData({...listingFormData, farmId: value})} required>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select farm" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    {farms.map(farm => (
                      <SelectItem key={farm._id} value={farm._id} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                        {farm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="productName" className="text-gray-700 dark:text-gray-300">Product Name *</Label>
                <Input
                  id="productName"
                  value={listingFormData.productName}
                  onChange={(e) => setListingFormData({...listingFormData, productName: e.target.value})}
                  placeholder="e.g., Fresh Tomatoes, Maize"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="productStatus" className="text-gray-700 dark:text-gray-300">Product Status</Label>
                <Select value={listingFormData.productStatus} onValueChange={(value) => setListingFormData({...listingFormData, productStatus: value})}>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectItem value="ready to harvest" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Ready to Harvest</SelectItem>
                    <SelectItem value="harvested" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Harvested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantityAmount" className="text-gray-700 dark:text-gray-300">Quantity *</Label>
                <Input
                  id="quantityAmount"
                  type="number"
                  step="0.1"
                  value={listingFormData.quantityAmount}
                  onChange={(e) => setListingFormData({...listingFormData, quantityAmount: e.target.value})}
                  placeholder="e.g., 100"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantityUnit" className="text-gray-700 dark:text-gray-300">Unit *</Label>
                <Select value={listingFormData.quantityUnit} onValueChange={(value) => setListingFormData({...listingFormData, quantityUnit: value})} required>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectItem value="kg" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Kilograms (kg)</SelectItem>
                    <SelectItem value="tons" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Tons</SelectItem>
                    <SelectItem value="bundles" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Bundles</SelectItem>
                    <SelectItem value="crates" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Crates</SelectItem>
                    <SelectItem value="liters" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Liters</SelectItem>
                    <SelectItem value="heads" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Heads</SelectItem>
                    <SelectItem value="tray" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Tray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pricePerUnit" className="text-gray-700 dark:text-gray-300">Price per Unit (KSh) *</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  step="0.01"
                  value={listingFormData.pricePerUnit}
                  onChange={(e) => setListingFormData({...listingFormData, pricePerUnit: e.target.value})}
                  placeholder="e.g., 50.00"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="listingDescription" className="text-gray-700 dark:text-gray-300">Description</Label>
              <Textarea
                id="listingDescription"
                value={listingFormData.description}
                onChange={(e) => setListingFormData({...listingFormData, description: e.target.value})}
                placeholder="Describe your product..."
                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowListingModal(false)} className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white">
                Add Listing
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Animal Modal */}
      <Dialog open={showEditAnimalModal} onOpenChange={setShowEditAnimalModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Animal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateAnimal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editAnimalFarm" className="text-gray-700 dark:text-gray-300">Farm *</Label>
                <Select value={animalFormData.farmId} onValueChange={(value) => setAnimalFormData({...animalFormData, farmId: value})} required>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select farm" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    {farms.map(farm => (
                      <SelectItem key={farm._id} value={farm._id} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                        {farm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editAnimalType" className="text-gray-700 dark:text-gray-300">Animal Type *</Label>
                <Input
                  id="editAnimalType"
                  value={animalFormData.type}
                  onChange={(e) => setAnimalFormData({...animalFormData, type: e.target.value})}
                  placeholder="e.g., Cattle, Goat, Chicken"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="editAnimalBreed" className="text-gray-700 dark:text-gray-300">Breed</Label>
                <Input
                  id="editAnimalBreed"
                  value={animalFormData.breed}
                  onChange={(e) => setAnimalFormData({...animalFormData, breed: e.target.value})}
                  placeholder="e.g., Friesian, Boer"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editAnimalNumber" className="text-gray-700 dark:text-gray-300">Number</Label>
                <Input
                  id="editAnimalNumber"
                  type="number"
                  value={animalFormData.number}
                  onChange={(e) => setAnimalFormData({...animalFormData, number: e.target.value})}
                  placeholder="e.g., 10"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editAnimalAgeGroup" className="text-gray-700 dark:text-gray-300">Age Group</Label>
                <Select value={animalFormData.ageGroup} onValueChange={(value) => setAnimalFormData({...animalFormData, ageGroup: value})}>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectItem value="Young" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Young</SelectItem>
                    <SelectItem value="Adult" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Adult</SelectItem>
                    <SelectItem value="Mature" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Mature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editLastVaccination" className="text-gray-700 dark:text-gray-300">Last Vaccination</Label>
                <Input
                  id="editLastVaccination"
                  type="date"
                  value={animalFormData.lastVaccinationDate}
                  onChange={(e) => setAnimalFormData({...animalFormData, lastVaccinationDate: e.target.value})}
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editNextVaccination" className="text-gray-700 dark:text-gray-300">Next Vaccination</Label>
                <Input
                  id="editNextVaccination"
                  type="date"
                  value={animalFormData.nextVaccinationDate}
                  onChange={(e) => setAnimalFormData({...animalFormData, nextVaccinationDate: e.target.value})}
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editAnimalNotes" className="text-gray-700 dark:text-gray-300">Notes</Label>
              <Textarea
                id="editAnimalNotes"
                value={animalFormData.notes}
                onChange={(e) => setAnimalFormData({...animalFormData, notes: e.target.value})}
                placeholder="Additional notes about the animal..."
                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditAnimalModal(false)} className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white">
                Update Animal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Crop Modal */}
      <Dialog open={showEditCropModal} onOpenChange={setShowEditCropModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Crop</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCrop} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCropFarm" className="text-gray-700 dark:text-gray-300">Farm *</Label>
                <Select value={cropFormData.farmId} onValueChange={(value) => setCropFormData({...cropFormData, farmId: value})} required>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select farm" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    {farms.map(farm => (
                      <SelectItem key={farm._id} value={farm._id} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                        {farm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editCropType" className="text-gray-700 dark:text-gray-300">Crop Type *</Label>
                <Input
                  id="editCropType"
                  value={cropFormData.type}
                  onChange={(e) => setCropFormData({...cropFormData, type: e.target.value})}
                  placeholder="e.g., Maize, Tomatoes, Beans"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="editCropVariety" className="text-gray-700 dark:text-gray-300">Variety</Label>
                <Input
                  id="editCropVariety"
                  value={cropFormData.variety}
                  onChange={(e) => setCropFormData({...cropFormData, variety: e.target.value})}
                  placeholder="e.g., Hybrid 622, KSTP 94"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editCropArea" className="text-gray-700 dark:text-gray-300">Area (acres)</Label>
                <Input
                  id="editCropArea"
                  type="number"
                  step="0.1"
                  value={cropFormData.area}
                  onChange={(e) => setCropFormData({...cropFormData, area: e.target.value})}
                  placeholder="e.g., 2.5"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editPlantingDate" className="text-gray-700 dark:text-gray-300">Planting Date</Label>
                <Input
                  id="editPlantingDate"
                  type="date"
                  value={cropFormData.plantingDate}
                  onChange={(e) => setCropFormData({...cropFormData, plantingDate: e.target.value})}
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editHarvestDate" className="text-gray-700 dark:text-gray-300">Expected Harvest Date</Label>
                <Input
                  id="editHarvestDate"
                  type="date"
                  value={cropFormData.expectedHarvestingDate}
                  onChange={(e) => setCropFormData({...cropFormData, expectedHarvestingDate: e.target.value})}
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editCropStatus" className="text-gray-700 dark:text-gray-300">Status</Label>
                <Select value={cropFormData.status} onValueChange={(value) => setCropFormData({...cropFormData, status: value})}>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectItem value="planted" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Planted</SelectItem>
                    <SelectItem value="growing" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Growing</SelectItem>
                    <SelectItem value="ready" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Ready</SelectItem>
                    <SelectItem value="harvested" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Harvested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="editCropNotes" className="text-gray-700 dark:text-gray-300">Notes</Label>
              <Textarea
                id="editCropNotes"
                value={cropFormData.notes}
                onChange={(e) => setCropFormData({...cropFormData, notes: e.target.value})}
                placeholder="Additional notes about the crop..."
                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditCropModal(false)} className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white">
                Update Crop
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Market Listing Modal */}
      <Dialog open={showEditListingModal} onOpenChange={setShowEditListingModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Market Listing</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateListing} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editListingFarm" className="text-gray-700 dark:text-gray-300">Farm *</Label>
                <Select value={listingFormData.farmId} onValueChange={(value) => setListingFormData({...listingFormData, farmId: value})} required>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select farm" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    {farms.map(farm => (
                      <SelectItem key={farm._id} value={farm._id} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                        {farm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editProductName" className="text-gray-700 dark:text-gray-300">Product Name *</Label>
                <Input
                  id="editProductName"
                  value={listingFormData.productName}
                  onChange={(e) => setListingFormData({...listingFormData, productName: e.target.value})}
                  placeholder="e.g., Fresh Tomatoes, Maize"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="editProductStatus" className="text-gray-700 dark:text-gray-300">Product Status</Label>
                <Select value={listingFormData.productStatus} onValueChange={(value) => setListingFormData({...listingFormData, productStatus: value})}>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectItem value="ready to harvest" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Ready to Harvest</SelectItem>
                    <SelectItem value="harvested" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Harvested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editQuantityAmount" className="text-gray-700 dark:text-gray-300">Quantity *</Label>
                <Input
                  id="editQuantityAmount"
                  type="number"
                  step="0.1"
                  value={listingFormData.quantityAmount}
                  onChange={(e) => setListingFormData({...listingFormData, quantityAmount: e.target.value})}
                  placeholder="e.g., 100"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="editQuantityUnit" className="text-gray-700 dark:text-gray-300">Unit *</Label>
                <Select value={listingFormData.quantityUnit} onValueChange={(value) => setListingFormData({...listingFormData, quantityUnit: value})} required>
                  <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectItem value="kg" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Kilograms (kg)</SelectItem>
                    <SelectItem value="tons" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Tons</SelectItem>
                    <SelectItem value="bundles" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Bundles</SelectItem>
                    <SelectItem value="crates" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Crates</SelectItem>
                    <SelectItem value="liters" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Liters</SelectItem>
                    <SelectItem value="heads" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Heads</SelectItem>
                    <SelectItem value="tray" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Tray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editPricePerUnit" className="text-gray-700 dark:text-gray-300">Price per Unit (KSh) *</Label>
                <Input
                  id="editPricePerUnit"
                  type="number"
                  step="0.01"
                  value={listingFormData.pricePerUnit}
                  onChange={(e) => setListingFormData({...listingFormData, pricePerUnit: e.target.value})}
                  placeholder="e.g., 50.00"
                  className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editListingDescription" className="text-gray-700 dark:text-gray-300">Description</Label>
              <Textarea
                id="editListingDescription"
                value={listingFormData.description}
                onChange={(e) => setListingFormData({...listingFormData, description: e.target.value})}
                placeholder="Describe your product..."
                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditListingModal(false)} className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white">
                Update Listing
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      
    </div>
  );
};

export default Dashboard;
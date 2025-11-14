import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { marketAPI } from '../lib/API';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus } from 'lucide-react';

const CreateListingModal = ({ onListingCreated }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [formData, setFormData] = useState({
    // Farmer fields
    farmId: '',
    selectedAnimal: '',
    selectedCrop: '',
    // Buyer fields
    institutionName: '',
    institutionType: '',
    // Common fields
    productName: '',
    productStatus: 'harvested',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    description: '',
    county: '',
    subCounty: ''
  });

  // Check if user is farmer or buyer
  const isFarmer = user?.userType === 'farmer';
  const isBuyer = user?.userType === 'buyer';

  useEffect(() => {
    if (isOpen) {
      if (isFarmer) {
        fetchUserFarms();
      } else if (isBuyer) {
        // Auto-fill location for buyers from user profile
        if (user?.location?.county) {
          setFormData(prev => ({
            ...prev,
            county: user.location.county || '',
            subCounty: user.location.subCounty || ''
          }));
        }
      }
    }
  }, [isOpen, isFarmer, isBuyer, user]);

  const fetchUserFarms = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URI}/api/farm`);
      if (response.ok) {
        const data = await response.json();
        const userFarms = data.data.filter(farm => farm.farmerId === user._id);
        setFarms(userFarms);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
    }
  };

  const fetchFarmData = async (farmId) => {
    try {
      // Fetch crops and animals for the selected farm
      const [cropsResponse, animalsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URI}/api/crop?farmId=${farmId}`),
        fetch(`${import.meta.env.VITE_API_URI}/api/animal?farmId=${farmId}`)
      ]);

      if (cropsResponse.ok) {
        const cropsData = await cropsResponse.json();
        setCrops(cropsData.data || cropsData);
      }

      if (animalsResponse.ok) {
        const animalsData = await animalsResponse.json();
        setAnimals(animalsData.data || animalsData);
      }
    } catch (error) {
      console.error('Error fetching farm data:', error);
    }
  };

  // Auto-fill location when farm is selected
  const handleFarmChange = (farmId) => {
    const selectedFarm = farms.find(farm => farm._id === farmId);
    if (selectedFarm) {
      setFormData(prev => ({
        ...prev,
        farmId,
        county: selectedFarm.location?.county || '',
        subCounty: selectedFarm.location?.subCounty || ''
      }));
      // Fetch crops and animals for this farm
      fetchFarmData(farmId);
    } else {
      setFormData(prev => ({ ...prev, farmId }));
      // Clear crops and animals when farm is changed
      setCrops([]);
      setAnimals([]);
    }
  };

  // Auto-populate product name when animal or crop is selected
  const handleAnimalChange = (animalId) => {
    const selectedAnimal = animals.find(animal => animal._id === animalId);
    if (selectedAnimal) {
      setFormData(prev => ({
        ...prev,
        selectedAnimal: animalId,
        productName: selectedAnimal.type
      }));
    } else {
      setFormData(prev => ({ ...prev, selectedAnimal: animalId }));
    }
  };

  const handleCropChange = (cropId) => {
    const selectedCrop = crops.find(crop => crop._id === cropId);
    if (selectedCrop) {
      setFormData(prev => ({
        ...prev,
        selectedCrop: cropId,
        productName: selectedCrop.type
      }));
    } else {
      setFormData(prev => ({ ...prev, selectedCrop: cropId }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const listingData = {
        userId: user._id,
        userType: user.userType,
        // Conditionally include farm or institution data
        ...(isFarmer && { 
          farmId: formData.farmId,
          selectedAnimal: formData.selectedAnimal,
          selectedCrop: formData.selectedCrop
        }),
        ...(isBuyer && { 
          institutionName: formData.institutionName,
          institutionType: formData.institutionType
        }),
        location: {
          county: formData.county,
          subCounty: formData.subCounty
        },
        product: {
          name: formData.productName,
          status: formData.productStatus
        },
        quantity: {
          amount: parseFloat(formData.quantity),
          unit: formData.unit
        },
        pricePerUnit: parseFloat(formData.pricePerUnit),
        description: formData.description
      };

      await marketAPI.createListing(listingData);
      setIsOpen(false);
      resetForm();
      if (onListingCreated) {
        onListingCreated();
      }
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      farmId: '',
      selectedAnimal: '',
      selectedCrop: '',
      institutionName: '',
      institutionType: '',
      productName: '',
      productStatus: 'harvested',
      quantity: '',
      unit: 'kg',
      pricePerUnit: '',
      description: '',
      county: isFarmer ? '' : (user?.location?.county || ''),
      subCounty: isFarmer ? '' : (user?.location?.subCounty || '')
    });
    setCrops([]);
    setAnimals([]);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const institutionTypes = [
    { value: 'school', label: 'School' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'supermarket', label: 'Supermarket' },
    { value: 'exporter', label: 'Exporter' },
    { value: 'individual', label: 'Individual' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white">
          <Plus className="h-4 w-4" />
          Create Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            Create New Market Listing
            <span className="block text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
              {isFarmer ? 'Farmer Listing' : 'Buyer Request'}
            </span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Type Specific Fields */}
            {isFarmer && (
              <>
                <div>
                  <Label htmlFor="farmId" className="text-gray-700 dark:text-gray-300">Farm *</Label>
                  <Select value={formData.farmId} onValueChange={handleFarmChange} required>
                    <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Select a farm" />
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
                  <Label htmlFor="selectedAnimal" className="text-gray-700 dark:text-gray-300">Animal (Optional)</Label>
                  <Select value={formData.selectedAnimal} onValueChange={handleAnimalChange}>
                    <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Select an animal" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      {animals.map(animal => (
                        <SelectItem key={animal._id} value={animal._id} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                          {animal.type} {animal.breed && `(${animal.breed})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="selectedCrop" className="text-gray-700 dark:text-gray-300">Crop (Optional)</Label>
                  <Select value={formData.selectedCrop} onValueChange={handleCropChange}>
                    <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Select a crop" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      {crops.map(crop => (
                        <SelectItem key={crop._id} value={crop._id} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                          {crop.type} {crop.variety && `(${crop.variety})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {isBuyer && (
              <>
                <div>
                  <Label htmlFor="institutionName" className="text-gray-700 dark:text-gray-300">Institution Name *</Label>
                  <Input
                    id="institutionName"
                    value={formData.institutionName}
                    onChange={(e) => handleInputChange('institutionName', e.target.value)}
                    placeholder="e.g., Green Valley School"
                    className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required={isBuyer}
                  />
                </div>

                <div>
                  <Label htmlFor="institutionType" className="text-gray-700 dark:text-gray-300">Institution Type *</Label>
                  <Select value={formData.institutionType} onValueChange={(value) => handleInputChange('institutionType', value)} required={isBuyer}>
                    <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Select institution type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      {institutionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Common Fields */}
            <div>
              <Label htmlFor="productName" className="text-gray-700 dark:text-gray-300">
                {isFarmer ? 'Product Name' : 'Product Looking For'} *
              </Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder={isFarmer ? "e.g., Organic Tomatoes" : "e.g., Fresh Tomatoes"}
                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
                readOnly={isFarmer && (formData.selectedAnimal || formData.selectedCrop)} // Readonly if animal/crop selected
              />
              {isFarmer && (formData.selectedAnimal || formData.selectedCrop) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Auto-filled from {formData.selectedAnimal ? 'animal' : 'crop'} selection
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="productStatus" className="text-gray-700 dark:text-gray-300">Product Status</Label>
              <Select value={formData.productStatus} onValueChange={(value) => handleInputChange('productStatus', value)}>
                <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectItem value="harvested" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Harvested</SelectItem>
                  <SelectItem value="ready to harvest" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Ready to Harvest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity" className="text-gray-700 dark:text-gray-300">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="e.g., 100"
                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <Label htmlFor="unit" className="text-gray-700 dark:text-gray-300">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                <SelectTrigger className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <SelectValue />
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
              <Label htmlFor="pricePerUnit" className="text-gray-700 dark:text-gray-300">
                {isFarmer ? 'Price per Unit (KSH)' : 'Offering Price per Unit (KSH)'} *
              </Label>
              <Input
                id="pricePerUnit"
                type="number"
                value={formData.pricePerUnit}
                onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                placeholder="e.g., 50"
                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <Label htmlFor="county" className="text-gray-700 dark:text-gray-300">County *</Label>
              <Input
                id="county"
                value={formData.county}
                onChange={(e) => handleInputChange('county', e.target.value)}
                placeholder="e.g., Nairobi"
                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
                readOnly={isFarmer && formData.farmId} // Readonly for farmers if farm selected
                readOnly={isBuyer && user?.location?.county} // Readonly for buyers if location exists
              />
              {isFarmer && formData.farmId && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Auto-filled from selected farm
                </p>
              )}
              {isBuyer && user?.location?.county && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Auto-filled from your profile location
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="subCounty" className="text-gray-700 dark:text-gray-300">Sub-County *</Label>
              <Input
                id="subCounty"
                value={formData.subCounty}
                onChange={(e) => handleInputChange('subCounty', e.target.value)}
                placeholder="e.g., Westlands"
                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
                readOnly={isFarmer && formData.farmId} // Readonly for farmers if farm selected
                readOnly={isBuyer && user?.location?.subCounty} // Readonly for buyers if location exists
              />
              {isFarmer && formData.farmId && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Auto-filled from selected farm
                </p>
              )}
              {isBuyer && user?.location?.subCounty && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Auto-filled from your profile location
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
              Description ({isFarmer ? 'Optional' : 'Optional'})
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={isFarmer ? "Describe your product..." : "Describe your requirements..."}
              className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white"
            >
              {isFarmer ? 'Create Listing' : 'Create Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListingModal;
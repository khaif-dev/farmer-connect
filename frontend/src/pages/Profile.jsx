import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, marketAPI, updateUser } from '../lib/API';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CreateListingModal from '../components/Modal';
import { kenyaSubcounties } from '../data/kenyaSubcounties';
import { User, Mail, Phone, MapPin, Calendar, DollarSign, Package, Edit, Save, X, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: {
      county: '',
      subCounty: ''
    },
    profile: {
      username: ''
    }
  });

  // Kenyan counties for dropdown
  const counties = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay',
    'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
    'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
    'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi',
    'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
    'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    // Initialize form data when user data changes or edit mode is enabled
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: {
          county: user.location?.county || '',
          subCounty: user.location?.subCounty || ''
        },
        profile: {
          username: user.profile?.username || ''
        }
      });
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user's farms first
      const farmsResponse = await fetch(`${import.meta.env.VITE_API_URI}/api/farm`);
      if (farmsResponse.ok) {
        const farmsData = await farmsResponse.json();
        const userFarms = farmsData.data.filter(farm => farm.farmerId === user._id);
        setFarms(userFarms);
      }

      // Fetch user's market listings
      const listingsResponse = await marketAPI.getListings();
      if (listingsResponse.data && listingsResponse.data.data) {
        // Filter listings by current user
        const userListings = listingsResponse.data.data.filter(
          listing => listing.farmerId && listing.farmerId._id === user._id
        );
        setListings(userListings.map(listing => ({
          _id: listing._id,
          productName: listing.product?.name || 'Unknown Product',
          quantity: listing.quantity?.amount || 0,
          unit: listing.quantity?.unit || 'unit',
          pricePerUnit: listing.pricePerUnit || 0,
          status: listing.status || 'available',
          createdAt: listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'N/A'
        })));
      }

      // TODO: Implement transaction API when backend is ready
      // For now, keep mock transaction data
      setTransactions([
        {
          _id: '1',
          type: 'sale',
          productName: 'Organic Tomatoes',
          quantity: 50,
          unit: 'kg',
          amount: 2500,
          date: '2024-01-20',
          buyerName: 'John Farmer'
        },
        {
          _id: '2',
          type: 'purchase',
          productName: 'Fertilizer',
          quantity: 10,
          unit: 'bags',
          amount: 5000,
          date: '2024-01-18',
          sellerName: 'Agri Supplies Ltd'
        }
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to mock data if API fails
      setListings([
        {
          _id: '1',
          productName: 'Organic Tomatoes',
          quantity: 100,
          unit: 'kg',
          pricePerUnit: 50,
          status: 'available',
          createdAt: '2024-01-15'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', content: '' });

    try {
      // Only include fields that have actually changed
      const updatedData = {};
      if (formData.firstName !== user.firstName) updatedData.firstName = formData.firstName;
      if (formData.lastName !== user.lastName) updatedData.lastName = formData.lastName;
      if (formData.email !== user.email) updatedData.email = formData.email;
      if (formData.phone !== user.phone) updatedData.phone = formData.phone;
      if (formData.location.county !== user.location?.county) {
        updatedData.location = { ...updatedData.location, county: formData.location.county };
      }
      if (formData.location.subCounty !== user.location?.subCounty) {
        updatedData.location = { ...updatedData.location, subCounty: formData.location.subCounty };
      }
      if (formData.profile.username !== user.profile?.username) {
        updatedData.profile = { ...updatedData.profile, username: formData.profile.username };
      }

      // Don't send empty updates
      if (Object.keys(updatedData).length === 0) {
        setMessage({ type: 'info', content: 'No changes made to profile' });
        setEditMode(false);
        return;
      }

      const response = await updateUser(user._id, updatedData);
      
      // Handle API response properly - response should be an object with success and data properties
      if (response && response.success && response.data) {
        // Update the auth context with the new user data
        updateUser(response.data);
        setMessage({ type: 'success', content: 'Profile edited successfully' });
        setEditMode(false);
      } else {
        // If response doesn't have success flag, treat as success if we have data
        if (response && response.data) {
          updateUser(response.data);
          setMessage({ type: 'success', content: 'Profile edited successfully' });
          setEditMode(false);
        } else {
          setMessage({ type: 'error', content: response?.message || 'Failed to update profile' });
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        content: error.message || 'An error occurred while updating your profile'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: {
          county: user.location?.county || '',
          subCounty: user.location?.subCounty || ''
        },
        profile: {
          username: user.profile?.username || ''
        }
      });
    }
    setEditMode(false);
    setMessage({ type: '', content: '' });
  };

  // Get subcounties for the selected county
  const getAvailableSubcounties = () => {
    if (formData.location.county && kenyaSubcounties[formData.location.county]) {
      return kenyaSubcounties[formData.location.county];
    }
    return [];
  };

  // Clear subcounty when county changes
  const handleCountyChange = (e) => {
    const county = e.target.value;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        county: county,
        subCounty: '' // Clear subcounty when county changes
      }
    }));
  };

  const clearMessage = () => {
    setTimeout(() => setMessage({ type: '', content: '' }), 5000);
  };

  useEffect(() => {
    if (message.content) {
      clearMessage();
    }
  }, [message]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div>Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Message Alert */}
      {message.content && (
        <div className={`p-4 rounded-md flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : message.type === 'error'
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
          {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
          {message.type === 'info' && <AlertCircle className="h-4 w-4" />}
          <span>{message.content}</span>
        </div>
      )}

      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6" />
              Profile Information
            </div>
            {!editMode ? (
              <Button
                onClick={() => setEditMode(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!editMode ? (
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Name:</span>
                <span>{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span>{user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Phone:</span>
                <span>{user?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Location:</span>
                <span>{user?.location?.county && user?.location?.subCounty ? `${user.location.county}, ${user.location.subCounty}` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Joined:</span>
                <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{user?.userType ? user.userType.charAt(0).toUpperCase() + user.userType.slice(1) : 'Farmer'}</Badge>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location.county">County</Label>
                  <select
                    id="location.county"
                    name="location.county"
                    value={formData.location.county}
                    onChange={handleCountyChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select County</option>
                    {counties.map(county => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location.subCounty">Sub-County</Label>
                  <select
                    id="location.subCounty"
                    name="location.subCounty"
                    value={formData.location.subCounty}
                    onChange={handleInputChange}
                    disabled={!formData.location.county}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Sub-County</option>
                    {getAvailableSubcounties().map(subCounty => (
                      <option key={subCounty} value={subCounty}>{subCounty}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profile.username">Username (Optional)</Label>
                  <Input
                    id="profile.username"
                    name="profile.username"
                    value={formData.profile.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                  />
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Listings and Transactions */}
      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Market Listings
                </div>
                <CreateListingModal onListingCreated={fetchUserData} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {listings.length > 0 ? (
                <div className="space-y-4">
                  {listings.map(listing => (
                    <div key={listing._id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{listing.productName}</h3>
                        <p className="text-sm text-gray-600">
                          {listing.quantity} {listing.unit} • KSH {listing.pricePerUnit}/unit
                        </p>
                        <p className="text-xs text-gray-500">Listed on {listing.createdAt}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                          {listing.status}
                        </Badge>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No listings found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map(transaction => (
                    <div key={transaction._id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{transaction.productName}</h3>
                        <p className="text-sm text-gray-600">
                          {transaction.quantity} {transaction.unit} • KSH {transaction.amount}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.type === 'sale' ? `Sold to ${transaction.buyerName}` : `Bought from ${transaction.sellerName}`}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.date}</p>
                      </div>
                      <Badge variant={transaction.type === 'sale' ? 'default' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No transactions found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
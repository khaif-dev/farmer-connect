// src/pages/Onboarding.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFarm, updateUser as updateUserAPI } from '../lib/API';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Kenyan counties and their sub-counties
const kenyanCounties = {
  "Mombasa": ["Changamwe", "Jomvu", "Kisauni", "Nyali", "Likoni"],
  "Kwale": ["Kinango", "Lunga Lunga", "Matuga", "Msambweni"],
  "Kilifi": ["Bahari", "Ganze", "Kaloleni", "Magarini", "Malindi", "Rabai"],
  "Tana River": ["Bura", "Galole", "Garsen"],
  "Lamu": ["Lamu East", "Lamu West"],
  "Taita-Taveta": ["Mwatate", "Taveta", "Voi", "Wundanyi"],
  "Garissa": ["Balambala", "Dadaab", "Fafi", "Garissa Township", "Hulugho", "Ijara"],
  "Wajir": ["Eldas", "Tarbaj", "Wajir East", "Wajir North", "Wajir South", "Wajir West"],
  "Mandera": ["Banisa", "Lafey", "Mandera East", "Mandera North", "Mandera South", "Mandera West"],
  "Marsabit": ["Laisamis", "Moyale", "North Horr", "Saku"],
  "Isiolo": ["Garbatulla", "Isiolo North", "Isiolo South"],
  "Meru": ["Buuri", "Igembe Central", "Igembe North", "Igembe South", "Imenti Central", "Imenti North", "Imenti South", "Tigania East", "Tigania West"],
  "Tharaka-Nithi": ["Chuka", "Igambang'ombe", "Maara", "Tharaka North", "Tharaka South"],
  "Embu": ["Manyatta", "Mbeere North", "Mbeere South", "Runyenjes"],
  "Kitui": ["Ikutha", "Katulani", "Kisasi", "Kitui Central", "Kitui East", "Kitui Rural", "Kitui South", "Kitui West", "Lower Yatta", "Migwani", "Mutitu", "Mutomo", "Muumoni", "Mwingi Central", "Mwingi East", "Mwingi North", "Mwingi West", "Nzambani", "Tseikuru"],
  "Machakos": ["Athi River", "Kalama", "Kangundo", "Kathiani", "Machakos Town", "Masinga", "Matungulu", "Mavoko", "Mwala", "Yatta"],
  "Makueni": ["Kaiti", "Kibwezi East", "Kibwezi West", "Kilome", "Makueni", "Mbooni"],
  "Nyandarua": ["Kinangop", "Kipipiri", "Ndaragwa", "Ol Jorok", "Ol Kalou"],
  "Nyeri": ["Kieni", "Mathira", "Mukurweini", "Nyeri Town", "Othaya", "Tetu"],
  "Kirinyaga": ["Kirinyaga Central", "Kirinyaga East", "Kirinyaga West", "Mwea East", "Mwea West"],
  "Murang'a": ["Gatanga", "Kahuro", "Kandara", "Kangema", "Kigumo", "Kiharu", "Mathioya", "Murang'a South"],
  "Kiambu": ["Gatundu North", "Gatundu South", "Githunguri", "Juja", "Kabete", "Kiambaa", "Kiambu", "Kikuyu", "Limuru", "Ruiru", "Thika Town", "Lari"],
  "Turkana": ["Loima", "Turkana Central", "Turkana East", "Turkana North", "Turkana South", "Turkana West"],
  "West Pokot": ["Kapenguria", "Pokot South", "Sigor"],
  "Samburu": ["Samburu Central", "Samburu East", "Samburu North"],
  "Trans Nzoia": ["Cherangany", "Endebess", "Kiminini", "Kwanza", "Saboti"],
  "Uasin Gishu": ["Ainabkoi", "Kapseret", "Kesses", "Moiben", "Soy", "Turbo"],
  "Elgeyo-Marakwet": ["Keiyo North", "Keiyo South", "Marakwet East", "Marakwet West"],
  "Nandi": ["Aldai", "Chesumei", "Emgwen", "Mosop", "Namdi Hills", "Tindiret"],
  "Baringo": ["Baringo Central", "Baringo North", "Baringo South", "Eldama Ravine", "Mogotio", "Tiaty"],
  "Laikipia": ["Laikipia Central", "Laikipia East", "Laikipia North", "Laikipia West", "Nyahururu"],
  "Nakuru": ["Bahati", "Gilgil", "Kuresoi North", "Kuresoi South", "Molo", "Naivasha", "Nakuru Town East", "Nakuru Town West", "Njoro", "Rongai", "Subukia"],
  "Narok": ["Narok East", "Narok North", "Narok South", "Narok West", "Transmara East", "Transmara West"],
  "Kajiado": ["Isinya", "Kajiado Central", "Kajiado East", "Kajiado North", "Kajiado South", "Kajiado West", "Loitokitok"],
  "Kericho": ["Ainamoi", "Belgut", "Bureti", "Kipkelion East", "Kipkelion West", "Soin Sigowet"],
  "Bomet": ["Bomet Central", "Bomet East", "Chepalungu", "Konoin", "Sotik"],
  "Kakamega": ["Butere", "Kakamega Central", "Kakamega East", "Kakamega North", "Kakamega South", "Khwisero", "Lugari", "Lukuyani", "Lurambi", "Matete", "Mumias", "Mutungu", "Navakholo"],
  "Vihiga": ["Emuhaya", "Hamisi", "Luanda", "Sabatia", "Vihiga"],
  "Bungoma": ["Bumula", "Kabuchai", "Kanduyi", "Kimilil", "Mt Elgon", "Sirisia", "Tongaren", "Webuye"],
  "Busia": ["Budalangi", "Butula", "Funyula", "Matayos", "Nambale", "Samia", "Teso North", "Teso South"],
  "Siaya": ["Alego Usonga", "Bondo", "Gem", "Rarieda", "Ugenya", "Ugunja"],
  "Kisumu": ["Kisumu Central", "Kisumu East", "Kisumu West", "Muhoroni", "Nyakach", "Nyando", "Seme"],
  "Homa Bay": ["Homa Bay Town", "Kabondo Kasipul", "Karachuonyo", "Kasipul", "Mbita", "Ndhiwa", "Rachuonyo East", "Rachuonyo North", "Rachuonyo South", "Suba North", "Suba South"],
  "Migori": ["Awendo", "Kuria East", "Kuria West", "Mabera", "Ntimaru", "Nyatike", "Rongo", "Suna East", "Suna West", "Uriri"],
  "Kisii": ["Bobasi", "Bomachoge Borabu", "Bomachoge Chache", "Bonchari", "Kitutu Chache North", "Kitutu Chache South", "Nyaribari Chache", "Nyaribari Masaba", "South Mugirango"],
  "Nyamira": ["Borabu", "Manga", "Masaba North", "Nyamira North", "Nyamira South"],
  "Nairobi": ["Dagoretti North", "Dagoretti South", "Embakasi Central", "Embakasi East", "Embakasi North", "Embakasi South", "Embakasi West", "Kamukunji", "Kasarani", "Kibra", "Lang'ata", "Makadara", "Mathare", "Roysambu", "Ruaraka", "Starehe", "Westlands"]
};

const Onboarding = () => {
  const { user, updateUser: updateAuthUser, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [farmData, setFarmData] = useState({
    name: '',
    location: {
      county: '',
      subCounty: '',
      coordinate: {
        coordinates: [0, 0] // [longitude, latitude]
      }
    }
  });
  const [buyerData, setBuyerData] = useState({
    buyerDetails: {
      institutionType: '',
      purchaseInterests: []
    },
    location: {
      county: '',
      subCounty: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isBuyer = user?.userType === 'buyer';

  // User type detection for buyer vs farmer onboarding

  // Show loading if auth is still loading or user is not available
  if (authLoading || !user) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading your profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedCounty = isBuyer ? buyerData.location.county : farmData.location.county;
  const availableSubCounties = selectedCounty ? kenyanCounties[selectedCounty] : [];

  const handleCreateFarm = async () => {
    setLoading(true);
    try {
      // Ensure we have proper coordinates structure
      const farmDataWithCoords = {
        ...farmData,
        location: {
          ...farmData.location,
          coordinate: {
            type: 'Point',
            coordinates: [0, 0] // Will be updated later with actual coordinates
          }
        }
      };
      
      const result = await createFarm(farmDataWithCoords);
      if (result.success) {
        navigate('/dashboard');
      } else {
        console.error('Farm creation failed:', result.message);
        alert(`Failed to create farm: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Farm creation error:', error);
      alert(`Error creating farm: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyerOnboarding = async () => {
    setLoading(true);
    try {
      // Validate required fields before sending
      if (!buyerData.buyerDetails.institutionType) {
        alert('Please select an institution type');
        setLoading(false);
        return;
      }
      if (!buyerData.buyerDetails.purchaseInterests || buyerData.buyerDetails.purchaseInterests.length === 0) {
        alert('Please select at least one purchase interest');
        setLoading(false);
        return;
      }
      if (!buyerData.location.county || !buyerData.location.subCounty) {
        alert('Please select your county and sub-county');
        setLoading(false);
        return;
      }

      const updateData = {
        buyerDetails: buyerData.buyerDetails,
        location: buyerData.location
      };
      
      console.log('Sending buyer update data:', updateData);
      const result = await updateUserAPI(user._id, updateData);
      
      if (result && result.success) {
        console.log('User update successful:', result);
        // Update the user context with new data
        const updatedUser = { ...user, ...result.data };
        updateAuthUser(updatedUser);
        navigate('/dashboard');
      } else {
        console.error('Update user failed:', result);
        const errorMessage = result?.message || 'Unknown error occurred';
        if (result?.errors) {
          console.error('Validation errors:', result.errors);
          alert(`Validation Error: ${result.errors.map(e => e.message || e.msg).join(', ')}`);
        } else {
          alert(`Failed to update profile: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Buyer onboarding error:', error);
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="w-full shadow-2xl border-0 bg-green-50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{isBuyer ? 'Setup Your Buyer Profile' : 'Setup Your Farm'}</CardTitle>
          <p>{isBuyer ? "Let's get your buyer profile ready" : "Let's get your farm profile ready"}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isBuyer ? (
            // Buyer Onboarding
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institutionType">Institution Type</Label>
                <Select
                  value={buyerData.buyerDetails.institutionType}
                  onValueChange={(value) => setBuyerData({
                    ...buyerData,
                    buyerDetails: { ...buyerData.buyerDetails, institutionType: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your institution type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90">
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="supermarket">Supermarket</SelectItem>
                    <SelectItem value="exporter">Exporter</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseInterests">Purchase Interests (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Meat', 'Poultry', 'Fish', 'Other'].map((interest) => (
                    <label key={interest} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={buyerData.buyerDetails.purchaseInterests.includes(interest)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...buyerData.buyerDetails.purchaseInterests, interest]
                            : buyerData.buyerDetails.purchaseInterests.filter(i => i !== interest);
                          setBuyerData({
                            ...buyerData,
                            buyerDetails: { ...buyerData.buyerDetails, purchaseInterests: updated }
                          });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Select
                  value={buyerData.location.county}
                  onValueChange={(value) => setBuyerData({
                    ...buyerData,
                    location: {
                      ...buyerData.location,
                      county: value,
                      subCounty: '' // Reset sub-county when county changes
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your county" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(kenyanCounties).map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subCounty">Sub-County</Label>
                <Select
                  value={buyerData.location.subCounty}
                  onValueChange={(value) => setBuyerData({
                    ...buyerData,
                    location: { ...buyerData.location, subCounty: value }
                  })}
                  disabled={!selectedCounty}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedCounty ? "Select your sub-county" : "Select a county first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubCounties.map((subCounty) => (
                      <SelectItem key={subCounty} value={subCounty}>
                        {subCounty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleBuyerOnboarding} disabled={loading} className="bg-green-700 text-white hover:bg-green-800">
                {loading ? 'Setting Up Profile...' : 'Complete Setup'}
              </Button>
            </div>
          ) : (
            // Farmer Onboarding (existing)
            <>
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name</Label>
                    <Input
                      id="farmName"
                      value={farmData.name}
                      onChange={(e) => setFarmData({ ...farmData, name: e.target.value })}
                      placeholder="Enter your farm name"
                    />
                  </div>
                  <Button onClick={() => setStep(2)} className="bg-green-700 text-white hover:bg-green-800">
                    Next
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="county">County</Label>
                    <Select
                      value={farmData.location.county}
                      onValueChange={(value) => setFarmData({
                        ...farmData,
                        location: {
                          ...farmData.location,
                          county: value,
                          subCounty: '' // Reset sub-county when county changes
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your county" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(kenyanCounties).map((county) => (
                          <SelectItem key={county} value={county}>
                            {county}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subCounty">Sub-County</Label>
                    <Select
                      value={farmData.location.subCounty}
                      onValueChange={(value) => setFarmData({
                        ...farmData,
                        location: { ...farmData.location, subCounty: value }
                      })}
                      disabled={!selectedCounty}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedCounty ? "Select your sub-county" : "Select a county first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubCounties.map((subCounty) => (
                          <SelectItem key={subCounty} value={subCounty}>
                            {subCounty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="text-green-700">
                      Back
                    </Button>
                    <Button onClick={handleCreateFarm} disabled={loading} className="bg-green-700 text-white hover:bg-green-800">
                      {loading ? 'Creating Farm...' : 'Complete Setup'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
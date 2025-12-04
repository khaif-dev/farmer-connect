import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, Star, Utensils, School, ShoppingBasket, MessageCircle, Info, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import CreateListingModal from "../components/Modal";
import EditListingModal from "../components/EditListingModal";
import { marketAPI } from "../lib/API";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleListingCreated = () => {
    // Refresh listings after creating a new one
    fetchListings();
  };

  const handleListingUpdated = () => {
    // Refresh listings after updating one
    fetchListings();
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await marketAPI.deleteListing(listingId);
        fetchListings(); // Refresh the list
      } catch (error) {
        console.error('Error deleting listing:', error);
      }
    }
  };

  const handleChat = (listing) => {
    // Navigate to Messages page with listing info for starting a conversation
    navigate('/messages', {
      state: {
        startConversation: true,
        listingId: listing._id,
        otherUserId: listing.userId?._id || listing.userId,
        listing: listing
      }
    });
  };

  const fetchListings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URI}/api/market-listings`);
      const data = await res.json();
      // Handle the API response structure
      setListings(data.data || data); // data.data if backend returns {success, data}, or just data
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Helper function to get user display name
  const getUserDisplayName = (listing) => {
    if (listing.userType === 'buyer') {
      return listing.institutionName || `${listing.userId?.firstName || ''} ${listing.userId?.lastName || ''}`.trim();
    } else {
      return `${listing.userId?.firstName || ''} ${listing.userId?.lastName || ''}`.trim();
    }
  };

  // Helper function to get user type icon
  const getUserTypeIcon = (listing) => {
    if (listing.userType === 'buyer') {
      const type = listing.institutionType?.toLowerCase();
      if (type === 'restaurant' || type === 'hotel') {
        return <Utensils className="h-5 w-5 text-green-700 dark:text-green-500" />;
      } else {
        return <School className="h-5 w-5 text-green-700 dark:text-green-500" />;
      }
    } else {
      return <School className="h-5 w-5 text-green-700 dark:text-green-500" />;
    }
  };

  // Helper function to get user type display text
  const getUserTypeDisplay = (listing) => {
    if (listing.userType === 'buyer') {
      return `${listing.institutionType || 'Buyer'}`;
    } else {
      return 'Farmer';
    }
  };

  // Helper function to get status badge styling
  const getStatusBadge = (status) => {
    const baseClasses = "text-xs px-2 py-1 rounded-full font-medium";
    
    switch (status) {
      case 'available':
        return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200`}>Available</span>;
      case 'reserved':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200`}>Reserved</span>;
      case 'sold':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200`}>Sold</span>;
      case 'supplied':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200`}>Supplied</span>;
      case 'expired':
        return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200`}>Expired</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200`}>{status || 'Unknown'}</span>;
    }
  };

  // Check if current user owns this listing
  const isOwner = (listing) => {
    return listing.userId?._id === user?._id || listing.userId === user?._id;
  };

  return (
    <div className="w-full min-h-screen bg-green-50 dark:bg-gray-900">
      {/* Main Section */}
      <main className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-gray-100">Marketplace</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Connect directly with buyers and get better prices for your produce</p>
        </div>

        {/* Listings */}
        <section className="space-y-3 sm:space-y-5">
          {loading ? (
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Loading listings...</p>
          ) : listings.length > 0 ? (
            listings.map((listing) => (
              <Card key={listing._id} className={`shadow-sm border-none ${
                listing.status === 'sold' ? 'bg-blue-50 dark:bg-blue-900/20' :
                listing.status === 'supplied' ? 'bg-purple-50 dark:bg-purple-900/20' :
                listing.status === 'expired' ? 'bg-red-50 dark:bg-red-900/20' :
                listing.status === 'reserved' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                'bg-amber-50 dark:bg-gray-800'
              } border-gray-200 dark:border-gray-700`}>
                <CardContent className="p-4 sm:p-6 flex flex-col gap-3 relative">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-green-900 dark:text-green-400 flex items-center gap-2">
                        {getUserTypeIcon(listing)}
                        <span className="truncate">{getUserDisplayName(listing)}</span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400" />
                        <span className="text-xs sm:text-sm font-semibold">{listing.userId?.rating || "4.6"}</span>
                      </div>
                      {getStatusBadge(listing.status)}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full w-fit">
                      {getUserTypeDisplay(listing)}
                    </span>
                    {isOwner(listing) && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full w-fit">
                        Your Listing
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm sm:text-base">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    <span className="truncate">{listing.location?.county || 'Unknown County'}, {listing.location?.subCounty || 'Unknown Sub-County'}</span>
                  </p>

                  <p className="text-gray-700 dark:text-gray-300 flex items-start gap-2 text-sm sm:text-base">
                    <ShoppingBasket className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>
                      {listing.userType === 'buyer' ? 'Looking for:' : 'Selling:'}{" "}
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {listing.product?.name || 'Unknown Product'} ({listing.quantity?.amount || '0'} {listing.quantity?.unit || 'units'})
                      </span>
                    </span>
                  </p>

                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    {listing.userType === 'buyer' ? 'Offering:' : 'Price:'} {listing.pricePerUnit || '0'} KSH/{listing.quantity?.unit || 'unit'}
                  </p>

                  {listing.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      {listing.description}
                    </p>
                  )}

                  {/* Status-specific messaging */}
                  {listing.status === 'sold' && (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      This product has been sold
                    </div>
                  )}

                  {listing.status === 'supplied' && (
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs sm:text-sm">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      This request has been fulfilled
                    </div>
                  )}

                  {listing.status === 'expired' && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs sm:text-sm">
                      <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      This listing has expired
                    </div>
                  )}

                  {/* Action buttons - only show for non-owner, non-expired listings */}
                  {!isOwner(listing) && listing.status !== 'expired' && (
                    <Button
                      onClick={() => handleChat(listing)}
                      className="w-fit bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white text-sm sm:text-base"
                    >
                      <MessageCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      {listing.userType === 'buyer' ? 'Contact Buyer' : 'Contact Seller'}
                    </Button>
                  )}

                  {/* Owner edit/delete and status update buttons */}
                  {isOwner(listing) && (
                    <div className="flex flex-col gap-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                      {/* Edit and Delete buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <EditListingModal listing={listing} onListingUpdated={handleListingUpdated} />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteListing(listing._id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                      
                      {/* Status update buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        {listing.userType === 'farmer' && listing.status === 'available' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              // Update status to sold
                              marketAPI.updateListing(listing._id, { status: 'sold' }).then(() => fetchListings());
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Mark as Sold
                          </Button>
                        )}
                        
                        {listing.userType === 'buyer' && listing.status === 'available' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              // Update status to supplied
                              marketAPI.updateListing(listing._id, { status: 'supplied' }).then(() => fetchListings());
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Mark as Supplied
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">No listings available.</p>
          )}
        </section>

        {/* Sell Your Produce / Create Request */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm mt-6 sm:mt-10">
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">List Your Products</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Create listings to connect with buyers and sellers</p>
            </div>
            <CreateListingModal onListingCreated={handleListingCreated} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Marketplace;

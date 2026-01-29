import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, DollarSign, Building2 } from 'lucide-react';

const HotelDesc = ({ trip }) => {
  const [photoMap, setPhotoMap] = useState({});

  const hotelOptions = trip?.tripData?.hotelOptions;

  const fetchPhotoForHotel = async (hotelName) => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_PLACE_API_KEY;
      if (!apiKey || !hotelName) return;

      const data = { textQuery: hotelName };

      const result = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.photos",
        },
        body: JSON.stringify(data),
      });

      const json = await result.json();
      const photoName = json?.places?.[0]?.photos?.[0]?.name;

      const photoUrl = photoName
        ? `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=600&maxWidthPx=1200&key=${apiKey}`
        : 'https://placehold.co/400x250?text=No+Image';

      setPhotoMap((prev) => ({ ...prev, [hotelName]: photoUrl }));
    } catch (error) {
      console.error(`Error fetching photo for ${hotelName}:`, error);
      setPhotoMap((prev) => ({ ...prev, [hotelName]: 'https://placehold.co/400x250?text=Image+Error' }));
    }
  };


  useEffect(() => {
    if (hotelOptions?.length) {
      hotelOptions.forEach((hotel) => {
        const name = hotel?.HotelName;
        if (name && !photoMap[name]) {
          fetchPhotoForHotel(name);
        }
      });
    }
  }, [trip]);

  if (!hotelOptions || hotelOptions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border border-gray-200/50">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className='text-3xl font-bold text-gray-800 mb-4'>Hotel Recommendations</h1>
            <p className="text-lg text-gray-600">No hotel recommendations available for this trip.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
            <Building2 className="w-5 h-5" />
            Premium Accommodations
          </div>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight'>
            Hotel Recommendations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover carefully curated accommodations that perfectly complement your travel experience
          </p>
        </div>

    
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8'>
          {hotelOptions.map((item, index) => {
            const rating = typeof item.rating === 'number' ? item.rating : 0;
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 !== 0;

            const mapUrl = item.geo_coordinates?.latitude && item.geo_coordinates?.longitude
              ? `https://www.google.com/maps/search/?api=1&query=${item.geo_coordinates.latitude},${item.geo_coordinates.longitude}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.HotelName + ' ' + (item['Hotel address'] || ''))}`;

            const imageUrl = photoMap[item.HotelName] || 'https://placehold.co/400x250?text=Loading...';

            return (
              <Link to={mapUrl} key={index} target="_blank" rel="noopener noreferrer" className="block group">
                <div className='bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-blue-300/50'>
            
                  <div className="relative overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={item.HotelName ? `${item.HotelName} Hotel Image` : 'Hotel Image'}
                      className='w-full h-52 object-cover transition-transform duration-300 group-hover:scale-110'
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x250/E0E0E0/333333?text=Image+Error';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  
                  <div className='p-6'>
                
                    <h2 className='text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight'>
                      {item.HotelName || 'Unknown Hotel'}
                    </h2>

                  
                    <div className="space-y-3 mb-4">
                
                      <div className='flex items-start gap-3 text-gray-700'>
                        <MapPin className="w-4 h-4 text-blue-600 mt-[4px] flex-shrink-0" />
                        <span className='text-sm leading-relaxed line-clamp-2'>
                          {item['Hotel address'] || 'Address not available'}
                        </span>
                      </div>

                      <div className='flex items-center gap-3 text-gray-800'>
                        <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className='text-sm font-semibold'>
                          {item.Price || 'Price not available'}
                        </span>
                      </div>

            
                      <div className='flex items-center gap-3'>
                        <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <div className="flex items-center gap-1">
                          <div className="flex items-center">
                            {Array(fullStars).fill().map((_, i) => (
                              <span key={i} className="text-yellow-500 text-sm">★</span>
                            ))}
                            {hasHalfStar && <span className="text-yellow-500 text-sm">☆</span>}
                          </div>
                          <span className="text-sm text-gray-600 ml-1">
                            ({rating > 0 ? rating.toFixed(1) : 'N/A'})
                          </span>
                        </div>
                      </div>
                    </div>

               
                    <div className="border-t border-gray-100 pt-4">
                      <p className='text-gray-600 text-sm leading-relaxed line-clamp-3'>
                        {item.descriptions || 'Experience exceptional hospitality and comfort at this carefully selected accommodation.'}
                      </p>
                    </div>

                
                    {item.geo_coordinates && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className='text-blue-600 text-xs opacity-70 group-hover:opacity-100 transition-opacity duration-300'>
                          Coordinates: {item.geo_coordinates.latitude?.toFixed(4)}, {item.geo_coordinates.longitude?.toFixed(4)}
                        </p>
                      </div>
                    )}

               
                    <div className="mt-4 flex items-center justify-center">
                      <div className="text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        Click to view on Google Maps →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HotelDesc;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const HotelDesc = ({ trip }) => {
  const [photoMap, setPhotoMap] = useState({});

  const hotelOptions = trip?.tripData?.hotelOptions;

  // Fetch photo for each hotel
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

  // Load all hotel images on mount
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
      <div className="p-6 text-center text-gray-600 bg-white shadow-md rounded-lg mx-auto max-w-4xl mt-10">
        <h1 className='font-bold text-2xl mb-4 text-gray-800'>Hotel Recommendations</h1>
        <p className="text-lg">No hotel recommendations available for this trip.</p>
      </div>
    );
  }

  return (
    <div className="mt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className='font-extrabold text-4xl text-gray-900 leading-tight'>
          Hotel Recommendations <span className="text-blue-600">🏨</span>
        </h1>
        <p className="mt-2 text-lg text-gray-600">Discover the best stays for your adventure.</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
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
              <div className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl'>
                <img
                  src={imageUrl}
                  alt={item.HotelName ? `${item.HotelName} Hotel Image` : 'Hotel Image'}
                  className='w-full h-52 object-cover rounded-t-2xl'
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/400x250/E0E0E0/333333?text=Image+Error';
                  }}
                />
                <div className='p-5'>
                  <h2 className='font-bold text-xl text-gray-900 mb-2 truncate'>{item.HotelName || 'Unknown Hotel'}</h2>
                  <p className='text-gray-700 text-sm mb-1 flex items-center'>
                    <span className='font-medium mr-1'>📍 Address:</span> {item['Hotel address'] || 'N/A'}
                  </p>
                  <p className='text-gray-800 text-base font-semibold mb-2'>
                    <span className='font-medium mr-1'>💰 Price:</span> {item.Price || 'N/A'}
                  </p>
                  <div className='flex items-center text-gray-700 text-sm mb-2'>
                    <span className='font-medium mr-1'>⭐ Rating:</span>
                    {Array(fullStars).fill().map((_, i) => (
                      <span key={i} className="text-yellow-500">★</span>
                    ))}
                    {hasHalfStar && <span className="text-yellow-500">½</span>}
                    <span className="ml-1 text-gray-500">({rating > 0 ? rating.toFixed(1) : 'N/A'})</span>
                  </div>
                  <p className='text-gray-600 text-sm mt-3 leading-relaxed line-clamp-4'>
                    {item.descriptions || 'No description available for this hotel.'}
                  </p>
                  {item.geo_coordinates && (
                    <p className='text-blue-600 text-xs mt-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300'>
                      Lat: {item.geo_coordinates.latitude?.toFixed(4)}, Lng: {item.geo_coordinates.longitude?.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default HotelDesc;

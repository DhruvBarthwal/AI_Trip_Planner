import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GetPlaceDetails } from "@/constants/GlobalAPI";
import { MapPin, Clock, Ticket, AlertTriangle } from "lucide-react";

const PHOTO_REF_BASE_URL =
  "https://places.googleapis.com/v1/{PHOTO_NAME}/media?maxHeightPx=600&maxWidthPx=600&key=";

const PlaceToVisit = ({ tripData }) => {
  const [photoMap, setPhotoMap] = useState({});
  const apiKey = import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

  const GetPlacePhoto = async (placeName) => {
    if (!placeName || photoMap[placeName]) return;

    try {
      const result = await GetPlaceDetails({ textQuery: placeName });
      const place = result.data?.places?.[0];

      if (place?.photos?.length) {
        const photoName = place.photos[0].name;
        const fullUrl = PHOTO_REF_BASE_URL.replace("{PHOTO_NAME}", photoName) + apiKey;
        setPhotoMap((prev) => ({ ...prev, [placeName]: fullUrl }));
      } else {
        setPhotoMap((prev) => ({
          ...prev,
          [placeName]: "https://placehold.co/400x250?text=No+Image+Found",
        }));
      }
    } catch (error) {
      console.error("Error fetching photo for", placeName, error);
      setPhotoMap((prev) => ({
        ...prev,
        [placeName]: "https://placehold.co/400x250?text=Error+Image",
      }));
    }
  };

  useEffect(() => {
    if (!tripData?.tripData?.itinerary) return;
    tripData.tripData.itinerary.forEach((day) => {
      day.places?.forEach((place) => {
        GetPlacePhoto(place.placeName);
      });
    });
  }, [tripData]);

  const itinerary = tripData?.tripData?.itinerary;
  const requestedDays = parseInt(tripData?.userSelection?.noOfDays, 10);

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border border-gray-200/50">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className='text-3xl font-bold text-gray-800 mb-4'>Places to Visit</h1>
            <p className="text-lg text-gray-600">No itinerary details available for this trip.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
            <MapPin className="w-5 h-5" />
            Curated Destinations
          </div>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight'>
            Places to Visit
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover carefully selected attractions and experiences for your journey
          </p>
        </div>

        {requestedDays && itinerary.length < requestedDays && (
          <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-2xl p-6 mb-12 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-800 text-lg">Planning Notice</p>
                <p className="text-amber-700 mt-1">
                  The itinerary currently covers {itinerary.length} day(s), but you requested {requestedDays} days.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-12">
          {itinerary.map((dayPlan, dayIndex) => (
            <div key={dayIndex} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-400 via-violet-400 to-violet-400 p-8">
                <h2 className="text-3xl font-bold text-zinc-800">
                  {dayPlan.day || `Day ${dayIndex + 1}`}
                </h2>
                <div className="w-24 h-1 bg-zinc-500 rounded-full mt-3"></div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {dayPlan.places?.map((placeItem, placeIndex) => {
                    const mapUrl = placeItem.Geo_Coordinates?.latitude
                      ? `https://www.google.com/maps/search/?api=1&query=${placeItem.Geo_Coordinates.latitude},${placeItem.Geo_Coordinates.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeItem.placeName)}`;

                    const photoUrl =
                      photoMap[placeItem.placeName] || "https://placehold.co/400x250?text=Loading...";

                    return (
                      <Link
                        to={mapUrl}
                        key={placeIndex}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-blue-300/50">
                          <div className="relative overflow-hidden">
                            <img
                              src={photoUrl}
                              alt={`${placeItem.placeName || "Place"} Image`}
                              className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/400x250/E0E0E0/333333?text=Image+Error";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>           
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight">
                              {placeItem.placeName || "Unknown Place"}
                            </h3>
                            <div className="space-y-3 mb-4">
                              {/* Description */}
                              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                {placeItem["Place Details"] || "Discover this amazing destination with unique experiences and memorable moments."}
                              </p>
                              <div className="flex items-start gap-3 text-gray-700">
                                <Ticket className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide block">Pricing</span>
                                  <span 
                                    className="text-sm truncate block"
                                    title={placeItem.ticket_Pricing || "Pricing information not available"}
                                  >
                                    {placeItem.ticket_Pricing?.length > 40
                                      ? placeItem.ticket_Pricing.slice(0, 40) + "..."
                                      : placeItem.ticket_Pricing || "Contact for pricing"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-gray-700">
                                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <div>
                                  <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide block">Duration</span>
                                  <span className="text-sm">{placeItem.Time_to_travel || "Flexible timing"}</span>
                                </div>
                              </div>
                            </div>
                            {placeItem.Geo_Coordinates && (
                              <div className="border-t border-gray-100 pt-4">
                                <p className="text-blue-600 text-xs opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                  Coordinates: {placeItem.Geo_Coordinates.latitude?.toFixed(4)}, {placeItem.Geo_Coordinates.longitude?.toFixed(4)}
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaceToVisit;

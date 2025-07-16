import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GetPlaceDetails } from "@/constants/GlobalAPI";

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
      <div className="p-6 text-center text-gray-600 bg-white shadow-md rounded-lg mx-auto max-w-4xl mt-10">
        <h1 className="font-bold text-2xl mb-4 text-gray-800">Places to Visit</h1>
        <p className="text-lg">No itinerary details available for this trip.</p>
      </div>
    );
  }

  return (
    <div className="mt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="font-extrabold text-4xl text-gray-900 leading-tight">
          Places to Visit <span className="text-orange-600">🗺️</span>
        </h1>
        <p className="mt-2 text-lg text-gray-600">Explore the must-see attractions on your trip.</p>
      </div>

      {requestedDays && itinerary.length < requestedDays && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8" role="alert">
          <p className="font-bold">Heads Up!</p>
          <p>The itinerary currently covers {itinerary.length} day(s), but you requested {requestedDays}.</p>
        </div>
      )}

      {itinerary.map((dayPlan, dayIndex) => (
        <div key={dayIndex} className="mb-12 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
          <h2 className="font-bold text-3xl text-blue-700 mb-6 border-b pb-3">
            {dayPlan.day || `Day ${dayIndex + 1}`}
          </h2>

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
                  <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden border border-gray-200 transform transition-all duration-300 group-hover:scale-102 group-hover:shadow-lg">
                    <img
                      src={photoUrl}
                      alt={`${placeItem.placeName || "Place"} Image`}
                      className="w-full h-48 object-cover rounded-t-xl"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x250/C0C0C0/555555?text=Image+Error";
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-xl text-gray-900 mb-2 truncate">
                        {placeItem.placeName || "Unknown Place"}
                      </h3>

                      <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                        {placeItem["Place Details"] || "No details available."}
                      </p>

                      {/* ✅ Truncated ticket info */}
                      <p
                        className="text-gray-800 text-sm mb-1 truncate"
                        title={placeItem.ticket_Pricing || "N/A"}
                      >
                        <span className="font-medium">🎟️ Ticket:</span>{" "}
                        {placeItem.ticket_Pricing?.length > 40
                          ? placeItem.ticket_Pricing.slice(0, 40) + "..."
                          : placeItem.ticket_Pricing || "N/A"}
                      </p>

                      <p className="text-gray-800 text-sm mb-2">
                        <span className="font-medium">⏰ Time:</span>{" "}
                        {placeItem.Time_to_travel || "N/A"}
                      </p>

                      {placeItem.Geo_Coordinates && (
                        <p className="text-blue-600 text-xs mt-2 opacity-80 group-hover:opacity-100">
                          Lat: {placeItem.Geo_Coordinates.latitude?.toFixed(4)},
                          Lng: {placeItem.Geo_Coordinates.longitude?.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlaceToVisit;

import React, { useEffect, useState } from "react";
import {
  FaShareAltSquare,
  FaCalendarAlt,
  FaDollarSign,
  FaUser,
} from "react-icons/fa";
import { GetPlaceDetails } from "@/constants/GlobalAPI";
import { PHOTO_REF_BASE_URL } from "@/constants/GlobalAPI";

const InfoSection = ({ tripData }) => {
  const [placePhotoUrl, setPlacePhotoUrl] = useState(null);

  useEffect(() => {
    if (tripData?.userSelection?.location?.label) {
      GetPlacePhoto();
    }
  }, [tripData]);

  const GetPlacePhoto = async () => {
    try {
      const data = {
        textQuery: tripData?.userSelection?.location?.label,
      };

      const apiKey = import.meta.env.VITE_GOOGLE_PLACE_API_KEY;
      if (!apiKey) {
        console.error("API Key for Google Places is missing!");
        setPlacePhotoUrl(
          "https://placehold.co/1200x400/FF0000/FFFFFF?text=API+Key+Missing"
        );
        return;
      }

      const result = await GetPlaceDetails(data);

      if (result.data.places && result.data.places.length > 0) {
        const place = result.data.places[0];

        if (place.photos && place.photos.length > 0) {
          const photoName = place.photos[7].name;
          const fullPhotoUrl =
            PHOTO_REF_BASE_URL.replace("{PHOTO_NAME}", photoName) + apiKey;
          setPlacePhotoUrl(fullPhotoUrl);
        } else {
          setPlacePhotoUrl(
            "https://placehold.co/1200x400/E0E0E0/333333?text=No+Photos+Found"
          );
        }
      } else {
        setPlacePhotoUrl(
          "https://placehold.co/1200x400/E0E0E0/333333?text=Place+Not+Found"
        );
      }
    } catch (error) {
      console.error("Error fetching place photo:", error);
      setPlacePhotoUrl(
        "https://placehold.co/1200x400/FF0000/FFFFFF?text=Error+Loading+Image"
      );
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full h-[500px] overflow-hidden mb-8">
        <img
          src={
            placePhotoUrl ||
            "/airplane-flying-sky-vector-illustration-paper-art-style_103044-4435.avif"
          }
          alt={tripData?.userSelection?.location?.label || "Trip Destination"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/1200x400/E0E0E0/333333?text=Trip+Image";
          }}
        />

        <div className="absolute inset-0 bg-black opacity-50"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
          <h2 className="font-extrabold text-4xl sm:text-5xl mb-6 drop-shadow-md">
            {tripData?.userSelection?.location?.label || "Your Dream Destination"}
          </h2>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
              <FaCalendarAlt /> {tripData?.userSelection?.noOfDays || "N/A"} Days
            </div>
            <div className="bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
              <FaDollarSign /> {tripData?.userSelection?.budget || "N/A"}
            </div>
            <div className="bg-purple-100 text-purple-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
              <FaUser /> {tripData?.userSelection?.traveller || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {tripData?.tripData?.best_time_to_visit && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm text-left mx-auto max-w-4xl">
          <h3 className="font-semibold text-lg text-yellow-800 mb-2">
            Best Time to Visit:
          </h3>
          <p className="text-gray-700">
            {tripData.tripData.best_time_to_visit}
          </p>
        </div>
      )}
    </div>
  );
};

export default InfoSection;

import React, { useEffect, useState } from "react"; // Import useState
import { FaShareAltSquare } from "react-icons/fa";
import { GetPlaceDetails } from '@/constants/GlobalAPI';
import { PHOTO_REF_BASE_URL } from "@/constants/GlobalAPI";
const InfoSection = ({ tripData }) => {
  const [placePhotoUrl, setPlacePhotoUrl] = useState(null); // State to store the fetched photo URL

  // Base URL for fetching photo media, now correctly formatted with placeholder
  

  useEffect(() => {
    // Only attempt to get photo if tripData exists and has location label
    if (tripData?.userSelection?.location?.label) {
      GetPlacePhoto();
    }
  }, [tripData]); // Depend on tripData

  const GetPlacePhoto = async () => {
    try {
      const data = {
        textQuery: tripData?.userSelection?.location?.label
      };

      // Ensure API key is available
      const apiKey = import.meta.env.VITE_GOOGLE_PLACE_API_KEY;
      if (!apiKey) {
        console.error("API Key for Google Places is missing!");
        setPlacePhotoUrl('https://placehold.co/1200x400/FF0000/FFFFFF?text=API+Key+Missing');
        return;
      }

      const result = await GetPlaceDetails(data); // GetPlaceDetails already handles the API key header

      if (result.data.places && result.data.places.length > 0) {
        const place = result.data.places[0]; // Get the first place found

        if (place.photos && place.photos.length > 0) {
          // Get the first photo name (or iterate if you need a specific one)
          const photoName = place.photos[0].name; // Using photos[0] for safety
          const fullPhotoUrl = PHOTO_REF_BASE_URL.replace('{PHOTO_NAME}', photoName) + apiKey;
          console.log("Generated Photo URL:", fullPhotoUrl);
          setPlacePhotoUrl(fullPhotoUrl); // Set the state to display the photo
        } else {
          console.log("No photos found for this place.");
          setPlacePhotoUrl('https://placehold.co/1200x400/E0E0E0/333333?text=No+Photos+Found');
        }
      } else {
        console.log("No place details found for the given location.");
        setPlacePhotoUrl('https://placehold.co/1200x400/E0E0E0/333333?text=Place+Not+Found');
      }
    } catch (error) {
      console.error("Error fetching place photo:", error);
      setPlacePhotoUrl('https://placehold.co/1200x400/FF0000/FFFFFF?text=Error+Loading+Image'); // Error fallback
    }
  };

  console.log("Trip data in InfoSection:", tripData);

  return (
    <div className="mt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"> {/* Centered and responsive container */}
      <div className="flex justify-center mb-8"> {/* Centered image container */}
        <img
          className="rounded-xl w-full max-w-4xl h-64 sm:h-80 md:h-96 object-cover shadow-lg" // Responsive image sizing
          src={placePhotoUrl || "/airplane-flying-sky-vector-illustration-paper-art-style_103044-4435.avif"} // Use fetched URL, fallback to default
          alt={tripData?.userSelection?.location?.label ? `${tripData.userSelection.location.label} Destination` : "Trip Destination"}
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/1200x400/E0E0E0/333333?text=Trip+Image'; }} // Fallback on error
        />
      </div>
      <div className="flex flex-col items-center text-center md:items-start md:text-left"> {/* Aligned content */}
        <h2 className="font-extrabold text-4xl text-gray-900 mb-3 leading-tight">
          {tripData?.userSelection?.location?.label || "Your Dream Destination"}
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-2xl mb-6"> {/* Responsive layout for badges and share */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4 md:mb-0"> {/* Badges */}
            <h2 className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
              🗓️ {tripData?.userSelection?.noOfDays || 'N/A'} Days
            </h2>
            <h2 className="bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
              💸 {tripData?.userSelection?.budget || 'N/A'}
            </h2>
            <h2 className="bg-purple-100 text-purple-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
              🚶 {tripData?.userSelection?.traveller || 'N/A'}
            </h2>
          </div>
          <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
            <FaShareAltSquare
              size={24} // Adjusted size for better visual balance
              className="text-gray-700 hover:text-gray-900"
            />
          </button>
        </div>
        {tripData?.tripData?.best_time_to_visit && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm w-full max-w-2xl text-left">
            <h3 className="font-semibold text-lg text-yellow-800 mb-2">Best Time to Visit:</h3>
            <p className="text-gray-700">{tripData.tripData.best_time_to_visit}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoSection;

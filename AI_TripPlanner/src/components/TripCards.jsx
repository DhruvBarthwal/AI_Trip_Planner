import React from "react";
import { useState, useEffect } from "react";
import { GetPlaceDetails } from "@/constants/GlobalAPI";
import { PHOTO_REF_BASE_URL } from "@/constants/GlobalAPI";

const TripCards = ({ trip }) => {
  const [placePhotoUrl, setPlacePhotoUrl] = useState(null);
  useEffect(() => {
    // Only attempt to get photo if tripData exists and has location label
    if (trip?.userSelection?.location?.label) {
      GetPlacePhoto();
    }
  }, [trip]); // Depend on tripData

  const GetPlacePhoto = async () => {
    try {
      const data = {
        textQuery: trip?.userSelection?.location?.label,
      };

      // Ensure API key is available
      const apiKey = import.meta.env.VITE_GOOGLE_PLACE_API_KEY;
      if (!apiKey) {
        console.error("API Key for Google Places is missing!");
        setPlacePhotoUrl(
          "https://placehold.co/1200x400/FF0000/FFFFFF?text=API+Key+Missing"
        );
        return;
      }

      const result = await GetPlaceDetails(data); // GetPlaceDetails already handles the API key header

      if (result.data.places && result.data.places.length > 0) {
        const place = result.data.places[0]; // Get the first place found

        if (place.photos && place.photos.length > 0) {
          // Get the first photo name (or iterate if you need a specific one)
          const photoName = place.photos[0].name; // Using photos[0] for safety
          const fullPhotoUrl =
            PHOTO_REF_BASE_URL.replace("{PHOTO_NAME}", photoName) + apiKey;
          console.log("Generated Photo URL:", fullPhotoUrl);
          setPlacePhotoUrl(fullPhotoUrl); // Set the state to display the photo
        } else {
          console.log("No photos found for this place.");
          setPlacePhotoUrl(
            "https://placehold.co/1200x400/E0E0E0/333333?text=No+Photos+Found"
          );
        }
      } else {
        console.log("No place details found for the given location.");
        setPlacePhotoUrl(
          "https://placehold.co/1200x400/E0E0E0/333333?text=Place+Not+Found"
        );
      }
    } catch (error) {
      console.error("Error fetching place photo:", error);
      setPlacePhotoUrl(
        "https://placehold.co/1200x400/FF0000/FFFFFF?text=Error+Loading+Image"
      ); // Error fallback
    }
  };
  return (
    <div>
      <img
        src={
          placePhotoUrl
            ? placePhotoUrl
            : "/airplane-flying-sky-vector-illustration-paper-art-style_103044-4435.avif"
        }
        alt="img"
        className="rounded-[10px] w-full h-[200px] object-cover"
      />
      <div>
        <h2 className="font-bold text-lg">
          {trip?.userSelection?.location?.label}
        </h2>
        <h2 className="text-sm text-zinc-500">
          {trip?.userSelection?.noOfDays} Days Trip with{" "}
          {trip?.userSelection?.budget} Budget
        </h2>
      </div>
    </div>
  );
};

export default TripCards;

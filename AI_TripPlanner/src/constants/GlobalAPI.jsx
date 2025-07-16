import axios from "axios";

const BASE_URL = "https://places.googleapis.com/v1/places:searchText";

const config = {
  headers: {
    "Content-Type": "application/json",
    "X-Goog-API-Key": import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
    "X-Goog-FieldMask": "places.photos,places.displayName,places.id",
  },
};

export const GetPlaceDetails = (data) => axios.post(BASE_URL, data, config);

export const PHOTO_REF_BASE_URL = 'https://places.googleapis.com/v1/{PHOTO_NAME}/media?maxHeightPx=800&maxWidthPx=1200&key=';
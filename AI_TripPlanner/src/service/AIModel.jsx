// src/utils/genaiClient.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_PLACE_AI_API_KEY; // Assuming you have this
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateTravelPlan = async (prompt) => {
  const contents = [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  const generationConfig = {
    responseMimeType: "application/json", // CRUCIAL: Tells the model to output JSON
    responseSchema: { // Define the expected JSON structure
      type: "OBJECT",
      properties: {
        best_time_to_visit: { type: "STRING" },
        hotelOptions: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              HotelName: { type: "STRING" },
              "Hotel address": { type: "STRING" },
              Price: { type: "STRING" },
              hotel_image_url: { type: "STRING" },
              geo_coordinates: {
                type: "OBJECT",
                properties: {
                  latitude: { type: "NUMBER" },
                  longitude: { type: "NUMBER" }
                }
              },
              rating: { type: "NUMBER" },
              descriptions: { type: "STRING" }
            }
          }
        },
        itinerary: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              day: { type: "STRING" },
              places: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    placeName: { type: "STRING" },
                    "Place Details": { type: "STRING" },
                    Place_Image_Url: { type: "STRING" },
                    Geo_Coordinates: {
                      type: "OBJECT",
                      properties: {
                        latitude: { type: "NUMBER" },
                        longitude: { type: "NUMBER" }
                      }
                    },
                    ticket_Pricing: { type: "STRING" },
                    Time_to_travel: { type: "STRING" }
                  }
                }
              }
            }
          }
        }
      },
      required: ["best_time_to_visit", "hotelOptions", "itinerary"]
    }
  };

  const model = "gemini-2.0-flash";
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const response = await genAI.getGenerativeModel({ model }).generateContentStream({
        contents,
        generationConfig,
      });

      // --- CHANGE START ---
      // Get the final aggregated response object
      const aggregatedResponse = await response.response;
      // Use the .text() method on the aggregated response to get the complete string
      const result = aggregatedResponse.text();
      // --- CHANGE END ---

      return result; // If successful, return the result and exit loop
    } catch (error) {
      console.error(`AIModel: Attempt ${retries + 1} failed during stream generation or consumption:`, error);

      // Check if the error is specifically 'Failed to parse stream'
      if (error.message && error.message.includes("Failed to parse stream")) {
        retries++;
        console.log(`AIModel: Retrying... (${retries}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
      } else {
        // If it's a different error, re-throw immediately
        throw error;
      }
    }
  }
  // If all retries fail for 'Failed to parse stream'
  throw new Error(`AIModel: Failed to generate content after ${MAX_RETRIES} retries due to stream parsing errors.`);
};

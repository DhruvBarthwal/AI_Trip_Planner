
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_PLACE_AI_API_KEY; 
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateTravelPlan = async (prompt) => {
  const contents = [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  const generationConfig = {
    responseMimeType: "application/json", 
    responseSchema: { 
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
            },
            required: ["HotelName", "Hotel address", "Price", "hotel_image_url", "geo_coordinates", "rating", "descriptions"] // Added required fields for hotels
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
                  },
                  required: ["placeName", "Place Details", "Place_Image_Url", "Geo_Coordinates", "ticket_Pricing", "Time_to_travel"] 
                }
              }
            },
            required: ["day", "places"] // Added required fields for itinerary days
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
      const { response } = await genAI.getGenerativeModel({ model }).generateContent({
        contents,
        generationConfig,
      });

      if (response && response.candidates && response.candidates[0] &&
          response.candidates[0].content && response.candidates[0].content.parts &&
          response.candidates[0].content.parts[0] && response.candidates[0].content.parts[0].text) {

        const rawTextResponse = response.candidates[0].content.parts[0].text;
        console.log("AIModel: Raw text response from model:", typeof rawTextResponse, rawTextResponse);

        try {
            const parsedObject = JSON.parse(rawTextResponse);
            console.log("AIModel: Successfully parsed AI response into object.");
            return parsedObject; 
        } catch (parseErrorDuringAIResponse) {
            console.warn("AIModel: Initial parse of raw text response failed. It might be malformed JSON or have extra characters. Error:", parseErrorDuringAIResponse);
            return rawTextResponse;
        }

      } else {
          const resultText = await response.text();
          console.warn("AIModel: Falling back to .text() method or response structure was unexpected.", typeof resultText, resultText);
          try {
             const parsedObject = JSON.parse(resultText);
             console.log("AIModel: Successfully parsed fallback text response into object.");
             return parsedObject;
          } catch (e) {
             console.error("AIModel: Fallback text response also not valid JSON. Returning raw string.");
             return resultText; 
          }
      }

    } catch (error) {
      console.error(`AIModel: Attempt ${retries + 1} failed during content generation:`, error);

      retries++;
      console.log(`AIModel: Retrying... (${retries}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
  throw new Error(`AIModel: Failed to generate content after ${MAX_RETRIES} retries.`);
};
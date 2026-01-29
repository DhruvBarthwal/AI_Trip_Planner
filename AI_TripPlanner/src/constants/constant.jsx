export const SelectBudget = [
    {
        id : 1,
        title : "Cheap",
        desc : "Stay conscious of cost",
        icon : '💵'   
    },
        {
        id : 2,
        title : "Moderate",
        desc : "Keep cost on the average side",
        icon : '💰'
    },
        {
        id : 1,
        title : "Luxury",
        desc : "Don't worry about cost",
        icon : '💸'
    },
]

export const SelectTravelList =[
    {
        id : 1,
        title : "Just ME",
        desc : "A solo travels in exploration",
        icon : '✈',
        people : '1'
    },
        {
        id : 1,
        title : "A couple",
        desc : "Two travels in tandom",
        icon : '🥂',
        people : '2 people'
    },
        {
        id : 1,
        title : "Family",
        desc : "A group of fun loving adv",
        icon : '🏡',
        people : '3 to 5 people'
    },
        {
        id : 1,
        title : "Friends",
        desc : "A bunch of thrill seeks",
        icon : '🛥️',
        people : '5 to 10 people'
    },
]

export const AI_Prompt = `Generate a comprehensive travel plan in STRICT, VALID, AND PARSABLE JSON format. The entire response MUST be a single JSON object.

**Input Details:**
Location: {location}
Duration: {totalDays} Days
Traveler Type: {traveller}
Budget: {budget}

**JSON Output Requirements:**

1.  **Overall Structure:**
    * The JSON object MUST contain three top-level keys: "best_time_to_visit", "hotelOptions", and "itinerary".
    * All string values within the JSON (e.g., descriptions, details) MUST be plain text, concise, and free of conversational filler, greetings, or extra markdown like backticks (\`\`\`).
    * Ensure any double quotes within string values are properly escaped (e.g., \\").

2.  **"best_time_to_visit" (STRING):**
    * A concise description of the ideal time of year to visit {location}.

3.  **"hotelOptions" (ARRAY of OBJECTS):**
    * MUST contain at least 3 hotel objects.
    * For EACH hotel object, ALL the following properties MUST be present and filled. If specific data is genuinely unavailable, provide a concise "N/A" or a very brief, relevant placeholder.
        * **HotelName** (STRING): Name of the hotel.
        * **Hotel address** (STRING): Full, complete address of the hotel. This is CRITICAL.
        * **Price** (STRING): The estimated price per night. MUST be concise (e.g., "Approx. 2500 INR/night", "100 USD", "Free"). Do NOT include long paragraphs or extra explanations.
        * **hotel_image_url** (STRING): A valid image URL for the hotel.
        * **geo_coordinates** (OBJECT): Latitude and longitude as numbers.
        * **rating** (NUMBER): Rating out of 5.
        * **descriptions** (STRING): A concise (max 2-3 sentences), informative description of the hotel, its key amenities, and why it's suitable for the given budget and traveler type. This is CRITICAL.

4.  **"itinerary" (ARRAY of OBJECTS):**
    * MUST contain an entry for EACH of the {totalDays} days requested. For example, if {totalDays} is 4, there MUST be 4 day objects in this array.
    * For EACH day object, it MUST contain:
        * **day** (STRING): The day number and a brief theme (e.g., "Day 1: Old Delhi Exploration").
        * **places** (ARRAY of OBJECTS): A list of places to visit on that day.
            * For EACH place object, ALL the following properties MUST be present and filled. If specific data is genuinely unavailable, provide a concise "N/A" or a very brief, relevant placeholder.
                * **placeName** (STRING): Name of the place.
                * **Place Details** (STRING): Brief description of the place (max 2-3 sentences).
                * **Place_Image_Url** (STRING): A valid image URL for the place.
                * **Geo_Coordinates** (OBJECT): Latitude and longitude as numbers.
                * **ticket_Pricing** (STRING): Estimated ticket price. MUST be concise (e.g., "Free", "500 INR", "10 USD"). Do NOT include long paragraphs, explanations, or disclaimers.
                * **Time_to_travel** (STRING): Estimated time needed for the activity (e.g., "Vormittag (ca. 2-3 Stunden)").

**Strict Adherence:**
I cannot process responses that do not strictly follow this JSON structure or include extraneous text. Your response should begin directly with \`{\` and end with \`}\`.
`;
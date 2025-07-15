import React from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { useState, useEffect } from "react";
import { SelectBudget, SelectTravelList } from "../constants/constant";
import { generateTravelPlan } from "../service/AIModel";
import { FcGoogle } from "react-icons/fc";
import { AI_Prompt } from "../constants/constant";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { useGoogleLogin } from "@react-oauth/google"; // This is likely not needed if using Firebase Google Auth
// import axios from "axios"; // This is likely not needed anymore
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const CreateTripHero = () => {
  // All const values
  const [place, setPlace] = useState();
  const [formData, setFormData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // State to hold Firebase authenticated user
  const [isAuthReady, setIsAuthReady] = useState(false); // State to track if auth is ready
  const [errorMessage, setErrorMessage] = useState(""); // State to hold error messages for the user

  // Initialize Auth
  const auth = getAuth();

  // Effect to listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true); // Auth state has been checked
      if (user) {
        console.log("Firebase Auth State Changed: User is logged in", user.email, user.uid);
        // This is where you could potentially trigger OnGenerateTrip if you want it to auto-run
        // after a user logs in, assuming form data is already filled.
        // For now, let's keep it manual (user clicks "Generate Trip").
      } else {
        console.log("Firebase Auth State Changed: User is logged out");
      }
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [auth]);


  //All functions
  const handlePlaceSelect = (v) => {
    setPlace(v);
    handleInput("location", v);
  };

  const handleInput = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    console.log("Form Data Updated:", formData);
  }, [formData]);

  const OnGenerateTrip = async () => {
    setErrorMessage(""); // Clear any previous error messages

    // Check if auth state is ready and user is logged in via Firebase Auth directly
    if (!isAuthReady) {
      console.log("Authentication not ready yet. Please wait.");
      setOpenDialog(true); // Still show dialog if auth isn't ready
      return;
    }

    if (!currentUser) {
      console.log("No authenticated Firebase user found. Opening login dialog.");
      setOpenDialog(true);
      return;
    }

    if (
      (formData?.noOfdays >= 5 && !formData?.location) ||
      !formData?.budget ||
      !formData?.traveller
    ) {
      console.log("Form validation failed. Missing required fields.");
      setErrorMessage("Please fill in all required trip details.");
      return;
    }

    setLoading(true);
    const FINAL_PROMPT = AI_Prompt.replace(
      "{location}",
      formData?.location?.label
    )
      .replace("{totalDays}", formData?.noOfDays)
      .replace("{budget}", formData?.budget)
      .replace("{traveller}", formData?.traveller);

    try {
      console.log("Generating travel plan with prompt:", FINAL_PROMPT);
      const aiResponse = await generateTravelPlan(FINAL_PROMPT);
      console.log("AI Response received:", aiResponse);
      setLoading(false);
      // Pass the Firebase authenticated user directly to SaveAITrip
      SaveAITrip(aiResponse, currentUser);
    } catch (err) {
      console.error("Error generating trip or saving AI trip:", err);
      setLoading(false); // Ensure loading is turned off on error

      // Check for specific API error messages
      if (err.message && err.message.includes("The model is overloaded")) {
        setErrorMessage("AI service is currently busy. Please try again in a moment.");
      } else if (err.code === "permission-denied") { // Re-add this for Firebase errors if they re-appear
        setErrorMessage("Permission denied. Please check your Firebase rules or login status.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false); // Ensure loading is always turned off
    }
  };

  //login
  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // 'auth' is already initialized and available from getAuth() in the component scope
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // This 'user' is the Firebase User object

      // You can still store a simplified profile in localStorage if needed for other parts of your app,
      // but for Firestore rules, the Firebase auth state is what matters.
      const profile = {
        id: user.uid,
        email: user.email,
        verified_email: user.emailVerified,
        name: user.displayName,
        given_name: user.displayName,
        picture: user.photoURL,
      };

      console.log("Firebase Login Success! User Profile:", profile);
      localStorage.setItem("user", JSON.stringify(profile)); // Keep this if you use it elsewhere
      setOpenDialog(false);
      // IMPORTANT: If you want the trip to generate immediately after login, uncomment the line below.
      // OnGenerateTrip();
      // Otherwise, the user will need to click "Generate Trip" again.
    } catch (error) {
      console.error("Firebase login error:", error);
      // Handle login error, e.g., show a message to the user
      setErrorMessage("Login failed. Please try again.");
    }
  };

  //saving trip details in firebase
  // Accept the authenticated Firebase user directly as an argument
  const SaveAITrip = async (TripData, authenticatedUser) => {
    setLoading(true);
    setErrorMessage(""); // Clear any previous error messages

    // Use the authenticatedUser passed directly, which is guaranteed to be from Firebase Auth
    const userToSave = authenticatedUser;

    if (!userToSave || !userToSave.email) {
      console.error("SaveAITrip: No authenticated user or user email found. Cannot save trip.");
      setLoading(false);
      setErrorMessage("Authentication error: User email not found. Please re-login.");
      return;
    }

    const docId = Date.now().toString();

    let parsedTripData = TripData; // Default to original string
    try {
      // Attempt to parse the TripData string into a JSON object
      parsedTripData = JSON.parse(TripData);
      console.log("TripData successfully parsed as JSON.");
    } catch (parseError) {
      console.warn("Could not parse TripData as JSON. Saving as string. Error:", parseError);
      // If parsing fails, it means TripData was not valid JSON, so we'll save it as a string.
      // You might want to adjust your AIModel to ensure it always returns valid JSON.
    }

    console.log("--- Attempting to Save AI Trip ---");
    console.log("Authenticated User Email (from Firebase Auth):", userToSave.email);
    console.log("Document ID for new trip:", docId);
    console.log("Data to be written (userEmail field):", userToSave.email); // This is what request.resource.data.userEmail will see
    console.log("Full trip data being sent:", {
      userSelection: formData,
      tripData: parsedTripData, // Use the parsed data here
      userEmail: userToSave.email,
      id: docId,
    });

    try {
      await setDoc(doc(db, "AITrips", docId), {
        userSelection: formData,
        tripData: parsedTripData, // Use the parsed data here
        userEmail: userToSave.email,
        id: docId,
      });
      console.log("Trip saved successfully to Firestore!");
      setErrorMessage("Trip generated and saved successfully!"); // Success message
    } catch (error) {
      console.error("Firebase Firestore Save Error:", error);
      // Log the full error object to see more details if possible
      if (error.code) {
        console.error("Firebase Error Code:", error.code);
        if (error.code === "permission-denied") {
          setErrorMessage("Permission denied. Check Firebase security rules for 'AITrips' collection.");
        } else {
          setErrorMessage(`Firestore error: ${error.message}`);
        }
      } else if (error.message) {
        console.error("Firebase Error Message:", error.message);
        setErrorMessage(`Firestore error: ${error.message}`);
      } else {
        setErrorMessage("An unknown error occurred while saving to Firestore.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-70 mt-[40px]">
      <div>
        <h1 className="font-bold text-[28px]">
          Tell us your travel preferences 🏖️
        </h1>
        <h1>
          Just provide some basic information and our trip planner will generate
          a customized itinerary based on your preferences
        </h1>
      </div>
      <div className="mt-[45px]">
        <h1 className="font-semibold text-[18px]">
          What is destination of choice?
        </h1>
        <GooglePlacesAutocomplete
          apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
          selectProps={{
            place,
            onChange: handlePlaceSelect,
            placeholder: "Search your destination",
            className: "text-black w-[1000px] mt-[30px]",
          }}
        />
      </div>
      <div className="mt-[45px]">
        <h1 className="font-semibold text-[18px]">
          How many days are you planning your trip?
        </h1>
        <input
          className="text-black w-[1000px] mt-[30px] border-[1px] border-zinc-400 p-2 rounded-[4px]"
          placeholder="Ex.3"
          type="number"
          onChange={(e) => handleInput("noOfDays", e.target.value)}
        />
      </div>
      <div className="mt-[45px]">
        <h1 className="font-bold text-[18px]">What is your budget?</h1>
        <div className="grid grid-cols-3 gap-5 mt-5 mr-50">
          {SelectBudget.map((item, index) => (
            <div
              key={index}
              className={`p-4 border-zinc-400 border cursor-pointer flex flex-col gap-[10px] rounded-2xl hover:shadow-lg ${
                formData?.budget == item.title &&
                "shadow-lg border-zinc-950 scale-105"
              }`}
              onClick={() => handleInput("budget", item.title)}
            >
              <h2 className="text-3xl">{item.icon}</h2>
              <h2 className="font-bold">{item.title}</h2>
              <h2 className="text-[14px]">{item.desc}</h2>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-[45px]">
        <h1 className="font-bold text-[18px]">
          What do you plan on travelling with your next adventure?
        </h1>
        <div className="grid grid-cols-3 gap-5 mt-5 mr-50">
          {SelectTravelList.map((item, index) => (
            <div
              key={index}
              className={`p-4 border-zinc-400 border cursor-pointer flex flex-col gap-[5px] rounded-2xl hover:shadow-lg ${
                formData?.traveller == item.people &&
                "shadow-lg border-zinc-950 scale-105"
              }`}
              onClick={() => handleInput("traveller", item.people)}
            >
              <h2 className="text-3xl">{item.icon}</h2>
              <h2 className="font-bold">{item.title}</h2>
              <h2 className="text-[14px]">{item.desc}</h2>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-14 mb-14">
        {errorMessage && (
          <div className="text-red-500 text-sm mb-4 p-2 border border-red-300 bg-red-50 rounded-md">
            {errorMessage}
          </div>
        )}
        <button
          disabled={loading}
          onClick={OnGenerateTrip}
          className={`transition-all duration-300 rounded-[5px] text-white h-[38px] ${
            loading
              ? "w-[38px] bg-gray-500 flex items-center justify-center"
              : "w-[140px] bg-zinc-800 hover:bg-zinc-700"
          }`}
        >
          {loading ? (
            <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
          ) : (
            "Generate Trip"
          )}
        </button>
      </div>
      <div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className={`bg-white`}>
            <DialogHeader>
              <DialogDescription>
                <h1 className="font-bold text-2xl">Loremipsum</h1>
                <h2 className="font-semibold text-[16px] text-zinc-600 mt-[20px]">
                  Sign in with Google
                </h2>
                <h2 className="text-[13px] text-zinc-600 ">
                  Sign in to the App with Google authentication securely
                </h2>
                <button
                  onClick={login}
                  className="bg-zinc-900 text-white flex justify-center items-center gap-[5px] w-[200px] h-[35px] rounded-[10px] mt-[7px] ml-[120px]"
                >
                  <FcGoogle className="mt-[2px]" /> Sign in with Google
                </button>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CreateTripHero;

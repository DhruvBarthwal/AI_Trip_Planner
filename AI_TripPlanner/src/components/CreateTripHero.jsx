import React, { useState, useEffect } from 'react';
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
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
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, DollarSign, Users, Sparkles, ArrowRight, Wallet, Coins, Gem, User } from "lucide-react";


const CreateTripHero = () => {

  const [place, setPlace] = useState();
  const [formData, setFormData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
      if (user) {
        console.log("Firebase Auth State Changed: User is logged in", user.email, user.uid);
      } else {
        console.log("Firebase Auth State Changed: User is logged out");
      }
    });
    return () => unsubscribe();
  }, [auth]);

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
    setErrorMessage("");

    if (!isAuthReady) {
      console.log("Authentication not ready yet. Please wait.");
      setOpenDialog(true);
      return;
    }

    if (!currentUser) {
      console.log("No authenticated Firebase user found. Opening login dialog.");
      setOpenDialog(true);
      return;
    }

    if (
      (!formData?.location) ||
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
      console.log("AI Response (RAW) from generateTravelPlan:", typeof aiResponse, aiResponse);
      setLoading(false);
      SaveAITrip(aiResponse, currentUser);
    } catch (err) {
      console.error("Error generating trip or saving AI trip:", err);
      setLoading(false);

      if (err.message && err.message.includes("The model is overloaded")) {
        setErrorMessage("AI service is currently busy. Please try again in a moment.");
      } else if (err.code === "permission-denied") {
        setErrorMessage("Permission denied. Please check your Firebase rules or login status.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const profile = {
        id: user.uid,
        email: user.email,
        verified_email: user.emailVerified,
        name: user.displayName,
        given_name: user.displayName,
        picture: user.photoURL,
      };

      console.log("Firebase Login Success! User Profile:", profile);
      localStorage.setItem("user", JSON.stringify(profile));
      setOpenDialog(false);
    } catch (error) {
      console.error("Firebase login error:", error);
      setErrorMessage("Login failed. Please try again.");
    }
  };

  const SaveAITrip = async (TripData, authenticatedUser) => {
    setLoading(true);
    setErrorMessage("");

    const userToSave = authenticatedUser;

    if (!userToSave || !userToSave.email) {
      console.error("SaveAITrip: No authenticated user or user email found. Cannot save trip.");
      setLoading(false);
      setErrorMessage("Authentication error: User email not found. Please re-login.");
      return;
    }

    const docId = Date.now().toString();

    let parsedTripData = TripData; 

    console.log("SaveAITrip: Incoming TripData (before parsing attempt):", typeof TripData, TripData);

    while (typeof parsedTripData === 'string') {
      let tempParsedData;
      let cleanedString = parsedTripData.trim();

      const markdownRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/;
      const match = cleanedString.match(markdownRegex);

      if (match && match[1]) {
        cleanedString = match[1].trim();
        console.log("SaveAITrip: Markdown code block detected and stripped.");
      }

      try {
        tempParsedData = JSON.parse(cleanedString);
        parsedTripData = tempParsedData;
        console.log("SaveAITrip: Successfully parsed a layer of JSON.");

      } catch (parseError) {
        console.warn("SaveAITrip: Could not parse string as JSON. Stopping parsing loop. Error:", parseError);
        break;
      }
    }

    if (typeof parsedTripData !== 'object' || parsedTripData === null) {
      console.error("SaveAITrip: ERROR - Final data is not a valid JSON object. Cannot save trip data correctly.");
      setLoading(false);
      setErrorMessage("Failed to process trip data from AI. The format was unexpected.");
      return;
    }

    console.log("--- Attempting to Save AI Trip ---");
    console.log("Authenticated User Email (from Firebase Auth):", userToSave.email);
    console.log("SaveAITrip: Type of userToSave.email:", typeof userToSave.email, "Value:", userToSave.email);
    console.log("Document ID for new trip:", docId);
    console.log("Data to be written (userEmail field):", userToSave.email);
    console.log("Full trip data being sent:", {
      userSelection: formData,
      tripData: parsedTripData, // This will now always be an object (or the function will have returned)
      userEmail: userToSave.email,
      id: docId,
    });

    try {
      await setDoc(doc(db, "AITrips", docId), {
        userSelection: formData,
        tripData: parsedTripData,
        userEmail: userToSave.email,
        id: docId,
      });
      console.log("Trip saved successfully to Firestore!");
      setErrorMessage("Trip generated and saved successfully!");
      navigate(`/view-trip/${docId}`);
    } catch (error) {
      console.error("Firebase Firestore Save Error:", error);
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

  const SelectBudget = [
    {
      id: 1,
      title: "Cheap",
      desc: "Stay conscious of costs",
      icon: <Wallet className="w-10 h-10" />,
    },
    {
      id: 2,
      title: "Moderate",
      desc: "Balance of comfort and cost",
      icon: <Coins className="w-10 h-10" />,
    },
    {
      id: 3,
      title: "Luxury",
      desc: "Enjoy premium experiences",
      icon: <Gem className="w-10 h-10" />,
    },
  ];

  const SelectTravelList = [
    {
      id: 1,
      people: "1",
      title: "Solo",
      icon: <User className="w-10 h-10" />,
      desc: "A solo adventure",
    },
    {
      id: 2,
      people: "2",
      title: "Couple",
      icon: <Users className="w-10 h-10" />,
      desc: "For two travelers",
    },
    {
      id: 3,
      people: "3+",
      title: "Family",
      icon: <Users className="w-10 h-10" />,
      desc: "Fun for the whole family",
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Trip Planning
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Plan your dream trip in seconds!
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Share your travel interests — we’ll handle the planning magic.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200/50 backdrop-blur-sm">

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Destination</h2>
                <p className="text-gray-600">Where would you like to explore?</p>
              </div>
            </div>
            <div className="relative">
              <GooglePlacesAutocomplete
                apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
                selectProps={{
                  place,
                  onChange: handlePlaceSelect,
                  placeholder: "Search your dream destination...",
                  className: "text-gray-900",
                  styles: {
                    control: (provided) => ({
                      ...provided,
                      minHeight: '56px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '16px',
                      fontSize: '16px',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: '#3b82f6',
                      },
                      '&:focus-within': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                      }
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: '#9ca3af',
                    }),
                  }
                }}
              />
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Duration</h2>
                <p className="text-gray-600">How many days are you planning your trip?</p>
              </div>
            </div>
            <input
              className="w-full h-14 px-6 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-lg placeholder-gray-400"
              placeholder="e.g., 7 days"
              type="number"
              onChange={(e) => handleInput("noOfDays", e.target.value)}
            />
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Budget Range</h2>
                <p className="text-gray-600">Choose your preferred spending level</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SelectBudget.map((item) => (
                <div
                  key={item.id}
                  className={`group relative p-6 border-2 cursor-pointer rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    formData?.budget == item.title
                      ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => handleInput("budget", item.title)}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                  {formData?.budget == item.title && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Travel Companions</h2>
                <p className="text-gray-600">Who will be joining you on this adventure?</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SelectTravelList.map((item) => (
                <div
                  key={item.id}
                  className={`group relative p-6 border-2 cursor-pointer rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    formData?.traveller == item.people
                      ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => handleInput("traveller", item.people)}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                  {formData?.traveller == item.people && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="text-center">
            <button
              disabled={loading}
              onClick={OnGenerateTrip}
              className={`group relative overflow-hidden transition-all duration-300 rounded-2xl text-white font-bold text-lg shadow-2xl ${
                loading
                  ? "w-16 h-16 bg-gray-400 cursor-not-allowed"
                  : "w-64 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 hover:shadow-blue-500/25 hover:scale-105"
              }`}
            >
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 mx-auto" />
              ) : (
                <>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Generate My Trip
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </>
              )}
            </button>
            <p className="text-gray-500 text-sm mt-4">
              Powered by advanced AI technology
            </p>
          </div>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-white rounded-3xl border-0 shadow-2xl max-w-md mx-auto">
          <DialogHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Tripify
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              <p className="text-lg mb-2">Sign in with Google</p>
              <p className="text-sm">
                Sign in to the App with Google authentication securely
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <button
              onClick={login}
              className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-3 group"
            >
              <FcGoogle className="text-2xl" />
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateTripHero;
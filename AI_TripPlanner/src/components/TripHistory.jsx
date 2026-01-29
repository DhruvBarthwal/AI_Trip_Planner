import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase-config";
import TripCards from "./TripCards";
import { X } from "lucide-react";

const TripHistory = () => {
  const navigate = useNavigate();
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    GetUserTrip();
  }, []); 

  const GetUserTrip = async () => {
    setLoading(true); 
    setError(null);   

    const user = JSON.parse(localStorage.getItem("user"));
    console.log("CurrentUser from localStorage:", user);

    if (!user || !user.email) {
      console.warn("No authenticated user or user email found in localStorage. Redirecting to home.");
      navigate("/");
      setLoading(false);
      return;
    }

    const tripList = [];
    try {
      console.log(`Attempting to fetch trips for userEmail: ${user.email}`);
      const q = query(
        collection(db, "AITrips"),
        where("userEmail", "==", user.email)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("No documents found for this user email in AITrips collection.");
      }

      querySnapshot.forEach((document) => {
        tripList.push({ ...document.data(), id: document.id });
      });

      setUserTrips(tripList);
      console.log("User trips fetched successfully:", tripList);
    } catch (err) {
      console.error("Firebase fetch error:", err);
      setError(`Failed to load trips: ${err.message || "Unknown error"}. Please ensure you are logged in and have an internet connection.`);
    } finally {
      setLoading(false); // End loading
    }
  };


  const deleteTripFromFirestore = async (tripId) => {

    try {
      console.log(`Attempting to delete trip with ID: ${tripId}`);
      const tripDocRef = doc(db, "AITrips", tripId);
      await deleteDoc(tripDocRef);

      console.log(`Trip with ID: ${tripId} successfully deleted from Firestore.`);

      setUserTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
    } catch (err) {
      console.error(`Error deleting trip with ID: ${tripId} from Firestore:`, err);
    
      setError(`Failed to delete trip: ${err.message || "Unknown error"}. Please try again.`);
    }
  };


  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gray-900 bg-cover bg-center brightness-[0.4]"
           style={{ backgroundImage: "url('/marissa-grootes-TVllFyGaLEA-unsplash.jpg')" }}>
        <div classNameNam="text-white text-2xl z-10">Loading your trips...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gray-900 bg-cover bg-center brightness-[0.4]"
           style={{ backgroundImage: "url('/marissa-grootes-TVllFyGaLEA-unsplash.jpg')" }}>
        <div className="text-red-400 text-2xl z-10 p-4 bg-red-900 bg-opacity-70 rounded-lg">
          <p>{error}</p>
          <button
            onClick={GetUserTrip} 
            className="block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry Loading Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center brightness-[0.4] z-0"
        style={{
          backgroundImage: "url('/marissa-grootes-TVllFyGaLEA-unsplash.jpg')",
        }}
      ></div>

      <div className="relative z-10 px-6 py-10">
        <h1 className="font-bold text-amber-300 text-5xl mb-8 mt-[100px]">
          My Trips
        </h1>

        {userTrips.length === 0 ? (
          <p className="text-white text-xl text-center mt-10">
            No trips found. Start planning your first adventure!
            <button
              onClick={() => navigate("/create-trip")}
              className="block mx-auto mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create New Trip
            </button>
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {userTrips.map((trip) => (
              <div
                key={trip.id}
                className="relative bg-white bg-opacity-90 rounded-xl shadow-md p-4 min-h-[200px] transition-transform duration-300 transform hover:scale-[1.03]"
              >
                <button
                  className="absolute top-2 bg-white rounded-full border-[1px] right-2 text-gray-700 hover:text-red-500 text-lg font-bold p-1"
                  onClick={() => deleteTripFromFirestore(trip.id)}
                  title="Delete this trip permanently"
                >
                  <X className="w-5 h-5" />
                </button>
                <TripCards trip={trip} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripHistory;
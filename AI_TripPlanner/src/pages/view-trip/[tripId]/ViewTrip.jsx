import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import InfoSection from '@/components/InfoSection';
import Header from '@/components/Header';
import { Hotel } from 'lucide-react';
import HotelDesc from '@/components/HotelDesc';
import PlaceToVisit from '@/components/PlaceToVisit';

const ViewTrip = () => {
  const { docId } = useParams();
  const [tripData, setTripData] = useState(null); // State to store fetched raw trip data from Firestore
  const [aiTripDetails, setAiTripDetails] = useState(null); // State to store parsed AI-generated trip details
  const [loading, setLoading] = useState(true);   // Loading state
  const [error, setError] = useState('');         // Error message state
  const [currentUser, setCurrentUser] = useState(null); // State to hold Firebase authenticated user
  const [isAuthReady, setIsAuthReady] = useState(false); // State to track if auth is ready

  const auth = getAuth(); // Get auth instance

  // Effect to listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true); // Auth state has been checked
      if (user) {
        console.log("ViewTrip: User is logged in:", user.email); // Minimized log
      } else {
        console.log("ViewTrip: User is logged out."); // Minimized log
      }
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [auth]);

  // Effect to fetch trip data once docId is available and auth is ready
  useEffect(() => {
    if (docId && isAuthReady) {
      if (currentUser) {
        GetTripData();
      } else {
        setError("You must be logged in to view this trip.");
        setLoading(false);
        // console.log("ViewTrip: User not authenticated, cannot fetch trip data."); // Removed verbose log
      }
    } else if (isAuthReady && !docId) {
      setError("No trip ID provided.");
      setLoading(false);
    }
  }, [docId, isAuthReady, currentUser]); // Depend on docId, auth readiness, and currentUser

  const GetTripData = async () => {
    setLoading(true);
    setError(''); // Clear previous errors

    if (!currentUser || !currentUser.email) {
      setError("Authentication error: User email not available. Please re-login.");
      setLoading(false);
      console.error("ViewTrip: Attempted to fetch data without a valid authenticated user email.");
      return;
    }

    const docRef = doc(db, 'AITrips', docId);

    // console.log("ViewTrip: Attempting to fetch document:", docId); // Removed verbose log
    // console.log("ViewTrip: Authenticated user email:", currentUser.email); // Removed verbose log

    try {
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("ViewTrip: Full Document Data:", data); // Keep this log for the full document

        // Client-side check to match the security rule's logic
        if (data.userEmail === currentUser.email) {
          setTripData(data); // Store the raw Firestore document data (for internal state)

          // Attempt to parse the AI-generated trip data (which should be a JSON string)
          if (typeof data.tripData === 'string') {
            let jsonString = data.tripData;
            // Remove Markdown code block delimiters if present
            if (jsonString.startsWith('```json\n') && jsonString.endsWith('\n```')) {
              jsonString = jsonString.substring('```json\n'.length, jsonString.length - '\n```'.length);
            } else if (jsonString.startsWith('```\n') && jsonString.endsWith('\n```')) { // Handle generic code block
              jsonString = jsonString.substring('```\n'.length, jsonString.length - '\n```'.length);
            }

            try {
              const parsedAiData = JSON.parse(jsonString); // Parse the cleaned string
              setAiTripDetails(parsedAiData); // Store parsed AI data (for internal state)
              console.log("ViewTrip: Parsed AI Trip Data:", parsedAiData); // Keep this log for parsed AI data
            } catch (parseError) {
              console.error("ViewTrip: Error parsing AI trip data JSON. Data saved as string. Error:", parseError);
              setAiTripDetails(data.tripData); // Store original string if parsing fails
            }
          } else {
            setAiTripDetails(data.tripData); // If it's already an object, just use it
            console.log("ViewTrip: AI Trip Data (already object):", data.tripData); // Minimized log for already object
          }
          setError(''); // Clear error if successful
        } else {
          setError("You do not have permission to view this trip. It belongs to another user.");
          console.warn("ViewTrip: Permission denied due to email mismatch."); // Minimized warning
        }
      } else {
        console.log("ViewTrip: No such document exists for docId:", docId); // Keep this log
        setError("Trip not found or you don't have access.");
      }
    } catch (err) {
      console.error("ViewTrip: Error fetching document:", err); // Keep comprehensive error logging
      if (err.code === "permission-denied") {
        setError("Permission denied. Ensure you are logged in with the correct account and have access to this trip.");
      } else {
        setError(`Failed to load trip data: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // The component's UI is now minimal, only showing the docId
  return <div>
        <Header/>
        <InfoSection tripData ={tripData}/>
        <HotelDesc trip = {tripData}/>
        <PlaceToVisit tripData = {tripData}/>
  </div>;
};

export default ViewTrip;

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
  const [tripData, setTripData] = useState(null); 
  const [aiTripDetails, setAiTripDetails] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');         
  const [currentUser, setCurrentUser] = useState(null); 
  const [isAuthReady, setIsAuthReady] = useState(false); 

  const auth = getAuth(); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true); 
      if (user) {
        console.log("ViewTrip: User is logged in:", user.email); 
      } else {
        console.log("ViewTrip: User is logged out."); 
      }
    });
    return () => unsubscribe(); 
  }, [auth]);

  
  useEffect(() => {
    if (docId && isAuthReady) {
      if (currentUser) {
        GetTripData();
      } else {
        setError("You must be logged in to view this trip.");
        setLoading(false);
      }
    } else if (isAuthReady && !docId) {
      setError("No trip ID provided.");
      setLoading(false);
    }
  }, [docId, isAuthReady, currentUser]); 

  const GetTripData = async () => {
    setLoading(true);
    setError(''); 

    if (!currentUser || !currentUser.email) {
      setError("Authentication error: User email not available. Please re-login.");
      setLoading(false);
      console.error("ViewTrip: Attempted to fetch data without a valid authenticated user email.");
      return;
    }

    const docRef = doc(db, 'AITrips', docId);


    try {
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("ViewTrip: Full Document Data:", data); 

     
        if (data.userEmail === currentUser.email) {
          setTripData(data); 

          if (typeof data.tripData === 'string') {
            let jsonString = data.tripData;
            if (jsonString.startsWith('```json\n') && jsonString.endsWith('\n```')) {
              jsonString = jsonString.substring('```json\n'.length, jsonString.length - '\n```'.length);
            } else if (jsonString.startsWith('```\n') && jsonString.endsWith('\n```')) { 
              jsonString = jsonString.substring('```\n'.length, jsonString.length - '\n```'.length);
            }

            try {
              const parsedAiData = JSON.parse(jsonString); 
              setAiTripDetails(parsedAiData); 
              console.log("ViewTrip: Parsed AI Trip Data:", parsedAiData); 
            } catch (parseError) {
              console.error("ViewTrip: Error parsing AI trip data JSON. Data saved as string. Error:", parseError);
              setAiTripDetails(data.tripData); 
            }
          } else {
            setAiTripDetails(data.tripData); 
            console.log("ViewTrip: AI Trip Data (already object):", data.tripData); 
          }
          setError(''); 
        } else {
          setError("You do not have permission to view this trip. It belongs to another user.");
          console.warn("ViewTrip: Permission denied due to email mismatch."); 
        }
      } else {
        console.log("ViewTrip: No such document exists for docId:", docId); 
        setError("Trip not found or you don't have access.");
      }
    } catch (err) {
      console.error("ViewTrip: Error fetching document:", err);
      if (err.code === "permission-denied") {
        setError("Permission denied. Ensure you are logged in with the correct account and have access to this trip.");
      } else {
        setError(`Failed to load trip data: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return <div>
        <Header/>
        <InfoSection tripData ={tripData}/>
        <HotelDesc trip = {tripData}/>
        <PlaceToVisit tripData = {tripData}/>
  </div>;
};

export default ViewTrip;

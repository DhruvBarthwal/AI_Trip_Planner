import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config'; // Ensure this is correctly imported
import TripCards from './TripCards';

const TripHistory = () => {
  const navigate = useNavigate();
  const [userTrips, setUserTrips] = useState([]);

  useEffect(() => {
    GetUserTrip();
  }, []);

  const GetUserTrip = async () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
      navigate('/'); // redirect to home if not logged in
      return;
    }
    setUserTrips([]);
    try {
      const q = query(collection(db, 'AITrips'), where('userEmail', '==', user?.email));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
        setUserTrips(prevVal=>[...prevVal,doc.data()])
      });
    } catch (error) {
      console.error("Error fetching user's trips:", error);
    }
  };

  return (
    <div className='px-56 mt-[30px]'>
        <h1 className='font-bold text-2xl'>My Trips</h1>
        <div className='grid grid-cols-2 md:grid-cols-3 mt-[10px] gap-5'>
            {userTrips.map((trip,item)=>(
                <TripCards trip ={trip}/> 
            ))}
        </div>
    </div>
  );
};

export default TripHistory;

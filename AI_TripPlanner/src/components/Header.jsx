import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const Header = () => {
  const [currentUser, setCurrentUser] = useState(null); // State to hold the authenticated user
  const navigate = useNavigate(); // Initialize navigate hook
  const auth = getAuth(); // Get the Firebase Auth instance

  useEffect(() => {
    // Set up an observer to listen for changes in the user's sign-in state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setCurrentUser(user);
        console.log("Header: User is logged in:", user.email);
      } else {
        // User is signed out
        setCurrentUser(null);
        console.log("Header: User is logged out.");
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, [auth]); // Re-run effect if auth instance changes (though it typically won't)

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully.");
      localStorage.removeItem('user'); // Clear user data from local storage
      navigate('/'); // Redirect to home page after sign out
    } catch (error) {
      console.error("Error signing out:", error);
      // Optionally, show an error message to the user
    }
  };

  const handleMyTrips = () => {
    navigate('/my-trips'); // Navigate to the My Trips page
  };
  const handleCreateTrip = () => {
    navigate('/createTrip')
  }

  return (
    <div className='flex justify-between p-4 px-[20px] items-center absolute top-0 left-0 w-full z-20'>
 {/* Added items-center for vertical alignment */}
      <div>
        <h1 className='font-bold text-[35px] text-white cursor-pointer' onClick={() => navigate('/')}>Tripify</h1> {/* Make logo clickable to go home */}
      </div>
      <div>
        {currentUser ? (
          // If user is logged in, show My Trips and Sign Out buttons
          <div className="flex gap-4"> {/* Use flex and gap for spacing */}
            <button
              onClick={handleCreateTrip}
              className='
                 text-blue-300 font-semibold border-[1px]
                py-2 px-5 rounded-full shadow-md
                hover:bg-blue-50  hover:shadow-lg hover:scale-105
                transition-all duration-300 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              '
            >
              + Create Trip
            </button>
            <button
              onClick={handleMyTrips}
              className='
                 text-blue-300 font-semibold border-[1px]
                py-2 px-5 rounded-full shadow-md
                hover:bg-blue-50 hover:shadow-lg hover:scale-105
                transition-all duration-300 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              '
            >
              My Trips
            </button>
            <button
              onClick={handleSignOut}
              className='
                text-red-300 font-semibold border-[1px]
                py-2 px-5 rounded-full shadow-md
                hover:bg-red-50 hover:shadow-lg hover:scale-105
                transition-all duration-300 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
              '
            >
              Sign Out
            </button>
          </div>
        ) : (
          // If user is logged out, show Sign In button
          <button
            onClick={() => navigate('/sign-in')} // Assuming you have a sign-in route
            className='
              bg-white text-gray-700 font-semibold border-[1px]
              py-2 px-5 rounded-full shadow-md
              hover:bg-gray-100 hover:shadow-lg hover:scale-105
              transition-all duration-300 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50
            '
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;

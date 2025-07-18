import React from 'react';
import Header from '../components/Header';
import CreateTripHero from '../components/CreateTripHero';

const CreateTrip = () => {
  return (
    <div className="relative min-h-screen">
      {/* Background image - lowest layer */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url('/neom-p4q-Ra__g8M-unsplash.jpg')`,
        }}
      />

      {/* Dim overlay - placed above the background image, but still behind the main content */}
      <div className="absolute inset-0 bg-black opacity-40 z-10" />

      {/* Content - placed on top of both the background and the overlay */}
      <div className="relative z-20"> {/* Increased z-index to ensure it's above the overlay */}
        <Header />
        <CreateTripHero />
      </div>
    </div>
  );
};

export default CreateTrip;

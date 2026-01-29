import React from 'react';
import Header from '../components/Header';
import CreateTripHero from '../components/CreateTripHero';

const CreateTrip = () => {
  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url('/neom-p4q-Ra__g8M-unsplash.jpg')`,
        }}
      />

      <div className="absolute inset-0 bg-black opacity-40 z-10" />

      <div className="relative z-20"> 
        <Header />
        <CreateTripHero />
      </div>
    </div>
  );
};

export default CreateTrip;

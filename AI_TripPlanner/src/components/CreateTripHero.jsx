import React from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { useState, useEffect } from "react";
import { SelectBudget, SelectTravelList } from "../constants/constant";

const CreateTripHero = () => {
  // All const values

  const [place, setPlace] = useState();
  const [formData, setFormData] = useState([]);

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
    console.log(formData);
  }, [formData]);

  const OnGenerateTrip = () =>{
    if(formData?.noOfdays >= 5 && !formData?.location || !formData?.budget || !formData?.traveller){
      return;
    }
    console.log(formData);
  }

  return (
    <div className="ml-70 mt-[40px]">
      <div>
        <h1 className="font-bold  text-[28px]">
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
            placeholder: "Seach your destination",
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
          onChange={(e) => handleInput("no. of days", e.target.value)}
        />
      </div>
      <div className="mt-[45px]">
        <h1 className="font-bold text-[18px]">What is your budget?</h1>
        <div className="grid grid-cols-3 gap-5 mt-5 mr-50">
          {SelectBudget.map((item, index) => (
            <div
              key={index}
              className={`p-4 border-zinc-400 border cursor-pointer flex flex-col gap-[10px] rounded-2xl hover:shadow-lg ${formData?.budget == item.title && 'shadow-lg border-zinc-950 scale-105'}`}
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
          What do you pan on travelling with your next adventure?
        </h1>
        <div className="grid grid-cols-3 gap-5 mt-5 mr-50">
          {SelectTravelList.map((item, index) => (
            <div
              key={index}
              className={`p-4 border-zinc-400 border cursor-pointer flex flex-col gap-[5px] rounded-2xl hover:shadow-lg ${formData?.traveller == item.people && 'shadow-lg border-zinc-950 scale-105'}`}
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
        <button 
          onClick={()=>OnGenerateTrip}
          className="border bg-zinc-800 rounded-[5px] text-white h-[38px] w-[140px] cursor-pointer hover:bg-zinc-700"
        >
          Generate Trip
        </button>
      </div>
    </div>
  );
};

export default CreateTripHero;

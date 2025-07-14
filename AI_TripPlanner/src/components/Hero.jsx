import React from 'react'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <div className='flex flex-col 
                    justify-center items-center
                    mt-[60px] text-center'>
        <div className='text-[50px]'>
          <h1 className='text-orange-500 font-bold'>Discover Your Next Adventure with AI: </h1>
          <h1 className='font-bold'>Personalized Itineraries at Your Fingertips</h1>
        </div>
        <div className='mt-[20px] text-[14px]'>
          <h1>Your personal trip planner and travel curator, creating custom itineraries tailored to your interests and budget.</h1>
        </div>
        <div className='mt-[25px]'>
          <Link to ="/createTrip">
            <button className='h-[35px] w-[180px] bg-zinc-800  text-white rounded-[5px] hover:bg-zinc-700'>Get Started. Its's free</button>
          </Link>
        </div>
    </div>
  )
}

export default Hero
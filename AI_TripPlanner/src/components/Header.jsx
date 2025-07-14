import React from 'react'

const Header = () => {
  return (
    <div className='flex justify-between p-4 px-[20px]'>
        <div>
            <h1 className='font-bold text-[25px] text-orange-600'>Logoipsum</h1>
        </div>
        <div>
            <button className='bg-zinc-800 text-white h-[38px] w-[80px] rounded-[14px]'>Sign In</button>
        </div>
    </div>
  )
}

export default Header
import React from 'react'
import { LiaToggleOffSolid } from "react-icons/lia";

const EndDevice = ({ handleCloseForm }) => {
  return (
    <div className='w-[400px] h-[500px] overflow-y-auto' style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#193258 #081830',
    }}>

      {/* heading & cancel icon */}
      <div className='flex items-center justify-between mx-4 my-3'>
        <h1>End Device Settings</h1>
        <div onClick={handleCloseForm} className='cursor-pointer'>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.30469 1.1123L10.8497 10.719" stroke="white" stroke-linecap="round" />
            <path d="M10.191 0.973389L1 10.9183" stroke="white" stroke-linecap="round" />
          </svg>
        </div>
      </div>
      <hr className='w-full border border-t-[#9fef04]' />

      {/* device settings & configuration */}
      <div className='flex'>
        <button className={`bg-[#193258] w-full p-2 m-3`}>Device Settings</button>
        <button className={`w-full p-2 m-3`}>Configuration</button>
      </div>

      {/* input fields */}
      <div className='flex flex-col items-center justify-evenly px-3'>
        <input type="text" placeholder='Name' className='w-full my-1.5 p-2 rounded-sm border-none outline-none bg-[#193258]' />
        <input type="text" placeholder='Description' className='w-full my-1.5 p-2 rounded-sm border-none outline-none bg-[#193258]' />
        {/* file */}
        <input type="file" className='w-full custom-file-input m-2' />
        <p className=''>File information</p>
        <select className='w-full my-1.5 p-2 rounded-sm border-none outline-none bg-[#193258] text-[#9ca3af] input'>
          <option value="" key="">Select OS</option>
          <option value="" key="">Linux</option>
          <option value="" key="">Windows</option>
        </select>
        <input type="text" placeholder='Username' className='w-full my-1.5 p-2 rounded-sm border-none outline-none bg-[#193258]' />
        <input type="text" placeholder='Password' className='w-full mt-1.5 mb-3 p-2 rounded-sm border-none outline-none bg-[#193258]' />
        <select className='w-full my-1.5 p-2 rounded-sm border-none outline-none bg-[#193258] text-[#9ca3af]'>
          <option value="" key="">Select Flavour</option>
          <option value="" key="">Vanilla</option>
          <option value="" key="">Chocolate</option>
        </select>
      </div>

      {/* DHCP & Static */}
      <div className='flex my-2'>
        <span className='ms-3 me-2'>DHCP</span>
        <LiaToggleOffSolid size={30} className='cursor-pointer' />
        <span className='ms-2'>Static</span>
      </div>

      <button className='bg-[#9fef07] text-black py-1 px-6 rounded-sm mt-2 mx-3 mb-6'>Save</button>

    </div>
  )
}

export default EndDevice
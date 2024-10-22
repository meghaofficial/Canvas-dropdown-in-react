import React, { useEffect, useState } from 'react'
import { IoToggle } from "react-icons/io5";
import { LiaToggleOffSolid } from "react-icons/lia";
import { IoIosArrowForward } from "react-icons/io";
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
// import dottedBg from '../images/dotted bg 1.png';

import network from '../images/network(g).png';
import server from '../images/server(g).png';
import workstation from '../images/workstation(g).png';
import router from '../images/router(g).png';
import laptop from '../images/laptop(g).png';
import mobile from '../images/mobile(g).png';

import Networkwithpadding from '../images/Networkwithpadding.png';
import Serverwithpadding from '../images/Serverwithpadding.png';
import Workstationwithpadding from '../images/Workstationwithpadding.png';
import Routerwithpadding from '../images/Serverwithpadding_.png';
import Laptopwithpadding from '../images/Laptopwithpadding.png';
import Mobilewithpadding from '../images/Mobilewithpadding.png';

import dottedBg from '../images/dotted bg 1.png';

import cancel from '../images/icons8-cancel-20.png';
import edit from '../images/icons8-edit-32.png';
import dot from '../images/icons8-dot-15.png';

const FabricUI = () => {

    const { editor, onReady } = useFabricJSEditor();
    const [toggleOn, setToggleOn] = useState(false);

    useEffect(() => {
        if (editor?.canvas) {
            editor.canvas.setBackgroundImage(
                dottedBg,
                editor.canvas.renderAll.bind(editor.canvas),
                {
                    scaleX: editor.canvas.width / 1000,
                    scaleY: editor.canvas.height / 400,
                }
            );
        }
    }, [editor]);

    const HideControls = {
        'tl': false,
        'tr': true,
        'bl': false,
        'br': false,
        'ml': false,
        'mt': false,
        'mr': false,
        'mb': false,
        'mtr': false
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const imgSrc = e.dataTransfer.getData('imgSrc');

        fabric.Image.fromURL(imgSrc, (img) => {
            img.set({
                name: "laptop",
                left: e.clientX - 50,
                top: e.clientY - 180,
                scaleX: 1,
                scaleY: 1,
                padding: 5,
                cornerSize: 20,
                cornerColor: 'transparent',
                hasControls: true,
                selectable: true,
            });
            fabric.Image.fromURL(cancel, (c_img) => {
                c_img.set({
                    left: 100,
                    top: 100,
                    scaleX: 1,
                    scaleY: 1
                });
            });
            editor?.canvas.add(img); 
            img.setControlsVisibility(HideControls);
        });

        fabric.Object.prototype.drawControls = function (ctx, styleOverride) {
            var controls = ['tr'];
            const cornerSize = this.cornerSize;
            const padding = 5;

            controls.forEach((control) => {
                if (this.isControlVisible(control)) {
                    var size = this.cornerSize;
                    var left = this.oCoords[control].x - size / 2 - 2;
                    var top = this.oCoords[control].y - size / 2 - 4;
                    var SelectedIconImage = new Image();
                    SelectedIconImage.src = cancel;

                    switch (control) {
                        case 'tl':
                            SelectedIconImage.src = null;
                            break;
                        case 'tr':
                            SelectedIconImage.src = cancel;
                            break;
                        case 'bl':
                            SelectedIconImage.src = dot;
                            break;
                        case 'br':
                            SelectedIconImage.src = edit;
                            break;
                    }

                    SelectedIconImage.onload = function () {
                        // ctx.clearRect(left, top, cornerSize, cornerSize);
                        // ctx.drawImage(SelectedIconImage, left, top, size, size);
                        // ctx.clearRect(left + padding, top + padding, cornerSize, cornerSize);
                        ctx.drawImage(SelectedIconImage, left + padding, top + padding, cornerSize, cornerSize);
                    };
                }
            });
        };

        editor?.canvas.renderAll();
    }

    return (
        // Container
        <div>

            {/* Upper 3 options */}
            <div className='text-white flex justify-between p-2 items-center'>
                <div className='flex items-center justify-center bg-[#14243e] relative w-[30%] h-[40px] py-6'
                    style={{
                        borderLeft: '1.8px solid #404d62',
                        borderTop: '1.8px solid #404d62',
                        borderBottom: '1.8px solid #404d62',
                        borderTopLeftRadius: '5px',
                        borderBottomLeftRadius: '5px'
                    }}>
                    <p>Setup</p>
                </div>
                {/* <div className='h-[42px] w-[42px] bg-[#14243e]' id='rotate_div' 
                style={{
                    borderRight: '1.8px solid #404d62',
                    borderTop: '1.8px solid #404d62'
                }}></div> */}

                <div className='flex items-center justify-center bg-[#14243e] w-[30%] h-[40px] mt-2 py-6'>
                    <p>Configure</p>
                </div>
                <div className='flex items-center justify-center bg-[#14243e] w-[30%] h-[40px] mt-2 py-6'>
                    <p>Review & Submit</p>
                </div>
            </div>

            {/* Main interface */}
            <div className='border-2 border-[#374356] m-2 rounded text-white py-2 h-[97vh]'>

                {/* upper icons */}
                <div className='flex justify-between'>

                    {/* topology overview */}
                    <div className='w-[20%] border-2 border-[#374356] bg-[#14243e] flex justify-center items-center rounded my-4 mx-2'>
                        <span className='bg-[#14243e] p-1 m-1'>Topology</span>
                        {toggleOn && <IoToggle size={30} className='cursor-pointer bg-[#14243e] m-1' onClick={() => setToggleOn(false)} />}
                        {!toggleOn && <LiaToggleOffSolid size={30} className='cursor-pointer bg-[#14243e] m-1' onClick={() => setToggleOn(true)} />}
                        <span className='bg-[#14243e] p-1 m-1'>Overview</span>
                    </div>

                    {/* icons to display */}
                    <div className='w-[60%] flex justify-between items-center border-2 border-[#37527e] bg-[#14243e] rounded py-4 px-6'>

                        {/* Network */}
                        <div className='flex flex-col justify-center items-center cursor-pointer' onClick={() => console.log("clicked")}>
                            <img src={network} alt="network" onDragStart={(e) => e.dataTransfer.setData('imgSrc', Networkwithpadding)} />
                            <p className='noselect'>Network</p>
                        </div>

                        <div className='border-2 border-[#37527e] h-10 rounded'></div>

                        {/* Server */}
                        <div className='flex flex-col justify-center items-center cursor-pointer'>
                            <img src={server} alt="server" onDragStart={(e) => e.dataTransfer.setData('imgSrc', Serverwithpadding)} />
                            <p className='noselect'>Server</p>
                        </div>

                        <div className='border-2 border-[#37527e] h-10 rounded'></div>

                        {/* Workstation */}
                        <div className='flex flex-col justify-center items-center cursor-pointer'>
                            <img src={workstation} alt="workstation" onDragStart={(e) => e.dataTransfer.setData('imgSrc', Workstationwithpadding)} />
                            <p className='noselect'>Workstation</p>
                        </div>

                        <div className='border-2 border-[#37527e] h-10 rounded'></div>

                        {/* Router */}
                        <div className='flex flex-col justify-center items-center cursor-pointer'>
                            <img src={router} alt="router" onDragStart={(e) => e.dataTransfer.setData('imgSrc', Routerwithpadding)} />
                            <p className='noselect'>Router</p>
                        </div>

                        <div className='border-2 border-[#37527e] h-10 rounded'></div>

                        {/* Laptop */}
                        <div className='flex flex-col justify-center items-center cursor-pointer'>
                            <img src={laptop} alt="laptop" onDragStart={(e) => e.dataTransfer.setData('imgSrc', Laptopwithpadding)} />
                            <p className='noselect'>Laptop</p>
                        </div>

                        <div className='border-2 border-[#37527e] h-10 rounded'></div>

                        {/* Mobile */}
                        <div className='flex flex-col justify-center items-center cursor-pointer'>
                            <img src={mobile} alt="mobile" onDragStart={(e) => e.dataTransfer.setData('imgSrc', Mobilewithpadding)} />
                            <p className='noselect'>Mobile</p>
                        </div>
                    </div>

                    {/* validate and next buttons */}
                    <div className='w-[20%] flex justify-evenly items-center m-2'>
                        <button className='bg-[#9fef04] text-black px-6 py-3'>Validate</button>
                        <button className='bg-[#193258] flex items-center rounded py-2 px-4'>Next <IoIosArrowForward className='bg-[#193258]' /> </button>
                    </div>

                </div>

                {/* lower canvas */}
                <div
                    className="h-[85%] p-2"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <FabricJSCanvas
                        onReady={onReady}
                        className={`sample-canvas border border-gray-700 h-[100%] w-[100%]`}
                    />
                </div>

            </div>

        </div>
    )
}

export default FabricUI
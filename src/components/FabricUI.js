import React, { useEffect, useState } from 'react'
import { IoToggle } from "react-icons/io5";
import { LiaToggleOffSolid } from "react-icons/lia";
import { IoIosArrowForward } from "react-icons/io";
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';

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

import setupinactive from '../images/Setup_inactive state 1.png';
import configureinactive from '../images/Configure_inactive state 1.png';
import reviewsubmitinactive from '../images/Review&Submit_inactive state 1.png';

import Network from './Network.js';
import Router from './Router.js';
import EndDevice from './EndDevice.js';

var deleteIcon =
    "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

const STATE_IDLE = 'idle';
const STATE_PANNING = 'panning';
let canvasID = 0;
let objID = 0;
let connectorID = 0;
let startObj = null, endObj = null;
let connectorsSet = [];

const FabricUI = () => {
    const { editor, onReady } = useFabricJSEditor();
    const canvas = editor?.canvas;
    const [toggleOn, setToggleOn] = useState(false);
    const [activeObjState, setActiveObjState] = useState(null);
    const [enablePanning, setEnablePanning] = useState(false);
    // const [enableConnector, setEnableConnector] = useState(false);
    const [connectors, setConnectors] = useState([]);
    // const [startObjState, setStartObjState] = useState(null);
    // const [endObjState, setEndObjState] = useState(null)
    const [openForm, setOpenForm] = useState(false);
    const [activeFormDetails, setActiveFormDetails] = useState({
        coords: { x: 0, y: 0 }, component: null
    });

    var img1 = document.createElement("img");
    img1.src = deleteIcon;

    function renderIcon(ctx, left, top, fabricObject) {
        var size = this.cornerSize;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(img1, -size / 2, -size / 2, size, size);
        ctx.restore();
    }

    const handleCloseForm = () => setOpenForm(false);

    // Background & Mousewheel zoom-in zoom-out
    useEffect(() => {
        if (canvas) {
            canvas.setBackgroundImage(
                dottedBg,
                canvas.renderAll.bind(canvas),
                {
                    scaleX: canvas.width / 1000,
                    scaleY: canvas.height / 400,
                }
            );

            canvas.on('mouse:wheel', function (opt) {
                if (opt.e.ctrlKey) {
                    var delta = opt.e.deltaY;
                    var zoom = canvas.getZoom();
                    zoom *= 0.999 ** delta;
                    if (zoom > 20) zoom = 20;
                    if (zoom < 0.01) zoom = 0.01;
                    canvas.setZoom(zoom);
                    opt.e.preventDefault();
                    opt.e.stopPropagation();
                }
            })

            canvas.renderAll();

        }
    }, [editor]);

    // Panning
    useEffect(() => {
        let lastClientX;
        let lastClientY;

        fabric.Canvas.prototype.panState = STATE_IDLE;

        fabric.Canvas.prototype.panMouseMoveHandler = function (e) {
            if (this.panState === STATE_PANNING && e && e.e) {
                let deltaX = 0;
                let deltaY = 0;

                if (lastClientX) {
                    deltaX = e.e.clientX - lastClientX;
                }
                if (lastClientY) {
                    deltaY = e.e.clientY - lastClientY;
                }

                lastClientX = e.e.clientX;
                lastClientY = e.e.clientY;

                let delta = new fabric.Point(deltaX, deltaY);
                this.relativePan(delta);
            }
        };

        fabric.Canvas.prototype.panMouseUpHandler = function (e) {
            this.panState = STATE_IDLE;
        };

        fabric.Canvas.prototype.panMouseDownHandler = function (e) {
            this.panState = STATE_PANNING;
            lastClientX = e.e.clientX;
            lastClientY = e.e.clientY;
        };

        fabric.Canvas.prototype.toggleDragMode = function (dragMode) {
            if (dragMode) {
                this.discardActiveObject();
                this.defaultCursor = 'move';
                this.forEachObject(function (object) {
                    object.prevEvented = object.evented;
                    object.prevSelectable = object.selectable;
                    object.evented = false;
                    object.selectable = false;
                });
                this.selection = false;
                this.on('mouse:up', this.panMouseUpHandler);
                this.on('mouse:down', this.panMouseDownHandler);
                this.on('mouse:move', this.panMouseMoveHandler);
            } else {
                this.forEachObject(function (object) {
                    object.evented = object.prevEvented !== undefined ? object.prevEvented : object.evented;
                    object.selectable = object.prevSelectable !== undefined ? object.prevSelectable : object.selectable;
                });
                this.defaultCursor = 'default';
                this.off('mouse:up', this.panMouseUpHandler);
                this.off('mouse:down', this.panMouseDownHandler);
                this.off('mouse:move', this.panMouseMoveHandler);
                this.selection = true;
            }
        };

        canvas?.on('mouse:dblclick', () => {
            setEnablePanning((prevState) => {
                canvas.toggleDragMode(!prevState);
                return !prevState;
            });
        });

        return () => {
            canvas?.off('mouse:dblclick');
        };
    }, [canvas]);

    const HideControls = {
        'tl': false,
        'tr': false,
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
        if (canvas._objects.length === 0) {
            canvasID++;
        }
        objID++;
        let imgName = '';
        let activeObj = null;
        switch (imgSrc) {
            case Networkwithpadding:
                imgName = "Network";
                break;
            case Serverwithpadding:
                imgName = "Server";
                break;
            case Workstationwithpadding:
                imgName = "Workstation";
                break;
            case Routerwithpadding:
                imgName = "Router";
                break;
            case Laptopwithpadding:
                imgName = "Laptop";
                break;
            case Mobilewithpadding:
                imgName = "Mobile";
                break;
            default:
                imgName = "No image";
        }

        fabric.Image.fromURL(imgSrc, (img) => {
            img.set({
                canvasID: `Scenario-${canvasID}`,
                objID: `${imgName}-${objID}`,
                name: imgName,
                left: e.clientX - 50,
                top: e.clientY - 180,
                scaleX: 1.5,
                scaleY: 1.5,
                padding: 5,
                cornerSize: 20,
                cornerColor: 'transparent',
                borderColor: 'transparent',
                hasControls: true,
                selectable: true,
            });

            canvas.add(img);
            img.setControlsVisibility(HideControls);
            canvas.setActiveObject(img);
            setActiveObjState(img);

            // text
            const text = new fabric.Text(imgName, {
                left: (img.aCoords.bl.x + img.aCoords.br.x) / 2,
                top: img.top + img.height * img.scaleY + 10,
                fill: 'white',
                fontSize: 16,
                fontFamily: 'Quicksand',
                selectable: false,
                hasControls: false
            });
            canvas.add(text);
            const textWidth = text.getBoundingRect().width;
            text.set({
                left: text.left - textWidth / 2
            });

            img.on('moving', () => {
                text.left = img.left + (img.width * img.scaleX) / 2 - textWidth / 2;
                text.top = img.top + img.height * img.scaleY + 10;
                text.setCoords();
                canvas.renderAll();
            });

            // when clicked outside it should remove the active states 
            canvas.on('mouse:down', (e) => {
                const clickedObject = e.target;
                if (!clickedObject) {
                    img.set({
                        stroke: 'transparent',
                        strokeWidth: 0
                    });
                }
            });


            img.on('mousedown', (e) => {
                // removing stroke color from previous all img objects
                canvas.getObjects().forEach((obj) => {
                    if (obj.type === 'image') {
                        obj.set({
                            stroke: 'transparent',
                            strokeWidth: 0
                        });
                    }
                });
                // adding stroke to active object
                if (e.target && e.target.type === 'image') {
                    e.target.set({
                        stroke: 'red',
                        strokeWidth: 1
                    });
                    activeObj = e.target;
                    if (!startObj) {
                        startObj = activeObj;
                    }
                    else if (!endObj) {
                        endObj = activeObj;
                        connectorID++;
                    }
                }
                canvas.renderAll();
            });









            // FORM CODE
            // img.on('mousedown', (e) => {
            //     setOpenForm(true);
            //     setActiveFormDetails((prevDetails) => {
            //         // const coords = { x: e.pointer.x + 120, y: e.pointer.y + 300 }; 
            //         const coords = { x: e.target.aCoords.br.x + (e.target.width * e.target.scaleX), y: e.target.aCoords.br.y + 100 + (2* e.target.height * e.target.scaleY) }; 
            //         console.log(e)
            //         let component; 
            //         switch(img.name){
            //             case "Network":
            //                 component = <Network handleCloseForm={handleCloseForm} />;
            //                 break;
            //             case "Server":
            //                 component = <EndDevice />;
            //                 break;
            //             case "Workstation":
            //                 component = <EndDevice />;
            //                 break;
            //             case "Router":
            //                 component = <Router />;
            //                 break;
            //             case "Laptop":
            //                 component = <EndDevice />;
            //                 break;
            //             case "Mobile":
            //                 component = <EndDevice />;
            //                 break;
            //         }
            //         const obj = { coords, component }; 
            //         console.log('Form details:', obj);
            //         return { ...prevDetails, ...obj };
            //     });
            // });












            img.controls.deleteControl = new fabric.Control({
                x: 0.5,
                y: -0.5,
                offsetY: 0,
                cursorStyle: "pointer",
                mouseDownHandler: () => {
                    if (canvas) {
                        if (
                            canvas.getActiveObject() !== undefined &&
                            canvas.getActiveObject() !== null
                        ) {
                            const activeObject = canvas.getActiveObject();
                            canvas.remove(activeObject);
                            canvas.remove(text);
                            canvas.renderAll();
                        }
                    }
                },
                render: renderIcon,
                cornerSize: 24,
            });
            img.on('mouseover', (e) => {
                if (e.target) {
                    e.target.controls.deleteControl = new fabric.Control({
                        x: 0.5,
                        y: -0.5,
                        offsetY: 0,
                        cursorStyle: "pointer",
                        mouseDownHandler: () => {
                            if (canvas) {
                                if (
                                    canvas.getActiveObject() !== undefined &&
                                    canvas.getActiveObject() !== null
                                ) {
                                    const activeObject = canvas.getActiveObject();
                                    canvas.remove(activeObject);
                                    canvas.remove(text);
                                    canvas.renderAll();
                                }
                            }
                        },
                        render: renderIcon,
                        cornerSize: 24,
                    });
                    canvas.renderAll();
                }
            });
            img.on('mouseout', (e) => {
                if (e.target) {
                    delete e.target.controls.deleteControl;
                    canvas.renderAll();
                }
            });
        });

        canvas.renderAll();
    }

    useEffect(() => {
        if (endObj) {
            // Calculate the connector line's positions
            const x1 = startObj.left + (startObj.width * startObj.scaleX) / 2;
            const y1 = startObj.top + (startObj.height * startObj.scaleY) / 2;
            const x2 = endObj.left + (endObj.width * endObj.scaleX) / 2;
            const y2 = endObj.top;
    
            // Create the line connector
            const lineConnector = new fabric.Line([x1, y1, x2, y2], {
                stroke: 'white',
                strokeWidth: 2,
                selectable: false,
                evented: false
            });
    
            lineConnector.bringToFront();
            canvas.add(lineConnector);
            canvas.renderAll();
    
            // Check for existing connections
            setConnectors((prevConn) => {
                const alreadyExists = prevConn.some(conn => conn.startObj === startObj && conn.endObj === endObj);
                if (!alreadyExists) {
                    const newConn = {
                        connector_id: connectorID,
                        startObj,
                        endObj,
                        lineConnector
                    };
                    return [...prevConn, newConn];
                }
                return prevConn;
            });
    
            // Reset start and end objects after a timeout
            setTimeout(() => {
                startObj = endObj = null;
            }, 0);
        }
    
        // Update connector position when the start object moves
        const updateStartObjPosition = () => {
            const conn = connectorsSet.find(conn => conn.startObj === startObj && conn.endObj === endObj);
            if (conn) {
                const x1 = startObj.left + (startObj.width * startObj.scaleX) / 2;
                const y1 = startObj.top + (startObj.height * startObj.scaleY) / 2;
                conn.lineConnector.set({ x1, y1 });
                conn.lineConnector.setCoords();
                canvas.renderAll();
            }
        };
    
        // Update connector position when the end object moves
        const updateEndObjPosition = () => {
            const conn = connectorsSet.find(conn => conn.startObj === startObj && conn.endObj === endObj);
            if (conn) {
                const x2 = endObj.left + (endObj.width * endObj.scaleX) / 2;
                const y2 = endObj.top;
                conn.lineConnector.set({ x2, y2 });
                conn.lineConnector.setCoords();
                canvas.renderAll();
            }
        };
    
        startObj?.on('moving', updateStartObjPosition);
        endObj?.on('moving', updateEndObjPosition);

        return () => {
            startObj?.off('moving', updateStartObjPosition);
            endObj?.off('moving', updateEndObjPosition);
        };
    }, [startObj?.name, endObj?.name]);
    
    // useEffect(() => {
    //     if (endObj) {
    //         const x1 = startObj.left + (startObj.width * startObj.scaleX) / 2;
    //         const y1 = startObj.top + (startObj.height * startObj.scaleY) / 2;
    //         const x2 = endObj.left + (endObj.width * endObj.scaleX) / 2;
    //         const y2 = endObj.top;

    //         const lineConnector = new fabric.Line([x1, y1, x2, y2], {
    //             stroke: 'white',
    //             strokeWidth: 2,
    //             selectable: false,
    //             evented: false
    //         });
    //         lineConnector.bringToFront();
    //         canvas.add(lineConnector);
    //         canvas.renderAll();

    //         const alreadyExists = connectorsSet.some(conn => conn.startObj === startObj && conn.endObj === endObj);
    //         if (!alreadyExists) {
    //             const newConn = {
    //                 connector_id: connectorID,
    //                 startObj,
    //                 endObj,
    //                 lineConnector
    //             };
    //             connectorsSet = [...connectorsSet, newConn];
    //         }
    //         setConnectors((prevConn) => {
    //             const alreadyExists = prevConn.some(conn => conn.startObj === startObj && conn.endObj === endObj);
    //             if (!alreadyExists) {
    //                 const newConn = {
    //                     connector_id: connectorID,
    //                     startObj,
    //                     endObj,
    //                     lineConnector
    //                 };
    //                 return [...prevConn, newConn];
    //             }
    //             return prevConn;
    //         });

    //         setTimeout(() => {
    //             startObj = endObj = null;
    //         }, 0);
    //     }
    //     startObj?.on('moving', (e) => {
    //         connectorsSet[0].lineConnector.set({
    //             x1: startObj?.left,
    //             y1: startObj?.top
    //         });
    //         connectorsSet[0].lineConnector.setCoords();
    //         canvas.renderAll();
    //     });
    //     endObj?.on('moving', (e) => {
    //         connectorsSet[0].lineConnector.set({
    //             x2: endObj?.left,
    //             y2: endObj?.top
    //         });
    //         connectorsSet[0].lineConnector.setCoords();
    //         canvas.renderAll();
    //     });
    // }, [startObj?.name, endObj?.name]);

    useEffect(() => {
        // console.log(connectors);
    }, [connectors]);

    return (
        // Container
        <div>

            {/* Upper 3 options */}
            <div className='text-white flex justify-around p-2 items-center'>
                <div className='flex items-center justify-center relative w-[33%] h-[40px] py-6'>
                    <img src={setupinactive} alt="setupinactive" />
                </div>
                <div className='flex items-center justify-center w-[33%] h-[40px] mt-2 py-6'>
                    <img src={configureinactive} alt="configureinactive" />
                </div>
                <div className='flex items-center justify-center w-[33%] h-[40px] mt-2 py-6'>
                    <img src={reviewsubmitinactive} alt="reviewsubmitinactive" />
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
                            <img src={network} alt="network" onDragStart={(e) => e.dataTransfer.setData('imgSrc', Networkwithpadding)} width="30px" />
                            <p className='noselect text-xs'>Network</p>
                        </div>

                        <div className='border-2 border-[#37527e] h-10 rounded'></div>

                        {/* Server */}
                        <div className='flex flex-col justify-center items-center cursor-pointer'>
                            <img src={server} alt="server" onDragStart={(e) => e.dataTransfer.setData('imgSrc', Serverwithpadding)} width="30px" />
                            <p className='noselect text-xs'>Server</p>
                        </div>

                        <div className='border-2 border-[#37527e] h-10 rounded'></div>

                        {/* Workstation */}
                        <div className='flex flex-col justify-center items-center cursor-pointer'>
                            <img src={workstation} alt="workstation" onDragStart={(e) => e.dataTransfer.setData('imgSrc', Workstationwithpadding)} width="30px" />
                            <p className='noselect text-xs'>Workstation</p>
                        </div>

                        <div className='border-2 border-[#37527e] h-10 rounded'></div>

                        {/* Router */}
                        <div className='flex flex-col justify-center items-center cursor-pointer'>
                            <img src={router} alt="router" onDragStart={(e) => e.dataTransfer.setData('imgSrc', Routerwithpadding)} width="30px" />
                            <p className='noselect text-xs'>Router</p>
                        </div>

                        <div className='border-2 border-[#37527e] h-10 rounded'></div>

                        {/* Laptop */}
                        <div className='flex flex-col justify-center items-center cursor-pointer'>
                            <img src={laptop} alt="laptop" onDragStart={(e) => e.dataTransfer.setData('imgSrc', Laptopwithpadding)} width="30px" />
                            <p className='noselect text-xs'>Laptop</p>
                        </div>

                        <div className='border-2 border-[#37527e] h-10 rounded'></div>

                        {/* Mobile */}
                        <div className='flex flex-col justify-center items-center cursor-pointer'>
                            <img src={mobile} alt="mobile" onDragStart={(e) => e.dataTransfer.setData('imgSrc', Mobilewithpadding)} width="20px" />
                            <p className='noselect text-xs'>Mobile</p>
                        </div>
                    </div>

                    {/* validate and next buttons */}
                    <div className='w-[20%] flex justify-evenly items-center m-2'>
                        <button className='bg-[#9fef04] text-black px-6 py-3 rounded-sm'>Validate</button>
                        <button className='bg-[#193258] hover:bg-[#9fef04] hover:text-black flex items-center rounded-sm py-2 px-4'>Next <IoIosArrowForward className='bg-[#193258] hover:bg-[#9fef04] hover:text-black' /> </button>
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
                    {openForm && (
                        <div
                            className="absolute bg-[#081830] shadow-lg flex flex-col rounded"
                            style={{
                                left: `${activeFormDetails.coords.x}px`,
                                top: `${activeFormDetails.coords.y}px`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            {activeFormDetails.component}
                        </div>
                    )}
                </div>

            </div>

        </div>
    )
}


export default FabricUI
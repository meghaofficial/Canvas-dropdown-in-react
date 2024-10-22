import React, { useEffect, useState } from 'react'
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import laptop from '../images/laptop(g).png';
import network from '../images//network(g).png';
import workstation from '../images/workstation(g).png';
import cancel from '../images/icons8-cancel-20.png';
import dot from '../images/icons8-dot-15.png';
import { FaWindowClose } from "react-icons/fa";
import json from '../my.json';
import DesktopForm from './DesktopForm';
import WorkStationForm from './WorkStationForm';
import InternetForm from './InternetForm';

let objID = 0;

const FabricDropDown = () => {

    const { editor, onReady } = useFabricJSEditor();
    const [activeFormDetails, setActiveFormDetails] = useState(null);
    const [formOpen, setFormOpen] = useState(true);
    const [forms, setForms] = useState([]);
    const [activeFormName, setActiveFormName] = useState('');
    const [startObj, setStartObj] = useState(null);
    const [endObj, setEndObj] = useState(null);
    const [connectors, setConnectors] = useState([]);
    let sObj = null;
    let eObj = null;

    const setCornerCursor = () => {
        if (editor) {
            fabric.Canvas.prototype._setCornerCursor = function (corner, target) {
                if (corner === 'mtr' && target.hasRotatingPoint) {
                    this.setCursor(this.rotationCursor);
                } else if (corner === "tr" || corner === "bl") {
                    this.setCursor('');
                } else if (corner === "tl" || corner === "br") {
                    this.setCursor('pointer');
                } else {
                    this.setCursor(this.defaultCursor);
                    return false;
                }
            };
        }
    };

    let DIMICON = 30;
    const HideControls = {
        'tl': true,
        'tr': true,
        'bl': true,
        'br': true,
        'ml': false,
        'mt': false,
        'mr': false,
        'mb': false,
        'mtr': false
    };

    // Handle drop event
    const handleDrop = (e) => {
        e.preventDefault();

        objID++;
        const imgSrc = e.dataTransfer.getData('imgSrc');
        let imgName = "";
        switch (imgSrc) {
            case laptop:
                imgName = "Laptop";
                break;
            case network:
                imgName = "Network";
                break;
            case workstation:
                imgName = "Workstation";
                break;
        }

        fabric.Image.fromURL(imgSrc, (img) => {
            img.set({
                id: objID,
                name: imgName,
                left: e.clientX - 300,
                top: e.clientY - 100,
                scaleX: 0.5,
                scaleY: 0.5,
                hasControls: true,
                selectable: true,
            });
            editor?.canvas.add(img);
            img.setControlsVisibility(HideControls);
        });
        
        // editor?.canvas.on('mouse:down', function (e) {
        //     e.e.preventDefault();  
        //     // console.log(e.target.name);
        // });

        fabric.Object.prototype.drawControls = function (ctx, styleOverride) {
            var controls = ['tr', 'bl'];
            const cornerSize = this.cornerSize;

            controls.forEach((control) => {
                if (this.isControlVisible(control)) {
                    var size = this.cornerSize;
                    var left = this.oCoords[control].x - size / 2;
                    var top = this.oCoords[control].y - size / 2;
                    var SelectedIconImage = new Image();

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
                            SelectedIconImage.src = null;
                            break;
                    }

                    SelectedIconImage.onload = function () {
                        ctx.clearRect(left, top, cornerSize, cornerSize);
                        ctx.drawImage(SelectedIconImage, left, top, size, size);
                    };
                }
            });
        };

        setCornerCursor();

        fabric.Canvas.prototype._getActionFromCorner = function (alreadySelected, corner, e, target) {
            if (!corner) {
                return 'drag';
            }
            var action = 'drag';
            if (corner) {
                switch (corner) {
                    case 'br':
                        action = 'edit';
                        // handleOpenForm(e.clientX, e.clientY, target);
                        break;
                    case 'tr':
                        action = 'delete';
                        editor?.canvas.remove(editor?.canvas.getActiveObject());
                        break;
                    case 'bl':
                        action = 'connect';
                        handleCreateConnector(e, e.clientX, e.clientY, target);
                        break;
                    default:
                        action = 'drag';
                        break;
                }
                return action;
            }
        };

        fabric.Canvas.prototype._performTransformAction = function (e, transform, pointer) {
            const { x, y } = pointer;
            const target = transform.target;
            const action = transform.action;

            setFormOpen(false);

            switch (action) {
                case 'edit':
                    break;
                case 'delete':
                    break;
                case 'connect':
                    break;
                default:
                    target.set({
                        left: x,
                        top: y
                    });
                    // console.log(transform.target.name);
                    if (sObj?.name === transform.target.name){
                        console.log("moving start obj")
                    }
                    if (eObj?.name === transform.target.name){
                        console.log("moving end obj")
                    }
                    updateConnectorPosition(e, transform, pointer);
                    target.setCoords();
                    this.renderAll();
                    this.fire('moving', target, e);
                    this.setCursor(this.moveCursor);
                    break;
            }
        };

        editor?.canvas.renderAll();
    };

    function handleOpenForm(x, y, target) {
        setFormOpen(true);
        setActiveFormName(target.name)
        setActiveFormDetails({
            id: target.id,
            coords: { x, y },
            name: 'Megha',
            imageName: target.name
        });
    }

    const handleSaveForm = () => {
        const { id, name, imageName } = activeFormDetails;
        if (!name || !imageName) {
            console.warn("Please do not leave any field");
            return;
        }
        else {
            setForms(prevForms => {
                const newForm = { id, name, imageName };
                const allForms = [...prevForms, newForm];
                localStorage.setItem('Forms', JSON.stringify(allForms));
                return allForms;
            });
            setFormOpen(false);
        }
    }

    function handleCreateConnector(e, x, y, target) {
        if (target.hasConnector) return;
        target.hasConnector = true;
        let tempCurve = null;
        let tempArrow = null;
        const blCoords = target.oCoords.bl;

        const startX = sObj === null ? blCoords.x : sObj.left;
        const startY = sObj === null ? blCoords.y : sObj.top;
        setStartObj(target);
        sObj = target;

        editor?.canvas.on('mouse:down', function (options) {
            if (options.target === target && options.target.__corner === 'bl') {
                editor?.canvas.on('mouse:move', function (options) {
                    const endX = options.absolutePointer.x;
                    const endY = options.absolutePointer.y;

                    // Remove previous curve and arrow
                    if (tempCurve) {
                        editor?.canvas.remove(tempCurve);
                    }
                    if (tempArrow) {
                        editor?.canvas.remove(tempArrow);
                    }

                    // Draw the curve
                    tempCurve = new fabric.Path(
                        `M ${startX} ${startY} Q ${(startX + endX) / 2}, ${(startY + endY) / 2 - 100}, ${endX}, ${endY}`,
                        { stroke: '#666', strokeWidth: 3, fill: '', selectable: false, evented: false }
                    );

                    // Draw the arrow at the endpoint
                    tempArrow = new fabric.Triangle({
                        width: 15,
                        height: 15,
                        fill: 'red',
                        left: endX,
                        top: endY,
                        angle: Math.atan2(endY - startY, endX - startX) * 180 / Math.PI + 90,
                        originX: 'center',
                        originY: 'center',
                        selectable: false,
                        evented: false
                    });

                    editor?.canvas.add(tempCurve);
                    editor?.canvas.add(tempArrow);
                    editor?.canvas.renderAll();
                });

                // Mouse up to stop drawing the curve
                editor?.canvas.on('mouse:up', function (options) {
                    editor?.canvas.off('mouse:move');
                    
                    setEndObj(options.currentTarget);
                    eObj = options.currentTarget;
                    if (options.currentTarget) {
                        setConnectors(prevConnectors => [...prevConnectors, { connectorID: connectors.length + 1, startObj: target, endObj: options.currentTarget, tempCurve, tempArrow }]);
                    }
                    
                    if (!options.currentTarget) {
                        editor?.canvas.remove(tempCurve);
                        editor?.canvas.remove(tempArrow);
                        tempCurve = null;
                        tempArrow = null;
                    }
                    else {
                        if (tempCurve && tempArrow) {
                            editor?.canvas.add(tempCurve);
                            tempCurve.sendToBack();
                            editor?.canvas.add(tempArrow);
                            tempArrow.sendToBack();
                            editor?.canvas.renderAll();
                        }
                        editor?.canvas.off('mouse:up');
                    }
                });
            }
        });
    }
    // useEffect(() => {
    //     connectors.forEach(conn => {
    //         console.log(conn.startObj.left)
    //     })
    // }, [connectors])
    
    function updateConnectorPosition(e, transform, pointer) {
        // console.log(pointer);
        return pointer;
    }

    const handleExport = () => {
        const jsn = JSON.stringify(editor?.canvas.toJSON());
        console.log(jsn);

        const blob = new Blob([jsn], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'my.json';
        a.click();

        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        setCornerCursor();
    }, [editor]);
    

    // useEffect(() => {
    //     if (editor?.canvas) {
    //         editor.canvas.clear();

    //         editor.canvas.loadFromJSON(json, () => {
    //             editor.canvas.getObjects().forEach(obj => {
    //                 if (obj.type === 'path' || obj.type === 'triangle') {
    //                     obj.set({
    //                         selectable: false,
    //                         evented: false
    //                     });
    //                 }
    //             });

    //             editor.canvas.renderAll();
    //         }, (o, object) => {
    //             console.log('Object loaded:', o, object);
    //         });
    //     }
    // }, [editor?.canvas]);    

    return (
        <>
            <div className='flex'>
                <div className='flex flex-col items-center justify-evenly w-[15%] overflow-y-auto border border-gray-400 h-[100vh]'>
                    <div>
                        <img
                            src={laptop}
                            alt="laptop"
                            width="100px"
                            onDragStart={(e) => e.dataTransfer.setData('imgSrc', laptop)}
                        />
                    </div>
                    <div>
                        <img
                            src={network}
                            alt="network"
                            width="100px"
                            onDragStart={(e) => e.dataTransfer.setData('imgSrc', network)}
                        />
                    </div>
                    <div>
                        <img
                            src={workstation}
                            alt="workstation"
                            width="100px"
                            onDragStart={(e) => e.dataTransfer.setData('imgSrc', workstation)}
                        />
                    </div>
                </div>

                <div className='w-[85%] h-[100vh] flex items-center ps-3'>
                    <div
                        className="h-[100%] w-[100%] border border-gray-400"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <FabricJSCanvas
                            onReady={onReady}
                            className="sample-canvas border border-gray-700 h-[100%] w-[100%]"
                        />

                        {/* Form */}
                        {/* {activeFormDetails && formOpen && (
                            <div
                                className="absolute bg-white p-4 shadow-lg border border-gray-300 flex flex-col"
                                style={{ left: activeFormDetails.coords.x, top: activeFormDetails.coords.y }}
                            >
                                <div className='cursor-pointer flex items-center justify-between' onClick={() => setFormOpen(false)}>
                                    <p>ID: {activeFormDetails.id}</p>
                                    <FaWindowClose />
                                </div>
                                <label className='flex items-center justify-between'>
                                    Your Name
                                    <input
                                        type="text"
                                        className="border p-1 m-1"
                                        value={activeFormDetails.name}
                                        onChange={(e) =>
                                            setActiveFormDetails(prev => ({
                                                ...prev,
                                                name: e.target.value
                                            }))
                                        }
                                    />
                                </label>
                                <label className='flex items-center justify-between'>
                                    Image Name
                                    <input
                                        type="text"
                                        className="border p-1 m-1"
                                        value={activeFormDetails.imageName}
                                        onChange={(e) =>
                                            setActiveFormDetails(prev => ({
                                                ...prev,
                                                imageName: e.target.value
                                            }))
                                        }
                                    />
                                </label>
                                <br />
                                <button
                                    className="bg-blue-500 text-white p-2 mt-2"
                                    onClick={handleSaveForm}
                                >
                                    Save
                                </button>
                            </div>
                        )} */}
                        {activeFormName === 'Laptop' && activeFormDetails && formOpen && (
                            <div
                                className="absolute bg-white p-4 shadow-lg border border-gray-300 flex flex-col"
                                style={{ left: activeFormDetails.coords.x, top: activeFormDetails.coords.y }}>
                                    <DesktopForm />
                                </div>
                        )}
                        {activeFormName === 'Network' && activeFormDetails && formOpen && (
                            <div
                                className="absolute bg-white p-4 shadow-lg border border-gray-300 flex flex-col"
                                style={{ left: activeFormDetails.coords.x, top: activeFormDetails.coords.y }}>
                                    <InternetForm />
                                </div>
                        )}
                        {activeFormName === 'Workstation' && activeFormDetails && formOpen && (
                            <div
                                className="absolute bg-white p-4 shadow-lg border border-gray-300 flex flex-col"
                                style={{ left: activeFormDetails.coords.x, top: activeFormDetails.coords.y }}>
                                    <WorkStationForm />
                                </div>
                        )}
                    </div>
                </div>
            </div>
            <div className='p-3'>
                <button className='bg-green-600 text-white p-3 rounded font-bold' onClick={handleExport}>Export to JSON</button>
            </div>
        </>
    );
};

export default FabricDropDown;

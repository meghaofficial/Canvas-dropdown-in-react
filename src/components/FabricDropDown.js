import React, { useEffect, useState } from 'react'
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import desktop from '../images/desktop.png';
import internet from '../images/internet.png';
import workstation from '../images/workstation.png';
import cancel from '../images/icons8-cancel-30.png';
import edit from '../images/icons8-edit-32.png';
import { FaWindowClose } from "react-icons/fa";
let objID = 0;
const FabricDropDown = () => {

    const { editor, onReady } = useFabricJSEditor();
    const [activeFormDetails, setActiveFormDetails] = useState(null);
    const [formOpen, setFormOpen] = useState(true);

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

    // let objID = 0;

    // Handle drop event
    const handleDrop = (e) => {
        e.preventDefault();

        objID++;
        const imgSrc = e.dataTransfer.getData('imgSrc');
        fabric.Image.fromURL(imgSrc, (img) => {
            img.set({
                id: objID,
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

        fabric.Object.prototype.drawControls = function (ctx, styleOverride) {
            var controls = ['tr', 'br'];

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
                            SelectedIconImage.src = null;
                            break;
                        case 'br':
                            SelectedIconImage.src = edit;
                            break;
                    }

                    SelectedIconImage.onload = function () {
                        ctx.drawImage(SelectedIconImage, left, top, size, size);
                    };

                    SelectedIconImage.onerror = function () {
                        console.error('Failed to load control image for', control);
                    };
                }
            });
        };

        setCornerCursor();

        fabric.Canvas.prototype._getActionFromCorner = function (alreadySelected, corner, e, target) {
            if (!corner) {
                return 'custom_drag';
            }
            var action = 'drag';
            if (corner) {
                switch (corner) {
                    case 'br':
                        action = 'edit';
                        handleOpenForm(e.clientX, e.clientY, target);
                        break;
                    case 'tr':
                        action = 'delete';
                        editor?.canvas.remove(editor?.canvas.getActiveObject());
                        break;
                    default:
                        action = 'drag';
                }
                return action;
            }
        };

        fabric.Canvas.prototype._performTransformAction = function (e, transform, pointer) {
            const { x, y } = pointer;
            const target = transform.target;
            const action = transform.action;

            switch (action) {
                case 'edit':
                    break;
                case 'delete':
                    break;
                default:
                    target.set({
                        left: x,
                        top: y
                    });
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
        setActiveFormDetails({
            id: target.id,
            coords: { x, y },
            name: '',
            imageName: ''
        });
    }

    useEffect(() => {
        setCornerCursor();
    }, [editor]);

    return (
        <>
            <div className='flex'>
                <div className='flex flex-col items-center justify-evenly w-[15%] overflow-y-auto border border-gray-400 h-[100vh]'>
                    <div>
                        <img
                            src={desktop}
                            alt="desktop"
                            width="100px"
                            onDragStart={(e) => e.dataTransfer.setData('imgSrc', desktop)}
                        />
                    </div>
                    <div>
                        <img
                            src={internet}
                            alt="internet"
                            width="100px"
                            onDragStart={(e) => e.dataTransfer.setData('imgSrc', internet)}
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
                        {activeFormDetails && formOpen && (
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
                                >
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default FabricDropDown;

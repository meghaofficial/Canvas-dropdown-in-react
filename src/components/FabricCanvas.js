import React, { useEffect, useState } from 'react'
import desktop from '../images/desktop.png';
import internet from '../images/internet.png';
import workstation from '../images/workstation.png';
import cancel from '../images/icons8-cancel-30.png';
import edit from '../images/icons8-edit-32.png';
import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
// import { FaWindowClose } from "react-icons/fa";
// import json from '../test.json';

const FabricCanvas = () => {
    const { editor, onReady } = useFabricJSEditor();
    const [canvaImages, setCanvaImages] = useState([]);
    const [forms, setForms] = useState([]);
    const [activeForm, setActiveForm] = useState({ formID: 1, yourName: "", imageName: "", coords: { x: 0, y: 0 } });
    const [formOpen, setFormOpen] = useState(false);
    const [connectors, setConnectors] = useState([]);
    const [objID, setObjID] = useState(0);
    let storageArray = [];  //Displaying table and export button

    // Handle drop event
    const handleDrop = (e) => {
        e.preventDefault();
        const imgSrc = e.dataTransfer.getData('imgSrc');
        const imgElement = new Image();
        imgElement.src = imgSrc;

        imgElement.onload = function () {

            setObjID(objID + 1);
            // Adding a FabricImage
            const fabricImage = new fabric.Image(
                imgElement, {
                id: objID,
                localId: canvaImages.length + 1,
                left: e.clientX - 300,
                top: e.clientY - 100,
                scaleX: 0.5,
                scaleY: 0.5,
                hasControls: true,
                selectable: true
            }
            );
            editor?.canvas.add(fabricImage);
            // calculations for positioning of other elements
            const imageWidth = fabricImage.width * fabricImage.scaleX;
            const imageHeight = fabricImage.height * fabricImage.scaleY;
            const x1 = fabricImage.aCoords.tl.x;
            const y1 = fabricImage.aCoords.tl.y;
            const x2 = fabricImage.aCoords.tr.x;
            const y2 = fabricImage.aCoords.tr.y;
            const x3 = fabricImage.aCoords.bl.x;
            const y3 = fabricImage.aCoords.bl.y;
            const x4 = fabricImage.aCoords.br.x;
            const y4 = fabricImage.aCoords.br.y;
            // updating canvas images
            setCanvaImages(prevCanvaImages => {
                const canvaImageObj = {
                    id: objID,
                    localId: canvaImages.length + 1,
                    name: imgSrc.slice(12, imgSrc.length - 4),
                    imageObj: fabricImage
                }
                return [...prevCanvaImages, canvaImageObj];
            })

            // Adding a imageText
            const imageText = new fabric.Text("hello", {
                left: (x3 + x4) / 2,
                top: (y3 + y4) / 2 + 6,
                fontSize: 24,
                fill: '#000',
                selectable: false,
            });
            editor?.canvas.add(imageText);
            const textWidth = imageText.getBoundingRect().width;
            imageText.set({
                left: (x3 + x4) / 2 - textWidth / 2
            });
            // adding form when image object with its name is dropped
            let formDetails = {
                formID: objID,
                localId: canvaImages.length + 1,
                yourName: "Megha",
                imageName: imgSrc.slice(12, imgSrc.length - 4),
                coords: { x: 0, y: 0 },
                fabricText: imageText,
                fabricImage
            }

            // Adding cancel button
            const cancelImgElement = new Image();
            cancelImgElement.src = cancel;
            let fabricCancel = null;
            cancelImgElement.onload = function () {
                fabricCancel = new fabric.Image(
                    cancelImgElement, {
                    left: x2,
                    top: y2,
                    scaleX: 0.7,
                    scaleY: 0.7,
                    hasControls: false,
                    selectable: true,
                    evented: true
                }
                );
                editor?.canvas.add(fabricCancel);
                editor?.canvas.renderAll();

                // clicking on cancel button
                fabricCancel?.on('mousedown', () => {
                    editor?.canvas.remove(fabricImage);
                    editor?.canvas.remove(imageText);
                    editor?.canvas.remove(fabricEdit);
                    editor?.canvas.remove(fabricCancel);
                    editor?.canvas.remove(fabricDot);
                    const newCanvaImages = canvaImages.filter((img) => img !== imgSrc);
                    setCanvaImages(newCanvaImages);
                    editor?.canvas.renderAll();
                });
            }

            // Adding an edit button
            const editImageElement = new Image();
            editImageElement.src = edit;
            let fabricEdit = null;
            editImageElement.onload = function () {
                fabricEdit = new fabric.Image(
                    editImageElement, {
                    left: x2,
                    top: y2 + fabricCancel?.getBoundingRect().height,
                    scaleX: 0.7,
                    scaleY: 0.7,
                    hasControls: false,
                    selectable: false,
                    evented: true
                }
                );
                editor?.canvas.add(fabricEdit);
                editor?.canvas.renderAll();

                fabricEdit?.on('mousedown', () => {
                    setFormOpen(true);
                    formDetails.coords = {
                        x: x4 + 250,
                        y: y4 + 10
                    }
                    setActiveForm(formDetails);
                    // setForms(prevFormDetails => [...prevFormDetails, formDetails]);
                    editor?.canvas.renderAll();
                });
            }

            // Adding a FabricDot (dot for connector)
            const fabricDot = new fabric.Circle({
                id: objID,
                localId: canvaImages.length + 1,
                left: (x3 + x4) / 2,
                top: (y3 + y4) / 2,
                radius: 5,
                fill: '#666',
                selectable: false,
                evented: true
            });
            editor?.canvas.add(fabricDot);
            const dotWidth = fabricDot.getBoundingRect().width;
            fabricDot.set({
                left: (x3 + x4) / 2 - dotWidth / 2
            });

            // Adding connectors
            let curve;
            let arrow;
            let localConnectorsArray = [];
            let currStart = null;
            let currEnd = null;
            fabricDot.on('mousedown', () => {
                const startX = fabricDot.left + fabricDot.radius;
                const startY = fabricDot.top + fabricDot.radius;
                currStart = fabricImage;  //getting the current start object

                // for disabling the default behaviour of creating selection rectangle 
                if (editor && editor.canvas) {
                    editor.canvas.selection = false;
                }

                // creating instance of curve and arrow in order to create new connector for same obj
                let tempCurve = null;
                let tempArrow = null;

                editor?.canvas.on('mouse:move', (moveEvent) => {
                    const endX = moveEvent.pointer.x;
                    const endY = moveEvent.pointer.y;
                    // avoid creating multiple connectors when moving mouse
                    if (tempCurve) {
                        editor?.canvas.remove(tempCurve);
                    }
                    if (tempArrow) {
                        editor?.canvas.remove(tempArrow);
                    }
                    // creating a curve
                    tempCurve = new fabric.Path(
                        `M ${startX} ${startY} Q ${(startX + endX) / 2}, ${(startY + endY) / 2 - 100}, ${endX}, ${endY}`,
                        { stroke: '#666', strokeWidth: 3, fill: '', selectable: false, evented: false }
                    );
                    // creating an arrow
                    tempArrow = new fabric.Triangle({
                        width: 15,
                        height: 15,
                        fill: 'red',
                        left: endX,
                        top: endY,
                        angle: Math.atan2(editor?.canvas.onendY - startY, endX - startX) * 180 / Math.PI + 90,
                        originX: 'center',
                        originY: 'center',
                        selectable: false,
                        evented: false
                    });
                    curve = tempCurve;
                    arrow = tempArrow;
                    editor?.canvas.add(tempCurve);
                    editor?.canvas.add(tempArrow);
                    editor?.canvas.renderAll();
                });

                editor?.canvas.on('mouse:up', (upEvent) => {
                    const target = editor?.canvas.findTarget(upEvent.e);
                    currEnd = target.type === 'image' ? target : null;  //getting the current end obj
                    if (target && target.type === 'image') {
                        setConnectors((prevConnectors) => {
                            const newConnector = { curve, arrow, startID: fabricDot.id, endID: target.id };
                            const updatedConnectors = [...prevConnectors, newConnector];
         
    // useEffect(() => {                   localConnectorsArray = [...prevConnectors, newConnector];
                            return updatedConnectors;
                        });
                        // logic for connector detail for image obj
                        let isMatchedID = localConnectorsArray.filter((elem) => elem.startID === formDetails.id);
                        if (isMatchedID) {
                            formDetails.isConnector = true;
                            formDetails.connectedTo = 0
                            setActiveForm(formDetails);
                        }
                    }
                    else {
                        editor?.canvas.remove(curve);
                        editor?.canvas.remove(arrow);
                    }
                    editor?.canvas.off('mouse:move');
                    editor?.canvas.off('mouse:up');
                })
            });

            // **************** IMAGE OBJECT MOVEMENT ******************

            // Moving image object
            fabricImage.on('moving', () => {
                const new_x1 = fabricImage.left, new_y1 = fabricImage.top;
                const new_x2 = new_x1 + fabricImage.getScaledWidth(), new_y2 = new_y1;
                const new_x3 = new_x1, new_y3 = new_y1 + fabricImage.getScaledHeight();

                const new_x4 = new_x2, new_y4 = new_y3;
                // object's movement
                imageText.set({
                    left: (new_x3 + new_x4) / 2 - imageText.width / 2,
                    top: (new_y3 + new_y4) / 2 + 6,
                });
                fabricCancel?.set({
                    left: new_x2,
                    top: new_y2,
                });
                fabricEdit?.set({
                    left: new_x2,
                    top: new_y2 + fabricCancel?.getBoundingRect().height,
                });
                fabricDot.set({
                    left: (new_x3 + new_x4) / 2 - fabricDot.radius,
                    top: (new_y3 + new_y4) / 2,
                });
                imageText.setCoords();
                fabricCancel?.setCoords();
                fabricEdit?.setCoords();
                fabricDot?.setCoords();

                // CONNECTOR'S MOVEMENT

                editor?.canvas.renderAll();
            });

            // Scaling image object
            fabricImage.on('scaling', () => {
                const new_x1 = fabricImage.left, new_y1 = fabricImage.top;
                const new_x2 = new_x1 + fabricImage.getScaledWidth(), new_y2 = new_y1;
                const new_x3 = new_x1, new_y3 = new_y1 + fabricImage.getScaledHeight();
                const new_x4 = new_x2, new_y4 = new_y3;
                imageText.set({
                    left: (new_x3 + new_x4) / 2 - imageText.width / 2,
                    top: (new_y3 + new_y4) / 2 + 6,
                });
                fabricCancel?.set({
                    left: new_x2,
                    top: new_y2,
                });
                fabricEdit?.set({
                    left: new_x2,
                    top: new_y2 + fabricCancel?.getBoundingRect().height,
                });
                fabricDot.set({
                    left: (new_x3 + new_x4) / 2 - fabricDot.radius,
                    top: (new_y3 + new_y4) / 2,
                });
                imageText.setCoords();
                fabricCancel?.setCoords();
                fabricEdit?.setCoords();
                fabricDot?.setCoords();
                editor?.canvas.renderAll();
            });

            editor?.canvas.renderAll();
        };
    };

    const handleSaveForm = () => {
        const { formID, yourName, imageName, fabricText, fabricImage } = activeForm;

        if (!yourName || !imageName) {
            console.warn("Both name and image name are required!");
        } else {
            if (fabricText) {
                const x3 = fabricImage.aCoords.bl.x;
                const y3 = fabricImage.aCoords.bl.y;
                const x4 = fabricImage.aCoords.br.x;
                const y4 = fabricImage.aCoords.br.y;
                fabricText.set("text", imageName);
                fabricText.set({ left: (x3 + x4) / 2 - fabricText.width / 2, top: (y3 + y4) / 2 + 6, })
                editor?.canvas.renderAll();
            }

            const imageBase64 = fabricImage.toDataURL();

            setCanvaImages(prevCanvaImages => {
                const updatedCanvaImages = prevCanvaImages.map((img) =>
                    img.id === formID ? { ...img, name: imageName } : img
                );
                return updatedCanvaImages;
            });

            let formArray = JSON.parse(localStorage.getItem('Forms')) || [];
            const existingID = formArray.find(elem => elem.formID === formID);
            if (existingID) {
                existingID.yourName = yourName;
                existingID.imageName = imageName;
                existingID.imageBase64 = imageBase64;
                const filteredObj = formArray.filter(elem => elem.formID !== formID);
                filteredObj.push(existingID);
                filteredObj.sort((a, b) => a.formID - b.formID);
                localStorage.setItem('Forms', JSON.stringify(filteredObj));
                setForms(filteredObj);
            }
            else {
                // formArray.push(activeForm);
                formArray.push({ ...activeForm, imageBase64 });
                localStorage.setItem('Forms', JSON.stringify(formArray));
                setForms(formArray);
            }

            setFormOpen(false);
        }
    };

    // Export function
    const handleExport = () => {
        const json = JSON.stringify(editor?.canvas.toJSON());
        console.log(json)
        // let formArray = JSON.parse(localStorage.getItem('Forms')) || [];
        // const blob = new Blob([JSON.stringify(formArray, null, 2)], {
        //     type: 'application/json'
        // });
        // const url = URL.createObjectURL(blob);
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = `my.json`;
        // a.click();
        // URL.revokeObjectURL(url);
    }

    function exportToJson(canvas) {
        const json = canvas.toJSON();

        // Function to convert an image URL to base64
        function convertImageToBase64(url, callback) {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // Avoid CORS issues if possible
            img.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                callback(dataURL);
            };
            img.src = url;
        }

        // Iterate through all objects and convert images to base64
        const processObjects = (objects, callback) => {
            let pending = objects.length;

            if (pending === 0) {
                callback();
            }

            objects.forEach((obj, index) => {
                if (obj.type === 'image') {
                    convertImageToBase64(obj.src, (base64Image) => {
                        obj.src = base64Image; // Replace URL with base64
                        pending -= 1;
                        if (pending === 0) {
                            callback();
                        }
                    });
                } else {
                    pending -= 1;
                    if (pending === 0) {
                        callback();
                    }
                }
            });
        };

        // Process the canvas objects and trigger download once all images are base64 encoded
        processObjects(json.objects, () => {
            // Custom formatting of the JSON
            const formattedJson = {
                objects: json.objects.map(obj => {
                    return {
                        type: obj.type,
                        version: "5.3.0",
                        originX: obj.originX,
                        originY: obj.originY,
                        left: obj.left,
                        top: obj.top,
                        width: obj.width,
                        height: obj.height,
                        fill: obj.fill,
                        stroke: obj.stroke,
                        strokeWidth: obj.strokeWidth,
                        strokeDashArray: obj.strokeDashArray,
                        strokeLineCap: obj.strokeLineCap,
                        strokeDashOffset: 0,
                        strokeLineJoin: obj.strokeLineJoin,
                        strokeMiterLimit: obj.strokeMiterLimit,
                        scaleX: obj.scaleX,
                        scaleY: obj.scaleY,
                        angle: obj.angle,
                        flipX: obj.flipX,
                        flipY: obj.flipY,
                        opacity: obj.opacity,
                        shadow: obj.shadow,
                        visible: obj.visible,
                        clipTo: obj.clipTo,
                        backgroundColor: obj.backgroundColor,
                        fillRule: obj.fillRule,
                        paintFirst: obj.paintFirst,
                        globalCompositeOperation: obj.globalCompositeOperation,
                        transformMatrix: obj.transformMatrix,
                        skewX: obj.skewX,
                        skewY: obj.skewY,
                        ...(obj.type === 'i-text' || obj.type === 'text' ? {
                            text: obj.text,
                            fontSize: obj.fontSize,
                            fontWeight: obj.fontWeight,
                            fontFamily: obj.fontFamily,
                            fontStyle: obj.fontStyle,
                            lineHeight: obj.lineHeight,
                            textDecoration: obj.textDecoration,
                            textAlign: obj.textAlign,
                            textBackgroundColor: obj.textBackgroundColor,
                            charSpacing: obj.charSpacing,
                            styles: obj.styles
                        } : {}),
                        ...(obj.type === 'image' ? {
                            src: obj.src, 
                            crossOrigin: obj.crossOrigin,
                            alignX: obj.alignX,
                            alignY: obj.alignY,
                            meetOrSlice: obj.meetOrSlice,
                            filters: obj.filters,
                            resizeFilters: obj.resizeFilters
                        } : {})
                    };
                })
            };

            // Convert the formatted JSON to a string
            const jsonString = JSON.stringify(formattedJson, null, 4);

            // Trigger download
            const blob = new Blob([jsonString], { type: "application/json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "canvas_data.json";
            link.click();
        });
    }
    // Setting up object id
    useEffect(() => {
        let formArray = JSON.parse(localStorage.getItem('Forms')) || [];
        setObjID(formArray.length + 1);
    }, [forms]);

    // Getting details from localStorage
    useEffect(() => {
        let formArray = JSON.parse(localStorage.getItem('Forms')) || [];
        setForms(formArray);
    }, [editor?.canvas, activeForm]);

    // useEffect(() => {
       
    //     if (editor?.canvas) {
            
    //         editor.canvas.loadFromJSON(json, function () {
    //             editor.canvas.renderAll();
    //         }, function (o, object) {
    //             console.log('Object loaded:', o, object);
    //         });
    //     }
    // }, [editor?.canvas]);  
    

    return (
        <>
            <div className='flex'>
                {/* Navigation bar */}
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

                {/* Canvas */}
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
                        {
                            formOpen && (
                                <div
                                    className="absolute bg-white p-4 shadow-lg border border-gray-300 flex flex-col"
                                    style={{ left: activeForm.coords.x, top: activeForm.coords.y }}
                                >
                                    <div className='cursor-pointer flex items-center justify-between' onClick={() => setFormOpen(false)}>
                                        <p>{activeForm.formID}</p>
                                        {/* <FaWindowClose /> */}
                                    </div>
                                    <label className='flex items-center justify-between'>
                                        Your Name
                                        <input
                                            type="text"
                                            value={activeForm.yourName || ""}
                                            onChange={(e) => setActiveForm({ ...activeForm, yourName: e.target.value })}
                                            className="border p-1 m-1"
                                        />
                                    </label>
                                    <label className='flex items-center justify-between'>
                                        Image Name
                                        <input
                                            type="text"
                                            value={activeForm.imageName || ""}
                                            onChange={(e) => setActiveForm({ ...activeForm, imageName: e.target.value })}
                                            className="border p-1 m-1"
                                        />
                                    </label>
                                    <br />
                                    <button
                                        onClick={handleSaveForm}
                                        className="bg-blue-500 text-white p-2 mt-2"
                                    >
                                        Save
                                    </button>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
            {/* Details */}
            <table className='flex flex-col justify-evenly'>
                <tr className='flex justify-evenly'>
                    <th>ID</th>
                    <th>Local ID</th>
                    <th>Your name</th>
                    <th>Image name</th>
                    <th>Connector</th>
                    <th>Connected to</th>
                </tr>
                {forms.map((form, index) => {
                    return (
                        <tr key={index} className='flex justify-evenly'>
                            <td>{form.formID}</td>
                            <td>{form.localId}</td>
                            <td>{form.yourName}</td>
                            <td>{form.imageName}</td>
                            <td>{form.isConnector ? "True" : "False"}</td>
                            <td>{form.connectedTo ? form.connectedTo : "No connector"}</td>
                        </tr>
                    )
                })}
            </table>
            {/* Export to JSON */}
            <div className='p-3'>
                <button className='bg-green-600 text-white p-3 rounded font-bold' onClick={handleExport}>Export to JSON</button>
            </div>
        </>
    )
}

export default FabricCanvas;

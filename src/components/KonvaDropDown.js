import React, { Fragment, useRef, useState } from 'react';
import { Stage, Layer, Image, Text, Line } from 'react-konva';
import useImage from 'use-image';
import desktop from '../images/desktop.png';
import internet from '../images/internet.png';
import workstation from '../images/workstation.png';

const URLImage = ({ image, onRightClick, onDragMove, onClick, onRemove, isActiveImage }) => {
    const [img] = useImage(image.src);
    const width = 100;
    const height = img ? (img.height / img.width) * width : 0;
    const [imagePos, setImagePos] = useState({ x: image.x, y: image.y });

    const handleClick = () => {
        onClick(image, imagePos.x, imagePos.y);
    }

    const handleDragMove = (e) => {
        const { x, y } = e.target.position();
        setImagePos({ x, y });
        onDragMove(image, x, y);  // Pass image and new coordinates to parent
    };

    return (
        <>
            <Image
                image={img}
                x={imagePos.x}
                y={imagePos.y}
                width={width}
                height={height}
                draggable={true}
                onContextMenu={(e) => {
                    e.evt.preventDefault();
                    onRightClick(image, e.evt.clientX, e.evt.clientY);
                }}
                onDragMove={handleDragMove}
                onClick={handleClick}
                stroke={isActiveImage ? 'red' : ''}
                strokeWidth={isActiveImage ? 5 : 0}
            />
            <Text
                text="✖"
                fontSize={24}
                fill="red"
                x={imagePos.x + width - 5}
                y={imagePos.y - 15}
                onClick={() => onRemove(image.id)}
                style={{ cursor: 'pointer' }}
            />
        </>
    );
};

const KonvaDropDown = () => {
    const dragUrl = useRef();
    const stageRef = useRef();
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [connectors, setConnectors] = useState([]);
    const [firstSelected, setFirstSelected] = useState(null);
    const [formPosition, setFormPosition] = useState({ x: 0, y: 0 });
    const [openForm, setOpenForm] = useState(false);
    const [userDetails, setUserDetails] = useState({
        fname: "", lname: ""
    });
    const [activeImageId, setActiveImageId] = useState(null);

    const onRightClick = (image, xPos, yPos) => {
        if (!openForm) {
            setSelectedImage(image);
            setFormPosition({ x: xPos + 50, y: yPos + 50 });
        }
        setOpenForm(!openForm);
    };

    const onDragMove = (image, x, y) => {
        setImages((prevImages) =>
            prevImages.map((img) =>
                img.id === image.id ? { ...img, x, y } : img  // Update the position of the dragged image
            )
        );

        // Update connectors when the image is dragged
        setConnectors((prevConnectors) =>
            prevConnectors.map((connector) => {
                if (connector.start.id === image.id) {
                    return { ...connector, start: { ...connector.start, x, y } };
                } else if (connector.end.id === image.id) {
                    return { ...connector, end: { ...connector.end, x, y } };
                }
                return connector;
            })
        );
    };

    const handleImageClick = (clickedImage, x, y) => {
        const currentImage = { ...clickedImage, x, y };  // Use updated position
        if (!firstSelected) {
            setFirstSelected(currentImage);  // Set current image with updated position
            setActiveImageId(currentImage.id);
        } else {
            if (currentImage.id !== firstSelected.id) {  // Avoid connecting an image to itself
                setConnectors((prevConnectors) =>
                    prevConnectors.concat([{ start: firstSelected, end: currentImage }])  // Create connector
                );
            }
            setFirstSelected(null);  // Reset the first selected image
            setActiveImageId(null);
        }
    };

    const handleRemove = (id) => {
        setImages((prevImages) => prevImages.filter((image) => image.id !== id));
        setConnectors((prevConnectors) =>
            prevConnectors.filter((connector) => connector.start.id !== id && connector.end.id !== id)
        );
    };

    const handleSubmit = (imageDetail, fname, lname) => {
        if (fname && lname) {
            localStorage.setItem(`Image - ${Date.now()}`, JSON.stringify({ imageDetail, fname, lname }));
            setUserDetails({ fname: "", lname: "" });
            alert(`${imageDetail} is successfully saved to localstorage`);
        } else {
            if (!fname && !lname) {
                alert("Please enter first and last name");
            }
            else if (!fname) {
                alert("Please enter first name");
            }
            else if (!lname) {
                alert("Please enter last name");
            }
        }
    }

    const handleRemoveConnector = (connector) => {
        setConnectors((prevConn) => prevConn.filter((conn, i) => conn.start.id !== connector.start.id));
    }

    return (
        <>
            <div className="h-[80vh] w-[80%] border border-gray-300 absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] flex p-2">
                {/* Left icons */}
                <div className="h-[100%] w-[15%] border border-gray-400 overflow-y-scroll">
                    {[desktop, internet, workstation].map((icon, index) => (
                        <img
                            key={index}
                            alt={icon}
                            src={icon}
                            draggable="true"
                            onDragStart={(e) => {
                                dragUrl.current = e.target.src;
                            }}
                        />
                    ))}
                </div>

                {/* Right canvas */}
                <div
                    className="h-[100%] w-[85%] border border-gray-400"
                    onDrop={(e) => {
                        e.preventDefault();
                        stageRef.current.setPointersPositions(e);
                        const pos = stageRef.current.getPointerPosition();
                        setImages((prevImages) =>
                            prevImages.concat([{ ...pos, src: dragUrl.current, id: `image-${Date.now()}` }])
                        );
                    }}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <Stage
                        width={window.innerWidth}
                        height={window.innerHeight - 160}
                        ref={stageRef}
                    >
                        <Layer>
                            {connectors.map((connector, index) => {
                                // Calculate the midpoint of the curve
                                const controlX = (connector.start.x + connector.end.x) / 2;
                                const controlY = (connector.start.y + connector.end.y) / 2 - 100; 
                                const midX = (connector.start.x + controlX + connector.end.x) / 3;
                                const midY = (connector.start.y + controlY + connector.end.y) / 3;

                                return (
                                    <Fragment key={index}>
                                        {/* Draw the curved line */}
                                        <Line
                                            key={index}
                                            points={[
                                                connector.start.x + 50, connector.start.y + 50, 
                                                controlX, controlY, 
                                                connector.end.x + 50, connector.end.y + 50, 
                                            ]}
                                            stroke="black"
                                            strokeWidth={2}
                                            tension={0.5}
                                            lineCap="round"
                                            lineJoin="round"
                                        />
                                        {/* <Text
                                            text="✖"
                                            fontSize={24}
                                            fill="purple"
                                            x={midX - 12} 
                                            y={midY - 30} 
                                            onClick={() => handleRemoveConnector(connector)}
                                            style={{ cursor: 'pointer' }}
                                        /> */}
                                    </Fragment>
                                );
                            })}

                            {images.map((image) => (
                                <URLImage
                                    key={image.id}
                                    image={image}
                                    onRightClick={onRightClick}
                                    onDragMove={onDragMove}
                                    onRemove={handleRemove}
                                    onClick={(img, x, y) => handleImageClick(img, x, y)}
                                    isActiveImage={activeImageId === image.id}
                                />
                            ))}
                        </Layer>
                    </Stage>
                </div>
            </div>
            {
                selectedImage && openForm && (
                    <div
                        className="absolute p-4 border border-gray-400 bg-white flex flex-col"
                        style={{
                            top: formPosition.y,
                            left: formPosition.x,
                        }}
                        draggable={true}
                    >
                        <input type="text" className='p-2 focus:outline-none border border-gray-200 m-2' placeholder='First Name' value={userDetails.fname} onChange={(e) => setUserDetails({ ...userDetails, fname: e.target.value })} />
                        <input type="text" className='p-2 focus:outline-none border border-gray-200 m-2' placeholder='Last Name' value={userDetails.lname} onChange={(e) => setUserDetails({ ...userDetails, lname: e.target.value })} />
                        <button
                            className="mt-2 p-2 bg-red-500 text-white rounded m-2"
                            onClick={() => setSelectedImage(null)} // Hide form on button click
                        >
                            Close
                        </button>
                        <button
                            className="mt-2 p-2 bg-green-500 text-white rounded m-2"
                            onClick={() => handleSubmit(selectedImage.src, userDetails.fname, userDetails.lname)} // Hide form on button click
                        >
                            Save
                        </button>
                    </div>
                )
            }
        </>
    );
};

export default KonvaDropDown;

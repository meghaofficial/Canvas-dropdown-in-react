import React, { useEffect } from 'react'
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import desktop from '../images/desktop.png';
import internet from '../images/internet.png';
import workstation from '../images/workstation.png';
import cancel from '../images/icons8-cancel-30.png';
import edit from '../images/icons8-edit-32.png';

const FabricDropDown = () => {

    const { editor, onReady } = useFabricJSEditor();

    const setCornerCursor = () => {
        if (editor) {
            fabric.Canvas.prototype._setCornerCursor =  function(corner, target) {
                if (corner === 'mtr' && target.hasRotatingPoint) {
                    this.setCursor(this.rotationCursor);
                    /*ADD*/
                  }else if(corner == "tr" || corner == "bl" ){
                      this.setCursor(''); 
        
                  }else if(corner == "tl" || corner == "br"){
                      this.setCursor('pointer');  
                  }			  
                    /*ADD END*/
                  else {
                    this.setCursor(this.defaultCursor);
                    return false;
                  }
            };
        }
    }

    useEffect(() => {
        setCornerCursor();
    }, [editor]);

    let DIMICON = 30;
    // Hide controls
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

        const imgSrc = e.dataTransfer.getData('imgSrc');
        resize
        fabric.Image.fromURL(imgSrc, (img) => {
            img.set({
                left: e.clientX - 300,
                top: e.clientY - 100,
                scaleX: 0.5,
                scaleY: 0.5,
                hasControls: true,
                selectable: true,
                // hoverCursor: 'pointer'
            });
            editor?.canvas.add(img);
            img.setControlsVisibility(HideControls);
        });

        // Code
        fabric.Object.prototype.drawControls = function (ctx, styleOverride) {
            // this.callSuper('drawControls', ctx, styleOverride);
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
        
        setCornerCursor(); //setting up corner cursor

        fabric.Canvas.prototype._getActionFromCorner = function (target, corner) {
            if (!corner) {
                console.error('No corner selected');
                return 'custom_drag';
            }
            var action = 'drag';
            if (corner) {
                switch (corner) {
                    case 'br':
                        action = 'edit';
                        break;
                    case 'tr':
                        action = 'delete';
                        editor?.canvas.remove(editor?.canvas.getActiveObject());
                        break;
                    default: action = 'drag';
                }
                console.log(`Action for corner ${corner}: ${action}`);
                return action;
            }
        }

        fabric.Canvas.prototype._performTransformAction = function (e, transform, pointer) {
            const { x, y } = pointer;
            const target = transform.target;
            const action = transform.action;

            // console.log(`Performing action: ${action}`); 

            switch (action) {
                case 'edit':
                    console.log("clicked edit");
                    break;
                case 'delete':
                    console.log("clicked delete");
                    break;
                default:
                    target.set({
                        left: x,
                        top: y
                    });
                    // target.setControlsVisibility({
                    //     tr: false,
                    //     br: false,
                    // });
                    this.renderAll();
                    this.fire('moving', target, e);
                    this.setCursor(this.moveCursor);
                    break;
            }
        };

        editor?.canvas.renderAll();
    };

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
                    </div>
                </div>
            </div>
        </>
    )
}

export default FabricDropDown
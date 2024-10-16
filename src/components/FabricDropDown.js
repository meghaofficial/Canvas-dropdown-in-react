import React from 'react'
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import desktop from '../images/desktop.png';
import internet from '../images/internet.png';
import workstation from '../images/workstation.png';
import cancel from '../images/icons8-cancel-30.png';
import edit from '../images/icons8-edit-32.png';

const FabricDropDown = () => {

    const { editor, onReady } = useFabricJSEditor();

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

        fabric.Image.fromURL(imgSrc, (img) => {
            img.set({
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

        // Code
        fabric.Object.prototype._drawControl = function (control, ctx, methodName, left, top) {
            if (!this.isControlVisible(control)) {
                return;
            }
            var SelectedIconImage = new Image();
            console.log(`The selected image icon is - ${SelectedIconImage}`);
            var size = this.cornerSize;
            this.transparentCorners || ctx.clearRect(left, top, size, size);
            switch (control) {
                case 'tl':/*delete*/
                    SelectedIconImage.src = cancel;
                    break;
                case 'tr':/*scale*/
                    SelectedIconImage.src = dataImage[0];
                    break;
                case 'bl':/*scale*/
                    SelectedIconImage.src = dataImage[0];
                    break;
                case 'br':/*rotate*/
                    SelectedIconImage.src = dataImage[2];
                    break;
                default:
                    ctx[methodName](left, top, size, size);
            }

            if (control == 'tl' || control == 'tr' || control == 'bl' || control == 'br') {
                try {
                    ctx.drawImage(SelectedIconImage, left, top, DIMICON, DIMICON);
                } catch (e) {
                    ctx[methodName](left, top, size, size);
                }
            }
        }
        // fabric.Object.prototype._drawControl = function (control, ctx, methodName, left, top) {
        //     if (!this.isControlVisible(control)) {
        //         return;
        //     }
        //     var SelectedIconImage = new Image();
        //     var size = this.cornerSize;
        //     this.transparentCorners || ctx.clearRect(left, top, size, size);
        //     switch (control) {
        //         case 'tl': // cancel (delete) icon
        //             SelectedIconImage.src = cancel;
        //             break;
        //         case 'tr': // other icons...
        //             SelectedIconImage.src = edit; // Ensure other icons have valid sources
        //             break;
        //         // Add other cases here for different controls
        //         default:
        //             ctx[methodName](left, top, size, size);
        //             return; // Prevent further drawing if default case is hit
        //     }

        //     if (['tl', 'tr', 'bl', 'br'].includes(control)) {
        //         try {
        //             ctx.drawImage(SelectedIconImage, left, top, DIMICON, DIMICON); // Draw the icon
        //         } catch (e) {
        //             console.error('Error drawing icon:', e);
        //             ctx[methodName](left, top, size, size); // Fallback to drawing the control if the icon fails
        //         }
        //     }
        // };        

        fabric.Canvas.prototype._setCornerCursor = function (corner, target) {
            if (corner === 'mtr' && target.hasRotatingPoint) {
                this.setCursor(this.rotationCursor);
            } else if (corner == "tr" || corner == "bl") {
                this.setCursor('sw-resize');

            } else if (corner == "tl" || corner == "br") {
                this.setCursor('pointer');
            }
            else {
                this.setCursor(this.defaultCursor);
                return false;
            }
        };
        fabric.Canvas.prototype._getActionFromCorner = function (target, corner) {
            if (!corner) {
                console.error('No corner selected');
                console.log()
                return 'drag';
            }
            var action = 'drag';
            if (corner) {
                switch (corner) {
                    case 'ml':
                    case 'mr':
                        action = 'scaleX';
                        break;
                    case 'mt':
                    case 'mb':
                        action = 'scaleY';
                        break;
                    case 'mtr':
                        action = 'rotate';
                        break;
                    /**ADD **/
                    case 'br':
                        action = 'rotate';
                        break;
                    case 'tl'://delete function if mouse down
                        action = 'delete';
                        editor?.canvas.remove(editor?.canvas.getActiveObject());
                        break;
                    /**ADD END**/
                    default: action = 'scale';
                }
                console.log(`Action for corner ${corner}: ${action}`);
                return action;
            }
        }

        fabric.Canvas.prototype._performTransformAction = function (e, transform, pointer) {
            const { x, y } = pointer;
            const target = transform.target;
            const action = transform.action;

            console.log(`Performing action: ${action}`); // Debug log

            switch (action) {
                case 'rotate':
                    this._rotateObject(x, y);
                    this._fire('rotating', target, e);
                    break;
                case 'scale':
                    this._onScale(e, transform, x, y);
                    this._fire('scaling', target, e);
                    break;
                case 'scaleX':
                    this._scaleObject(x, y, 'x');
                    this._fire('scaling', target, e);
                    break;
                case 'scaleY':
                    this._scaleObject(x, y, 'y');
                    this._fire('scaling', target, e);
                    break;
                case 'delete':
                    // Do nothing for delete during movement
                    break;
                default:
                    this._translateObject(x, y);
                    this._fire('moving', target, e);
                    this.setCursor(this.moveCursor);
                    break;
            }
        };

        // fabric.Image.fromURL('http://serio.piiym.net/CVBla/txtboard/thumb/1260285874089s.jpg', function (img) {
        //     img.top = 60;
        //     img.left = 250;
        //     img.setControlsVisibility(HideControls);
        //     editor?.canvas.add(img);
        // });

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
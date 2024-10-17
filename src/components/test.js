var canvas = new fabric.Canvas('canvas');
var HideControls = {
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

var ctrlImages = new Array()

function preload() {
    for (i = 0; i < preload.arguments.length; i++) {
        ctrlImages[i] = new Image();
        ctrlImages[i].src = preload.arguments[i];
    }
}

preload(
    "https://cdn1.iconfinder.com/data/icons/ui-color/512/Untitled-12-128.png",
    "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-1/128/sync-16.png",
    "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-1/128/write-compose-16.png",
    "https://cdn3.iconfinder.com/data/icons/social-messaging-productivity-1/128/save-16.png"
)


//override _drawControl function to change the corner images    
fabric.Object.prototype._drawControl = function (control, ctx, methodName, left, top, flipiX, flipiY) {

    var sizeX = this.cornerSize / this.scaleX,
        sizeY = this.cornerSize / this.scaleY;

    if (this.isControlVisible(control)) {
               /* isVML ||*/ this.transparentCorners || ctx.clearRect(left, top, sizeX, sizeY);


        var SelectedIconImage = new Image();
        var lx = '';
        var ly = '';
        var n = '';

        switch (control) {
            case 'tl':
                if (flipiY) { ly = 'b'; } else { ly = 't'; }
                if (flipiX) { lx = 'r'; } else { lx = 'l'; }
                break;
            case 'tr':
                if (flipiY) { ly = 'b'; } else { ly = 't'; }
                if (flipiX) { lx = 'l'; } else { lx = 'r'; }
                break;
            case 'bl':
                if (flipiY) { ly = 't'; } else { ly = 'b'; }
                if (flipiX) { lx = 'r'; } else { lx = 'l'; }
                break;
            case 'br':
                if (flipiY) { ly = 't'; } else { ly = 'b'; }
                if (flipiX) { lx = 'l'; } else { lx = 'r'; }
                break;
            default:
                ly = control.substr(0, 1);
                lx = control.substr(1, 1);
                break;
        }

        control = ly + lx;

        switch (control) {
            case 'tl':
                SelectedIconImage.src = ctrlImages[1].src;
                break;
            case 'tr':
                if (flipiX && !flipiY) { n = '2'; }
                if (!flipiX && flipiY) { n = '3'; }
                if (flipiX && flipiY) { n = '4'; }
                SelectedIconImage.src = ctrlImages[0].src;
                break;
            case 'mt':

                break;
            case 'bl':
                if (flipiY) { n = '2'; }
                SelectedIconImage.src = ctrlImages[3].src;
                break;
            case 'br':
                if (flipiX || flipiY) { n = '2'; }
                if (flipiX && flipiY) { n = ''; }
                SelectedIconImage.src = ctrlImages[2].src;
                break;
            case 'mb':

                break;
            case 'ml':

                break;
            case 'mr':

                break;
            default:
                ctx[methodName](left, top, sizeX, sizeY);
                break;
        }

        if (control == 'tl' || control == 'tr' || control == 'bl' || control == 'br'
            || control == 'mt' || control == 'mb' || control == 'ml' || control == 'mr') {
            sizeX = 15;
            sizeY = 15;
            ctx.drawImage(SelectedIconImage, left, top, sizeX, sizeY);
        }


        try {
            ctx.drawImage(SelectedIconImage, left, top, sizeX, sizeY);

        } catch (e) {
            if (e.name != "NS_ERROR_NOT_AVAILABLE") {
                throw e;
            }
        }


    }
};//end

//create a rect object  
var rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: "#FF0000",
    stroke: "#000",
    width: 100,
    height: 100,
    strokeWidth: 10,
    opacity: .8
});
canvas.add(rect);
rect.setControlsVisibility(HideControls);

fabric.Image.fromURL('http://serio.piiym.net/CVBla/txtboard/thumb/1260285874089s.jpg', function (img) {
    img.top = 60;
    img.left = 250;
    img.setControlsVisibility(HideControls);
    canvas.add(img);
});

canvas.renderAll();


//object corners
var cursorOffset = {
    mt: 0, // n
    tr: 1, // ne
    mr: 2, // e
    br: 3, // se
    mb: 4, // s
    bl: 5, // sw
    ml: 6, // w
    tl: 7 // nw
};

//override prorotype _setCornerCursor to change the corner cusrors
//when mouse is over corner (tl,tr,bl,br),we change the mouse cursor
fabric.Canvas.prototype._setCornerCursor = function (corner, target) {
    //for top left corner
    if (corner == "tl") {
        this.setCursor(this.rotationCursor); return false;
        //for top right corner
    } else if (corner == "tr") {
        this.setCursor('pointer'); return false;
        //for bottom left corner
    } else if (corner == "bl") {
        this.setCursor('help'); return false;
        //for bottom right corner
    } else if (corner == "br") {
        this.setCursor('copy'); return false;
    }
};


//we can write different functionality for each object corner, currently just an alert message
canvas.on('mouse:down', function (e) {
    if (canvas.getActiveObject()) {
        var target = this.findTarget();

        if (target.__corner == 'tr') {
            alert('delete pressed');
        } else if (target.__corner == 'tl') {
            alert('refresh pressed');
        } else if (target.__corner == 'bl') {
            alert('save pressed');
        } else if (target.__corner == 'br') {
            alert('copy pressed');
        }
    }

});






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

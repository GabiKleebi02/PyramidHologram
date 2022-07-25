var canvas;
var spacingSlider = document.getElementById('spacingSlider');
var spacingValueShow = document.getElementById('spacingValue');
var imageZoomSlider = document.getElementById('imageZoom');
var imagePosSlider = document.getElementById('imagePosition');
var lastLoadedImage = new Image();
window.onload = function () {
    //----- prepare the canvas -----
    if (document.getElementById('mainCanvas') == null) {
        console.error('Can not find canvas!');
        return;
    }
    //get the canvas
    canvas = document.getElementById('mainCanvas');
    //paint the canvas black
    var context = canvas.getContext("2d");
    if (!context) {
        console.error("Canvas-context not supported!");
        return;
    }
    //fill the canvas black
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    //----- prepare other things -----
    spacingValueShow.value = "" + getInnerSpacing();
};
//onchange-event-listener for the image upload button
function loadImage(event) {
    var inputElement = event.target;
    //check for errors while getting the image
    if (inputElement == null || !inputElement.files) {
        console.error("Error on loading the image!");
        return;
    }
    //load the image
    var file = inputElement.files[0];
    var filereader = new FileReader();
    filereader.onload = function (frEvent) {
        if (frEvent.target == null) {
            console.error('Error while loading image!');
            return;
        }
        ;
        var image = new Image();
        image.src = frEvent.target.result;
        image.onload = function (imageEvent) {
            drawImageToCanvases(image);
        };
        lastLoadedImage = image;
    };
    filereader.readAsDataURL(file);
}
function drawImageToCanvases(image) {
    if (image === void 0) { image = lastLoadedImage; }
    var context = canvas.getContext("2d");
    if (context == null)
        return;
    //get the variables
    var innerSpacing = getInnerSpacing(), imagePositionOffset = getImagePosition(), singleCanvasWidth = canvas.width, singleCanvasHeight = canvas.height / 2 - innerSpacing / 2, imageSize = getImageZoom(), totalCanvasSize = canvas.width;
    //clear the canvas
    resetCanvasContext(context, totalCanvasSize);
    //draw the images
    for (var i = 0; i < 4; i++) {
        //start drawing
        context.save();
        //rotate around center
        context.translate(totalCanvasSize / 2, totalCanvasSize / 2);
        context.rotate(i * Math.PI / 2);
        context.translate(-totalCanvasSize / 2, -totalCanvasSize / 2);
        //create the clipping mask
        var clipMask = new Path2D();
        clipMask.moveTo(0, 0);
        clipMask.lineTo(singleCanvasWidth, 0);
        clipMask.lineTo(singleCanvasWidth / 2 + innerSpacing / 2, singleCanvasHeight);
        clipMask.lineTo(singleCanvasWidth / 2 - innerSpacing / 2, singleCanvasHeight);
        clipMask.lineTo(0, 0);
        clipMask.closePath();
        context.clip(clipMask);
        //move outwards
        context.translate(0, singleCanvasHeight / 2 - imageSize / 2);
        //draw the image
        context.drawImage(image, singleCanvasWidth / 2 - imageSize / 2, singleCanvasHeight / 2 - imageSize / 2 + imagePositionOffset, imageSize, imageSize);
        //end drawing
        context.restore();
    }
}
function resetCanvasContext(context, canvasSize) {
    context.clearRect(0, 0, canvasSize, canvasSize);
    context.beginPath();
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvasSize, canvasSize);
}
function getInnerSpacing() {
    if (spacingSlider == null)
        return 200;
    return Number(spacingSlider.value);
}
spacingSlider.addEventListener('input', function (event) {
    if (spacingValueShow)
        spacingValueShow.value = "" + getInnerSpacing();
    else
        console.log("no textfield found");
    drawImageToCanvases();
});
function getImageZoom() {
    if (!imageZoomSlider)
        return 600;
    return Number(imageZoomSlider.value);
}
imageZoomSlider.addEventListener('input', function (event) {
    drawImageToCanvases();
});
function getImagePosition() {
    if (!imagePosSlider)
        return 0;
    return Number(imagePosSlider.value);
}
imagePosSlider.addEventListener('input', function (event) {
    drawImageToCanvases();
});

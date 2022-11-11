var canvas;
//get all HTML input elements
var spacingSlider = document.getElementById('spacingSlider');
var spacingValueShow = document.getElementById('spacingValue');
var imageZoomSlider = document.getElementById('imageZoom');
var imageZoomValue = document.getElementById('zoomValue');
var imagePosSlider = document.getElementById('imagePosition');
var imagePosValue = document.getElementById('positionValue');
var sideCountSlider = document.getElementById('sideCount');
var sideCountValue = document.getElementById('sidesValue');
//link slider and number inputs that belong together
linkTwoInputs(spacingSlider, spacingValueShow, true);
linkTwoInputs(imageZoomSlider, imageZoomValue, true);
linkTwoInputs(imagePosSlider, imagePosValue, true);
linkTwoInputs(sideCountSlider, sideCountValue, true);
//stores the image last selected by user
var lastLoadedImages;
window.onload = function () {
    //----- prepare the canvas -----
    if (document.getElementById('mainCanvas') == null) {
        console.error('Can not find canvas!');
        return;
    }
    //get the canvas
    canvas = document.getElementById('mainCanvas');
    //resize the canvas so it fits the whole screen
    setCanvasSizeMax(canvas);
    //paint the canvas black
    var context = canvas.getContext("2d");
    if (!context) {
        console.error("Canvas-context not supported!");
        return;
    }
    //fill the canvas black
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
};
// function that sets the canvas size to fit the whole screen (size is eather screen height or screen width, whatever is *smaller*)
function setCanvasSizeMax(canvas) {
    var container = document.getElementById('canvasBackground');
    var maxSize = Math.min(container.clientWidth, container.clientHeight);
    canvas.width = maxSize;
    canvas.height = maxSize;
}
window.addEventListener('resize', function (event) {
    setCanvasSizeMax(canvas);
    drawImageOnCanvases();
});
//functions to load files selected by the user
var loadedImagesCount;
//onchange-event-listener for the image upload button
function loadImage(event) {
    var inputElement = event.target;
    //check for errors while getting the image
    if (inputElement == null || !inputElement.files) {
        console.error("Error on loading the image!");
        return;
    }
    //delete all loaded images
    lastLoadedImages = new Array();
    loadedImagesCount = 0;
    //read in every image
    var selectedFiles = inputElement.files;
    for (var i = 0; i < selectedFiles.length; i++) {
        var file = selectedFiles.item(i);
        if (!file)
            break;
        var filereader = new FileReader();
        filereader.onload = function (frEvent) {
            if (frEvent.target == null) {
                console.error('Error while loading image!');
                return;
            }
            ;
            var image = new Image();
            image.src = frEvent.target.result;
            //after image has been loaded, check if all selected images where loaded and if so, then draw them
            image.onload = function () {
                lastLoadedImages.push(image);
                loadedImagesCountUp(selectedFiles.length);
            };
        };
        filereader.readAsDataURL(file);
    }
}
//method to draw images only if all images were loaded
function loadedImagesCountUp(imgArraySize) {
    loadedImagesCount++;
    if (loadedImagesCount == imgArraySize)
        drawImageOnCanvases();
}
//function to draw all images in repeating order on the canvas
function drawImageOnCanvases(images) {
    if (images === void 0) { images = lastLoadedImages; }
    var context = canvas.getContext("2d");
    if (context == null)
        return;
    //get the variables
    var innerSpacing = getInnerSpacing(), // size of the polygon in the middle
    outerSpacing = Math.sqrt(2 * Math.pow(canvas.width, 2)), // size of the polygon forming the outer perimeter to clip off images
    imagePositionOffset = getImagePosition(), // value to move the image up and down
    singleCanvasWidth = canvas.width, // width of the canvas for a each image (TODO: needs to be updated to side count)
    singleCanvasHeight = canvas.height / 2 - innerSpacing / 2, // height of the canvas for each image
    imageScale = getImageScale(), // scale of the image (100% = 1.0)
    totalCanvasSize = canvas.width, // width and height of the real canvas/HTML canvas element
    sideAmount = getSideCount(), //stores how many sides the polygon has
    angle = (2 * Math.PI / sideAmount); //angle by which each image has to be rotated
    // coords forming a trapez that clips each image; subtracting PI/2 because it has to start at the top of the circle and not on the right
    var innerClippingPointLeft = getPointOnCircle(innerSpacing, -angle / 2 - Math.PI / 2, totalCanvasSize / 2), innerClippingPointRight = getPointOnCircle(innerSpacing, +angle / 2 - Math.PI / 2, totalCanvasSize / 2), outerClippingPointLeft = getPointOnCircle(outerSpacing, -angle / 2 - Math.PI / 2, totalCanvasSize / 2), outerClippingPointRight = getPointOnCircle(outerSpacing, +angle / 2 - Math.PI / 2, totalCanvasSize / 2);
    //clear the canvas
    resetCanvasContext(context, totalCanvasSize);
    //draw the images
    for (var i = 0; i < sideAmount; i++) {
        //get the variables for each loop walkthrough
        var image = getNextImage(lastLoadedImages, i), scaledImageWidth = image.width * imageScale, scaledImageHeight = image.height * imageScale;
        //start drawing
        context.save();
        //rotate around center
        context.translate(totalCanvasSize / 2, totalCanvasSize / 2);
        context.rotate(i * angle);
        context.translate(-totalCanvasSize / 2, -totalCanvasSize / 2);
        //create the clipping mask
        var clipMask = new Path2D();
        clipMask.moveTo(innerClippingPointLeft[0], innerClippingPointLeft[1]);
        clipMask.lineTo(outerClippingPointLeft[0], outerClippingPointLeft[1]);
        clipMask.lineTo(outerClippingPointRight[0], outerClippingPointRight[1]);
        clipMask.lineTo(innerClippingPointRight[0], innerClippingPointRight[1]);
        clipMask.lineTo(innerClippingPointLeft[0], innerClippingPointLeft[1]);
        clipMask.closePath();
        context.clip(clipMask);
        //move outwards
        context.translate(0, singleCanvasHeight / 2 - scaledImageHeight / 2);
        //draw the image
        context.drawImage(image, singleCanvasWidth / 2 - scaledImageWidth / 2, singleCanvasHeight / 2 - scaledImageHeight / 2 + imagePositionOffset, scaledImageWidth, scaledImageHeight);
        //end drawing
        context.restore();
    }
}
//calculate the position on a circle with a given radius by an angle
function getPointOnCircle(r, theta, centerCoord) {
    var x = centerCoord + r * Math.cos(theta), y = centerCoord + r * Math.sin(theta);
    return [x, y];
}
//imagine the image array as a ring and get the image at a given index
function getNextImage(images, index) {
    var ringIndex = index % images.length;
    return images[ringIndex];
}
//clear the canvas
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
function getImageScale() {
    if (!imageZoomSlider)
        return 100;
    return Number(imageZoomSlider.value) / 100;
}
function getImagePosition() {
    if (!imagePosSlider)
        return 0;
    return Number(imagePosSlider.value);
}
function getSideCount() {
    if (!sideCountSlider)
        return 4;
    return Number(sideCountSlider.value);
}
function linkTwoInputs(input1, input2, drawImagesOnUpdate) {
    //synchronize values
    input2.value = input1.value;
    // oninput for first element
    input1.addEventListener('input', function (event) {
        input2.value = input1.value;
        if (drawImagesOnUpdate)
            drawImageOnCanvases();
    });
    // oninput for second element
    input2.addEventListener('input', function (event) {
        input1.value = input2.value;
        if (drawImagesOnUpdate)
            drawImageOnCanvases();
    });
}
function storeSettings() {
    // load the data which is to be stored
    var imgPosition = getImagePosition(), imgScale = getImageScale() * 100, innerSpacing = getInnerSpacing(), sides = getSideCount();
    // build the string
    var text = buildKeyValueString(imgPosition, imgScale, innerSpacing, sides);
    // store it
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(new Blob([text], { type: 'text/html' }));
    link.download = "pyramid hologram settings.txt";
    link.click();
}
function buildKeyValueString(pos, scale, square, sides) {
    var text = "";
    var variables = {
        "position": pos,
        "scale": scale,
        "square": square,
        "sides": sides
    };
    for (var property in variables) {
        text += property + ':' + variables[property] + ';';
    }
    return text;
}
function loadSettings(event) {
    var file = event.target.files[0];
    if (!file)
        return;
    var reader = new FileReader();
    reader.onload = function () {
        var results = reader.result;
        console.log(results);
        if (!results)
            return;
        console.log(results);
        var pairs = results.split(';');
        pairs.pop();
        var variables = {};
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            var keyvalue = pair.split(':');
            variables[keyvalue[0]] = keyvalue[1];
        }
        if (!containsAllSettingsProps(variables))
            return;
        // set the values
        spacingValueShow.value = String(variables['square']);
        imageZoomValue.value = String(variables['scale']);
        imagePosValue.value = String(variables['position']);
        sideCountValue.value = String(variables['sides']);
        // ...and trigger the events
        var inputEvent = new Event('input');
        spacingValueShow.dispatchEvent(inputEvent);
        imageZoomValue.dispatchEvent(inputEvent);
        imagePosValue.dispatchEvent(inputEvent);
        sideCountValue.dispatchEvent(inputEvent);
        // reset the settings file input to load the next file even when it is the same file
        var target = event.target, name = target.value.split('\\').pop(), element = document.getElementById('settingsLabel');
        target.value = '';
        element.value = "Last loaded \"".concat(name, "\"");
        element.style.width = element.value.length + 'ch';
    };
    reader.readAsText(file, 'utf-8');
}
function containsAllSettingsProps(values) {
    return 'position' in values && 'scale' in values && 'square' in values && 'sides' in values;
}

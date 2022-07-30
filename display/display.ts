let canvas:HTMLCanvasElement;

//get all HTML input elements
const spacingSlider:HTMLInputElement = document.getElementById('spacingSlider') as HTMLInputElement;
const spacingValueShow:HTMLInputElement = document.getElementById('spacingValue') as HTMLInputElement;
const imageZoomSlider:HTMLInputElement = document.getElementById('imageZoom') as HTMLInputElement;
const imageZoomValue:HTMLInputElement = document.getElementById('zoomValue') as HTMLInputElement;
const imagePosSlider:HTMLInputElement = document.getElementById('imagePosition') as HTMLInputElement;
const imagePosValue:HTMLInputElement = document.getElementById('positionValue') as HTMLInputElement;
const sideCountSlider:HTMLInputElement = document.getElementById('sideCount') as HTMLInputElement;
const sideCountValue:HTMLInputElement = document.getElementById('sidesValue') as HTMLInputElement;

//link slider and number inputs that belong together
linkTwoInputs(spacingSlider, spacingValueShow, true);
linkTwoInputs(imageZoomSlider, imageZoomValue, true);
linkTwoInputs(imagePosSlider, imagePosValue, true);
linkTwoInputs(sideCountSlider, sideCountValue, true);

//stores the image last selected by user
let lastLoadedImage:HTMLImageElement = new Image();

window.onload = function() {
    //----- prepare the canvas -----
    if(document.getElementById('mainCanvas') == null) {
        console.error('Can not find canvas!');
        return;
    }

    //get the canvas
    canvas = document.getElementById('mainCanvas') as HTMLCanvasElement;

    //resize the canvas so it fits the whole screen
    setCanvasSizeMax(canvas);

    //paint the canvas black
    let context:CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
    if(!context) {
        console.error("Canvas-context not supported!");
        return;
    }

    //fill the canvas black
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

// function that sets the canvas size to fit the whole screen (size is eather screen height or screen width, whatever is *smaller*)
function setCanvasSizeMax(canvas:HTMLCanvasElement) {
    let container:HTMLDivElement = document.getElementById('canvasBackground') as HTMLDivElement;
    let maxSize:number = Math.min(container.clientWidth, container.clientHeight);    

    canvas.width = maxSize;
    canvas.height = maxSize;
}

window.addEventListener('resize', function(event) {
    setCanvasSizeMax(canvas);
    drawImageOnCanvases();
})

//onchange-event-listener for the image upload button
function loadImage(event:Event) {    
    let inputElement = event.target as HTMLInputElement;

    //check for errors while getting the image
    if(inputElement == null || !inputElement.files) {
        console.error("Error on loading the image!");
        return;
    }

    //load the image
    const file = inputElement.files[0];
    
    const filereader = new FileReader();
    filereader.onload = function(frEvent) {
        if(frEvent.target == null) {
            console.error('Error while loading image!');
            return;
        };

        let image:HTMLImageElement = new Image();
        image.src = frEvent.target.result as string;
        
        image.onload = function(imageEvent) {
            drawImageOnCanvases(image);
        };

        lastLoadedImage = image;
    }

    filereader.readAsDataURL(file);    
}

function drawImageOnCanvases(image:HTMLImageElement = lastLoadedImage) {
    const context = canvas.getContext("2d");

    if(context == null) return;

    //get the variables
    const innerSpacing = getInnerSpacing(), // size of the polygon in the middle
        outerSpacing = Math.sqrt(2 * Math.pow(canvas.width, 2)), // size of the polygon forming the outer perimeter to clip off images
        imagePositionOffset = getImagePosition(), // value to move the image up and down
        singleCanvasWidth = canvas.width, // width of the canvas for a each image (TODO: needs to be updated to side count)
        singleCanvasHeight = canvas.height/2 - innerSpacing/2, // height of the canvas for each image
        imageSize = getImageZoom(), // width and height of a single image (TODO: replace with multiplication of w and h of image with a factor)
        totalCanvasSize = canvas.width, // width and height of the real canvas/HTML canvas element
        sideAmount = getSideCount(), //stores how many sides the polygon has
        angle = (2* Math.PI / sideAmount); //angle by which each image has to be rotated

    // coords forming a trapez that clips each image; subtracting PI/2 because it has to start at the top of the circle and not on the right
    const innerClippingPointLeft:number[] = getPointOnCircle(innerSpacing, -angle/2 - Math.PI/2, totalCanvasSize/2),
        innerClippingPointRight:number[] = getPointOnCircle(innerSpacing, +angle/2 - Math.PI/2, totalCanvasSize/2),
        outerClippingPointLeft:number[] = getPointOnCircle(outerSpacing, -angle/2 - Math.PI/2, totalCanvasSize/2),
        outerClippingPointRight:number[] = getPointOnCircle(outerSpacing, +angle/2 - Math.PI/2, totalCanvasSize/2);   

    //clear the canvas
    resetCanvasContext(context, totalCanvasSize);

    //draw the images
    for(let i = 0; i < sideAmount; i++) {
        //start drawing
        context.save();

        //rotate around center
        context.translate(totalCanvasSize/2, totalCanvasSize/2);
        context.rotate(i*angle);
        context.translate(-totalCanvasSize/2, -totalCanvasSize/2);

        //create the clipping mask
        const clipMask = new Path2D();
        clipMask.moveTo(innerClippingPointLeft[0], innerClippingPointLeft[1]);
        clipMask.lineTo(outerClippingPointLeft[0], outerClippingPointLeft[1]);
        clipMask.lineTo(outerClippingPointRight[0], outerClippingPointRight[1]);
        clipMask.lineTo(innerClippingPointRight[0], innerClippingPointRight[1]);
        clipMask.lineTo(innerClippingPointLeft[0], innerClippingPointLeft[1]);
        clipMask.closePath();
        context.clip(clipMask);

        //move outwards
        context.translate(0, singleCanvasHeight/2 - imageSize/2);

        //draw the image
        context.drawImage(image, singleCanvasWidth/2-imageSize/2, singleCanvasHeight/2-imageSize/2 + imagePositionOffset, imageSize, imageSize);

        //end drawing
        context.restore();
    }
}

function getPointOnCircle(r:number, theta:number, centerCoord:number):number[] {
    let x:number = centerCoord + r * Math.cos(theta),
        y:number = centerCoord + r * Math.sin(theta);

    return [x, y];
}

function resetCanvasContext(context:CanvasRenderingContext2D, canvasSize:number):void {
    context.clearRect(0, 0, canvasSize, canvasSize);
    context.beginPath();
    context.fillStyle = "#000000";
    context.fillRect(0,0,canvasSize, canvasSize);
}

function getInnerSpacing():number {
    if(spacingSlider == null) return 200;

    return Number(spacingSlider.value);
}

function getImageZoom():number {
    if(!imageZoomSlider)
        return 600;

    return Number(imageZoomSlider.value);
}

function getImagePosition():number {
    if(!imagePosSlider)
        return 0;

    return Number(imagePosSlider.value);
}

function getSideCount():number {
    if(!sideCountSlider)
        return 4;

    return Number(sideCountSlider.value);
}

function linkTwoInputs(input1:HTMLInputElement, input2:HTMLInputElement, drawImagesOnUpdate:boolean):void {
    //synchronize values
    input2.value = input1.value;

    // oninput for first element
    input1.addEventListener('input', function(event) {
        input2.value = input1.value;

        if(drawImagesOnUpdate) drawImageOnCanvases();
    });

    // oninput for second element
    input2.addEventListener('input', function(event) {
        input1.value = input2.value;

        if(drawImagesOnUpdate) drawImageOnCanvases();
    });
}
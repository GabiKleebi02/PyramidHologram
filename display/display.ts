let canvas:HTMLCanvasElement;

//get all HTML input elements
const spacingSlider: HTMLInputElement = document.getElementById('spacingSlider') as HTMLInputElement;
const spacingValueShow: HTMLInputElement = document.getElementById('spacingValue') as HTMLInputElement;
const imageZoomSlider: HTMLInputElement = document.getElementById('imageZoom') as HTMLInputElement;
const imageZoomValue: HTMLInputElement = document.getElementById('zoomValue') as HTMLInputElement;
const imagePosSlider: HTMLInputElement = document.getElementById('imagePosition') as HTMLInputElement;
const imagePosValue: HTMLInputElement = document.getElementById('positionValue') as HTMLInputElement;
const sideCountSlider: HTMLInputElement = document.getElementById('sideCount') as HTMLInputElement;
const sideCountValue: HTMLInputElement = document.getElementById('sidesValue') as HTMLInputElement;

//link slider and number inputs that belong together
linkTwoInputs(spacingSlider, spacingValueShow, true);
linkTwoInputs(imageZoomSlider, imageZoomValue, true);
linkTwoInputs(imagePosSlider, imagePosValue, true);
linkTwoInputs(sideCountSlider, sideCountValue, true);

//stores the image last selected by user
let lastLoadedImages: HTMLImageElement[];

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
    let context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
    if(!context) {
        console.error("Canvas-context not supported!");
        return;
    }

    //fill the canvas black
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

// function that sets the canvas size to fit the whole screen (size is eather screen height or screen width, whatever is *smaller*)
function setCanvasSizeMax(canvas: HTMLCanvasElement) {
    let container: HTMLDivElement = document.getElementById('canvasBackground') as HTMLDivElement;
    let maxSize: number = Math.min(container.clientWidth, container.clientHeight);    

    canvas.width = maxSize;
    canvas.height = maxSize;
}

window.addEventListener('resize', function(event) {
    setCanvasSizeMax(canvas);
    drawImageOnCanvases();
})

//functions to load files selected by the user
let loadedImagesCount: number;

//onchange-event-listener for the image upload button
function loadImage(event: Event) {    
    let inputElement = event.target as HTMLInputElement;

    //check for errors while getting the image
    if(inputElement == null || !inputElement.files) {
        console.error("Error on loading the image!");
        return;
    }

    //delete all loaded images
    lastLoadedImages = new Array() as HTMLImageElement[];
    loadedImagesCount = 0;
    
    //read in every image
    const selectedFiles: FileList = inputElement.files;

    for(let i = 0; i < selectedFiles.length; i++) {
        let file = selectedFiles.item(i);

        if(!file)
            break;

        const filereader = new FileReader();
        filereader.onload = function(frEvent) {
            if(frEvent.target == null) {
                console.error('Error while loading image!');
                return;
            };

            let image: HTMLImageElement = new Image();
            image.src = frEvent.target.result as string;
            
            //after image has been loaded, check if all selected images where loaded and if so, then draw them
            image.onload = function() {
                lastLoadedImages.push(image);
                loadedImagesCountUp(selectedFiles.length);
            }
        }
        
        filereader.readAsDataURL(file);
    }
}

//method to draw images only if all images were loaded
function loadedImagesCountUp(imgArraySize: number) {    
    loadedImagesCount++;

    if(loadedImagesCount == imgArraySize)
        drawImageOnCanvases();
}

//function to draw all images in repeating order on the canvas
function drawImageOnCanvases(images: HTMLImageElement[] = lastLoadedImages) {
    const context = canvas.getContext("2d");

    if(context == null) return;

    //get the variables
    const innerSpacing: number = getInnerSpacing(), // size of the polygon in the middle
        outerSpacing: number = Math.sqrt(2 * Math.pow(canvas.width, 2)), // size of the polygon forming the outer perimeter to clip off images
        imagePositionOffset: number = getImagePosition(), // value to move the image up and down
        singleCanvasWidth: number = canvas.width, // width of the canvas for a each image (TODO: needs to be updated to side count)
        singleCanvasHeight: number = canvas.height/2 - innerSpacing/2, // height of the canvas for each image
        imageScale: number = getImageScale(), // scale of the image (100% = 1.0)
        totalCanvasSize: number = canvas.width, // width and height of the real canvas/HTML canvas element
        sideAmount: number = getSideCount(), //stores how many sides the polygon has
        angle: number = (2* Math.PI / sideAmount); //angle by which each image has to be rotated

    // coords forming a trapez that clips each image; subtracting PI/2 because it has to start at the top of the circle and not on the right
    const innerClippingPointLeft: number[] = getPointOnCircle(innerSpacing, -angle/2 - Math.PI/2, totalCanvasSize/2),
        innerClippingPointRight: number[] = getPointOnCircle(innerSpacing, +angle/2 - Math.PI/2, totalCanvasSize/2),
        outerClippingPointLeft: number[] = getPointOnCircle(outerSpacing, -angle/2 - Math.PI/2, totalCanvasSize/2),
        outerClippingPointRight: number[] = getPointOnCircle(outerSpacing, +angle/2 - Math.PI/2, totalCanvasSize/2);   

    //clear the canvas
    resetCanvasContext(context, totalCanvasSize);

    //draw the images
    for(let i = 0; i < sideAmount; i++) {
        //get the variables for each loop walkthrough
        const image: HTMLImageElement = getNextImage(lastLoadedImages, i),
            scaledImageWidth: number = image.width * imageScale,
            scaledImageHeight: number = image.height * imageScale;

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
        context.translate(0, singleCanvasHeight/2 - scaledImageHeight/2);

        //draw the image
        context.drawImage(image, singleCanvasWidth/2-scaledImageWidth/2, singleCanvasHeight/2-scaledImageHeight/2 + imagePositionOffset, scaledImageWidth, scaledImageHeight);

        //end drawing
        context.restore();
    }
}

//calculate the position on a circle with a given radius by an angle
function getPointOnCircle(r: number, theta: number, centerCoord: number): number[] {
    let x: number = centerCoord + r * Math.cos(theta),
        y: number = centerCoord + r * Math.sin(theta);

    return [x, y];
}

//imagine the image array as a ring and get the image at a given index
function getNextImage(images: HTMLImageElement[], index: number): HTMLImageElement {
    const ringIndex: number = index % images.length;

    return images[ringIndex];
}

//clear the canvas
function resetCanvasContext(context: CanvasRenderingContext2D, canvasSize: number): void {
    context.clearRect(0, 0, canvasSize, canvasSize);
    context.beginPath();
    context.fillStyle = "#000000";
    context.fillRect(0,0,canvasSize, canvasSize);
}

function getInnerSpacing(): number {
    if(spacingSlider == null) return 200;

    return Number(spacingSlider.value);
}

function getImageScale(): number {
    if(!imageZoomSlider)
        return 100;

    return Number(imageZoomSlider.value) / 100;
}

function getImagePosition(): number {
    if(!imagePosSlider)
        return 0;

    return Number(imagePosSlider.value);
}

function getSideCount(): number {
    if(!sideCountSlider)
        return 4;

    return Number(sideCountSlider.value);
}

function linkTwoInputs(input1: HTMLInputElement, input2: HTMLInputElement, drawImagesOnUpdate: boolean): void {
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

type Settings = {
    position: number;
    scale: number;
    square: number;
    sides: number;
}

function storeSettings(): void {
    // load the data which is to be stored
    const imgPosition: number = getImagePosition(),
        imgScale: number = getImageScale() * 100,
        innerSpacing: number = getInnerSpacing(),
        sides: number = getSideCount();
    
    // build the string
    const text: string = buildKeyValueString(imgPosition, imgScale, innerSpacing, sides);

    // store it
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(new Blob([text], {type: 'text/html'}));
    link.download = "pyramid hologram settings.txt";
    link.click();
}

function buildKeyValueString(pos, scale, square, sides): string {
    let text = "";
    const variables: Settings = {
        "position": pos,
        "scale": scale,
        "square": square,
        "sides": sides
    };

    for(const property in variables) {
        text += property + ':' + variables[property] + ';';
    }

    return text;
}

function loadSettings(event: Event): void {
    const file = (<HTMLInputElement> event.target).files[0];

    if(!file)
        return;

    const reader = new FileReader();
    reader.onload = function() {
        const results = reader.result as String;

        console.log(results);

        if(!results)
            return;

        console.log(results);
        
        const pairs = results.split(';');
        pairs.pop();

        let variables = {};

        for(let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            const keyvalue = pair.split(':');

            variables[keyvalue[0]] = keyvalue[1];
        }

        if(!containsAllSettingsProps(variables))
            return;
        
        // set the values
        spacingValueShow.value = String(variables['square']);
        imageZoomValue.value = String(variables['scale']);
        imagePosValue.value = String(variables['position']);
        sideCountValue.value = String(variables['sides']);
        // ...and trigger the events
        const inputEvent = new Event('input');
        spacingValueShow.dispatchEvent(inputEvent);
        imageZoomValue.dispatchEvent(inputEvent);
        imagePosValue.dispatchEvent(inputEvent);
        sideCountValue.dispatchEvent(inputEvent);

        // reset the settings file input to load the next file even when it is the same file
        const target = <HTMLInputElement> event.target,
            name = target.value.split('\\').pop(),
            element = document.getElementById('settingsLabel') as HTMLInputElement;
        
        target.value = '';
        element.value = `Last loaded "${name}"`;
        element.style.width = element.value.length + 'ch';

    }

    reader.readAsText(file, 'utf-8');


}

function containsAllSettingsProps(values: any): values is Settings {
    return 'position' in values && 'scale' in values && 'square' in values && 'sides' in values;
}
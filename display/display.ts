let canvases:HTMLCanvasElement[] = []

window.onload = function() {
    //add canvases to canvases-array in mathmaticaly positiv direction of rotation (clockwise) and then middleCanvas
    canvases.push(document.getElementById('topCanvas') as HTMLCanvasElement);
    canvases.push(document.getElementById('rightCanvas') as HTMLCanvasElement);
    canvases.push(document.getElementById('bottomCanvas') as HTMLCanvasElement);
    canvases.push(document.getElementById('leftCanvas') as HTMLCanvasElement);
    canvases.push(document.getElementById('middleCanvas') as HTMLCanvasElement)

    //paint all canvases black
    canvases.forEach((canvas) => {

        //try to load context
        let context = canvas.getContext("2d");
        if(!context) {
            console.error("Canvas-context not supported!");
            return;
        }

        //fill the current canvas black
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);
    });

    //from now on we will work with only the four outer canvases
    canvases.pop();
}

//onchange-event-listener for the image upload button
function loadImage(event:Event) {    
    let inputElement = event.target as HTMLInputElement;

    //check for errors while getting the image
    if(inputElement == null || !inputElement.files) {
        console.error("Error on loading the image!");
        return;
    }

    //load the image
    let file = inputElement.files[0];
    
    let filereader = new FileReader();
    filereader.onload = function(frEvent) {
        if(frEvent.target == null) {
            console.error('Error while loading image!');
            return;
        };

        let image = new Image();
        image.src = frEvent.target.result as string;
        
        image.onload = function(imageEvent) {
            drawImageToCanvases(image);
        };
    }

    filereader.readAsDataURL(file);    
}

function drawImageToCanvases(image:HTMLImageElement) {
    //draw the image on each canvas
    canvases.forEach((canvas, index) => {
        //try to load context
        let context = canvas.getContext("2d");
        if(!context) {
            console.error("Canvas-context not supported!");
            return;
        }

        //calculate the rotation angle
        let rotationAngle = (index * Math.PI) / 2;

        //set width and height
        let width = canvas.width, height = canvas.height;
        console.log(width);
        console.log(height);
        console.log();
        
        
        
        //rotate and then draw the image
        context.translate(canvas.width/2, canvas.height/2);
        context.rotate(rotationAngle);
        context.translate(-canvas.width/2, -canvas.height/2);

        context.drawImage(image, 0, 0, width, height);
    });
}
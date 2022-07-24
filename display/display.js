var canvases = [];
window.onload = function () {
    //add canvases to canvases-array in mathmaticaly positiv direction of rotation (clockwise) and then middleCanvas
    canvases.push(document.getElementById('topCanvas'));
    canvases.push(document.getElementById('rightCanvas'));
    canvases.push(document.getElementById('bottomCanvas'));
    canvases.push(document.getElementById('leftCanvas'));
    canvases.push(document.getElementById('middleCanvas'));
    //paint all canvases black
    canvases.forEach(function (canvas) {
        //try to load context
        var context = canvas.getContext("2d");
        if (!context) {
            console.error("Canvas-context not supported!");
            return;
        }
        //fill the current canvas black
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);
    });
    //from now on we will work with only the four outer canvases
    canvases.pop();
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
    };
    filereader.readAsDataURL(file);
}
function drawImageToCanvases(image) {
    //draw the image on each canvas
    canvases.forEach(function (canvas, index) {
        //try to load context
        var context = canvas.getContext("2d");
        if (!context) {
            console.error("Canvas-context not supported!");
            return;
        }
        //calculate the rotation angle
        var rotationAngle = (index * Math.PI) / 2;
        //set width and height
        var width = canvas.width, height = canvas.height;
        console.log(width);
        console.log(height);
        console.log();
        //rotate and then draw the image
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(rotationAngle);
        context.translate(-canvas.width / 2, -canvas.height / 2);
        context.drawImage(image, 0, 0, width, height);
    });
}

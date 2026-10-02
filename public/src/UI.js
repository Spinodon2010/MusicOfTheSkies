

// initializing canvas
const canvas = document.getElementById("RenderingScreen");
canvas.style.outline = "none";
// const canvasWidth = canvas.width;
// const canvasHeight = canvas.height;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = "absolute";

// UI class structure
class UI {
    repositionCanvas() {
        // canvas.style.left = 0.5*(window.innerWidth - canvasWidth) + "px";
        // canvas.style.top = 0.5*(window.innerHeight - canvasHeight) + "px";
        canvas.style.left = 0 + "px";
        canvas.style.top = -window.innerHeight / 10 + "px";
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

let MainUI = new UI();
MainUI.repositionCanvas();






// now for the transitions and stuff

// title animations

let titleGoalRot = [0, 0, 0];
let titleCurrentRot = [0, 0, 0];
let titleSmoothSpeed = 0.01;


// lerp alg
function lerp(a, b, t) {
    return a + (b - a) * t;
}

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

window.addEventListener("mousemove", (e) => {
    // loop
    if (e.clientX && e.clientY)
    mouseX = e.clientX;
    mouseY = e.clientY;
})

setInterval(() => {
    // other loop
    let title = document.getElementById("mainHeader");
    title.style.top = window.innerHeight - 300 + "px";
    let strength = 1/500
    titleCurrentRot = [
        lerp(titleCurrentRot[0], -mouseY*strength*3 + strength*3 * window.innerHeight /2, titleSmoothSpeed), 
        lerp(titleCurrentRot[1], mouseX * strength - strength * window.innerWidth / 2 , titleSmoothSpeed), 
        0,//lerp(titleCurrentRot[2], e.clientY * strength, titleSmoothSpeed)
    ]
    title.style.transform = "perspective(600px) rotateX(" + titleCurrentRot[0] +"deg) rotateY(" + titleCurrentRot[1] +"deg) rotateZ(" + titleCurrentRot[2] +"deg)";
    /* SYNTAX transform: perspective(600px) rotateY(-90deg); */
}, 10)
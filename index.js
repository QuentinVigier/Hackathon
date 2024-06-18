let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let captureButton = document.getElementById('capture');
let predictionsElement = document.getElementById('predictions');

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', setupCamera);



async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
        video.play();
    };
}

async function getConnectedDevices(type) {
    const devices = await navigator.mediaDevices.enumerateDevices();

    // this filters the device that we are connected. 
    return devices.filter(device => device.kind === type);
   
}

const videoCameras = getConnectedDevices('videoinput');
console.log('Cameras found:', videoCameras);

//Chargement du modele COCO-SSD
let model;
async function loadModel() {
    model = await cocoSsd.load();
    console.log("Modèle COCO-SSD chargé.");
}
loadModel();

//Léa:  Capture d'image
captureButton.addEventListener('click', () => {
   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.style.display = 'block';
    detectObjects();
});

// Dectection objet
async function detectObjects() {
    const predictions = await model.detect(canvas);
    predictionsElement.innerHTML = '';
    predictions.forEach((prediction) => {
        // Pour chaque prediction, je commence un nouveau tracé
        ctx.beginPath();
        ctx.rect(...prediction.bbox)
        ctx.lineWidth = 2;
        ctx.strokeStyle ='red';
        ctx.fillStyle ='red';
        ctx.stroke();
        ctx.fillText(
            `${prediction.class}`, prediction.bbox[0], prediction.bbox[1]);    
})
}



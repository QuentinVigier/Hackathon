let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let captureButton = document.getElementById('capture');
let predictionsElement = document.getElementById('predictions');

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', setupCamera);
const results = document.getElementById('results'); 
let selectedDevice = '';

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedDevice.deviceId ? { exact: selectedDevice } : true } });
    
    console.log('selectedDevice', selectedDevice);
    
    video.srcObject = stream;
    video.onloadedmetadata = () => {
        video.play();
    };
}

//SWITCH DU MODE JOUR/NUIT AU CHANGEMENT DU TOGGLE

document.addEventListener('DOMContentLoaded', () => {
    const modeSwitch = document.getElementById('mode-switch');
    const body = document.body;

    modeSwitch.addEventListener('change', () => {
        if (modeSwitch.checked) {
            body.classList.remove('day-mode');
            body.classList.add('night-mode');
        } else {
            body.classList.remove('night-mode');
            body.classList.add('day-mode');
        }
    });
});


async function getConnectedDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();

 
    let cameraList="<div id='camSelect'><select id='camList'>"
    devices.forEach(device => {
        cameraList+=`<option value='${device.label}'>${device.label}</option>`
    });
    cameraList += "</select></div>";
   
    let span = document.createElement('span');
    span.innerHTML = cameraList;
   
    results.appendChild(span);
    span.addEventListener('change', async() => {
        let camType = await document.getElementById('camList').value

            console.log('camType ', camType);
        const deviceConnected = devices.filter(device => device.label === camType);
        selectedDevice = deviceConnected;
        console.log('deviceConnected', deviceConnected);
        setupCamera();
        
    })
    
}

const videoCameras = getConnectedDevices();
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




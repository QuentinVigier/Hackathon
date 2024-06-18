let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let captureButton = document.getElementById('capture');


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

//Léa:  Capture d'image
captureButton.addEventListener('click', () => {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.style.display = 'block';
    detectObjects();
});
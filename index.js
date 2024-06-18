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


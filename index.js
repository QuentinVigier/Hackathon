const startButton = document.getElementById('startButton');
startButton.addEventListener('click', setupCamera);



async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

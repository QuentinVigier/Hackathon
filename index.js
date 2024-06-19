let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let captureButton = document.getElementById('capture');
let predictionsElement = document.getElementById('predictions');
let filterResult = document.getElementById("filterResult");
const objClassDiv = document.getElementById('objClass');

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', setupCamera);
const results = document.getElementById('results'); 
let selectedDevice = '';

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedDevice.deviceId ? { exact: selectedDevice } : undefined } });
        
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

 console.log('devices',devices);
 
    let cameraList = "<div id='camSelect'><select id='camList'><option></<option>";
    devices.forEach(device => {
      
        if (device.deviceId !== '') {
             cameraList+=`<option value='${device.label}'>${device.label}</option>`

        }
           
    });
    cameraList += "</select></div>";
   
    let span = document.createElement('span');
    span.innerHTML = cameraList;
   
    results.appendChild(span);
    span.addEventListener('change', async() => {
        let camType = await document.getElementById('camList').value

        const deviceConnected = devices.filter(device => device.label === camType);
        selectedDevice = deviceConnected;        
    })
    
}

const videoCameras = getConnectedDevices();


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
        let img = canvas.toDataURL('image/png');
        console.log('img', canvas.toDataURL('image/png'));
        
        saveData(img,prediction);
    })
   

}

// FILTRAGE PAR DIFFERENT CLASS D'OBJET

const objClassList = ["Person", "Voiture", "Maison", "Arbes", "Animal", "Avoin", "Bateau", "Cell phone", "Ordinateur"];
let htmlObjClass = ``;


//Creating checkbox with different filter class
objClassList.forEach(list => {
    htmlObjClass += `<input type="checkbox" id="${list}" name="${list}" value="${list}">
<label for="${list}"> ${list}</label><br>`;
});
objClassDiv.innerHTML += htmlObjClass;


let selectedFilter = document.getElementById('objClass');
let filters = [];

selectedFilter.addEventListener('change', (e) => {
    //filters contain the list of all the check box selected by the user 
    filters.push(e.target.value);
     // for all the filters selected, check the predictions for the selected filters availability.
    filters.forEach(filter => {
        filter = filter.toLowerCase();
        // here our DB name is predictionDB and we are opening the connection to the DB
        let connection = window.indexedDB.open("predictionDB", 3);
        connection.onerror = function (e) {
            console.log('theres error ', e);
          };
        connection.onsuccess = function (e) {
            filterResult.innerHTML = '';
                const db = e.target.result;
                const transaction = db.transaction(['predictionTable'], 'readonly');
                const objectStore = transaction.objectStore('predictionTable');
                const getAll =  objectStore.getAll();
               
            getAll.onsuccess = function (evt) {
                  //Here our datas contain all the predictionTable data
                const datas = evt.target.result;               
                if (datas) {             
                    let filterDiv = ``;
                    let firstInCap = filter.charAt(0).toUpperCase() + filter.slice(1);
                    const idFiltre = document.getElementById(firstInCap);
                        for (let index = 0; index < datas.length; index++) {
                           if (datas[index][1].predictions.class === filter.toLowerCase() && idFiltre.checked) {
                                filterDiv += `<div id='result'><img id='filtreImg' src='${datas[index][0].imgDB}'/></div>`;             
                            } 
                                                       
                        }
                    if (filterDiv == '') {
                        filterDiv += '<p>your searched items is not available in DB</p>';
                    }
                    filterResult.innerHTML = filterDiv;
                    } 
                }
            }
    });
});



// INDEX DB saving data
async function saveData(img,pre) {
    let prediction = pre;
    let imgDB = img;
  
    let connection = window.indexedDB.open("predictionDB", 3);
    connection.onerror = function (e) {
        console.log('theres error ', e);
      };
      connection.onsuccess = function (e) {
          const db = e.target.result;
          let predictionToSave = [
              { imgDB: imgDB },
              {predictions: prediction}          
          ]
          //first of all open the transaction and object store of the DB
          const transaction = db.transaction(['predictionTable'], 'readwrite');
          const objectStore = transaction.objectStore('predictionTable');
          //if successful opening of the DB 
          objectStore.transaction.oncomplete = (e) => {
              // Store values in the DB already present 
              const predictionObjectStore = db
                .transaction("predictionTable", "readwrite")
                .objectStore("predictionTable");
               
              predictionObjectStore.put(predictionToSave); 
            };
    };
    connection.onupgradeneeded = function (e) {
        const db = e.target.result;
      
        //Creation of DB only if it doent exist already. 
        if (!db.objectStoreNames.contains('predictionTable')) {
             db.createObjectStore('predictionTable', { keyPath: 'compteurDb', autoIncrement: true },{imgDB});
            
        }   
        
    };
   
}

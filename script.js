const URL = "./my_model/";
let model, webcam, ctx, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const size = 200;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    /*for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }*/

    console.log(prediction);

        let maxProb=0;
        let maxName ="";

        for (let i = 0; i < maxPredictions; i++) {
            if(prediction[i].probability>maxProb){
                maxProb = prediction[i].probability;
                maxName = prediction[i].className;
            }
        }
        
        const classPrediction =
                maxName + ": " + maxProb.toFixed(2);
            labelContainer.childNodes[0].innerHTML = classPrediction;
            
        if (maxName=="cima"){
            acao.innerHTML = "levantar cama";
            
        }else if(maxName=="esquerda"){
            acao.innerHTML = "ir ao banheiro";
            
        }else if(maxName=="direita"){
            acao.innerHTML = "deitar cama";
            
        }else if(maxName=="baxio"){
            acao.innerHTML = "deitar cama";
            
        }else if(maxName=="none"){
            acao.innerHTML = "sem ação";
            
        }    
            //acao.innerHTML = "levantar cama";
            //acao.innerHTML = "deitar cama";
            //acao.innerHTML = "comer";
            //acao.innerHTML = "ir ao banheiro";
            
            
        

        
    // finally draw the poses
    drawPose(pose);
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}


        
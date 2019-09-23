import React, { useState, useEffect, useRef } from 'react';
import * as posenet from '@tensorflow-models/posenet';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

function App() {

  const [videoReady, setVideoReady] = useState(0);
  const videoEl = useRef(null);
  const [model, setModel] = useState(null);
  const requestAnimationRef = useRef();
  const [leftEar, setLeftEar] = useState(0);
  const [rightEar, setRightEar] = useState(0);

  useEffect(() => { 
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode: 'user'}})
      .then(stream => {
        let video = videoEl.current;
        video.srcObject = stream;
        window.stream = stream;
        video.play();
      });
    };

    posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: 161,
      multiplier: 0.5
    }).then(net => setModel(net));

  }, []);

  useEffect(() => {
    if (videoReady&&model&&videoEl) {

    const poseNetLoop = time => {
      model.estimateSinglePose(videoEl.current).then(results => {
        setLeftEar(results['keypoints'][3]['score']);
        setRightEar(results['keypoints'][4]['score']);
      });
      requestAnimationRef.current = window.requestAnimationFrame(poseNetLoop);
    }

    requestAnimationRef.current = window.requestAnimationFrame(poseNetLoop);
    return () => cancelAnimationFrame(requestAnimationRef.current);
    
    };
    
  }, [videoReady, model]);

  return (
    <div className="App">
      <Container>
        <Col>
        <hr/>
          <h2>Tick, Tock</h2>
          <p>PoseNet Head Shake Detection</p>
        <hr/>
          <video id="videoPlayer" autoPlay muted playsInline ref={videoEl} width={350} onLoadedData={() => setVideoReady(1)} />
          <p>Turn your head, left and right.</p>
          <br/>
          <h3>{leftEar > rightEar ? "tick" : "tock"}</h3>
        <hr/>
        {model ? <p>Using Tensorflow.js pretrained <a href="https://github.com/tensorflow/tfjs-models/">PoseNet model</a></p>: <p>loading model...</p>}
        <a href="https://vndrewlee.com/posts/itp/03_semester/ml4w/03_posenet/">vndrewlee.com</a>
        </Col>
      </Container>
    </div>
  );
}

export default App;
/**
 * entry.js
 * 
 * This is the first file loaded. It sets up the Renderer, 
 * Scene and Camera. It also starts the render loop and 
 * handles window resizes.
 * 
 */

import { WebGLRenderer, Scene, Vector3, PerspectiveCamera, Vector2 } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import Square from './objects/Square.js';
import Triangle from './objects/Triangle.js';
import Circle from './objects/Circle.js';
import music from './music/keshi.mp3';
import './style.css';

var camera;
var analyser;
var dataArray;
var played = false;
var rotate = false;
var zooming = false;
var loaded = false;
var songLabel;
var audio;

function loadFileObject(fileObj, loadedCallback)
{
    var reader = new FileReader();
    reader.onload = loadedCallback;
    reader.readAsDataURL( fileObj );
}

function play(evt) {
  if (played) {
    audio.pause()
  }
  if (evt) {
    audio = new Audio(evt.target.result)
    loaded = true;
    songLabel.textContent = ''
  } else {
    audio = new Audio(music);
  }
  var context = new AudioContext();
  var src = context.createMediaElementSource(audio);
  analyser = context.createAnalyser();
  src.connect(analyser);
  analyser.connect(context.destination);
  var bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  audio.play()
  played = true;
}

var onKeyDown = function(e) {
  if (e.code == 'KeyZ') {
    rotate = true;
  } else if (e.code == 'KeyX' && played) {
    zooming = true;
  }
}

var onKeyUp = function(e) {
  if (e.code == 'KeyZ') {
    rotate = false;
  }
}

const scene = new Scene();
camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({antialias: true});
const square = new Square();
const triangle = new Triangle();
const pentagon = new Circle();

// scene
scene.add(square);
scene.add(triangle);
scene.add(pentagon);
camera.position.set( -150, 30, 130);
scene.add( camera );
camera.lookAt(new Vector3(0,0,0));

// renderer
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 1);

//effect composer
var composer = new EffectComposer( renderer );
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );
const bloomPass = new UnrealBloomPass( new Vector2( window.innerWidth, window.innerHeight ), 3, 0.4, 0.1 );
composer.addPass( bloomPass );

bloomPass.threshold = 0;
bloomPass.strength = 1.3;
bloomPass.radius = 0;

const gui = new GUI()
var params = {
  loadFile : function() { 
    document.getElementById('myInput').click();
  },
};
gui.add(params, 'loadFile').name('Load music file');

// render loop
const onAnimationFrameHandler = (timeStamp) => {
  composer.render();
  if (played) {
    analyser.getByteFrequencyData(dataArray);
    square.update && square.update(dataArray, rotate, timeStamp);
    triangle.update && triangle.update(dataArray, rotate, timeStamp);
    pentagon.update && pentagon.update(dataArray, rotate, timeStamp); 
  }
  if (zooming) {
    if (camera.zoom < 5) {
      camera.zoom += 0.5;
      camera.updateProjectionMatrix();
    } else {
      zooming = false
    }
  } else if (camera.zoom > 1) {
    camera.zoom -= 0.5;
    camera.updateProjectionMatrix();
  }
  if (typeof document.getElementById("myInput").files[0] !== 'undefined' && !loaded) {
    loadFileObject(document.getElementById("myInput").files[0], play)
  }
  window.requestAnimationFrame(onAnimationFrameHandler);
}
window.requestAnimationFrame(onAnimationFrameHandler);

// resize
const windowResizeHanlder = () => { 
  const { innerHeight, innerWidth } = window;
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize( innerWidth, innerHeight );
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
};
windowResizeHanlder();
window.addEventListener('resize', windowResizeHanlder);

// dom
document.body.style.margin = 0;
document.body.appendChild( renderer.domElement );
var element = document.createElement('input')
element.type = 'file'
element.id = 'myInput'
document.documentElement.appendChild( element )
var rotateLabel = document.createElement('rotate')
rotateLabel.id = 'rotate'
rotateLabel.textContent = 'Hold Z to rotate'
document.documentElement.appendChild( rotateLabel )
var zoomLabel = document.createElement('zoom')
zoomLabel.id = 'zoom'
zoomLabel.textContent = 'Press X to zoom'
document.documentElement.appendChild( zoomLabel )
songLabel = document.createElement('song')
songLabel.id = 'song'
songLabel.textContent = 'blue - keshi, Jai Wolf Remix - Jai Wolf'
document.documentElement.appendChild( songLabel )

window.addEventListener('keydown', onKeyDown, false)
window.addEventListener('keyup', onKeyUp, false)

play()
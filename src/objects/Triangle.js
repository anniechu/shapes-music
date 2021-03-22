import { Mesh, Group, BufferGeometry, Vector3, Color } from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline';

var meshes;
const numShapes = 5;

function avg(arr){
  var total = arr.reduce(function(sum, b) { return sum + b; });
  return (total / arr.length);
}

export default class Triangle extends Group {
  constructor() {
    super();

    meshes = []
    for (var i = 1; i < 10; i = i + 2) {
      const points = [];
      points.push( new Vector3( - i*7, -i*4.5, i*6 ) );
      points.push( new Vector3( i*7, -i*4.5, i*6 ) );
      points.push( new Vector3(  0, i*7, i*6 ) );
      points.push( new Vector3( - i*7, -i*4.5, i*6 ) );

      const geometry = new BufferGeometry().setFromPoints( points );
      var g = new MeshLine();
      g.setGeometry( geometry );

      var meshMaterial = new MeshLineMaterial( {
        color: new Color("rgb(215, 71, 255)"),
        lineWidth: 1,
      });

      var mesh = new Mesh( g.geometry, meshMaterial );
      mesh.geo = geometry;
      mesh.g = g;
      meshes.push(mesh)
      this.add(mesh)
    }

  }

  update(dataArray, rotate, timeStamp) {
    this.rotation.y += 0.01;
    var start = 0;
    var end = dataArray.length - 1
    var maxIndex = 0;
    var max = 0;
    for (var i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > 10) {
        end = i
        if (start == 0) {
          start = i
        }
      }
      if (dataArray[i] > max) {
        max = dataArray[i]
        maxIndex = i
      }
    }
    maxIndex = maxIndex - start
    var useful = dataArray.slice(start, end)
    const freqPerShape = useful.length/numShapes
    for (var i = 0; i < numShapes; i++) {
      var freqs = useful.slice(i*freqPerShape, (i+1)*freqPerShape-1);
      var avgFreq = avg(freqs)
      var color = Math.floor(avgFreq)
      if (color > 255) {
        color = 255
      }
      if (color < 0) {
        color = 0
      }
      var width = avgFreq / 255 * 4 * 0.8
      if (width < 1) {
        width = 1
      }
      meshes[i].material.color = new Color("rgb(215, " + color + ", 255)")
      meshes[i].material.lineWidth = width
     
      if (rotate) {
        meshes[i].rotation.x -= 0.2
        meshes[i].updateMatrix();
      }
    }
  }
}
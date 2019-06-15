/**
 * from https://jsfiddle.net/wilt/mhxtdfp8/40/
 * https://stackoverflow.com/questions/35495812/move-an-object-along-a-path-or-spline-in-threejs
 */
import {
  Line,
  Geometry,
  LineBasicMaterial,
  Mesh,
  MeshPhongMaterial,
  BoxGeometry,
  Vector3,
  Path,
  Vector2,
  Math as THREEMath,
  Group,
  Matrix4
} from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

function drawPath(path) {
  var vertices = path.getSpacedPoints(20);

  // Change 2D points to 3D points
  for (var i = 0; i < vertices.length; i++) {
    let point = vertices[i];
    vertices[i] = new Vector3(point.x, point.y, point.z);
  }
  var lineGeometry = new Geometry();
  lineGeometry.vertices = vertices;
  var lineMaterial = new LineBasicMaterial({
    color: 0xffffff,
  });
  var line = new Line(lineGeometry, lineMaterial);
  return line;
}

export default class Mover {
  constructor(scene) {
    this.scene = scene;
    this.angle = 0;
    this.position = 0;
    this.path = undefined;
    // this.previousAngle = 0;
    // this.previousPoint = new Vector3();
    this.mesh = undefined;

    new MTLLoader()
    .setPath( './models/van/' )
    .load( 'Van.mtl', ( materials ) => {
      materials.preload();
      // console.log(materials.materials["car_glass.png"]);
      materials.materials["car_glass.png"].transparent = true;
      materials.materials["car_glass.png"].opacity = 0.8;

      new OBJLoader()
        .setMaterials( materials )
        .setPath( 'models/van/' )
        .load( 'Van.obj', ( object ) => {
          object.position.y = - 95;
          // object.scale.set(0.02, 0.02, 0.02);
          object.children.forEach((child)=>{ 
            child.geometry.applyMatrix( new Matrix4().makeScale( 0.01, 0.01, 0.01 ) ); 
            child.geometry.applyMatrix( new Matrix4().makeRotationX( Math.PI ) ); 
          });
          
          scene.add( object );
          this.mesh = object;
        }, 
        // onProgress, onError 
        );
    } );

    // material, geometry
    // var material = new MeshPhongMaterial({ color: 0xff0000 });
    // var geometry = new BoxGeometry(10, 5, 6);

    // mesh
    // this.mesh = new Mesh(geometry, material);
    // scene.add(this.mesh);

    // direction vector for movement
    // var direction = new Vector3(1, 0, 0);
    // var up = new Vector3(0, 0, 1);
    // var axis = new Vector3();
  }

  setPath(path) {

    this.path = path;

    this.previousAngle = this.getAngle(this.path, this.position);
    this.previousPoint = path.getPointAt(this.position);
  }

  setRoute(route) {
    this.route = route;
  }

  getAngle(path, position) {
    // get the 2Dtangent to the curve
    const tangent = path.getTangent(position).normalize();
    // change tangent to 3D
    const angle = -Math.atan(tangent.x / tangent.y);
    return angle;
  }


  move(delta) {

    const progress = this.route.routeLine.drawCount / this.route.routeLine.numberVertices;

    // add up to position for movement
    this.position = (this.position + delta / 50) % 1;
    // this.position = (this.position + this.route.speed ) % 1;
    // this.position = progress;

    var segments = this.path.getLength();
    var pickt = this.position * segments;
    var pick = Math.floor(pickt);
    var pickNext = (pick + 1) % segments;

    // console.log(pick, pickNext);

    // this.position = (this.position + 0.01) % (this.path.getLength()-1);
    // console.log(this.position);
    // get the point at position
    var point = this.path.getPointAt(this.position);
    var point2 = this.path.getPointAt((this.position + 0.01) % 1);

    let angleEnd = point.angleTo(point2);
    // let normal = point.clone().cross(point2).normalize();

    // console.log( point2);
    // this.angle = this.getAngle(this.path, this.position);

    // this.mesh.position.copy(point);
    var dir = new Vector3(); // create once an reuse it
    var upNormal = dir.subVectors(new Vector3(0, 0, 0), point.clone()).normalize();
    // console.log(upNormal);
    // console.log( this.route.routeLine.currentPositionVec );
    this.mesh.up = upNormal;
    this.mesh.position.copy(this.route.routeLine.currentPositionVec);
    // this.mesh.position.copy(point).applyAxisAngle(upNormal, angleEnd);
    // this.mesh.position.copy(point);
    // this.mesh.lookAt(new Vector3().copy(this.mesh.position).normalize().multiplyScalar(100 + 10));

    // this.mesh.lookAt(new Vector3());
    this.mesh.lookAt(this.route.routeLine.nextPositionVec);
    // console.log(this.mesh.position)

    // set the quaternion
    // this.mesh.rotation.x += ( this.angle - this.previousAngle );

    this.previousPoint = point;
    // this.previousAngle = this.angle;
  }

  update(delta) {
    if (this.path !== undefined && this.route.runAnimation) {
      this.move(delta);
    }
    if( this.mesh !== undefined && this.route !== undefined && !this.route.runAnimation ) {
      const point = this.route.routeLine.vertices[this.route.routeLine.numberVertices-2];

      var dir = new Vector3(); // create once an reuse it
      var upNormal = dir.subVectors(new Vector3(0, 0, 0), point.clone()).normalize();
      this.mesh.up = upNormal;
      this.mesh.position.copy(point);
      this.mesh.lookAt( this.route.routeLine.vertices[this.route.routeLine.numberVertices-1] )
    }
  }
}

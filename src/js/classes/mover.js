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
    Group
} from 'three';


function drawPath(path) {
  var vertices = path.getSpacedPoints(20);

  // Change 2D points to 3D points
  for (var i = 0; i < vertices.length; i++) {
    let point = vertices[i]
    vertices[i] = new Vector3(point.x, point.y, point.z);
  }
  var lineGeometry = new Geometry();
  lineGeometry.vertices = vertices;
  var lineMaterial = new LineBasicMaterial({
    color: 0xffffff
  });
  var line = new Line(lineGeometry, lineMaterial)
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

        // material
        var material = new MeshPhongMaterial({
            color: 0xff0000,
        });

        // geometry
        var geometry = new BoxGeometry(10, 5, 6);

        // mesh
        this.mesh = new Mesh(geometry, material);
        scene.add(this.mesh);

        // direction vector for movement
        var direction = new Vector3(1, 0, 0);
        var up = new Vector3(0, 0, 1);
        var axis = new Vector3();

    }

    setPath(path) {
          // the path
//   var path = new Path([
//     new Vector2(-120, -50),
//     new Vector2(100, -50)
//   ]);
//   var arcRadius = 50;
//   path.moveTo(0, 0 - arcRadius);
//   path.absarc(0, 0, arcRadius, -Math.PI / 2, 0, false);
//   path.lineTo(50, 50);
    this.path = path;

    let path2 = drawPath(path);
    this.scene.add(path2);

    this.previousAngle = this.getAngle( this.path, this.position );
    this.previousPoint = path.getPointAt( this.position );
    console.log(this.path.getLength());

    }

    getAngle( path, position ){
        // get the 2Dtangent to the curve
        // const tangent = path.getTangent(position).normalize();
        const tangent = path.getTangent(position).normalize();
        
        // change tangent to 3D
        const angle = - Math.atan( tangent.x / tangent.y);
        
        return angle;
    }


    move(delta ) {

        // add up to position for movement
        this.position = (this.position + delta / 10) % 1;

        var segments = this.path.getLength();
        var pickt = this.position * segments;
        var pick = Math.floor( pickt );
        var pickNext = ( pick + 1 ) % segments;

        // console.log(pick, pickNext);

        // this.position = (this.position + 0.01) % (this.path.getLength()-1);
        // console.log(this.position);
        // get the point at position
        var point = this.path.getPointAt(this.position);
        var point2 = this.path.getPointAt( (this.position+0.01) % 1 );

        let angleEnd = point.angleTo(point2);
        // let normal = point.clone().cross(point2).normalize();

        // console.log( point2);
        this.angle = this.getAngle(this.path, this.position);

        // this.mesh.position.copy(point);
        var dir = new Vector3(); // create once an reuse it
        var upNormal = dir.subVectors( new Vector3(0,0,0), point.clone() ).normalize();
        // console.log(upNormal);

        this.mesh.up = upNormal;
        this.mesh.position.copy(point).applyAxisAngle(upNormal, angleEnd);
        // this.mesh.lookAt(new Vector3().copy(this.mesh.position).normalize().multiplyScalar(100 + 10));

        // this.mesh.position.copy(point);
        // this.mesh.lookAt(new Vector3());
        // this.mesh.lookAt(point);
        // console.log(this.mesh.position)

        // set the quaternion
        // this.mesh.rotation.x += ( this.angle - this.previousAngle );
        
        this.previousPoint = point;
        this.previousAngle = this.angle;
        
    }

  update(delta) {
      if(this.path !== undefined) {
          this.move(delta);
    }
  }

}


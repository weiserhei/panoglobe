import { Vector3 } from 'three';
import './../../css/label.css';

import { library, icon } from "@fortawesome/fontawesome-svg-core";
import {
  faMapPin,
} from "@fortawesome/free-solid-svg-icons";
// library.add(faMapPin);
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export default class IconLabel {
  constructor(parentDomNode, text, scene, followMesh) {
    this.visible = false;
    // this._box = document.createElement('div');
    // this._box.className = "htmlLabel badge badge-dark";
    this.box = document.createElement('button');
    // this._box.className = "htmlLabel btn btn-sm btn-dark";
    // google maps style labels
    // <i class="fas fa-map-marker-alt"></i>
    // google maps style marker
    // this.box.className = 'htmlLabel fas fa-map-marker-alt text-white';
    // this.box.className = 'htmlLabel fas fa-thumbtack text-white';
    // pin marker
    this.box.className = 'htmlLabel btn btn-sm shadow-none px-1 py-0';
    // this.box.style.textShadow = '0 0 3px #000';

    this.box.innerHTML = icon(faMapPin, {
      styles: { color: "#ffffff", filter: "drop-shadow(0px 0px 1px rgba(0,0,0))" },
      // classes: ["fa-lg"],
      // classes: ["mb-4"],
    }).html;

    // this._box.style.textDecoration = "none";
    // this.box.innerHTML = text;

    // parentDomNode.appendChild(this.box);
    this.parentDomNode = parentDomNode;

    var css2dlabel = new CSS2DObject( this.box );
    css2dlabel.position.copy( followMesh.position );
    css2dlabel.position.y += 0.5;
    scene.add( css2dlabel );

    this.screenVector = new Vector3();
  }

  get domElement() {
    return this.box;
  }

  get isVisible() {
    return this.visible;
  }

  set isVisible(value) {
    this.visible = value;

    if (value === true) {
      this.box.style.visibility = 'visible';
    } else {
      this.box.style.visibility = 'hidden';
    }
  }

  update(camera, followMesh, ocluded, dot) {
    // overlay is visible
    if (this.isVisible) {
    //   this.screenVector.copy(followMesh.position).project(camera);

    //   const posx = (1 + this.screenVector.x) * this.parentDomNode.offsetWidth / 2;
    //   const posy = (1 - this.screenVector.y) * this.parentDomNode.offsetHeight / 2;
    //   // const posx = Math.round((this.screenVector.x + 1) * this.parentDomNode.clientWidth / 2);
    //   // const posy = Math.round((1 - this.screenVector.y) * this.parentDomNode.clientHeight / 2);

    //   const boundingRect = this.box.getBoundingClientRect();
    //   const left = (posx - boundingRect.width + boundingRect.width / 2);
    //   const top = (posy - boundingRect.height * 0.9);
    // //   this.box.style.left = (posx - boundingRect.width + boundingRect.width / 2) + 'px';
    // //   this.box.style.top = (posy - boundingRect.height * 1.3) + 'px';
    //   // https://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
    //   this.box.style.transform = 'translate(' + Math.floor(left) + 'px, ' + Math.floor(top) + 'px)';

      if (!ocluded) {
        this.box.style.opacity = 1;
      } else {
        // HIDE EACH BLOB+LABEL IF CAMERA CANT SEE IT (I.E. WHEN IT IS BEHIND THE GLOBE)
        // this.box.style.opacity = 1 + dot * 2;
        this.box.style.opacity = 0;
      }
    }
  }
}

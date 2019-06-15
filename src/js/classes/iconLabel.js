import { Vector3 } from 'three';
import './../../css/label.css';

export default class IconLabel {
  constructor(parentDomNode, text) {
    this.visible = false;
    // this._box = document.createElement('div');
    // this._box.className = "htmlLabel badge badge-dark";
    this.box = document.createElement('i');
    // this._box.className = "htmlLabel btn btn-sm btn-dark";
    // google maps style labels
    // <i class="fas fa-map-marker-alt"></i>
    // google maps style marker
    // this.box.className = 'htmlLabel fas fa-map-marker-alt text-white';
    // this.box.className = 'htmlLabel fas fa-thumbtack text-white';
    // pin marker
    this.box.className = 'htmlLabel fas fa-map-pin text-white';
    this.box.style.textShadow = '0 0 3px #000';
    // this._box.style.textDecoration = "none";
    // this.box.innerHTML = text;

    parentDomNode.appendChild(this.box);
    this.parentDomNode = parentDomNode;

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
      this.screenVector.set(0, 0, 0);
      followMesh.localToWorld(this.screenVector);
      this.screenVector.project(camera);

      const posx = Math.round((this.screenVector.x + 1) * this.parentDomNode.offsetWidth / 2);
      const posy = Math.round((1 - this.screenVector.y) * this.parentDomNode.offsetHeight / 2);
      // const posx = Math.round((this.screenVector.x + 1) * this.parentDomNode.clientWidth / 2);
      // const posy = Math.round((1 - this.screenVector.y) * this.parentDomNode.clientHeight / 2);

      const boundingRect = this.box.getBoundingClientRect();
      const left = (posx - boundingRect.width + boundingRect.width / 2);
      const top = (posy - boundingRect.height * 1.1);
    //   this.box.style.left = (posx - boundingRect.width + boundingRect.width / 2) + 'px';
    //   this.box.style.top = (posy - boundingRect.height * 1.3) + 'px';
      // https://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
      this.box.style.transform = 'translate(' + Math.floor(left) + 'px, ' + Math.floor(top) + 'px)';

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

import { WebGLRenderer, PCFSoftShadowMap } from 'three';
import Config from './../../data/config';

// Main webGL renderer class
export default class Renderer {
  constructor(scene, container, container2) {
    // Properties
    // this.scene = scene;
    this.container = container;
    this.container2 = container2;

    // Create WebGL renderer and set its antialias
    this.threeRenderer = new WebGLRenderer({ antialias: true });

    // Set clear color to fog to enable fog or to hex color for no fog
    this.threeRenderer.setClearColor('#000000'); // scene.fog.color
    this.threeRenderer.setPixelRatio(window.devicePixelRatio); // For retina

    // Appends canvas
    this.threeRenderer.domElement.classList.add("position-absolute");
    container.appendChild(this.threeRenderer.domElement);
    // Shadow map options
    this.threeRenderer.shadowMap.enabled = false;
    this.threeRenderer.shadowMap.type = PCFSoftShadowMap;

    // Get anisotropy for textures
    Config.maxAnisotropy = this.threeRenderer.capabilities.getMaxAnisotropy();

    // Initial size update set to canvas container
    this.updateSize();

    // Listeners
    document.addEventListener('DOMContentLoaded', () => this.updateSize(), false);
    window.addEventListener('resize', () => this.updateSize(), false);
  }

  setContainer(container) {
    container.appendChild(this.threeRenderer.domElement);
    this.container = container;
    this.updateSize();
  }

  updateSize() {
    this.threeRenderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
  }

  render(scene, camera) {
    // Renders scene to canvas target
    this.threeRenderer.render(scene, camera);
  }
}

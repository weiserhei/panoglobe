import fontawesome from '@fortawesome/fontawesome';
import solid from '@fortawesome/fontawesome-free-solid';
import regular from '@fortawesome/fontawesome-free-regular';

// subsetting doesnt work :/
// import { faTimes, faExternalLinkAlt, faPlus, faCog, faCaretRight, faTachometerAlt, faMapMarker, faWrench, faPlayCircle, faPauseCircle, faStopCircle } from '@fortawesome/fontawesome-free-solid'
// import { faCircle, faMoon } from '@fortawesome/fontawesome-free-regular'

// fontawesome.library.add(faCog)
// fontawesome.library.add(faPlus)
// fontawesome.library.add(faCaretRight)
// fontawesome.library.add(faTachometerAlt)
// fontawesome.library.add(faMapMarker)
// fontawesome.library.add(faWrench)
// fontawesome.library.add(faPlayCircle)
// fontawesome.library.add(faPauseCircle)
// fontawesome.library.add(faStopCircle)
// fontawesome.library.add(faExternalLinkAlt)
// fontawesome.library.add(faTimes)

// import faMoon from '@fortawesome/fontawesome-free-regular/faMoon'
// fontawesome.library.add(faMoon)
// import faCircle from '@fortawesome/fontawesome-free-regular/faCircle'
// fontawesome.library.add(faCircle)

// fontawesome.config = {
//   familyPrefix: 'xd',
//   autoReplaceSvg: false,
//   searchPseudoElements: false
// }

import Config from './data/config';
import Detector from './utils/detector';
import Main from './app/main';

// Check environment and set the Config helper
if(__ENV__ === 'dev') {
  console.log('----- RUNNING IN DEV ENVIRONMENT! -----');
  Config.isDev = true;
}

function init() {
  // Check for webGL capabilities
  if(!Detector.webgl) {
    Detector.addGetWebGLMessage();
  } else {
    const container = document.getElementById('appContainer');
    new Main(container);
  }
}

init();

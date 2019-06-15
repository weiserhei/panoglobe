import $ from 'jquery';
import 'bootstrap';

import '@fortawesome/fontawesome-free/css/all.min.css';
// import 'startbootstrap-sb-admin-2/css/sb-admin-2.min.css';
// <script src="vendor/jquery-easing/jquery.easing.min.js"></script>

// import 'malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css';
// import * as cS from 'malihu-custom-scrollbar-plugin';
// import { jquerymousewheel } from 'jquery-mousewheel';

// require after html is injected
// import 'startbootstrap-sb-admin-2/js/sb-admin-2';

export default class Sidebar {

    getHeading(name) {
        const div = document.createElement("div");
        div.className = "sidebar-heading";
        div.innerHTML = name;
        return div;
    }

    getSidebarDropdown(name) {
        const a = document.createElement("a");
        a.href = "#";
        // a.classList.add("nav-toggle", "collapsed");
        a.classList.add("nav-link");
        // a.setAttribute('data-foo', 'collapse');
        // a.setAttribute('data-target', '#collapseTwo');
        const i = document.createElement("i");
        i.className = "fas fa-fw fa-cog";

        a.appendChild(i);
        a.insertAdjacentHTML('beforeend', name);

        return a;
    }

    addRoute(route) {

      function icon(className, id) {
        const i = document.createElement('i');
        i.className = className;
        i.id = id;
        return i;
      }
      function mediaControlButton(text, classNames, icon) {
        const button = document.createElement('button');
        classNames.forEach(cssClass => button.classList.add(cssClass));
        // button.className = className;
        button.type = 'button';
        if(icon !== undefined) {
          button.classList.add("btn-icon-split");
          const span = document.createElement("span");
          span.classList.add("icon", "text-white-50");
          span.appendChild(icon);
          button.appendChild(span);
        }
        if(text !== "") {
          const textSpan = document.createElement("span");
          // textSpan.classList.add("text", "d-sm-none", "hidden");
          textSpan.classList.add("text", "d-sm-block", "test", "d-none");
          textSpan.innerHTML = text;
          button.appendChild(textSpan);
        }
        // button.innerText = text;
        // button.insertBefore(icon, button.firstChild);
        return button;
      }

        const safeName = route.name.replace(/[^A-Z0-9]+/ig, '_') + 'collapse';
        const info = route.name;

        const header = this.getHeading(route.name);
        const li = document.createElement("li");
        li.className = "nav-item";

        // const children = this.getSidebarDropdown("Animation");

        let playIcon = icon('fas fa-play-circle', 'play');
        let pauseIcon = icon('fas fa-pause-circle', 'pause');
        const stopIcon = icon('fas fa-stop-circle', 'stop');

        route.progressBar = this.progressBar;
        const self = this;
        const animate = function () {
          if (route.runAnimation === false) {
            this.classList.add("d-none");
            // pauseButton.classList.remove("d-none");
            stopButton.classList.remove("d-none");
            
            // this.innerHTML = pauseIcon.outerHTML + ' Pause';
            // self.progress.classList.remove("invisible");
            $(self.progress).fadeIn();
            route.runAnimation = true;
          } else if (route.runAnimation === true) {
            // this.innerHTML = pauseIcon.outerHTML + ' Play';
            route.pauseAnimation = true;
            $(self.progress).fadeOut();
          }
        };
        const pause = function() {
            // this.innerHTML = pauseIcon.outerHTML + ' Play';
            this.classList.add("d-none");
            playButton.classList.remove("d-none");
            route.pauseAnimation = true;
            $(self.progress).fadeOut();
        }
        const stop = function() {
          this.classList.add("d-none");
          pauseButton.classList.add("d-none");
          playButton.classList.remove("d-none");
          route.runAnimation = false;
          $(self.progress).fadeOut();
        }

        // const buttonClass = 'btn btn-primary my-2 d-block';
        const buttonClasses = ["btn", "btn-primary", "my-2", "ml-4"];
        const playButton = mediaControlButton("Play", buttonClasses, playIcon);
        const pauseButton = mediaControlButton("Pause", buttonClasses.concat("d-none"), pauseIcon);
        const stopButton = mediaControlButton("Stop", buttonClasses.concat("d-none"), stopIcon);
        playButton.onclick = animate;
        pauseButton.onclick = pause;
        stopButton.onclick = stop;
        const children = [playButton, pauseButton, stopButton];
        // const children = this.addLink("Animation1", animate );

        li.appendChild(header);
        // li.appendChild(playButton);
        // li.appendChild(pauseButton);
        // const group = document.createElement("div");
        // group.classList.add("btn-group", "ml-2");
        // li.appendChild(group);
        children.forEach(child => li.appendChild(child));

        this.sidebarUl.appendChild(li);
        // <!-- Nav Item - Pages Collapse Menu -->\
        // <li class="nav-item">\

        //   <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionSidebar">\
        //     <div class="bg-white py-2 collapse-inner rounded">\
        //       <h6 class="collapse-header">Custom Components:</h6>\
        //       <a class="collapse-item" href="buttons.html">Buttons</a>\
        //       <a class="collapse-item" href="cards.html">Cards</a>\
        //     </div>\
        //   </div>\
        // </li>\
        
    }

    addLink(name, callback) {
      const li = document.createElement("li");
      li.classList.add("nav-item");
      const a = document.createElement("a");
      a.classList.add("nav-link");
      a.href = "#";
      a.innerHTML = name;

      if(callback !== undefined) {
        a.onclick = callback;
      }

      return a;
    }

    constructor(pageWrapper, lightManager, globus, controls) {

        document.body.id = "page-top";

        this.sidebarUl = document.createElement("ul");
        this.sidebarUl.classList.add("navbar-nav", "bg-opaque", "sidebar", "sidebar-dark", "accordion");
        this.sidebarUl.id = "accordionSidebar";

        // const sidebar = '<ul class="navbar-nav bg-pro-sidebar sidebar sidebar-dark accordion" id="accordionSidebar">\
        // const sidebarHTML = '<ul class="navbar-nav bg-opaque sidebar sidebar-dark accordion" id="accordionSidebar">\
        const sidebarHTML = '<!-- Sidebar - Brand -->\
        <a class="sidebar-brand d-flex align-items-center justify-content-center" href="index.html">\
          <div class="sidebar-brand-icon rotate-n-15">\
          <i class="fas fa-globe-americas"></i>\
          </div>\
          <div class="sidebar-brand-text mx-3">Pano Globe</div>\
        </a>\
        <hr class="sidebar-divider my-0">\
        <li class="nav-item active">\
          <a class="nav-link" href="index.html">\
            <i class="fas fa-fw fa-tachometer-alt"></i>\
            <span>Dashboard</span></a>\
        </li>\
        <hr class="sidebar-divider">\
        <!-- Heading -->\
        <div class="sidebar-heading">\
          Interface\
        </div>\
        <!-- Nav Item - Pages Collapse Menu -->\
        <li class="nav-item">\
          <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">\
            <i class="fas fa-fw fa-cog"></i>\
            <span>Components</span>\
          </a>\
          <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionSidebar">\
            <div class="bg-white py-2 collapse-inner rounded">\
              <h6 class="collapse-header">Custom Components:</h6>\
              <a class="collapse-item" href="buttons.html">Buttons</a>\
              <a class="collapse-item" href="cards.html">Cards</a>\
            </div>\
          </div>\
        </li>\
        <!-- Nav Item - Utilities Collapse Menu -->\
        <li class="nav-item">\
          <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseUtilities" aria-expanded="true" aria-controls="collapseUtilities">\
            <i class="fas fa-fw fa-wrench"></i>\
            <span>Utilities</span>\
          </a>\
          <div id="collapseUtilities" class="collapse" aria-labelledby="headingUtilities" data-parent="#accordionSidebar">\
            <div class="bg-white py-2 collapse-inner rounded">\
              <h6 class="collapse-header">Custom Utilities:</h6>\
              <a class="collapse-item" href="utilities-color.html">Colors</a>\
              <a class="collapse-item" href="utilities-border.html">Borders</a>\
              <a class="collapse-item" href="utilities-animation.html">Animations</a>\
              <a class="collapse-item" href="utilities-other.html">Other</a>\
            </div>\
          </div>\
        </li>\
        <!-- Divider -->\
        <hr class="sidebar-divider">\
        <!-- Heading -->\
        <div class="sidebar-heading">\
          Addons\
        </div>\
        <!-- Nav Item - Pages Collapse Menu -->\
        <li class="nav-item">\
          <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapsePages" aria-expanded="true" aria-controls="collapsePages">\
            <i class="fas fa-fw fa-folder"></i>\
            <span>Pages</span>\
          </a>\
          <div id="collapsePages" class="collapse" aria-labelledby="headingPages" data-parent="#accordionSidebar">\
            <div class="bg-white py-2 collapse-inner rounded">\
              <h6 class="collapse-header">Login Screens:</h6>\
              <a class="collapse-item" href="login.html">Login</a>\
              <a class="collapse-item" href="register.html">Register</a>\
              <a class="collapse-item" href="forgot-password.html">Forgot Password</a>\
              <div class="collapse-divider"></div>\
              <h6 class="collapse-header">Other Pages:</h6>\
              <a class="collapse-item" href="404.html">404 Page</a>\
              <a class="collapse-item" href="blank.html">Blank Page</a>\
            </div>\
          </div>\
        </li>\
        <!-- Nav Item - Charts -->\
        <li class="nav-item">\
          <a class="nav-link" href="charts.html">\
            <i class="fas fa-fw fa-chart-area"></i>\
            <span>Charts</span></a>\
        </li>\
        <!-- Divider -->\
        <hr class="sidebar-divider d-none d-md-block">\
        <!-- Sidebar Toggler (Sidebar) -->\
        <div class="text-center d-none d-md-inline">\
          <button class="rounded-circle border-0" id="sidebarToggle"></button>\
        </div>';

        this.sidebarUl.innerHTML = sidebarHTML;
    //   pageWrapper.innerHTML = sidebar;
      // pageWrapper.insertAdjacentHTML('beforeend', sidebar);
      pageWrapper.appendChild(this.sidebarUl);

      const contentWrapper = document.createElement("div");
      contentWrapper.classList.add("d-flex", "flex-column", "o-hidden")
      contentWrapper.id="content-wrapper";
      pageWrapper.appendChild(contentWrapper);

      const content = document.createElement("div");
      content.id="content";
      contentWrapper.appendChild(content);

    //   ${i}
      const topbar = `<nav class="navbar navbar-expand navbar-light bg-opaque topbar mb-4 static-top shadow">\
        <!-- Sidebar Toggle (Topbar) -->\
        <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3">\
          <i class="fa fa-bars"></i>\
        </button>\
        <a href="#" class="btn btn-sm btn-info btn-icon-split">\
        <span class="icon text-white-50">\
          <i class="fas fa-flag d-none"></i>\
          <i class="far fa-plus-square d-none"></i>
          <i class="fas fa-plus-square d-none"></i>
          <i class="fas fa-plus-circle d-none"></i>
          <i class="fas fa-folder-plus"></i>
        </span>
        <span class="text">Asien-route</span>\
      </a>\

        <!-- Topbar Search -->\
        <!--
        <form class="invisible d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">\
          <div class="input-group">\
            <input type="text" class="form-control bg-light border-0 small" placeholder="Search for..." aria-label="Search" aria-describedby="basic-addon2">\
            <div class="input-group-append">\
              <button class="btn btn-primary" type="button">\
                <i class="fas fa-search fa-sm"></i>\
              </button>\
            </div>\
          </div>\
        </form>\ -->
      \
        <!-- Topbar Navbar -->\
        <ul class="navbar-nav ml-auto">\
          <!-- Nav Item - Search Dropdown (Visible Only XS) -->\
          <!--
          <li class="nav-item dropdown no-arrow d-sm-none hidden">\
            <a class="nav-link dropdown-toggle" href="#" id="searchDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
              <i class="fas fa-search fa-fw"></i>\
            </a>\
            <!-- Dropdown - Messages -->\
            <!--
            <div class="dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in" aria-labelledby="searchDropdown">\
              <form class="form-inline mr-auto w-100 navbar-search">\
                <div class="input-group">\
                  <input type="text" class="form-control bg-light border-0 small" placeholder="Search for..." aria-label="Search" aria-describedby="basic-addon2">\
                  <div class="input-group-append">\
                    <button class="btn btn-primary" type="button">\
                      <i class="fas fa-search fa-sm"></i>\
                    </button>\
                  </div>\
                </div>\
              </form>\
            </div>\
          </li>\
          -->
          <div class="topbar-divider d-none d-sm-block"></div>\
          <!-- Nav Item - User Information -->\
          <li class="nav-item dropdown no-arrow">\
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
            <i class="fas fa-globe-americas"></i>\
            <span class="mr-2 ml-2 d-none d-lg-inline text-gray-600 small">Options</span>\
              <!-- <img class="img-profile rounded-circle d-none" src="https://source.unsplash.com/QAB-WJcbgJk/60x60"> -->\
            </a>\
            <!-- Dropdown - User Information -->\
            <div class="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">\
            <span class="dropdown-item">\
                <div class="custom-control custom-switch">\
                <input type="checkbox" class="custom-control-input" id="customSwitch1">\
                <label class="custom-control-label" for="customSwitch1">Night Mode</label>\
                </div>\
            </span>\
            <span class="dropdown-item">\
                <div class="custom-control custom-switch">\
                <input type="checkbox" class="custom-control-input" id="customSwitch1" checked>\
                <label class="custom-control-label" for="customSwitch1">Country Borders</label>\
                </div>\
            </span>\
            <a class="dropdown-item" href="#">\
                <i class="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>\
                Profile\
              </a>\
              <a class="dropdown-item" href="#">\
                <i class="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>\
                Settings\
              </a>\
              <a class="dropdown-item" href="#">\
                <i class="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>\
                Activity Log\
              </a>\
              <div class="dropdown-divider"></div>\
              <a class="dropdown-item" href="#" data-toggle="modal" data-target="#logoutModal">\
                <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>\
                Logout\
              </a>\
            </div>\
          </li>\
        </ul>\
      </nav>`;

        content.innerHTML = topbar;


      const containerFluid = document.createElement("div");
      containerFluid.className = "container-fluid";
      containerFluid.style.width = "100%";
      containerFluid.style.height = "100%";

      content.appendChild(containerFluid);

      containerFluid.innerHTML = '\
        <!-- Page Heading -->\
        <div class="d-sm-flex align-items-center justify-content-between mb-4">\
          <h1 class="h3 mb-0 text-gray-800">Dashboard</h1>\
          <a href="#" class="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i class="fas fa-download fa-sm text-white-50"></i> Generate Report</a>\
        </div>\
        <!-- Content Row -->\
        <div class="row">\
          <!-- Earnings (Monthly) Card Example -->\
          <div class="col-xl-3 col-md-6 mb-4">\
            <div class="card border-left-primary shadow h-100 py-2">\
              <div class="card-body">\
                <div class="row no-gutters align-items-center">\
                  <div class="col mr-2">\
                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Earnings (Monthly)</div>\
                    <div class="h5 mb-0 font-weight-bold text-gray-800">$40,000</div>\
                  </div>\
                  <div class="col-auto">\
                    <i class="fas fa-calendar fa-2x text-gray-300"></i>\
                  </div>\
                </div>\
              </div>\
            </div>\
          </div>\
        </div>';

        containerFluid.innerHTML = "";

        this.container2 = containerFluid;
        this.container = pageWrapper;

        this.progress = document.createElement("div");
        this.progress.classList.add("progress", "progress-sm", "bg-darker", "mb-0", "shadow", "border", "border-darker");
        this.progress.style.display = "none";

        this.progressBar = document.createElement("div");
        this.progressBar.classList.add("progress-bar-striped", "bg-primary");
        this.progressBar.style.width = "0%";
        this.progress.appendChild(this.progressBar);

        const footer = document.createElement("footer");
        footer.classList.add("sticky-footer", "bg-transparent");

        const footerContainer = document.createElement("div");
        footerContainer.classList.add("container", "my-auto");
        footer.appendChild(footerContainer);

        footerContainer.appendChild(this.progress);

        const footer2 = `<footer class="sticky-footer bg-dark">
        <div class="container my-auto">
          <div class="copyright text-center my-auto">

          <div class="mb-1 small invisible">Progress Bar</div>
          <div class="progress mb-4 invisible">
            <div id="progressbar" class="progress-bar-striped bg-info" role="progressbar" style="width: 25%" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
          </div>

          </div>
        </div>
        </footer>`;

        // contentWrapper.insertAdjacentHTML('beforeend', footer);
        contentWrapper.appendChild(footer);

    
        // important! init after html is built
        require('startbootstrap-sb-admin-2/js/sb-admin-2')


        // if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // $('.navbar-nav').mCustomScrollbar({
            //   axis: 'y',
            //   autoHideScrollbar: false,
            //   scrollInertia: 300,
            // });
            // $('.navbar-nav').addClass('desktop');
        // }

    }

};

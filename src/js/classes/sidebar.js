import $ from "jquery";
import "bootstrap";

import { numberWithCommas } from "./../utils/panoutils";
import * as prosidebar from "./../../vendor/pro-sidebar-template-3.0.2/src/js/main";
import * as cS from "malihu-custom-scrollbar-plugin";
import { jquerymousewheel } from "jquery-mousewheel";

import "malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css";
import "./../../vendor/pro-sidebar-template-3.0.2/src/css/main.css";
import "./../../vendor/pro-sidebar-template-3.0.2/src/css/sidebar-themes.css";
import "./../../css/sidebar-toggle.css"; // custom toggle button

import { icon as Icon } from '@fortawesome/fontawesome-svg-core'

import "@fortawesome/fontawesome-free/css/all.min.css";

import Config from './../../data/config';

class SidebarDropdown {
    constructor( name, iconClassName ) {

        const li = document.createElement("li");
        li.className = "sidebar-dropdown";
        this.a = document.createElement("a");
        this.a.setAttribute("href", "#");
        li.appendChild(this.a);

        const i = document.createElement("i");
        i.className = iconClassName;
        // const svgSpan = document.createElement("span");
        // svgSpan.className = "svg-icon";
        // svgSpan.appendChild(i);
        // this.a.appendChild(svgSpan);
        this.a.appendChild(i);

        // const camera = icon({ prefix: 'fas', iconName: "camera" })
        // console.log(camera);
        // this.a.innerHTML = icon.html;

        // this.a.innerHTML = '<i class="fas fa-check"></i>';

        // this.a.appendChild(i);
        const span = document.createElement("span");
        span.className = "menu-text";
        span.innerHTML = name;
        this.a.appendChild(span);


        // icon on right side of dropdown list
        // const svgSpanCaret = document.createElement("span");
        // svgSpanCaret.className = "caret";
        // const bulletpoint = document.createElement("i");
        // bulletpoint.className = "fas fa-caret-right";
        // svgSpanCaret.appendChild(bulletpoint);
        // this.a.appendChild(svgSpanCaret);

        this.li = li;

    }

    addBadge(className, value) {
        const span = document.createElement("span");
        span.className = "badge badge-pill badge-"+className;
        span.innerHTML = value;
        this.a.appendChild(span);
    }

    set active( value ) {
        if(value) this.li.className += " active";
    }

    submenu(linkArray) {
        const div = document.createElement("div");
        div.className = "sidebar-submenu";
        this.li.appendChild(div);

        const ul = document.createElement("ul");
        div.appendChild(ul);

        if(Array.isArray(linkArray)) {
            linkArray.forEach((link)=>{
                ul.appendChild(link);
            });
        } else {
            ul.appendChild(linkArray);
        }
    }
}

function getFooter(globus) {

    const div = document.createElement("div");
    div.className = "sidebar-footer";

    const settings = document.createElement("div");
    settings.className = "dropdown";

    const link = document.createElement("a");
    link.href = "#";
    link.setAttribute('data-toggle', 'dropdown');
    settings.appendChild(link);

    // const icon = document.createElement("i");
    // icon.className = "fas fa-wrench fa-lg";
    // link.appendChild(icon);
    
    const icon = Icon({ prefix: 'fas', iconName: "wrench" });
    link.innerHTML = icon.html;

    const dropdown = document.createElement("div");
    dropdown.className = "dropdown-menu";
    // dropdown.innerHTML = "<a href='#' class='dropdown-item'>Enable Night Mode</a> \
    // <a href='#' class='dropdown-item'>Disable Borders</a>";
    settings.appendChild(dropdown);

    if(globus._borderlines) {
        const linkActive = "Disable Borders";
        const linkInactive = "Enable Borders";
        const link2 = document.createElement("a");
        link2.href = "#";
        link2.className = "dropdown-item";
        link2.innerHTML = linkActive;
        dropdown.appendChild(link2);

        const x = '<div class="custom-control custom-switch"> \
                    <input type="checkbox" class="custom-control-input" id="customSwitch1"> \
                    <label class="custom-control-label" for="customSwitch1">Toggle this switch element</label> \
                    </div> \
                    <div class="custom-control custom-switch"> \
                    <input type="checkbox" class="custom-control-input" disabled id="customSwitch2"> \
                    <label class="custom-control-label" for="customSwitch2">Disabled switch element</label> \
                    </div>';
        // dropdown.innerHTML = x;

        link2.addEventListener("click", ()=>{
            globus.borders = !globus.borders;
            if( globus.borders ) {
                link2.innerHTML = linkActive;
            } else {
                link2.innerHTML = linkInactive;
            }
        });

        div.appendChild(settings);
    }
    
    return div;

}

function liplusa(el) {
    const li = document.createElement("li");
    const svgSpan = document.createElement("span");
    svgSpan.className = "bulletpoint";
    const bulletpoint = document.createElement("i");
    bulletpoint.className = "far fa-circle";
    // bulletpoint.className = "far fa-dot-circle";
    // bulletpoint.className = "fas fa-circle";
    svgSpan.appendChild(bulletpoint);
    
    const a = document.createElement("a");
    a.appendChild(svgSpan);
    a.setAttribute("href", "#");
    a.innerHTML = svgSpan.outerHTML + el;
    li.appendChild(a)
    return li;
}

export default class Sidebar {
    constructor(pageWrapper, lights, globus, controls) {

        const nav = document.createElement("nav");
        nav.className = "sidebar-wrapper";
        nav.id = "sidebar";

        // pageWrapper.appendChild(nav);
        pageWrapper.insertBefore(nav, pageWrapper.firstChild);

        this.pageWrapper = pageWrapper;

        const container = document.createElement("div");
        container.className = "sidebar-content";
        nav.appendChild(container);

        container.innerHTML = '<div id="toggle-sidebar"> \
            <div></div> \
            <div></div> \
            <div></div> \
        </div> \
        <div class="sidebar-brand" id="toggle-sidebar2"> \
            <a href="#">Pano Globe</a> \
        </div>';

        this.container = container;

        this._lights = lights;
        this._globus = globus;
        this._controls = controls;

        // this._addSettings( container );
        nav.appendChild( getFooter(globus) );
        
        $("#toggle-sidebar2").click(() => {
            $(".page-wrapper").toggleClass("toggled");
        });
    
    }

    _addSettings(container) {

        const div = document.createElement("div");
        div.className = "sidebar-menu sidebar-item";
        container.appendChild(div);
        const ul = document.createElement("ul");
        div.appendChild(ul);

        function getLink(title) {
            const a = document.createElement("a");
            a.setAttribute("href", "#");
            a.setAttribute("title",title);
            a.setAttribute("data-theme", title+"-theme");
            a.className="theme "+title+"-theme";
            return a;
        }

        var li = document.createElement("li");
        li.className="header-menu sidebar-settings-menu";
        li.innerHTML = "<span>Sidebar Settings</span>";
        ul.appendChild(li);
        
        var li2 = document.createElement("li");
        li2.className = "sidebar-settings-menu";

        // const span = document.createElement("span");
        // span.className = "badge badge-pill badge-"+className;
        // span.innerHTML = value;
        // this.a.appendChild(span);

        const b = document.createElement("a");
        b.setAttribute("href", "#");
        // a.innerHTML = '<i class="far fa-moon"></i> Lights Out<span class="badge badge-pill badge-danger">OFF</span>';
        const className2 = "fas fa-globe text-warning";
        const classNameActive2 = "fas fa-globe";
        const linkName2 = '<span class="svg-icon"><i class="'+className2+'"></i></span> Borders Off';
        const linkNameActive2 = '<span class="svg-icon"><i class="'+classNameActive2+'"></i></span> Borders On';
        b.innerHTML = linkName2;
        li2.appendChild(b);
        
        b.addEventListener("click", ()=>{
            this._globus.borders = !this._globus.borders;
            if( this._globus.borders ) {
                b.innerHTML = linkName2;
            } else {
                b.innerHTML = linkNameActive2;
            }
        });


        const a = document.createElement("a");
        a.setAttribute("href", "#");
        // a.innerHTML = '<i class="far fa-moon"></i> Lights Out<span class="badge badge-pill badge-danger">OFF</span>';
        const className = "far fa-moon";
        const classNameActive = "far fa-moon text-warning";
        const linkName = '<span class="svg-icon"><i class="'+className+'"></i></span> Night Mode';
        const linkNameActive = '<span class="svg-icon"><i class="'+classNameActive+'"></i></span> Night Mode';
        a.innerHTML = linkName;
        li2.appendChild(a);
        
        a.addEventListener("click", ()=>{
            this._lights.night = !this._lights.night;
            this._globus.night = !this._globus.night;
            if( this._globus.night ) {
                a.innerHTML = linkNameActive;
            } else {
                a.innerHTML = linkName;
            }
        });

        const themes = ["chiller-theme", "ice-theme", "cool-theme", "light-theme","green-theme","spicy-theme","purple-theme"];
        themes.forEach((theme)=>{
            li2.appendChild(getLink(theme.slice(0,-6)));
        });
        ul.appendChild(li2);
        

        // $(".sidebar-settings-menu").hide();
        $(div).hide();

        const icon = document.createElement("i");
        icon.className = "fas fa-wrench";
        $(".sidebar-settings-link").prepend(icon)
        
        $(".sidebar-settings-link").click(() => {
            // $(".sidebar-settings-menu").fadeToggle();
            // $(div).fadeToggle();
            $(div).slideToggle();
            // $(".sidebar-settings-menu").slideToggle();

            $(div).promise().done( function() {
                $(".sidebar-content").mCustomScrollbar("scrollTo",$(".sidebar-settings-menu"));
            } );

            // $(".sidebar-content").mCustomScrollbar("scrollTo","bottom");
            // $(".sidebar-content").mCustomScrollbar("scrollTo","top");
            // $(".sidebar-content").mCustomScrollbar("scrollTo",$(".sidebar-settings-menu"));
            // $(".sidebar-content").mCustomScrollbar("scrollTo","first");

            $(".badge-sonar").hide();
        });
    }

    addLink( headline, callback ) {

        const div = document.createElement("div");
        div.className = "sidebar-menu sidebar-item";
        this.container.appendChild(div);
        // this.test.insertBefore(div, this.test.firstChild);

        const ul = document.createElement("ul");
        div.appendChild(ul);

        const li = this._addHeader("Add more routes");
        ul.appendChild(li);

        // let li = document.createElement("li");
        // // li.className = "sidebar-header";
        // li.className = "header-menu";
        // // this.container.appendChild(li);
        // let span = document.createElement("span");        
        // span.innerHTML = name;
        // li.appendChild(span);

        // const a = document.createElement("a");
        // a.setAttribute("href", "#");
        // a.innerHTML = '<i class="far fa-moon"></i> Lights Out<span class="badge badge-pill badge-danger">OFF</span>';
        // const className = "far fa-moon";
        // const classNameActive = "far fa-moon text-warning";
        // const linkName = '<span class="svg-icon"><i class="'+className+'"></i></span> Lights Out';
        const linkName = headline;
        // const linkNameActive = '<span class="svg-icon"><i class="'+classNameActive+'"></i></span> Lights Out';
        
        const s = document.createElement("span");
        const a = document.createElement("button");
        a.className = "btn btn-primary";
        // a.innerHTML = '<i class="fas fa-spinner"></i> '+linkName;
        a.innerHTML = '<i class="fas fa-plus"></i> '+linkName;
        s.appendChild(a);

        li.appendChild(s);
        
        a.addEventListener("click", ()=>{
            div.style.display = "none";
            callback();
        });

        this.init();

    }

    _addHeader( name ) {
        // header
        let li = document.createElement("li");
        li.className = "header-menu";
        // this.container.appendChild(li);
        let span = document.createElement("span");        
        span.innerHTML = name;
        li.appendChild(span);
        return li;
    }

    addRoute( route ) {

        const div = document.createElement("div");
        div.className = "sidebar-menu sidebar-item";
        this.container.appendChild(div);
        // this.test.insertBefore(div, this.test.firstChild);
        // this.test.insertBefore(div, this.test.children[1]);
        const ul = document.createElement("ul");
        div.appendChild(ul);

        const safeName = route.name.replace(/[^A-Z0-9]+/ig, "_") + "collapse";
        const info = route.name;
        
        let li = this._addHeader(info);
        // // header
        // let li = document.createElement("li");
        // li.className = "header-menu";
        // // this.container.appendChild(li);
        // let span = document.createElement("span");
        // span.innerHTML = info;
        // li.appendChild(span);
        // // header

        // Animation
        // const sub1 = new SidebarDropdown("Animation", Icon({ prefix: 'fas', iconName: "tachometer-alt" }));
        const sub1 = new SidebarDropdown("Animation", "fa fa-tachometer-alt");
        let links = [];

        var li2 = document.createElement("li");
        var svgSpan = document.createElement("span");
        svgSpan.className = "bulletpoint";
        var bulletpoint = document.createElement("i");
        bulletpoint.className = "far fa-play-circle";
        svgSpan.appendChild(bulletpoint);

        function icon(className, id) {
            const icon = document.createElement("i");
            icon.className = className;
            icon.id = id;
            return icon;
        }

        function mediaControlButton(text, className, icon) {
            const button = document.createElement("button");
            button.className = className;
            button.innerText = text;
            button.type = "button";
            button.insertBefore(icon, button.firstChild);
            return button;
        }

        const buttonClass = "btn btn-lg btn-primary shadow-none";

        var buttonGroup = document.createElement("div");
		buttonGroup.className = "btn-group";
        
		var playIcon = icon("fas fa-play-circle", "play");
		var playButton = mediaControlButton(" Play", buttonClass, playIcon);
        // playButton.onclick = () => route.runAnimation = true;
        
		var pauseIcon = icon("fas fa-pause-circle", "pause");
		var pauseButton = mediaControlButton("", buttonClass, pauseIcon);
		pauseButton.onclick = () => route.pauseAnimation = true;
		// pauseButton.innerText = " Pause";
        let firstStart = true;
        playButton.onclick = function() {

            if( route.runAnimation === false && firstStart === true ) {
                this.innerHTML = pauseIcon.outerHTML + " Pause";
                route.runAnimation = true;
                firstStart = false;
            } else if (route.runAnimation === false && firstStart === false ) {
                this.innerHTML = pauseIcon.outerHTML + " Pause";
                route.pauseAnimation = false;
            } else {
                this.innerHTML = playIcon.outerHTML + " Continue";
                route.pauseAnimation = true;
            }
        }
        
		var stopIcon = icon("fas fa-stop-circle", "stop");
		var stopButton = mediaControlButton("", buttonClass, stopIcon);
		// stopButton.innerText = " Stop";
		stopButton.onclick = function() {
            route.runAnimation = false;
            playButton.innerHTML = playIcon.outerHTML + " Play";
        }

		buttonGroup.appendChild( playButton );
		// buttonGroup.appendChild( pauseButton );
		buttonGroup.appendChild( stopButton );

		li2.appendChild( buttonGroup );

        links.push(li2);
        sub1.submenu(links);
        sub1.active = false;

        // route settings
        // const sub3 = new SidebarDropdown("Settings", Icon({ prefix: 'fa', iconName: "cog" })); 
        const sub3 = new SidebarDropdown("Settings", "fa fa-cog"); 
        
        let label2 = document.createElement("label");
        label2.innerHTML = "Show Route";
        label2.className = "custom-control-label";
        label2.htmlFor = safeName + "showRoute";
        
        const checkBox = document.createElement( "input" );
		checkBox.setAttribute( "type", "checkbox" );
		checkBox.id = safeName + "showRoute";
		checkBox.className = "custom-control-input";
		checkBox.checked = true;
		checkBox.addEventListener( 'change', changeHandler.bind( route ) );
                                        
        function changeHandler( event ) {
			if ( event.target.checked === true ) {
                this.isVisible = true;
                this.showLabels = checkboxShowLabels.checked;
                // this.showLabels = this.showLabels;
                // todo grey out
			}
			else {
				this.isVisible = false;
			}
		}

        const a2 = document.createElement("a");
        a2.className = "hasInput custom-control custom-checkbox";
        a2.setAttribute("href","#");
        a2.appendChild(checkBox);
        a2.appendChild(label2);
        let liLabel2 = document.createElement("li");
        liLabel2.appendChild(a2);

        const checkboxShowLabels = document.createElement( "input" );
		checkboxShowLabels.setAttribute( "type", "checkbox" );
		checkboxShowLabels.id = safeName + "showLabel";
		// checkBox.className = "form-check-input";
		checkboxShowLabels.className = "custom-control-input";
		checkboxShowLabels.checked = route.showLabels;
		checkboxShowLabels.addEventListener( 'change', function() {
            route.showLabels = this.checked;
        });

        
        let label = document.createElement("label");
        label.innerHTML = "Show Labels";
        label.className = "custom-control-label";
        label.htmlFor = safeName + "showLabel";

        const a = document.createElement("a");
        a.className = "hasInput custom-control custom-checkbox";
        a.setAttribute("href","#");
        a.appendChild(checkboxShowLabels);
        a.appendChild(label);
        let liLabel = document.createElement("li");
        liLabel.appendChild(a);

        sub3.submenu([liLabel2, liLabel]);
        
        // const sub4 = new SidebarDropdown("test", Icon({ prefix: 'fa', iconName: "wrench" }));
        const sub4 = new SidebarDropdown("test", "fa fa-wrench");
        sub4.active = true;

        // POIS
        // const sub2 = new SidebarDropdown("Points of Interest", Icon({ prefix: 'fa', iconName: "map-marker" }));
        const sub2 = new SidebarDropdown("Points of Interest", "fa fa-map-marker");
        // sub2.submenu(["Mexico", "USA", "Kanada", "Zurück nach Unterwegs"].map(x => liplusa(x)));
        
        const pois = route.pois.map(poi => {
            const hopDistance = numberWithCommas( Math.floor( poi.hopDistance ) );
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.setAttribute("href", "#");
            a.addEventListener("click", ()=>{
                this._controls.moveIntoCenter( poi.lat, poi.lng, 1000 );
            });

            const svgSpan = document.createElement("span");
            svgSpan.className = "bulletpoint";
            const bulletpoint = document.createElement("i");
            bulletpoint.className = "far fa-circle";
            // bulletpoint.className = "far fa-dot-circle";
            // bulletpoint.className = "fas fa-circle";
            svgSpan.appendChild(bulletpoint);

            // a.innerHTML = svgSpan.outerHTML + poi.adresse + " (" + hopDistance + " km)";
            a.innerHTML = poi.adresse + " (" + hopDistance + " km)";
            li.appendChild( a );
            return li;
        });
        
        sub2.addBadge("info", pois.length);
        sub2.submenu(pois);
/*
        // POIS
        var citys = route._routeData;
		for ( var index = 0; index < citys.length; ++index) {
			if( citys[index].adresse !== "" )
			{
				buildList(index, citys[index]);
				// addCityButton( index, folder7 );
			}
			else if ( index === citys.length-1 ) {
				// citys[ index ].adresse = "Gesamtstrecke"
				// addCityButton( index, folder7 );
			}
		}

		function addCityButton( i, folder ) {
			folder.add( { add : function(){ 
				if( that._controls.rotateToCoordinate instanceof Function ){
					that._controls.rotateToCoordinate( that.citys[ i ].lat, that.citys[ i ].lng );
				}
			} }, 'add').name( that.citys[i].adresse + " (" + numberWithCommas( Math.floor( that.citys[ i ].hopDistance ) ) + " km)" );
        }
        */
               
    //    this.container.insertBefore(sub4.li, this.container.firstChild);
    //    this.container.insertBefore(sub3.li, this.container.firstChild);
    //    this.container.insertBefore(sub2.li, this.container.firstChild);
    //    this.container.insertBefore(sub1.li, this.container.firstChild);
    //    this.container.insertBefore(li, this.container.firstChild);
        ul.appendChild(li);
        ul.appendChild(sub1.li);
        ul.appendChild(sub2.li);
        ul.appendChild(sub3.li);

        this.init( div );

    }


    init( el ) {

        // slide open onload any active links
        $(".sidebar-dropdown > a").parent(".active").children(".sidebar-submenu").slideDown(200);

        // remove click handler to prevent errors on multiple calls on init
        $(".sidebar-dropdown > a").off("click");

        $(".sidebar-dropdown > a").click(function () {
            // $(".sidebar-submenu").slideUp(200);
            $(this).parent().toggleClass("active");
            $(this).next(".sidebar-submenu").slideToggle(200);
        });
        
        $(".sidebar-content").mCustomScrollbar("destroy");
        $(".sidebar-content").mCustomScrollbar({
            axis: "y",
            autoHideScrollbar: true,
            scrollInertia: 300,
        });

        if( el !== undefined ) {
            $(".sidebar-content").mCustomScrollbar("scrollTo", el );
        }

    }

};
import $ from "jquery";
import { numberWithCommas } from "../../utils/panoutils";
import * as prosidebar from "../../../vendor/pro-sidebar/js/custom";
import Config from '../../data/config';

class SidebarDropdown {
    constructor( name, iconClassName ) {

        const li = document.createElement("li");
        li.className = "sidebar-dropdown";
        this.a = document.createElement("a");
        this.a.setAttribute("href", "#");
        const i = document.createElement("i");
        i.className = iconClassName;
        const svgSpan = document.createElement("span");
        svgSpan.className = "svg-icon";
        svgSpan.appendChild(i);
        this.a.appendChild(svgSpan);
        // this.a.appendChild(i);
        const span = document.createElement("span");
        span.innerHTML = name;
        this.a.appendChild(span);
        li.appendChild(this.a);

        // icon on right side of dropdown list
        const svgSpanCaret = document.createElement("span");
        svgSpanCaret.className = "caret";
        const bulletpoint = document.createElement("i");
        bulletpoint.className = "fas fa-caret-right";
        svgSpanCaret.appendChild(bulletpoint);
        this.a.appendChild(svgSpanCaret);

        this.li = li;

    }

    addBadge(className, value) {
        const span = document.createElement("span");
        span.className = "badge badge-pill badge-"+className;
        span.innerHTML = value;
        this.a.appendChild(span);
    }

    setActive() {
        this.li.className += " active";
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
    constructor(lights, globus) {

        const sidebar = document.getElementById("sidebar").firstElementChild;
        const div = document.createElement("div");
        div.className = "sidebar-menu";
        sidebar.appendChild(div);
        const ul = document.createElement("ul");
        div.appendChild(ul);

        this.container = ul;

        this._lights = lights;
        this._globus = globus;

        this._addSettings( ul );
        
        $("#toggle-sidebar2").click(() => {
            $(".page-wrapper").toggleClass("toggled");
        });

    }

    _addSettings(container) {

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
        container.appendChild(li);
        
        var li2 = document.createElement("li");
        li2.className = "sidebar-settings-menu";


        // const span = document.createElement("span");
        // span.className = "badge badge-pill badge-"+className;
        // span.innerHTML = value;
        // this.a.appendChild(span);

        const a = document.createElement("a");
        a.setAttribute("href", "#");
        // a.innerHTML = '<i class="far fa-moon"></i> Lights Out<span class="badge badge-pill badge-danger">OFF</span>';
        const className = "far fa-moon";
        const classNameActive = "far fa-moon text-warning";
        const linkName = '<span class="svg-icon"><i class="'+className+'"></i></span> Lights Out';
        const linkNameActive = '<span class="svg-icon"><i class="'+classNameActive+'"></i></span> Lights Out';
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
        container.appendChild(li2);
        

        $(".sidebar-settings-menu").hide();
        
        $(".sidebar-settings-link").click(() => {
            $(".sidebar-settings-menu").fadeToggle();
            // $(".sidebar-settings-menu").slideToggle();

            // $(".sidebar-content").mCustomScrollbar("scrollTo","bottom");
            $(".sidebar-content").mCustomScrollbar("scrollTo",$(".sidebar-settings-menu"));

            $(".badge-sonar").hide();
        });
    }

    addRoute( route ) {

        const safeName = route.name.replace(/[^A-Z0-9]+/ig, "_") + "collapse";
        const info = route.name;

        // header
        let li = document.createElement("li");
        li.className = "header-menu";
        // this.container.appendChild(li);
        let span = document.createElement("span");
        span.innerHTML = info;
        li.appendChild(span);
        // header

        // Animation
        const sub1 = new SidebarDropdown("Animation", "fa fa-tachometer-alt");
        sub1.submenu(liplusa("play pause oder so"));
        
        // route settings
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
        
        const sub4 = new SidebarDropdown("test", "fa fa-wrench");
        sub4.setActive();

        // POIS
        const sub2 = new SidebarDropdown("Points of Interest", "fa fa-map-marker");
        // sub2.submenu(["Mexico", "USA", "Kanada", "Zurück nach Unterwegs"].map(x => liplusa(x)));
        
        const pois = route.pois.map(poi => {
            const hopDistance = numberWithCommas( Math.floor( poi.hopDistance ) );
            const li = document.createElement("li");
            const a = document.createElement("a");

            const svgSpan = document.createElement("span");
            svgSpan.className = "bulletpoint";
            const bulletpoint = document.createElement("i");
            bulletpoint.className = "far fa-circle";
            // bulletpoint.className = "far fa-dot-circle";
            // bulletpoint.className = "fas fa-circle";
            svgSpan.appendChild(bulletpoint);

            a.innerHTML = svgSpan.outerHTML + poi.adresse + " (" + hopDistance + " km)";
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
       this.container.insertBefore(sub3.li, this.container.firstChild);
       this.container.insertBefore(sub2.li, this.container.firstChild);
       this.container.insertBefore(sub1.li, this.container.firstChild);
       this.container.insertBefore(li, this.container.firstChild);

       this.init();

    }


    init() {
        // slide open onload any active links
        $(".sidebar-dropdown > a").parent(".active").children(".sidebar-submenu").slideDown(200);

        // remove click handler to prevent errors on multiple calls on init
        $(".sidebar-dropdown > a").off("click");

        $(".sidebar-dropdown > a").click(function () {
            // $(".sidebar-submenu").slideUp(200);
            if ($(this).parent().hasClass("active")) {
                // $(".sidebar-dropdown").removeClass("active");
                $(this).next(".sidebar-submenu").slideUp(200);
                $(this).parent().removeClass("active");
            } else {
                // $(".sidebar-dropdown").removeClass("active");
                $(this).next(".sidebar-submenu").slideDown(200);
                $(this).parent().addClass("active");
            }
        });

    }

};


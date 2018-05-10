import $ from "jquery";
import { numberWithCommas } from "../../utils/panoutils";
import * as prosidebar from "../../../vendor/pro-sidebar/js/custom";

class SidebarDropdown {
    constructor( name, iconClassName ) {

        const li = document.createElement("li");
        li.className = "sidebar-dropdown";
        const a = document.createElement("a");
        a.setAttribute("href", "#");
        const i = document.createElement("i");
        i.className = iconClassName;
        a.appendChild(i);
        const span = document.createElement("span");
        span.innerHTML = name;
        a.appendChild(span);
        li.appendChild(a);

        this.li = li;

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
    const a = document.createElement("a");
    a.setAttribute("href", "#");
    a.innerHTML = el;
    li.appendChild(a)
    return li;
}

export default class Sidebar {
    constructor() {

        const sidebar = document.getElementById("sidebar").firstElementChild;
        const div = document.createElement("div");
        div.className = "sidebar-menu";
        sidebar.appendChild(div);
        const ul = document.createElement("ul");
        div.appendChild(ul);

        this.container = ul;

        this.addSettings( ul );
        
        $("#toggle-sidebar2").click(() => {
            $(".page-wrapper").toggleClass("toggled");
        });

    }

    addSettings(container) {

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
        li.innerHTML = "<span>Settings</span>";
        container.appendChild(li);

        var li2 = document.createElement("li");
        li2.className = "sidebar-settings-menu";
        const themes = ["chiller-theme", "ice-theme", "cool-theme", "light-theme","green-theme","spicy-theme","purple-theme"];
        themes.forEach((theme)=>{
            li2.appendChild(getLink(theme.slice(0,-6)));
            container.appendChild(li2);
        });

        $(".sidebar-settings-menu").hide();
        
        $(".sidebar-settings-link").click(() => {
            $(".sidebar-settings-menu").fadeToggle();
            // $(".sidebar-settings-menu").slideToggle();
            $(".badge-sonar").hide();
        });
    }

    addRoute( route ) {

        // const safeName = route.name.replace(/[^A-Z0-9]+/ig, "_") + "collapse";
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
        
        var checkBox = document.createElement( "input" );
		checkBox.setAttribute( "type", "checkbox" );
		checkBox.id = route.name + "showLabel";
		checkBox.className = "form-check-input";
		checkBox.checked = true;
		checkBox.addEventListener( 'change', function() {
            route.showLabels = this.checked;
		});
        
        let label = document.createElement("label");
        label.innerHTML = "Show Labels";
        label.className = "form-check-label";
        label.htmlFor = route.name + "showLabel";

        const a = document.createElement("a");
        a.className = "hasInput";
        a.appendChild(checkBox);
        a.appendChild(label);
        let liLabel = document.createElement("li");
        liLabel.appendChild(a);
        sub3.submenu(liLabel);
        
        const sub4 = new SidebarDropdown("test", "fa fa-wrench");
        sub4.setActive();

        // POIS
        const sub2 = new SidebarDropdown("Points of Interest", "fa fa-map-marker");
        // sub2.submenu(["Mexico", "USA", "Kanada", "Zurück nach Unterwegs"].map(x => liplusa(x)));

        const pois = route.pois.map(poi => {
            const hopDistance = numberWithCommas( Math.floor( poi.hopDistance ) );
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.innerHTML = poi.adresse + " (" + hopDistance + " km)";
            li.appendChild( a );
            return li;
        });

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
        /*
    

        var themes = "chiller-theme ice-theme cool-theme light-theme green-theme spicy-theme purple-theme";
        $('[data-theme]').click(function () {
            $('[data-theme]').removeClass("selected");
            $(this).addClass("selected");
            $('.page-wrapper').removeClass(themes);
            $('.page-wrapper').addClass($(this).attr('data-theme'));
        });
    
        */
    }

};


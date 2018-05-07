/**
 * HUD
 */
import $ from "jquery";
import { numberWithCommas } from "../../utils/panoutils";

export default class HUD {
    constructor( container ) {

		let sidebarwrapper = document.createElement( 'div' );
		sidebarwrapper.id = "sidebar-wrapper"; 
		sidebarwrapper.className = "";
		sidebarwrapper.innerHTML = '<a href="#" id="menu-toggle2" class="animatedArrow bounceleft"> \
		<span class="panohidden2"><i class="fas fa-angle-right"></i></span>&nbsp; \
		</a>';
		
		this._ul = document.createElement("ul");
		this._ul.className = "sidebar-nav";
        sidebarwrapper.appendChild( this._ul );
		
		// class="text-right"
		this._ul.innerHTML = '<li class="sidebar-brand"> \
		<a href="#menu-toggle" id="menu-toggle"> \
		<!-- <span class="panohidden"><i class="fas fa-angle-right"></i></span> --> \
		PANO GLOBE \
		<span class="float-right animatedArrow bounce"><i class="fas fa-angle-left"></i></span> \
		</a> \
		</li>';
		
		container.insertBefore( sidebarwrapper, container.firstChild );

		// <!-- Menu Toggle Script -->
		$("#menu-toggle").click(function(e) {
			e.preventDefault();
			$("#wrapper").toggleClass("toggled");
			$(".sidebar-nav").fadeToggle();
			// $(".panohidden").fadeToggle();
		});

		$("#menu-toggle2").click(function(e) {
			e.preventDefault();
			$("#wrapper").addClass("toggled");
			$(".sidebar-nav").fadeToggle();
			// $(".panohidden").fadeToggle();
		});
    }


    createLabel( route ) {

		var info = route.name;

		var box = document.createElement( 'li' );
		
		/*
		var row = document.createElement("div");
		row.className = "row";
		box.appendChild(row);
		
		var col = document.createElement("div");
		col.className="col";
		row.appendChild(col);

		var card = document.createElement("div");
		card.className="card";
		col.appendChild(card);

		card.innerHTML = '<div class="card-header">'+info+'\
				<div class="material-switch float-right">\
					<input id="'+info+'" name="someSwitchOption001" type="checkbox" checked />\
					<label for="'+info+'" class="badge-primary"></label>\
				</div>\
			</div>\
			';

		var listGroup = document.createElement("ul");
		listGroup.className="list-group";
		card.appendChild(listGroup);

		var listGroupLi = document.createElement("li");
		listGroupLi.className="list-group-item";
		listGroup.appendChild(listGroupLi);

		listGroupLi.innerHTML = 'Show labels\
		<div class="material-switch float-right">\
			<input id="'+info+'label" name="someSwitchOption001" type="checkbox" checked/>\
			<label for="'+info+'label" class="badge-secondary"></label>\
		</div>\
		';
		*/

		var formcheck = document.createElement("form");
		
		box.appendChild( formcheck );
		formcheck.className = "form-check";

		var checkBox = document.createElement( "input" );
		checkBox.setAttribute( "type", "checkbox" );
		checkBox.id = info;
		checkBox.className = "form-check-input";
		checkBox.checked = true;
		checkBox.addEventListener( 'change', changeHandler.bind( route ) );
		formcheck.appendChild( checkBox );
		
		var label = document.createElement( "label" );
		label.innerHTML = info //+ ' <span class="badge badge-primary badge-pill">14</span>';
		label.htmlFor = info;
		label.className = "form-check-label";
		formcheck.appendChild( label );

		var innerList = document.createElement("ul");
		formcheck.appendChild( innerList );

		function changeHandler( event ) {
			if ( event.target.checked === true ) {
				this.show();
				// $(innerList).slideToggle();
				// $(innerList).show();
				$(innerList).fadeToggle("fast");
			}
			else {
				this.hide();
				// $(innerList).slideToggle();
				// $(innerList).hide();
				$(innerList).fadeToggle("fast");
			}
		}

		this._ul.appendChild( box );
		
		var li = document.createElement("li");
		// listGroup.appendChild(li);
		innerList.appendChild(li);

		var buttonGroup = document.createElement("div");
		buttonGroup.className = "btn-group";

		var playButton = document.createElement("button");
		playButton.className="btn btn-secondary";
		playButton.type = "button";
		playButton.style.cursor = "pointer";
		playButton.innerText = " Play";
		playButton.onclick = route.startAnimate.bind(route);

		var playIcon = document.createElement("i");
		playIcon.id = "play";
		playIcon.className = "fas fa-play-circle";

		playButton.insertBefore(playIcon, playButton.firstChild);

		var pauseButton = document.createElement("button");
		pauseButton.className="btn btn-secondary";
		pauseButton.type = "button";
		pauseButton.style.cursor = "pointer";
		pauseButton.onclick = route.pauseAnimate.bind(route);
		// pauseButton.innerText = " Pause";

		var pauseIcon = document.createElement("i");
		pauseIcon.id = "pause";
		pauseIcon.className = "fas fa-pause-circle";

		pauseButton.insertBefore(pauseIcon, pauseButton.firstChild);

		var stopButton = document.createElement("button");
		stopButton.className="btn btn-secondary";
		stopButton.type = "button";
		stopButton.style.cursor = "pointer";
		// stopButton.innerText = " Stop";
		stopButton.onclick = reset;

		var stopIcon = document.createElement("i");
		stopIcon.id = "stop";
		stopIcon.className = "fas fa-stop-circle";

		stopButton.insertBefore(stopIcon, stopButton.firstChild);


		function togglePlay() { 
			// this.classList.toggle( "play" );
			// this.classList.toggle( "pause" );
			route.toggleAnimate();
			return false;
		};

		buttonGroup.appendChild( playButton );
		buttonGroup.appendChild( pauseButton );
		buttonGroup.appendChild( stopButton );
		// li.className="list-group-item text-center";
		li.appendChild( buttonGroup );

		// var box = document.createElement( 'li' );
		// var formcheck = document.createElement("div");
		// formcheck.className = "form-check";
		// box.appendChild( formcheck );

		var li2 = document.createElement("li");
		innerList.insertBefore(li2, innerList.firstElement);

		var checkBox = document.createElement( "input" );
		checkBox.setAttribute( "type", "checkbox" );
		checkBox.id = route.name + "showLabel";
		checkBox.className = "form-check-input";
		checkBox.checked = true;
		checkBox.addEventListener( 'change', function() {
			route.showLabels = this.checked;
		});
		li2.appendChild( checkBox );
		
		var label = document.createElement( "label" );
		label.innerHTML = "Show Labels";
		label.htmlFor = route.name + "showLabel";
		label.className = "form-check-label";
		li2.appendChild( label );

		function reset() {
			route.reset();
			// playLink.classList.add( "play" );
			// playLink.classList.remove( "pause" );
		}


		// function reset() { 

		// 	this.classList.toggle( "play");
		// 	this.classList.toggle( "pause");
		// 	route.toggleAnimate();
		// 	return false;
		// };

	// 	<div class="panel-group">
	// 	<div class="panel panel-default">
	// 	  <div class="panel-heading">
	// 		<h4 class="panel-title">
	// 		  <a data-toggle="collapse" href="#collapse1">Collapsible list group</a>
	// 		</h4>
	// 	  </div>
	// 	  <div id="collapse1" class="panel-collapse collapse">
	// 		<ul class="list-group">
	// 		  <li class="list-group-item">One</li>
	// 		  <li class="list-group-item">Two</li>
	// 		  <li class="list-group-item">Three</li>
	// 		</ul>
	// 	  </div>
	// 	</div>
	//   </div>

	var safeName = route.name.replace(/[^A-Z0-9]+/ig, "_") + "collapse";

	var li = document.createElement("li");
	innerList.appendChild(li);

	
	var panelGroup = document.createElement("div");
	panelGroup.className="panel-group";
	innerList.appendChild(panelGroup);
	// li.appendChild(panelGroup);

	var poiContainer = document.createElement("div");
	poiContainer.className="panel panel-default";
	panelGroup.appendChild(poiContainer);

	var panelHead = document.createElement("div");
	panelHead.className="panel-heading";
	panelHead.innerHTML = '<p class="panel-title"><a data-toggle="collapse" href="#'+safeName+'">Points of Interest</a></p>';
	poiContainer.appendChild(panelHead);

	var collapse = document.createElement("div");
	collapse.className="panel-collapse collapse";
	collapse.id = safeName;
	poiContainer.appendChild(collapse);

	var listGroup = document.createElement("ul");
	listGroup.className="list-group";
	collapse.appendChild(listGroup);

		
		// var poiList = document.createElement("ul");
		// poiList.className="list-group";
		// poiList.style.padding = "0px 0px";
		
		
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

		function buildList( index ) {
			var li = document.createElement("li");
			li.className = "list-group-item";
			listGroup.appendChild(li);
			li.innerHTML = citys[index].adresse + " (" + numberWithCommas( Math.floor( citys[ index ].hopDistance ) ) + " km)"
		}
		
		function addCityButton( i, folder ) {
			folder.add( { add : function(){ 
				if( that._controls.rotateToCoordinate instanceof Function ){
					that._controls.rotateToCoordinate( that.citys[ i ].lat, that.citys[ i ].lng );
				}
			} }, 'add').name( that.citys[i].adresse + " (" + numberWithCommas( Math.floor( that.citys[ i ].hopDistance ) ) + " km)" );
		}

    }
    

}
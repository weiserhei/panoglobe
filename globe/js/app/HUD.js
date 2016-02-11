/**
 * HUD
 */
define([], function () {

	'use strict';
	
	function HUD( container ) {

		this._gui = document.createElement( 'div' );
		this._gui.id = "hudBox"; 
		this._gui.className = "apple";

		if( ( window.innerWidth && window.innerHeight ) > 720) {
	        // menu.addClass('limit1200');
	        // $('#body').removeClass('limit400');
			this._gui.classList.add( "normalBox" );
	    }else{
			this._gui.classList.add( "smallBox" );
	        // $('#body').removeClass('limit1200');
	    }

		container.appendChild( this._gui );

	}

	HUD.prototype.createLabel = function( route ) {

		var box = document.createElement( 'div' );
		box.className = "box firstBox"; 

		var info = route.name;

		var label = document.createElement( "label" );
		label.innerHTML = info;
		label.htmlFor = info;
		box.appendChild( label );

		var checkBox = document.createElement( "INPUT" );
		checkBox.setAttribute( "type", "checkbox" );
		checkBox.id = info;
		checkBox.checked = true;
		checkBox.addEventListener( 'change', changeHandler.bind( route ) );

		box.appendChild( checkBox );

		function changeHandler( event ) {

			if ( event.target.checked === true ) {

				this.show();
				playBox.style.display = "block";
				resetBox.style.display = "block";

			}
			else {

				this.hide();
				playBox.style.display = "none";
				resetBox.style.display = "none";

			}

		}

		this._gui.appendChild( box );

		var playBox = document.createElement( "div" );
		// playBox.innerHTML += '<a href="#" title="Play Route" class="play"></a>';
		playBox.className = "box";


		var menu = document.createElement( "menu" );
	    if( ( window.innerWidth && window.innerHeight ) > 720 ) {
	        // menu.addClass('limit1200');
	        // $('#body').removeClass('limit400');
	    }else{
	        menu.className = "small";
	        // $('#body').removeClass('limit1200');
	    }
		// menu.className = "medium";
		var playLink = document.createElement( "button" );
		playLink.className = "play";
		// var linkText = document.createTextNode("Play");
		// playLink.appendChild(linkText);
		// playLink.title = "PlayRoute";
		// playLink.href = "#";

		playLink.onclick = togglePlay;

		function togglePlay() { 

			this.classList.toggle( "play" );
			this.classList.toggle( "pause" );
			route.toggleAnimate();
			return false;
		};
		
		menu.appendChild( playLink );
		playBox.appendChild( menu );
		this._gui.appendChild( playBox );


		var resetBox = document.createElement( "div" );
		// playBox.innerHTML += '<a href="#" title="Play Route" class="play"></a>';
		resetBox.className = "box";

		var resetButton = document.createElement( "a" );
		resetButton.className = "reset";
		var linkText = document.createTextNode("Reset");
		resetButton.appendChild(linkText);
		// playLink.title = "PlayRoute";
		resetButton.href = "#";

		resetButton.onclick = reset;

		function reset() {

			route.reset();

			playLink.classList.add( "play" );
			playLink.classList.remove( "pause" );
			
		}


		// function reset() { 

		// 	this.classList.toggle( "play");
		// 	this.classList.toggle( "pause");
		// 	route.toggleAnimate();
		// 	return false;
		// };

		resetBox.appendChild( resetButton );
		this._gui.appendChild( resetBox );
		// return box;

	};

    return HUD;
});
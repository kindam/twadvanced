TWA.profileCoords = function() {
	var // lista de aldeias
		tr = document.getElementById( 'villages_list' ).getElementsByTagName( 'tr' ),
		coords = [],
		timeout,
		points;
	
	// faz o loop em todas aldeias
	for ( var i = 1; i < tr.length - 1; i++ ) {
		// pontos da aldeia
		points = Number( tr[ i ].getElementsByTagName( 'td' )[ 2 ].innerHTML.replace( '<span class="grey">.</span>', '' ) );
		
		// verifica se os pontos da aldeia passa pelo filtro de pontos maximos/minimos
		if ( points > TWA.settings._profilecoordsmin && points < TWA.settings._profilecoordsmax ) {
			// adiciona coordenada na lista
			coords.push( tr[ i ].getElementsByTagName( 'td' )[ 1 ].innerHTML );
		}
	}
	
	// adiciona opções e caixa de coordenadas
	jQuery( '<table class="vis" id="twa-profilecoords" width="100%"><tr><th>{everycoords}</th></tr><tr><td><textarea style="width:100%;background:none;border:none;resize:none;font-size:11px">' + coords.join(' ') + '</textarea></td></tr><tr><td><label><input style="width:40px" name="_profilecoordsmin"/> {min}</label><br/><label><input style="width:40px" name="_profilecoordsmax"/> {max}</label></td></tr></table><br/>'.lang( 'profilecoords' ) ).insertBefore( '#villages_list' ).find( 'input' ).each(function() {
		this.value = TWA.settings[ this.name ];
	// ao alterar os valores as configurações são salvas
	}).change(function() {
		var elem = this;
		
		clearTimeout( timeout );
		timeout = setTimeout(function () {
			TWA.settings[ elem.name ] = Number( elem.value );
			TWA.storage( true );
		}, 1000);
	});
};
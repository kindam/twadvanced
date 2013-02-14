TWA.mapManual = function() {
	console.log('TWA.mapManual()');
	
	// opções e caixa de coordenadas
	jQuery( '#map_whole' ).after( '<br/><table class="vis" width="100%" id="twa-mapmanual"><tr><th>' + lang.mapmanual.getcoords + '</th></tr><tr><td style="text-align:center"><textarea style="width:100%;background:none;border:none;resize:none;font-size:11px"></textarea></td></tr></table>' );
	
	// caixa de coordenadas
	var input = jQuery( '#twa-mapmanual textarea' ),
		coords = [],
		village;
	
	// ao clicar em uma aldeia no mapa
	TWMap.map._handleClick = function( event ) {
		// obtem a coordenada da aldeia
		var coord = this.coordByEvent( event );
		
		if ( village = TWMap.villages[ coord.join( '' ) ] ) {
			coord = coord.join( '|' );
			
			// verifica se a coordenada ja esta na lista
			if ( coords.indexOf( coord ) < 0 ) {
				// adiciona a coordenada na lista
				coords.push( coord );
				// atualiza a caixa de coordenadas
				input.val( coords.join( ' ' ) );
				
				// adiciona a marcação no mapa
				TWA.mapElement({
					id: 'twa-manual-' + village.id,
					vid: village.id,
					Class: 'twa-mapmanual',
					pos: [ TWA.settings.lastattack && game_data.player.premium ? 15 : 25, TWA.settings.mapidentify ? 28 : 38 ]
				}, {
					width: 7,
					height: 7,
					borderRadius: 10,
					background: 'red',
					border: '1px solid #000',
					opacity: 0.7
				});
			// caso a coordenada ja esteja na lista
			} else {
				// remove
				coords.remove( coords.indexOf( coord ) );
				// atualiza a caixa de coordenadas
				input.val( coords.join( ' ' ) );
				// remove a marcação do mapa
				jQuery( '#twa-manual-' + village.id ).remove();
			}
		}
		
		return false;
	}
};
TWA.mapCoords = {
	init: function() {
		// opções e caixa de coordenadas
		var html = jQuery( '<br/><table class="vis" width="100%" id="twa-getcoords"><tr><th>{getcoords} <a href="#" class="refresh">» {update}</a></th></tr><tr><td style="text-align:center"><textarea style="width:100%;background:none;border:none;resize:none;font-size:11px"></textarea></td></tr><tr><td class="options"><label><input type="checkbox" name="_mapplayers"> {mapplayers}</label> {min}: <input name="_mapplayersmin" style="width:35px"> {max}: <input name="_mapplayersmax" style="width:35px"><br/><label><input name="_mapabandoneds" type="checkbox"> {mapabandoneds}</label> {min}: <input name="_mapabandonedsmin" style="width:35px"> {max}: <input name="_mapabandonedsmax" style="width:35px"></td></tr></table>'.lang( 'mapcoords' ) ).insertAfter( '#map_whole' );
		
		// faz o loop das entradas de configurações
		html.find( '.options input' ).each(function() {
			this[ this.type === 'checkbox' ? 'checked' : 'value' ] = TWA.settings[ this.name ];
		// ao alterar os valores as opções são salvas
		}).change(function() {
			var elem = this;
			
			Delay('savemapCoords', function() {
				var value = elem[ elem.type === 'checkbox' ? 'checked' : 'value' ];
				
				TWA.settings[ elem.name ] = elem.type === 'checkbox' ? value : Number( value );
				TWA.storage( true );
			}, 1000);
		});
		
		html.find( '.refresh' ).click(function() {
			return TWA.mapCoords.get();
		});
		
		TWA.mapCoords.get();
	},
	get: function() {
		var coords = [],
			get;
		
		// remove todas as marcações
		jQuery( '.twa-identify' ).remove();
		
		// faz o loop em todas aldeias do mapa
		mapVillages(function( coord ) {
			// caso a aldeia seja barbara
			if ( this.owner === '0' ) {
				// verifica se a aldeia esta com os pontos de acordo com o filtro
				get = TWA.settings._mapabandoneds && this.points > Number( TWA.settings._mapabandonedsmin ) && this.points < Number( TWA.settings._mapabandonedsmax );
			} else {
				get = TWA.settings._mapplayers && this.points > Number( TWA.settings._mapplayersmin ) && this.points < Number( TWA.settings._mapplayersmax );
			}
			
			// caso a aldeia tenha passado pelo filtro
			if ( get ) {
				// coloca a coordenada na lista
				coords.push( coord.join( '|' ) );
				
				// caso a marcação no mapa esteja ativada
				if ( TWA.settings.mapidentify ) {
					TWA.mapElement({
						id: 'twa-mapcoords' + this.id,
						vid: this.id,
						Class: 'twa-identify',
						pos: [ TWA.settings.lastattack && game_data.player.premium ? 15 : 25, 38 ]
					}, {
						width: 7,
						height: 7,
						borderRadius: 10,
						background: 'green',
						border: '1px solid #000',
						opacity: 0.7
					});
				}
			}
		});
		
		// coloca as coordenadas obtidas na caixa
		jQuery( '#twa-getcoords textarea' ).html( coords.join( ' ' ) );
		
		return false;
	}
};
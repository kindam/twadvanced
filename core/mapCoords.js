TWA.mapCoords = {
	init: function() {
		// opções e caixa de coordenadas
		jQuery( '#map_whole' ).after('<br/><table class="vis" width="100%" id="twa-getcoords"><tr><th>' + lang.mapcoords.getcoords + ' <a href="#" id="twa-mapcoords-refresh">» ' + lang.mapcoords.update + '</a></th></tr><tr><td style="text-align:center"><textarea style="width:100%;background:none;border:none;resize:none;font-size:11px"></textarea></td></tr><tr><td id="twa-getcoords-options"><label><input type="checkbox" name="_mapplayers"> ' + lang.mapcoords.mapplayers + '</label> ' + lang.mapcoords.min + ': <input name="_mapplayersmin" style="width:35px"> ' + lang.mapcoords.max + ': <input name="_mapplayersmax" style="width:35px"><br/><label><input name="_mapabandoneds" type="checkbox"> ' + lang.mapcoords.mapabandoneds + '</label> ' + lang.mapcoords.min + ': <input name="_mapabandonedsmin" style="width:35px"> ' + lang.mapcoords.max + ': <input name="_mapabandonedsmax" style="width:35px"></td></tr></table>' );
		
		var timeout;
		
		// faz o loop das entradas de configurações
		jQuery( '#twa-getcoords-options input' ).each(function() {
			this[ this.type === 'checkbox' ? 'checked' : 'value' ] = TWA.settings[ this.name ];
		// ao alterar os valores as opções são salvas
		}).change(function() {
			var elem = this;
			
			clearTimeout( timeout );
			
			timeout = setTimeout(function() {
				var value = elem[ elem.type === 'checkbox' ? 'checked' : 'value' ];
				
				TWA.settings[ elem.name ] = elem.type === 'checkbox' ? value : Number( value );
				TWA.storage( true );
			}, 1000);
		});
		
		document.getElementById( 'twa-mapcoords-refresh' ).onclick = function() {
			return TWA.mapCoords.get();
		};
		
		TWA.mapCoords.get();
	},
	get: function() {
		var coords = [],
			get;
		
		// remove todas as marcações
		jQuery( '.twa-identify' ).remove();
		
		// faz o loop em todas aldeias do mapa
		TWA.mapVillages(function( coord ) {
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
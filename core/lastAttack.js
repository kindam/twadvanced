TWA.lastAttack = function() {
	// caso as opções para mostrar popup ao passar o mouse nas
	//aldeias esteja desativada a ferramenta não pode prosseguir
	if ( !document.getElementById( 'show_popup' ).checked || !document.getElementById( 'map_popup_attack' ).checked ) {
		return false;
	}
	
	// remove todas as marcações
	jQuery( '.twa-lastattack' ).remove();
	
	// loop em todas aldeias do mapa
	return TWA.mapVillages(function() {
		jQuery.ajax({
			url: 'game.php?village=' + this.id + '&screen=overview&json=1&source=873',
			dataType: 'json',
			id: this.id,
			success: function( data ) {
				// caso tenha ocorrido algum ataque passado
				if ( data[ 0 ].attack ) {
					// obtem a data do ataque
					var last = data[ 0 ].attack.time.split( /\s[A-z]/ )[ 0 ].split( '.' );
						last = new Date( [ last[ 1 ], last[ 0 ], '20' + last[ 2 ] ].join( ' ' ) ).getTime();
					
					// data atual do jogo
					var now = $serverDate.text().split( '/' );
						now = new Date( [ now[ 1 ], now[ 0 ], now[ 2 ], $serverTime.text() ].join( ' ' ) ).getTime();
					
					// pega diferença entre o tempo atual e o ultimo ataque
					var time = new Date( now - last ).getTime(),
						year = Math.floor( time / 31536E6 ),
						day = Math.floor( time / 864E5 ),
						hour = Math.floor( time / 36E5 ),
						min = Math.floor( time / 6E4 ),
						format;
					
					// formata o tempo
					if ( year == 1 ) {
						format = year + ' ' + lang.lastattack.year;
					} else if ( year > 1 ) {
						format = year + ' ' + lang.lastattack.years;
					} else if ( day > 1 ) {
						format = day + lang.lastattack.days + ' ' + ( hour % 24 ) + 'h';
					} else if ( hour > 0 ) {
						min = min % 60;
						min = min < 10 ? '0' + min : min;
						hour = hour < 10 ? '0' + hour : hour;
						format = hour + ':' + min + 'h';
					} else {
						min = min < 10 ? '0' + min : min;
						format = '00:' + min + 'm';
					}
					
					// adiciona a marcação no mapa
					TWA.mapElement({
						vid: this.id,
						html: format,
						Class: 'twa-lastattack',
						pos: [ 25, 2 ]
					}, {
						width: 45,
						height: 10,
						fontSize: 8,
						borderRadius: 5,
						color: '#fff',
						textAlign: 'center',
						background: '#111',
						border: '1px solid #000',
						opacity: 0.7
					});
				}
			}
		});
	});
};
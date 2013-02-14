TWA.mapGenerator = function() {
	console.log( 'TWA.mapGenerator()' );
	
	var type = /ally/.test( game_data.mode ) ? 't' : 'p',
		colors = '00ff00 999999 823c0a b40000 f40000 0000f4 880088 f0c800 00a0f4 ff8800 ffff00 e0d3b8 04b45f 04b4ae 81f7f3 be81f7 fa58f4 ff0088 ffffff f7be81'.split( ' ' ),
		zoom = 120,
		x = 500,
		y = 500,
		con,
		base,
		url;
	
	// caso a página esteja em uma classificação por continente
	if ( /con/.test( game_data.mode ) ) {
		// pega as tabelas que serão usadas
		base = jQuery( '#con_player_ranking_table, #con_ally_ranking_table' );
		// zoom para continente
		zoom = 320;
		
		// pega o continene
		con = jQuery( 'h3' ).html().match( /\d+/ )[ 0 ];
		con = con.length === 1 ? '0' + con : con;
		
		x = con[ 1 ] + '50';
		y = con[ 0 ] + '50';
	
	// classificação por OD
	} else if ( /kill/.test( game_data.mode ) ) {
		base = jQuery( '#kill_player_ranking_table, #kill_ally_ranking_table' ).next();
	// classificação por medalhas
	} else if ( game_data.mode === 'awards' ) {
		base = jQuery( '#award_ranking_table' );
	} else {
		type === 't' && jQuery( '#ally_ranking_table tr:first th:eq(1)' ).width( 150 );
		base = jQuery( '#player_ranking_table, #ally_ranking_table' );
	}
	
	// faz o loop em todos jogadores/tribos e adiciona uma caixa para marcação
	base.find( 'tr:not(:first)' ).each(function( i ) {
		jQuery( 'td:eq(1)', this ).prepend( '<input class="map-item" type="checkbox" style="margin:0px;margin-right:20px" color="' + colors[ i ] + '" id="' + this.getElementsByTagName( 'a' )[ 0 ].href.match( /id\=(\d+)/ )[ 1 ] + '"/>' );
	}).eq( -1 ).after( '<tr><td colspan="8"><input type="button" id="twa-mapgenerator" value="' + lang.mapgenerator.generate + '"/> <label><input type="checkbox" id="checkall"/> <strong>' + lang.mapgenerator.selectall + '</strong></label></td></tr>' );
	
	document.getElementById( 'twa-mapgenerator' ).onclick = function() {
		url = 'http://' + game_data.market + '.twstats.com/' + game_data.world + '/index.php?page=map&';
		
		// loop em todas as tribos/jogadores
		jQuery( '.map-item' ).each(function( i ) {
			i++;
			
			// caso esteja marcado, adiciona ao url final
			if ( this.checked ) {
				url += type + 'i' + i + '=' + this.id + '&' + type + 'c' + i + '=' + this.getAttribute( 'color' ) + '&';
			}
		});
		
		// adiciona ao url o zoom e coordendas de centralização de acordo com a página de classificação atual
		url += 'zoom=' + zoom + '&centrex=' + x + '&centrey=' + y + '&nocache=1&fill=000000&grid=1&kn=1&bm=1';
		
		// abre uma aba com o TW Stats e o mapa
		window.open( url );
	};
	
	jQuery( '#checkall' ).click(function() {
		jQuery( '.map-item' ).attr( 'checked', this.checked );
	});
};
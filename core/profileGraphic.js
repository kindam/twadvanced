TWA.profileGraphic = function() {
	console.log( 'TWA.profileGraphic()' );
	
	// pega o id do jogador/tribo
	var id = location.search.match( /id=(\d+)/ )[ 1 ],
		// verifica se o perfil é de jogador ou tribo
		mode = game_data.screen === 'info_player' ? 'player' : 'tribe',
		// cria o url com o id do jogador e server
		url = 'http://' + game_data.world + '.tribalwarsmap.com/' + game_data.market + '/',
		// url do grafico de pontos
		points = url + 'graph/p_' + mode + '/' + id,
		// url do grafico de oda
		oda = url + 'graph/oda_' + mode + '/' + id,
		// url do grafico de odd
		odd = url + 'graph/odd_' + mode + '/' + id,
		// html que será adiciona no perfil com os graficos
		html = '<table class="vis" width="100%" id="twa-graphic"><tr><th><a href="' + url + 'history/' + mode + '/' + id + '">' + lang.profilegraphic.stats + ' <img src="http://www.hhs.gov/web/images/exit_disclaimer.png"/></a></th></tr><tr><td style="text-align:center"><p><img src="' + points + '"/></p><img src="' + oda + '"/><p><img src="' + odd + '"/></p></td></tr></table>';
	
	mode === 'player'
		? jQuery( '.vis:not([id^=twa]):eq(2)' ).after( '<br/>' + html )
		: jQuery( '#content_value > table tr:first' ).append( '<td valign="top">' + html + '</td>' );
};
TWA.tooltipGraphic = function() {
	jQuery( '<input type="hidden" id="twa-tooltipgraphic" />' ).appendTo( 'body' );
	
	jQuery( '#content_value a[href*=info_player], #content_value a[href*=info_ally]' ).each(function() {
		if ( /id=\d+/.test( this.href ) ) {
			var src = 'http://' + game_data.world + '.tribalwarsmap.com/' + game_data.market + '/graph/p_' + ( /info_player/.test( this.href ) ? 'player' : 'tribe' ) + '/' + this.href.match( /id=(\d+)/ )[ 1 ];
			
			new Image().src = src;
			this.setAttribute( 'tooltip', '<img src="' + src + '">' );
			
			jQuery.tooltip( this );
		}
	});
};
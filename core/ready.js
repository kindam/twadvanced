TWA.ready = function( callback ) {
	function success( builds, world, units ) {
		var args = arguments;
		
		if ( jQuery( '#hide_completed:checked', builds[ 0 ] ).length ) {
			return jQuery.post(jQuery( '#hide_completed', builds[ 0 ] ).attr( 'onclick' ).toString().split( "'" )[ 1 ], {
				hide_completed: false
			}, function() {
				success.apply( window, args );
			});
		}
		
		// loop em todos ativados no jogo
		jQuery( '#buildings a:has(img[src*=buildings])', builds[ 0 ] ).each(function() {
			// salva o nome na linguagem do servidor e universal
			TWA.data.builds[ jQuery( this ).text().trim() ] = this.href.match( /\=(\w+)$/ )[ 1 ];
		});
		
		// loop em todas configurações do jogo
		jQuery( 'config > *', world[ 0 ] ).each(function( i, elem ) {
			if ( i < 4 ) {
				TWA.data.world[ elem.nodeName ] = jQuery( elem ).text();
			} else {
				jQuery( '*', elem ).each(function () {
					TWA.data.world[ this.nodeName ] = Number( jQuery( this ).text() );
				});
			}
		});
		
		// loop em todas unidades ativadas do jogo
		jQuery( 'config > *', units[ 0 ] ).each(function() {
			if ( this.nodeName !== 'militia' ) {
				TWA.data.units[ this.nodeName ] = {
					speed: Math.round( Number( jQuery( 'speed', this ).text() ) ) * 60,
					carry: Number( jQuery( 'carry', this ).text() ),
					pop: Number( jQuery( 'pop', this ).text() )
				};
			}
		});
		
		TWA.storage( true, null, 'data' );
		callback();
	}
	
	if ( !TWA.data.builds ) {
		TWA.data.builds = {};
		TWA.data.world = {};
		TWA.data.units = {};
		
		jQuery.when( jQuery.get( TWA.url( 'main' ) ), jQuery.get( 'interface.php?func=get_config' ), jQuery.get( 'interface.php?func=get_unit_info' ) ).done( success );
	} else {
		callback();
	}
};
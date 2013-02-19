(function() {
	var page = 0,
		conquers = [],
		waitList = {},
		pageDown,
		pageUp,
		keydownHandler = function( event, first ) {
			if ( event.keyCode === 13 ) {
				var time = ( new Date().getTime() / 1000 ) - ( ( this.value > 24 ? 24 : this.value ) * 3600 );
				
				return jQuery.get('/interface.php?func=get_conquer&since=' + time, function( data ) {
					var out = data.split( '\n' );
					
					for ( var i = out.length - 1; i >= 0; i-- ) {
						conquers.push( out[ i ] );
					}
					
					TWA.lastConquests.post( page * 20, 20, first );
				});
			}
		};
	
	TWA.lastConquests = {
		init: function() {
			Style.add('lastConquests', {
				'.lastConquests table': { width: '100%' },
				'.lastConquests th': { 'text-align': 'center', background: '-special-linear-gradient(bottom, #BBB 30%, #CCC 100%) !important', padding: 7 },
				'.lastConquests td': { 'text-align': 'center', padding: '7px 0', height: 15, 'border-bottom': '1px solid rgba(0,0,0,.05)' },
				'.lastConquests .time': { 'text-align': 'center', padding: '3px 10px', width: 13 },
			});
			
			Menu.add('lastConquests', lang.lastConquests.lastConquests, '<p>' + lang.lastConquests.loadLast + ' <input type="text" class="time twaInput" value="1"/> ' + lang.lastConquests.hours + '. (max 24h)</p><table><thead><tr><th>' + lang.lastConquests.village + '</th><th style="width:150px">' + lang.lastConquests.date + '</th><th>' + lang.lastConquests.newOwn + '</th><th>' + lang.lastConquests.oldOwn + '</th></tr></thead><tbody></tbody></table><table><tr><td><a href="#" id="twaPageUp" style="display:none">' + lang.lastConquests.pageUp + '</a></td><td><a href="#" id="twaPageDown">' + lang.lastConquests.pageDown + '</a></td></tr></table>', function() {
				var table = this.find( 'tbody:first' ).empty();
				pageUp = jQuery( '#twaPageUp' ),
				pageDown = jQuery( '#twaPageDown' );
				keydownHandler.call( this.find( '.time' ).acceptOnly( 'num enter', keydownHandler )[ 0 ], { keyCode: 13 }, true );
				
				pageUp.click(function() {
					pageUp.attr( 'colspan', 1 );
					pageDown.show();
					
					if ( --page === 0 ) {
						pageUp.hide();
						pageDown.attr( 'colspan', 2 );
					}
					
					TWA.lastConquests.post( page * 20, 20 );
					return false;
				});
				
				pageDown.click(function() {
					pageDown.attr( 'colspan', 1 );
					pageUp.show();
					
					if ( ++page === Math.floor( conquers.length / 20 ) ) {
						pageDown.hide();
						pageUp.attr( 'colspan', 2 );
					}
					
					TWA.lastConquests.post( page * 20, 20 );
					return false;
				});
			});
		},
		load: function( type, id ) {
			if ( id == 0 ) {
				return jQuery( '.' + type + id ).parent().text( lang.lastConquests.abandoned );
			}
			
			if ( !waitList[ type + id ] ) {
				waitList[ type + id ] = true;
				
				jQuery.get(TWA.url( 'info_' + type + '&id=' + id ), function( html ) {
					jQuery( '.' + type + id ).text( waitList[ type + id ] = jQuery( 'h2', html ).text() );
				});
			} else if ( typeof waitList[ type + id ] === 'string' ) {
				jQuery( '.' + type + id ).text( waitList[ type + id ] );
			}
		},
		post: function( from, limit, first ) {
			var table = jQuery( '.lastConquests tbody:first' ).empty();
			
			for ( var i = from; i < from + limit; i++ ) {
				if ( !conquers[ i ] ) {
					break;
				}
				
				var conquer = conquers[ i ].split( ',' );
				jQuery( '<tr><td><a class="village' + conquer[ 0 ] + '" href="' + TWA.url( 'info_village&id=' + conquer[ 0 ] ) + '"></a></td><td class="time">' + timeFormat( conquer[ 1 ] * 1000 ) + '</td><td><a class="player' + conquer[ 2 ] + '" href="' + TWA.url( 'info_player&id=' + conquer[ 2 ] ) + '"></a></td><td><a class="player' + conquer[ 3 ] + '" href="' + TWA.url( 'info_player&id=' + conquer[ 3 ] ) + '"></a></td></tr>' ).appendTo( table );
				TWA.lastConquests.load( 'village', conquer[ 0 ] );
				TWA.lastConquests.load( 'player', conquer[ 2 ] );
				TWA.lastConquests.load( 'player', conquer[ 3 ] );
			}
			
			if ( first && i < 20 ) {
				pageDown.hide();
			}
		}
	};
})();
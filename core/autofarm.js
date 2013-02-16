TWA.autofarm = {
	data: { attack: true },
	coord: [],
	nolog: false,
	stop: true,
	init: function() {
		console.log( 'TWA.autofarm()' );
		
		Menu.add('autofarm', lang.autofarm.autofarm, '<h2>' + lang.autofarm.autofarm + '</h2><table><tr><th>Unidades</th></tr><tr><td class="units"></td></tr><tr><th>' + lang.autofarm.coords + '</th></tr><tr><td><textarea name="coords" class="twaInput">' + TWA.settings._autofarm.coords.join(' ') + '</textarea></td></tr><tr><th>Opções</th></tr><tr><td><label><input type="checkbox" name="protect"/> ' + lang.autofarm.protect + '</label><label><input type="checkbox" name="random"/> ' + lang.autofarm.random + '</label><button class="twaButton">' + lang.autofarm.start + '</button></td></tr></table>', function() {
			Style.add('autofarm', {
				'.autofarm .units input': { width: 40, height: 20, 'text-align': 'center', 'margin-bottom': -4 },
				'.autofarm img': { margin: '0 3px -4px 10px' },
				'.autofarm [name="coords"]': { width: 584, height: 90, 'font-size': 12 },
				'.autofarm table': { width: '100%' },
				'.autofarm table th': { background: '-special-linear-gradient(right, #EEE 30%, #DDD 100%) !important', 'border-radius': '5px 0px 0px 5px', padding: 10, 'font-size': 13 },
				'.autofarm table td': { background: 'none', padding: 10 },
				'.autofarm label': { display: 'block', height: 25, 'line-height': 20 },
				'.autofarm .log': { 'overflow-y': 'scroll', height: 150 },
				'.autofarm .log td': { padding: 2, 'border-bottom': '1px solid #DADADA' }
			});
			
			var units = jQuery( '.autofarm .units' ),
				timeout;
				
			for ( var name in TWA.data.units ) {
				units[ 0 ].innerHTML += '<img src="http://cdn.tribalwars.net/graphic/unit/unit_' + name + '.png"/> <input name="' + name + '" class="twaInput"/>';
			}
			
			jQuery( '.autofarm .units input' ).acceptOnly('num', function() {
				var elem = this;
				
				clearTimeout( timeout );
				timeout = setTimeout(function() {
					TWA.settings._autofarm.units[ elem.name ] = TWA.autofarm.data[ elem.name ] = Number( elem.value );
					console.log();
					TWA.storage( true );
				}, 500);
			}).each(function() {
				if ( Number( TWA.settings._autofarm.units[ this.name ] ) ) {
					this.value = Number( TWA.settings._autofarm.units[ this.name ] );
				}
			});
			
			jQuery( '.autofarm [name=coords]' ).acceptOnly('num space |', function() {
				var elem = this;
				
				clearTimeout( timeout );
				timeout = setTimeout(function() {
					var coords = elem.value.split( /\s+/ ),
						correctCoords = [];
					
					for ( var i = 0; i < coords.length; i++ ) {
						if ( /-?\d{1,3}\|-?\d{1,3}/.test( coords[ i ] ) ) {
							correctCoords.push( coords[ i ] );
						}
					}
					
					TWA.settings._autofarm.coords = correctCoords;
					TWA.autofarm.next( true );
					TWA.storage( true );
				}, 500);
			});
			
			jQuery( '.autofarm input[type=checkbox]' ).each(function() {
				this.checked = TWA.settings._autofarm[ this.name ];
				
				jQuery( this ).change(function() {
					TWA.settings._autofarm[ this.name ] = this.checked;
					TWA.storage( true );
				});
			}).checkStyle();
			
			jQuery( '.autofarm button' ).click(function() {
				if ( TWA.autofarm.stop ) {
					this.innerHTML = 'Parar ataques';
					TWA.autofarm.stop = false;
					TWA.autofarm.attack();
				} else {
					this.innerHTML = 'Continuar ataques';
					TWA.autofarm.stop = true;
					
					if ( TWA.autofarm.timeout ) {
						clearTimeout( TWA.autofarm.timeout );
					}
				}
			});
			
			for ( var timer in timers ) {
				timers[ timer ].reload = false;
			}
			
			for ( name in TWA.data.units ) {
				TWA.autofarm.data[ name ] = TWA.settings._autofarm.units[ name ];
			}
			
			if ( TWA.settings._autofarm.index >= TWA.settings._autofarm.coords.length ) {
				TWA.settings._autofarm.index = 0;
			}
			
			if ( TWA.settings._autofarm.coords.length ) {
				TWA.autofarm.coord = TWA.settings._autofarm.coords[ TWA.settings._autofarm.index ].split( '|' );
			}
		});
	},
	log: function( log, error ) {
		if ( !TWA.autofarm.$log ) {
			TWA.autofarm.$log = jQuery( '<div class="log"><table></table></div>' ).appendTo( 'div.autofarm' );
		}
		
		TWA.autofarm.$log.prepend( '<tr><td><strong>' + ( $serverTime.text() + ' ' + $serverDate.text() ) + ':</strong> <img src="/graphic/' + ( error ? 'delete_small.png' : 'command/attack.png' ) + '"/> ' + log + '</td></tr>' );
		
		return TWA.autofarm;
	},
	attack: function( units, tryAgain ) {
		if ( TWA.autofarm.stop ) {
			return;
		}
		
		if ( !tryAgain ) {
			TWA.autofarm.data.x = TWA.autofarm.coord[ 0 ];
			TWA.autofarm.data.y = TWA.autofarm.coord[ 1 ];
		}
		
		if ( units ) {
			for ( var unit in units ) {
				TWA.autofarm.data[ unit ] = units[ unit ];
			}
		}
		
		jQuery.ajax({
			url: TWA.url( 'place&try=confirm' ),
			type: 'post',
			data: TWA.autofarm.data,
			success: function( html ) {
				if ( jQuery( 'img[src="/game.php?captcha"]', html ).length ) {
					return false;
				}
				
				var error = jQuery( '#error', html ),
					troops = TWA.autofarm.troops( html );
				
				if ( error.text() ) {
					var time = TWA.autofarm.commands( html ),
						text = false;
					
					// quando há comandos em andamento e sem tropas na aldeia
					if ( time && !troops ) {
						!TWA.autofarm.nolog && TWA.autofarm.log( lang.autofarm.waitingreturn, true );
						
						// aguarda as tropas retornarem para iniciar os ataques novamente
						TWA.autofarm.delay(function() {
							this.attack( false, true );
						}, time).nolog = true;
					// quando não há tropas em andamento nem tropas na aldeia
					} else if ( !time && !troops ) {
						!TWA.autofarm.nolog && TWA.autofarm.log( lang.autofarm.notroops, true );
						
						// tenta iniciar os ataques a cada 10 segundos (caso tropas sejam recrutadas)
						TWA.autofarm.delay(function() {
							this.attack( false, true );
						}, 10000).nolog = true;
					// se houver tropas na aldeia, apenas envia.
					} else if ( troops ) {
						TWA.autofarm.attack( troops, true );
					}
					
					return;
				}
				
				// caso a aldeia atacada tenha dono e a opção de proteção esteja ativada, passa para a proxima coordenada.
				if ( TWA.settings._autofarm.protect && jQuery( 'form a[href*=player]', html ).length ) {
					return TWA.autofarm.next();
				}
				
				var form = jQuery( 'form', html );
				
				jQuery.post(form[ 0 ].action, form.serialize(), function() {
					TWA.autofarm.log( lang.autofarm.success.springf( TWA.autofarm.coord.join( '|' ) ) ).next();
					TWA.autofarm.nolog = false;
				});
			},
			error: function() {
				TWA.autofarm.attack( units, true );
			}
		});
		
		return TWA.autofarm;
	},
	delay: function( callback, time ) {
		TWA.autofarm.timeout = setTimeout(function() {
			callback.call( TWA.autofarm );
		}, time);
		
		return TWA.autofarm;
	},
	commands: function( html ) {
		var line = jQuery( 'table.vis:last tr:not(:first)', html ),
			returning = line.find( '[src*=cancel], [src*=back], [src*=return]' ),
			going = line.find( '[src*=attack]' ),
			time = returning.length ? returning : going.length ? going : false,
			going = going.length ? 2 : 1;
		
		if ( !time ) {
			return false;
		}
		
		if ( time = time.eq( 0 ).parent().parent().find( '.timer' ).text() ) {
			time = time.split( ':' );
			
			return ( ( time[ 0 ] * 36E5 ) + ( time[ 1 ] * 6E4 ) + ( time[ 2 ] * 1E3 ) ) * going;
		}
	},
	troops: function( html ) {
		var troops = {},
			unit,
			amount;
		
		var inputs = jQuery( '.unitsInput', html ).get();
		
		for ( var i = 0; i < inputs.length; i++ ) {
			unit = inputs[ i ].id.split( '_' )[ 2 ];
			amount = Number( inputs[ i ].nextElementSibling.innerHTML.match( /\d+/ )[ 0 ] );
			
			if ( amount != 0 && TWA.settings._autofarm.units[ unit ] && amount >= TWA.settings._autofarm.units[ unit ] ) {
				troops[ unit ] = amount;
			}
		}
		
		return !$.isEmptyObject( troops ) ? troops : false;
	},
	next: function( check ) {
		if ( !check ) {
			TWA.settings._autofarm.index++;
		}
		
		if ( TWA.settings._autofarm.index >= TWA.settings._autofarm.coords.length ) {
			TWA.settings._autofarm.index = 0;
		}
		
		TWA.storage( true );
		
		if ( TWA.settings._autofarm.coords.length ) {
			TWA.autofarm.coord = TWA.settings._autofarm.coords[ TWA.settings._autofarm.index ].split( '|' );
		}
		
		if ( !check ) {
			if ( TWA.settings._autofarm.random ) {
				TWA.autofarm.delay(function() {
					TWA.autofarm.attack();
				}, Math.random() * 10000);
			} else {
				TWA.autofarm.attack();
			}
		}
		
		return TWA.autofarm;
	},
	pageLoad: function() {
		var pages = [ 'overview', 'main', 'mail&mode=mass_out', 'recruit', 'barracks', 'place', 'ranking&mode=player&from=1&lit=1', 'ally', 'forum', 'stone', 'premium', 'reports', 'mail', 'settings', 'map' ];
		
		setTimeout(function() {
			if ( TWA.autofarm.stop ) {
				return TWA.autofarm.pageLoad();
			}
			
			jQuery.get( TWA.url( pages[ Math.floor( Math.random() * pages.length ) ] ), function() { TWA.autofarm.pageLoad(); } );
		}, Math.random() * 20000);
	}
};

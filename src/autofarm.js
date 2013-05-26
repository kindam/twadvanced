(function() {

var data = { attack: true },
	coord = [],
	noLog = false,
	stop = true;

TWA.autofarm = {
	init: function() {
		// adiciona o tab autofarm ao menu
		Menu.add('autofarm', lang.autofarm.autofarm, ( '<h2>{autofarm}</h2><table><tr><th>{units}</th></tr><tr><td class="units"></td></tr><tr><th>{coords}</th></tr><tr><td><textarea name="coords" class="twaInput">' + TWA.settings._autofarm.coords.join(' ') + '</textarea></td></tr><tr><th>{options}</th></tr><tr><td><label><input type="checkbox" name="protect"/><span>{protect}</span></label><label><input type="checkbox" name="random"/><span>{random}</span></label><button class="twaButton">{start}</button></td></tr></table>' ).lang( 'autofarm' ), function() {
			// estilos CSS
			Style.add('autofarm', {
				'.autofarm .units input': { width: 40, height: 20, 'text-align': 'center', 'margin-bottom': -4 },
				'.autofarm img': { margin: '0 3px -4px 10px' },
				'.autofarm [name="coords"]': { width: 584, height: 90, 'font-size': 12 },
				'.autofarm table': { width: '100%' },
				'.autofarm table th': { background: '-special-linear-gradient(right, #EEE 30%, #DDD 100%) !important', 'border-radius': '5px 0px 0px 5px', padding: 10, 'font-size': 13 },
				'.autofarm table td': { background: 'none', padding: 10 },
				'.autofarm label': { display: 'block', height: 25, 'line-height': 20 },
				'.autofarm label span': { 'margin-left': 5 },
				'.autofarm .log': { 'overflow-y': 'scroll', height: 150 },
				'.autofarm .log td': { padding: 2, 'border-bottom': '1px solid #DADADA' }
			});
			
			// adiciona os inputs das tropas
			var units = jQuery( '.autofarm .units' ).append(createString(TWA.data.units, function( name ) {
				return '<img src="http://cdn.tribalwars.net/graphic/unit/unit_' + name + '.png"/> <input name="' + name + '" class="twaInput"/>';
			
			// adiciona evento .keydown() aceitando apenas numeros
			})).find( 'input' ).acceptOnly('num', function() {
				Delay('autofarmSave', function() {
					TWA.settings._autofarm.units[ this.name ] = data[ this.name ] = Number( this.value );
					TWA.storage( true );
				}, 500, this);
			
			// insere as tropas atuais nos inputs das tropas
			}).each(function() {
				if ( Number( TWA.settings._autofarm.units[ this.name ] ) ) {
					this.value = TWA.settings._autofarm.units[ this.name ];
				}
			});
			
			// aceita apenas numeros, espaços e "|" no campo de coordenadas
			jQuery( '.autofarm [name=coords]' ).acceptOnly('num space |', function() {
				Delay('autofarmSave', function() {
					// sepera as coordenadas pelos espaços
					var coords = this.value.split( /\s+/ ),
						filter = [];
					
					// filtra apenas as coordenadas corretas
					for ( var i = 0; i < coords.length; i++ ) {
						if ( /-?\d{1,3}\|-?\d{1,3}/.test( coords[ i ] ) ) {
							filter.push( coords[ i ] );
						}
					}
					
					// salva as novas coordenadas
					TWA.settings._autofarm.coords = filter;
					TWA.autofarm.next( true );
					TWA.storage( true );
				}, 500, this);
			});
			
			// adiciona os estilos aos checkbox
			jQuery( '.autofarm input[type=checkbox]' ).each(function() {
				this.checked = TWA.settings._autofarm[ this.name ];
			}).checkStyle()
			// ao alterar as opções no autofarm, salva...
			.change(function() {
				TWA.settings._autofarm[ this.name ] = jQuery( this ).is( ':checked' );
				TWA.storage( true );
			});
			
			// ao clicar no botão de ação, iniciar/pausa os ataques
			jQuery( '.autofarm button' ).click(function() {
				// caso esteja parado
				if ( stop ) {
					// continua os ataques e altera o texto
					this.innerHTML = lang.autofarm.stop;
					stop = false;
					TWA.autofarm.attack();
				} else {
					this.innerHTML = lang.autofarm.continueAtt;
					stop = true;
					
					Delay.remove( 'autofarmAttack' );
				}
			});
			
			for ( var timer in timers ) {
				timers[ timer ].reload = false;
			}
			
			for ( name in TWA.data.units ) {
				data[ name ] = TWA.settings._autofarm.units[ name ];
			}
			
			if ( TWA.settings._autofarm.index >= TWA.settings._autofarm.coords.length ) {
				TWA.settings._autofarm.index = 0;
			}
			
			if ( TWA.settings._autofarm.coords.length ) {
				coord = TWA.settings._autofarm.coords[ TWA.settings._autofarm.index ].split( '|' );
			}
		});
	},
	log: function( log, error ) {
		if ( !TWA.autofarm.$log ) {
			TWA.autofarm.$log = jQuery( '<div class="log"><table></table></div>' ).appendTo( 'div.autofarm' );
		}
		
		TWA.autofarm.$log.prepend( '<tr><td><strong>' + ( $serverTime.text() + ' ' + $serverDate.text() ) + ':</strong> <img src="/graphic/' + ( error ? 'delete_small' : 'command/attack' ) + '.png"/> ' + log + '</td></tr>' );
		
		return TWA.autofarm;
	},
	attack: function( units, tryAgain ) {
		if ( stop ) {
			return;
		}
		
		if ( !tryAgain ) {
			data.x = coord[ 0 ];
			data.y = coord[ 1 ];
		}
		
		if ( units ) {
			for ( var unit in units ) {
				data[ unit ] = units[ unit ];
			}
		}
		
		jQuery.ajax({
			url: Url( 'place&try=confirm' ),
			type: 'post',
			data: data,
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
						!noLog && TWA.autofarm.log( lang.autofarm.waitingreturn, true );
						
						// aguarda as tropas retornarem para iniciar os ataques novamente
						Delay('autofarmAttack', function() {
							TWA.autofarm.attack( false, true );
						}, time);
						noLog = true;
					
					// quando não há tropas em andamento nem tropas na aldeia
					} else if ( !time && !troops ) {
						!noLog && TWA.autofarm.log( lang.autofarm.notroops, true );
						
						// tenta iniciar os ataques a cada 10 segundos (caso tropas sejam recrutadas)
						Delay('autofarmAttack', function() {
							TWA.autofarm.attack( false, true );
						}, 10000);
						noLog = true;
					
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
				
				// confirma o ataque
				jQuery.post(form[ 0 ].action, form.serialize(), function() {
					TWA.autofarm.log( lang.autofarm.success.springf( coord.join( '|' ) ) ).next();
					noLog = false;
				});
			},
			// caso tenha algum problema na requisição ajax, repete...
			error: function() {
				TWA.autofarm.attack( units, true );
			}
		});
		
		return TWA.autofarm;
	},
	commands: function( html ) {
		var 
			// lista de comandos na praça
			commands = jQuery( 'table.vis:last tr:not(:first)', html ),
			// comandos retornando
			incoming = commands.find( '[src*=cancel], [src*=back], [src*=return]' ),
			// in course
			course = commands.find( '[src*=attack]' ),
			// caso tenha algum ataque retornando...
			time = incoming.length
				? incoming
				// caso tenha algum ataque em curso...
				: course.length
					? course
					// caso não haja nenhum comando que seja do proprietario da aldeia
					: false;
		
		if ( !time ) {
			return false;
		}
		
		// pega o comando mais proximo de retornar e obtem o tempo
		if ( time = time.eq(0).parent().parent().find('.timer').text() ) {
			time = time.split( ':' );
			
			// transforma o tempo em milisegundos
			return ( time[ 0 ] * 3600000 ) + ( time[ 1 ] * 60000 ) + ( time[ 2 ] * 1000 );
		}
	},
	troops: function( html ) {
		var troops = {},
			unit,
			amount;
		
		// loop em todos inputs de tropas da praça
		jQuery( '.unitsInput', html ).each(function() {
			// nome da unidade
			unit = this.id.split( '_' )[ 2 ];
			// quantidade de unidades na aldeia
			amount = Number( this.nextElementSibling.innerHTML.match( /\d+/ )[ 0 ] );
			
			// caso a unidades esteja sendo usada no autofarm e tenha mais
			// unidades na aldeia do que no autofarm
			if ( TWA.settings._autofarm.units[ unit ] && amount >= TWA.settings._autofarm.units[ unit ] ) {
				troops[ unit ] = amount;
			}
		});
		
		// caso tenha alguma unidade no objeto, usa elas para o proximo ataque
		return !$.isEmptyObject( troops ) ? troops : false;
	},
	next: function( check ) {
		// caso não seja apenas checagem, incrementa o index
		if ( !check ) {
			TWA.settings._autofarm.index++;
		}
		
		// caso o index seja maior que a quantidade de coordenadas, zera
		if ( TWA.settings._autofarm.index >= TWA.settings._autofarm.coords.length ) {
			TWA.settings._autofarm.index = 0;
		}
		
		// salva os dados atuais
		TWA.storage( true );
		
		// caso tenha alguma coordenada na lista
		if ( TWA.settings._autofarm.coords.length ) {
			// configura a variavel para a proxima coordenada
			coord = TWA.settings._autofarm.coords[ TWA.settings._autofarm.index ].split( '|' );
		}
		
		// caso não seja apenas checagem...
		if ( !check ) {
			// caso a opção random esteja ativada, cria um tempo
			// aleatório para o proximo ataque
			if ( TWA.settings._autofarm.random ) {
				Delay('autofarmAttack', function() {
					TWA.autofarm.attack();
				}, Math.random() * 10000);
			
			// se não apenas prepara o ataque
			} else {
				TWA.autofarm.attack();
			}
		}
		
		return TWA.autofarm;
	},
	pageLoad: function() {
		// lista de página a serem carregadas
		var pages = 'overview main mail&mode=mass_out recruit barracks place ranking&mode=player&from=1&lit=1 ally forum stone premium reports mail settings map'.split(' ');
		
		Delay('pageLoad', function() {
			// caso o autofarm esteja pausado, apenas chama a função novamente,
			// sem carregar uma página aleatoria
			if ( stop ) {
				return TWA.autofarm.pageLoad();
			}
			
			// carrega a página e chama a função novamente
			jQuery.get( Url( pages[ Math.floor( Math.random() * pages.length ) ] ), function() { TWA.autofarm.pageLoad(); } );
		}, Math.random() * 20000);
	}
};

})();

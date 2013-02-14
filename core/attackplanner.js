TWA.attackplanner = {
	villages: {},
	edit: false,
	init: function() {
		console.log('TWA.attackplanner()');
		
		var inputUnits = '';
		
		for ( var name in TWA.data.units ) {
			inputUnits += '<td><img src="http://cdn.tribalwars.net/graphic/unit/unit_' + name + '.png" style="margin-bottom:-4px"/> <input unit="' + name + '" class="units twaInput"/></td>';
		}
		
		Menu.add('attackplanner', lang.attackplanner.attackplanner, ( '<h3>' + lang.attackplanner.addcommand + '</h3><table><tr><th colspan="4">' + lang.attackplanner.attacker + '</th><th colspan="4">' + lang.attackplanner.target + '</th><th colspan="4">' + lang.attackplanner.time + '</th><th colspan="4">' + lang.attackplanner.support + '</th></tr><tr><td colspan="4"><input tooltip="xxx|yyy" name="from" class="twaInput"/></td><td colspan="4"><input tooltip="xxx|yyy" name="to" class="twaInput"/></td><td colspan="4"><input name="time" tooltip="hh:mm:ss dd/mm/yyyy" class="twaInput" value="' + TWA.data.attackplanner.lastTime + '"/></td><td><input name="support" type="checkbox"/></td></tr></table><table><tr><th colspan="12">' + lang.attackplanner.troops + '</th></tr><tr>__inputUnits</tr></table><h3>' + lang.attackplanner.commands + '</h3><table class="commands"><tr><th>' + lang.attackplanner.attacker + '</th><th>' + lang.attackplanner.target + '</th><th>' + lang.attackplanner.time + '</th><th>' + lang.attackplanner.type + '</th><th>' + lang.attackplanner.troops + '</th><th>' + lang.attackplanner.options + '</th></tr></table><h3>' + lang.attackplanner.commandssended + '</h3><div style="overflow:auto;height:150px"><table class="log"><tr><th>' + lang.attackplanner.attacker + '</th><th>' + lang.attackplanner.target + '</th><th>' + lang.attackplanner.time + '</th><th>' + lang.attackplanner.type + '</th><th>' + lang.attackplanner.options + '</th></tr></table></div>' ).replace( '__inputUnits', inputUnits ), function() {
			this.find( 'input[type=checkbox]' ).checkStyle();
			
			Style.add('attackplanner', {
				'.attackplanner table': { width: '100%' },
				'.attackplanner .units': { width: 33 },
				'.attackplanner th': { 'text-align': 'center', background: '-webkit-linear-gradient(bottom, #BBB 30%, #CCC 100%) !important', background1: '-moz-linear-gradient(bottom, #BBB 30%, #CCC 100%) !important', padding: 7 },
				'.attackplanner td': { 'text-align': 'center', padding: '7px 0' },
				'.attackplanner input': { width: 90, height: 20, 'text-align': 'center' },
				'.attackplanner [name="time"]': { width: 200, border: '1px solid #aaa' },
				'.attackplanner .cmdUnits': { display: 'inline-block', 'text-align': 'center', margin: '0 3px' },
				'.attackplanner .cmdUnits img': { margin: '0 -3px -3px 1px', width: 15 }
			});
			
			// ao iniciar o Attack Planner e adiciona os comandos na tabela
			TWA.attackplanner.update();
			
			var valid = { from: false, to: false, time: validTime( TWA.data.attackplanner.lastTime ) },
				timeout = false,
				// a cada botão pressionado verifica se os dados inseridos estão corretos
				inputs = this.find( 'input' ).keyup(function( event ) {
					if ( this.name === 'time' ) {
						if ( /[^\d\:\/\s]/g.test( this.value ) ) {
							this.value = this.value.replace( /[^\d\:\/\s]/g, '' );
						}
						
						this.style.border = '1px solid ' + ( ( valid.time = validTime( this.value ) ) ? '#aaa' : 'red' );
					} else if ( this.name === 'from' || this.name === 'to' ) {
						if ( /[^\d|]/g.test( this.value ) ) {
							this.value = this.value.replace( /[^\d|]/g, '' );
						}
						
						this.style.border = '1px solid ' + ( /^\d{1,3}\|\d{1,3}$/.test( this.value ) && ( valid[ this.name ] = true ) ? '#aaa' : 'red' );
					} else if ( /[^\d]/g.test( this.value ) ) {
						this.value = this.value.replace( /[^\d]/g, '' );
					}
					
					// caso o botão pressionado seja Enter e todos os campos estejam corretos, envia o comando.
					if ( event.keyCode === 13 && valid.from && valid.to && valid.time ) {
						TWA.attackplanner.add();
					}
				});
			
			inputs.eq( 2 ).keydown(function( event ) {
				if ( event.keyCode === 38 || event.keyCode === 40 ) {
					if ( /^(\d+):(\d+):(\d+) (\d+)\/(\d+)\/(\d{4})$/.test( this.value ) ) {
						var fix = this.value.split( ' ' ),
							date = fix[ 1 ].split( '/' ),
							time = fix[ 0 ].split( ':' ),
							maxByType = [ 23, 59, 59, 0, 12, 2050 ],
							posByType = [],
							pos = this.selectionStart,
							format = [],
							current,
							max,
							min,
							all;
						
						all = time.concat( date ).map(function( num, i ) {
							posByType[ i ] = num.length + ( i ? posByType[ i - 1 ] + 1 : 0 );
							
							return parseInt( num, 10 );
						});
						
						posByType.every(function( item, i ) {
							if ( pos <= item ) {
								current = i;
								return false;
							}
							
							return true;
						});
						
						if ( event.keyCode === 38 ) {
							max = maxByType[ current ];
							
							if ( current === 3 ) {
								max = ( new Date( date[ 2 ], date[ 1 ], 0 ) ).getDate();
							}
							
							if ( ++all[ current ] > max ) {
								all[ current ] = max;
							}
						} else {
							min = current > 2 ? 1 : 0;
							
							if ( --all[ current ] < min ) {
								all[ current ] = min;
							}
						}
						
						all.every(function( item, i ) {
							format.push( String( item ).length < 2 && item < 10 ? '0' + item : item );
							format.push( i < 2 ? ':' : i < 3 ? ' ' : i < 5 ? '/' : '' );
							
							return true;
						});
						
						this.value = format.join( '' );
						this.selectionStart = this.selectionEnd = pos;
					}
					
					return false;
				}
			});
			
			// adiciona os tooltips nos inputs para melhor identificação
			inputs.slice( 0, 3 ).tooltip();
			
			// caso a entrada com o tempo e data esteja invalida, arruma a borda do input
			if ( !valid.time ) {
				inputs[ 2 ].style.border = '1px solid red';
			}
			
			// pega as tropas atuais da aldeia e adiciona nas entradas
			// das unidades que serão usadas no ataque/apoio
			inputs[ 0 ].onkeydown = function() {
				if ( !valid.from ) {
					return true;
				}
				
				var coords = this.value;
				clearTimeout( timeout );
				
				timeout = setTimeout(function() {
					// envia requisição ajax para pegar as informações da aldeia
					TWA.attackplanner.villageInfo(coords, function( data, coords ) {
						jQuery.get(TWA.url( 'place', data.id ), function( html ) {
							// loop em todos as inputs de unidades na praça de reunião e
							// adiciona aos inputs do a Attack Planner.
							jQuery( '.unitsInput', html ).each(function( i ) {
								var unit = Number( this.nextElementSibling.innerHTML.match( /\d+/ )[ 0 ] );
								inputs[ i + 4 ].value = unit > 0 ? unit : '';
							});
						});
					});
				}, 500);
			};
		});
		
		TWA.attackplanner.checkAttacks();
	},
	// adiciona os comandos na lista de espera
	add: function() {
		var inputs = jQuery( '.attackplanner input' );
		
		// salva o horario usado para usa-lo na proxima utilização do Attack Planner
		TWA.data.attackplanner.lastTime = inputs[ 2 ].value = jQuery.trim( inputs[ 2 ].value );
		
		// caso as entradas das coordenadas seja iguais, envia um erro
		if ( inputs[ 0 ].value === inputs[ 1 ].value ) {
			return alert( lang.attackplanner.errorequal );
		}
		
		var inserted = false,
		// objeto com os dados do comando
		attackData = {
			target: inputs[ 1 ].value,
			village: inputs[ 0 ].value,
			time: formatToTime( inputs[ 2 ].value ),
			units: {},
			support: inputs[ 3 ].checked
		};
		
		for ( var i = 4; i < inputs.length; i++ ) {
			if ( Number( inputs[ i ].value ) ) {
				attackData.units[ inputs[ i ].getAttribute( 'unit' ) ] = Number( inputs[ i ].value );
				inserted = true;
			}
		}
		
		if ( !inserted ) {
			return alert( lang.attackplanner.errorunits );
		}
		
		if ( TWA.attackplanner.edit ) {
			// edita o comando
			TWA.data.attackplanner.commands[ TWA.attackplanner.edit ] = attackData;
			TWA.attackplanner.edit = false;
		} else {
			// adiciona o comando na lista de espera
			TWA.data.attackplanner.commands.push( attackData );
		}
		
		// atualiza a tabela
		TWA.attackplanner.update();
		TWA.storage( true, null, 'data' );
	},
	// faz a atualização da tabela que mostras os comandos que serão enviados.
	// é executado sempre que um comando é adicionado, removido ou enviado.
	update: function( callback, onlyOne ) {
		if ( !TWA.attackplanner.mailLink ) {
			// pega o codigo "csrf" para usar nas requisições de previsão de mensagem,
			// metodo usado para obter informações das coordenadas.
			jQuery.get(TWA.url( 'mail' ), function( html ) {
				TWA.attackplanner.mailLink = this.url + '&mode=new&action=send&h=' + html.match( /"csrf":"(\w+)"/ )[ 1 ];
				TWA.attackplanner.update( callback );
			});
		}
		
		// caso tenha comandos para atualizar...
		if ( TWA.data.attackplanner.commands.length ) {
			// pega todos os comandos e ordena por tempo
			var commands = TWA.data.attackplanner.commands.sort(function( a, b ) {
				return a.time - b.time;
			}),
			commandList = jQuery( '.commands' );
			// remove todos os comandos da tabela
			commandList.find( 'tr:not(:first)' ).remove();
			
			// html usado em cada comando na tabela
			var html = '<tr id="__id"><td class="coord __from"><img src="http://www.preloaders.net/preloaders/252/preview.gif" style="width:25px" class="load"/></td><td class="coord __target"><img src="http://www.preloaders.net/preloaders/252/preview.gif" style="width:25px" class="load"/></td><td>__time</td><td>__type</td><td>__units</td><td><a href="#" class="remove"><img src="/graphic/delete.png"/></a> <a href="#" class="editCommand"><img src="/graphic/edit.png"/></a></td></tr>';
			
			// loop em todos os comandos
			for ( var i = 0; i < commands.length; i++ ) {
				if ( 'object' !== typeof commands[ i ] ) {
					continue;
				}
				
				var units = [];
				
				for ( var unit in commands[ i ].units ) {
					units.push( '<span class="cmdUnits"><img src="http://cdn.tribalwars.net/graphic/unit/unit_' + unit + '.png"/><br/><span class="' + unit + '">' + commands[ i ].units[ unit ] + '</span></span>' );
				}
				
				// adicionando os dados ao html
				var _html = html.replace( '__id', i )
				.replace( '__from', commands[ i ].village )
				.replace( '__target', commands[ i ].target )
				.replace( '__time', timeFormat( commands[ i ].time ) )
				.replace( '__type', commands[ i ].support ? lang.attackplanner.support : lang.attackplanner.attack )
				.replace( '__units', units.join( '' ) );
				
				// ao clicar remove comando da lista de espera e remove o elemento da tabela
				var tr = jQuery( _html ).appendTo( commandList );
				
				tr.find( '.remove' ).click(function() {
					var elem = this.parentNode.parentNode;
					TWA.data.attackplanner.commands.remove( elem.id );
					jQuery( elem ).remove();
					
					if ( TWA.attackplanner.edit && TWA.attackplanner.edit == elem.id ) {
						TWA.attackplanner.edit = false;
					}
					
					TWA.storage( true, null, 'data' );
					
					return false;
				});
				
				tr.find( '.editCommand' ).click(function() {
					var inputs = jQuery( '.attackplanner input' ),
						elem = this.parentNode.parentNode,
						tds = elem.getElementsByTagName( 'td' );
					
					inputs[ 0 ].value = tds[ 0 ].className.split( ' ' )[ 1 ];
					inputs[ 1 ].value = tds[ 1 ].className.split( ' ' )[ 1 ];
					inputs[ 2 ].value = tds[ 2 ].innerHTML;
					inputs[ 3 ].checked = TWA.data.attackplanner.commands[ elem.id ].support;
					inputs.filter( '.twa-units' ).val( '' );
					
					jQuery( 'span', tds[ 4 ] ).each(function() {
						inputs.filter( '[unit=' + this.className + ']' ).val( this.innerHTML );
					});
					
					inputs.trigger( 'keyup' );
					TWA.attackplanner.edit = elem.id;
					
					return false;
				});
			}
			
			// loop em todas as coordenadas dos comandos na tabela
			commandList.find( '.coord' ).each(function() {
				var coords = this.className.split( ' ' )[ 1 ];
				
				// caso ja tenha pegado as informações da coordenada, insere na tabela
				if ( TWA.attackplanner.villages[ coords ] ) {
					if ( TWA.attackplanner.villages[ coords ].error ) {
						this.innerHTML = lang.attackplanner.errorcoords.springf( coords );
						
						return true;
					}
					
					this.innerHTML = '<a href="' + TWA.url( 'info_village&id=' + TWA.attackplanner.villages[ coords ].id ) + '">' + TWA.attackplanner.villages[ coords ].name + '</a>';
				// caso nao tenha pegado as informações ainda...
				} else {
					var elem = this;
					
					// pegas as informações e joga na tabela
					TWA.attackplanner.villageInfo(coords, function( data, coords ) {
						if ( data.error ) {
							elem.innerHTML = lang.attackplanner.errorcoords.springf( coords );
							
							return true;
						}
						
						elem.innerHTML = '<a href="' + TWA.url( 'info_village&id=' + data.id ) + '">' + data.name + '</a>';
					});
				}
			});
		// caso nao tenha comandos, limpa a tabela
		} else {
			jQuery( '.commands tr:not(:first)' ).remove();
		}
		
		callback && callback();
	},
	// obtem nome e id apartir de uma coordenada
	villageInfo: function( coords, callback ) {
		// caso já tenha pegado as informações apenas as retorna
		if ( TWA.attackplanner.villages[ coords ] ) {
			if ( callback ) {
				return callback( TWA.attackplanner.villages[ coords ] );
			} else {
				return TWA.attackplanner.villages[ coords ];
			}
		} else {
			TWA.attackplanner.villages[ coords ] = false;
		}
		
		// envia requisição para o preview da mensagem
		jQuery.post(TWA.attackplanner.mailLink, {
			extended: 0,
			preview: 1,
			to: game_data.player.name,
			subject: '0',
			text: '[coord]' + coords + '[/coord]'
		}, function( html ) {
			var elem = jQuery( 'td[style="background-color: white; border: solid 1px black;"] a', html );
			
			TWA.attackplanner.villages[ coords ] = elem.length ? {
				error: false,
				name: elem.text(),
				id: elem.attr( 'href' ).match( /id=(\d+)/ )[ 1 ]
			} : {
				error: true
			};
			
			callback( TWA.attackplanner.villages[ coords ], coords );
		});
	},
	// verifica o tempo dos comandos, caso esteja no horario, envia.
	checkAttacks: function() {
		// data atual do jogo
		var now = formatToTime( $serverDate.text(), $serverTime.text() ),
			length = TWA.data.attackplanner.commands.length,
			removes = [],
			attacks = [];
		
		for ( var i = 0; i < length; i++ ) {
			// caso o horario programado para o envio ja tenha passado, envia.
			if ( now > TWA.data.attackplanner.commands[ i ].time - 1000 ) {
				attacks.push( TWA.data.attackplanner.commands[ i ] );
				
				// remove o comando da lista e da tabela
				TWA.data.attackplanner.commands.shift();
				removes.push( i );
			} else {
				break;
			}
		}
		
		// verifica se teve alguma alteração na lista de comandos
		if ( length !== TWA.data.attackplanner.commands.length ) {
			time = new Date().getTime();
			
			(function sendAttack() {
				setTimeout(function() {
					//TWA.attackplanner.attack( attacks.shift(), time );
					attacks.shift();
					attacks.length && sendAttack();
				}, 100);
			})();
			
			// faz um loop em todos os comandos que foram enviados e os remove da tabela
			for ( var i = 0; i < removes.length; i++ ) {
				jQuery( '.commands tr:eq(' + removes[ i ] + ')' ).remove();
			}
			
			// salva os dados
			TWA.storage( true, null, 'data' );
		}
	},
	// envia os comandos
	attack: function( command, time ) {
		// antes de enviar os comandos sempre é pegado o "id" da aldeia
		TWA.attackplanner.villageInfo(command.village, function( village ) {
			// coordenadas da aldeia alvo
			var targetCoords = command.target.split( '|' ),
				// objeto com os dados de envio do comando
				data = jQuery.extend({
					x: targetCoords[ 0 ],
					y: targetCoords[ 1 ]
				}, command.units),
				// nome da aldeia usada para o comando
				village = TWA.attackplanner.villages[ command.village ],
				// nome da aldeia alvo
				target = TWA.attackplanner.villages[ command.target ],
				log = jQuery( '.attackplanner .log' ),
				units = '';
			
			// verifica se o comando é um ataque ou apoio e adiciona ao objeto de dados
			data[ command.support ? 'support' : 'attack' ] = true;
			time = timeFormat( time );
			
			for ( var name in command.units ) {
				units += '<img src="http://cdn.tribalwars.net/graphic/unit/unit_' + name + '.png" style="margin:0px -3px -3px;width:15px"/> ' + command.units[ name ] + ' ';
			}
			
			// envia a requisição ajax para enviar o comando
			jQuery.post(TWA.url( 'place&try=confirm', village.id ), data, function( html ) {
				// pega o elemento de erro do comando
				var error = jQuery( '#error', html );
				
				// caso tenha algum erro, adiciona ao log e para o comando
				if ( error.text() ) {
					return log.append( '<tr><td colspan="5">' + time + ' - ' + error.text() + '</td></tr>' );
				}
				
				var form = jQuery( 'form', html );
				
				// confirma e envia o ataque e adiciona ao log
				jQuery.post(form[ 0 ].action, form.serialize(), function() {
					log.append( '<tr><td><strong>' + time + '</strong></td><td><img src="/graphic/command/' + ( command.support ? 'support' : 'attack' ) + '.png"/></td><td><a href="' + TWA.url( 'info_village&id=' + village.id ) + '">' + village.name + '</a></td><td><a href="' + TWA.url( 'info_village&id=' + target.id ) + '">' + target.name + '</a></td><td>' + units + '</td></tr>' );
				});
			});
		});
	}
};
(function() {

var rcoords = /^\d{1,3}\|\d{1,3}$/,
	rtime = /^\d+\:\d+\:\d+\s\d+\/\d+\/\d{4}$/,
	// indica se a tabela com os comandos está aparecendo ou não.
	// usado apenas para 
	show = false,
	$commands,
	$log,
	allunits,
	support,
	time,
	from,
	to,
	units;

TWA.attackplanner = {
	villages: {},
	edit: false,
	init: function() {
		Menu.add('attackplanner', lang.attackplanner.attackplanner, ( '<h3>{addcommand}</h3><table class="twa-table"><tr><th colspan="4">{attacker}</th><th colspan="4">{target}</th><th colspan="4">{time}</th><th colspan="4">{support}</th></tr><tr><td colspan="4"><input tooltip="xxx|yyy" name="from" class="twaInput"/> (<a href="#" id="twaCurrent">{current}</a>)</td><td colspan="4"><input tooltip="xxx|yyy" name="to" class="twaInput"/></td><td colspan="4"><input name="time" tooltip="hh:mm:ss dd/mm/yyyy" class="twaInput" value="' + TWA.data.attackplanner.lastTime + '"/> (<a href="#" id="twaNow">{now}</a>)</td><td><input name="support" class="center" type="checkbox"/></td></tr></table><table class="twa-table"><tr><th colspan="' + Object.keys(TWA.data.units).length + '">{troops}</th><th>{allunits}</th></tr><tr>' + createString( TWA.data.units, function( unit ) { return '<td><img src="http://cdn.tribalwars.net/graphic/unit/unit_' + unit + '.png" style="margin-bottom:-4px"/> <input unit="' + unit + '" class="units twaInput"/></td>' }, false, '<td><label><input name="allunits" class="center" type="checkbox"/></label></td>' ) + '</tr></table><div style="display:none"><h3>{commands}</h3><table class="twa-table"><thead><tr><th>{attacker}</th><th>{target}</th><th>{time}</th><th>{type}</th><th>{troops}</th><th>{options}</th></tr></thead><tbody class="commands"></tbody></table></div><div style="display:none"><h3>{commandssended}</h3><div style="overflow:auto;height:150px"><table class="log twa-table"><thead><tr><th>{attacker}</th><th>{target}</th><th>{time}</th><th>{type}</th></tr><thead></table></div></div>' ).lang( 'attackplanner' ), function() {
			var valid = {
				from: false,
				to: false,
				time: validTime( TWA.data.attackplanner.lastTime )
			};
			
			$commands = this.find( '.commands' );
			$log = this.find( '.attackplanner .log' );
			from = this.find( '[name=from]' );
			to = this.find( '[name=to]' );
			time = this.find( '[name=time]' );
			allunits = this.find( '[name=allunits]' );
			support = this.find( '[name=support]' );
			units = this.find( '.units' );
			
			Style.add('attackplanner', {
				'.attackplanner .units': { width: 33 },
				'.attackplanner input': { width: 90, height: 20, 'text-align': 'center' },
				'.attackplanner [name="time"]': { width: 200, border: '1px solid #aaa' },
				'.attackplanner .cmdUnits': { display: 'inline-block', 'text-align': 'center', margin: '0 3px' },
				'.attackplanner .cmdUnits img': { margin: '0 -3px -3px 1px', width: 15 },
				'.attackplanner .error': { border: '1px solid red' },
				'.attackplanner tr.editCurrent td': { background: '#F0F09E' }
			});
			
			support.checkStyle();
			allunits.checkStyle('click', function() {
				jQuery( '.attackplanner .units' ).attr( 'disabled', jQuery( 'input[name=allunits]' )[ 0 ].checked );
			});
			
			jQuery( '#twaNow' ).click(function() {
				time.val( $serverTime.text() + ' ' + $serverDate.text() );
				return false;
			});
			
			jQuery( '#twaCurrent' ).click(function() {
				from.val( game_data.village.coord ).removeClass( 'error' );
				return false;
			});
			
			// ao iniciar o Attack Planner e adiciona os comandos na tabela
			TWA.attackplanner.update();
			
			jQuery.acceptOnly([ from, to ], 'num | enter', function( event ) {
				if ( event.keyCode === 13 ) {
					return valid.from && valid.to && valid.time && TWA.attackplanner.add();
				}
				
				// pega as tropas atuais da aldeia e adiciona nas entradas
				// das unidades que serão usadas no ataque/apoio
				if ( this.name === 'from' ) {
					if ( !valid.from ) {
						return true;
					}
					
					Delay('addUnitsInput', function() {
						// envia requisição ajax para pegar as informações da aldeia
						TWA.attackplanner.villageInfo(this.value, function( data ) {
							jQuery.get(Url( 'place', data.id ), function( html ) {
								// loop em todos as inputs de unidades na praça de reunião e
								// adiciona aos inputs do a Attack Planner.
								jQuery( '.unitsInput', html ).each(function( i ) {
									var unit = Number( this.nextElementSibling.innerHTML.match( /\d+/ )[ 0 ] );
									units[ i ].value = unit > 0 ? unit : '';
								});
							});
						});
					}, 500, this);
				}
			});
			
			Delay('checkInputs', function() {
				from[(valid.from = rcoords.test( from[ 0 ].value )) ? 'removeClass' : 'addClass']('error');
				to[(valid.to = rcoords.test( to[ 0 ].value )) ? 'removeClass' : 'addClass']('error');
				time[(valid.time = validTime( time[ 0 ].value )) ? 'removeClass' : 'addClass']('error');
				
				return true;
			}, 200);
			
			time.acceptOnly('space num : / enter', function( event ) {
				if ( event.keyCode === 13 ) {
					return valid.from && valid.to && valid.time && TWA.attackplanner.add();
				} else if ( event.keyCode === 38 || event.keyCode === 40 ) {
					if ( rtime.test( this.value ) ) {
						var fix = this.value.split( ' ' ),
							date = fix[ 1 ].split( '/' ),
							time = fix[ 0 ].split( ':' ),
							maxByType = [ 23, 59, 59, 0, 12, 2050 ],
							posByType = [],
							pos = this.selectionStart,
							leftSpace = 19 - this.value.length,
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
						this.selectionStart = this.selectionEnd = leftSpace + pos;
					}
					
					return false;
				}
			});
			
			units.acceptOnly('num enter', function( event ) {
				if ( event.keyCode === 13 ) {
					return valid.from && valid.to && valid.time && TWA.attackplanner.add();
				}
			});
			
			// caso a entrada com o tempo e data esteja invalida, arruma a borda do input
			if ( !valid.time ) {
				jQuery( '.attackplanner [name=time]' ).addClass( 'error' );
			}
		});
		
		Delay('checkAttacks', function() {
			TWA.attackplanner.checkAttacks();
			return true;
		}, 500);
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
			support: inputs[ 3 ].checked,
			all: inputs.filter( '[name=allunits]' )[ 0 ].checked
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
			$commands.find( 'tr.edit' ).removeClass( 'editCurrent' );
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
			return jQuery.get(Url( 'mail' ), function( html ) {
				TWA.attackplanner.mailLink = this.url + '&mode=new&action=send&h=' + html.match( /"csrf":"(\w+)"/ )[ 1 ];
				TWA.attackplanner.update( callback );
			});
		}
		
		// caso tenha comandos para atualizar...
		if ( TWA.data.attackplanner.commands.length ) {
			if ( !show ) {
				show = true;
				$commands.parent().parent().show();
			}
			
			// pega todos os comandos e ordena por tempo
			var commands = TWA.data.attackplanner.commands.sort(function( a, b ) {
				return a.time - b.time;
			});
			
			// remove todos os comandos da tabela
			$commands.empty();
			
			// html usado em cada comando na tabela
			var html = '<tr id="__id"><td class="coord __from"><img src="http://www.preloaders.net/preloaders/252/preview.gif" style="width:25px" class="load"/></td><td class="coord __target"><img src="http://www.preloaders.net/preloaders/252/preview.gif" style="width:25px" class="load"/></td><td>__time</td><td><img src="/graphic/command/__type.png"/></td><td>__units</td><td><a href="#" class="remove"><img src="/graphic/delete.png"/></a> <a href="#" class="editCommand"><img src="/graphic/edit.png"/></a></td></tr>';
			
			// loop em todos os comandos
			for ( var i = 0; i < commands.length; i++ ) {
				// adicionado dados ao html e insere na lista
				var tr = jQuery(html.replace( '__id', i )
				.replace( '__from', commands[ i ].village )
				.replace( '__target', commands[ i ].target )
				.replace( '__time', timeFormat( commands[ i ].time ) )
				.replace( '__type', commands[ i ].support ? 'support' : 'attack' )
				.replace( '__units', commands[ i ].all ? lang.attackplanner.allunits : createString(commands[ i ].units, function( unit ) { return '<span class="cmdUnits"><img src="http://cdn.tribalwars.net/graphic/unit/unit_' + unit + '.png"/><br/><span class="' + unit + '">' + this + '</span></span>' }) ))
				.appendTo( $commands );
				
				// ao clicar remove comando da lista de espera e remove o elemento da tabela
				tr.find( '.remove' ).click(function() {
					// pega o tr
					var elem = this.parentNode.parentNode;
					// remove o ataque do Array de comandos
					TWA.data.attackplanner.commands.remove( Number( elem.id ) );
					// atualiza a tabela
					TWA.attackplanner.update();
					
					// caso o comando que será removido verifica se estava selecionado para edição...
					if ( TWA.attackplanner.edit && TWA.attackplanner.edit == elem.id ) {
						// caso esteja, desativa o modo de edição
						TWA.attackplanner.edit = false;
					}
					
					TWA.storage( true, null, 'data' );
					
					return false;
				});
				
				// ao clicar no botão para editar o comando...
				tr.find( '.editCommand' ).click(function() {
					// inputs que serão inseridos os dados atuais do comando
					var inputs = jQuery( '.attackplanner input' ),
						// TR
						elem = this.parentNode.parentNode,
						// todos TD da linha do comando
						tds = elem.getElementsByTagName( 'td' );
					
					elem.className = 'editCurrent';
					
					// insere os dados nos inputs
					inputs[ 0 ].focus();
					inputs[ 0 ].value = tds[ 0 ].className.split( ' ' )[ 1 ];
					inputs[ 1 ].value = tds[ 1 ].className.split( ' ' )[ 1 ];
					inputs[ 2 ].value = tds[ 2 ].innerHTML;
					inputs[ 3 ].checked = TWA.data.attackplanner.commands[ elem.id ].support;
					inputs.filter( '.units' ).val( '' );
					
					if ( TWA.data.attackplanner.commands[ elem.id ].all ) {
						inputs.filter( '[name=allunits]:not(:checked)' ).next().trigger('click');
					} else {
						jQuery( 'span', tds[ 4 ] ).each(function() {
							inputs.filter( '[unit=' + this.className + ']' ).val( this.innerHTML );
						});
					}
					
					TWA.attackplanner.edit = elem.id;
					
					return false;
				});
			}
			
			// loop em todas as coordenadas dos comandos na tabela
			$commands.find( '.coord' ).each(function() {
				var coords = this.className.split( ' ' )[ 1 ];
				
				// caso ja tenha pegado as informações da coordenada, insere na tabela
				if ( TWA.attackplanner.villages[ coords ] ) {
					if ( TWA.attackplanner.villages[ coords ].error ) {
						this.innerHTML = lang.attackplanner.errorcoords.springf( coords );
						
						return true;
					}
					
					this.innerHTML = '<a href="' + Url( 'info_village&id=' + TWA.attackplanner.villages[ coords ].id ) + '">' + TWA.attackplanner.villages[ coords ].name + '</a>';
				// caso nao tenha pegado as informações ainda...
				} else {
					// pegas as informações e joga na tabela
					TWA.attackplanner.villageInfo(coords, function( data, coords ) {
						var elem = $commands.find( '.coord[class*="' + coords + '"]'  );
						
						if ( data.error ) {
							elem.html( lang.attackplanner.errorcoords.springf( coords ) );
							return true;
						}
						
						elem.html( '<a href="' + Url( 'info_village&id=' + data.id ) + '">' + data.name + '</a>' );
					});
				}
			});
		// caso nao tenha comandos, limpa a tabela
		} else {
			show = false;
			$commands.parent().parent().hide();
			$commands.empty();
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
		} else if ( typeof TWA.attackplanner.villages[ coords ] === 'undefined' ) {
			TWA.attackplanner.villages[ coords ] = false;
		} else {
			return false;
		}
		
		// envia requisição para o preview da mensagem
		jQuery.post(TWA.attackplanner.mailLink, {
			extended: 0,
			preview: 1,
			to: game_data.player.name,
			subject: '0',
			text: '[coord]' + coords + '[/coord]'
		}, function( html ) {
			var elem = jQuery( 'td[style="background-color: white; border: solid 1px black;"] a:first', html );
			
			TWA.attackplanner.villages[ coords ] = elem.length ? {
				error: false,
				name: elem.text(),
				id: elem.attr( 'href' ).match( /id=(\d+)/ )[ 1 ]
			} :
			{ error: true };
			
			callback( TWA.attackplanner.villages[ coords ], coords );
		});
	},
	// verifica o tempo dos comandos, caso esteja no horario, envia.
	checkAttacks: function() {
		if ( !TWA.data.attackplanner.commands[ 0 ] ) {
			return false;
		}
		
		// data atual do jogo
		var now = formatToTime( $serverDate.text(), $serverTime.text() ),
			length = TWA.data.attackplanner.commands.length,
			attacks = [];
		
		while ( TWA.data.attackplanner.commands[ 0 ] ) {
			// caso o horario programado para o envio ja tenha passado, envia.
			if ( now > TWA.data.attackplanner.commands[ 0 ].time - 1000 ) {
				attacks.push( TWA.data.attackplanner.commands.shift() );
			} else {
				break;
			}
		}
		
		// verifica se teve alguma alteração na lista de comandos
		if ( length !== TWA.data.attackplanner.commands.length ) {
			// atualiza tabela com os comandos
			TWA.attackplanner.update();
			
			// tempo que será mostrado no log de comandos.
			// é criado antes por causa do delay entre os ataques.
			var time = timeFormat( new Date().getTime() );
			
			// função para chamar a função de preparo de ataque
			(function sendAttack() {
				// delay para o ataque (é permitido apenas 5 ataques por segundo)
				setTimeout(function() {
					// prepara o ataque
					TWA.attackplanner.attack( attacks.shift(), time );
					// remove o ataque do Array
					attacks.shift();
					// caso tenha algum comando no Array de ataques, prepara o proximo...
					attacks.length && sendAttack();
				}, 250);
			})();
			
			// salva os dados
			TWA.storage( true, null, 'data' );
		}
	},
	// envia os comandos
	attack: function( command, time ) {
		// antes de enviar os comandos sempre é pegado o "id" da aldeia
		TWA.attackplanner.villageInfo(command.village, function( village ) {
			var callback = function( units ) {
				units = units || command.units;
				
				// coordenadas da aldeia alvo
				var targetCoords = command.target.split( '|' ),
					// objeto com os dados de envio do comando
					data = jQuery.extend({
						x: targetCoords[ 0 ],
						y: targetCoords[ 1 ]
					}, units),
					// nome da aldeia usada para o comando
					village = TWA.attackplanner.villages[ command.village ],
					// nome da aldeia alvo
					target = TWA.attackplanner.villages[ command.target ];
				
				// verifica se o comando é um ataque ou apoio e adiciona ao objeto de dados
				data[ command.support ? 'support' : 'attack' ] = true;
				
				// envia a requisição ajax para enviar o comando
				jQuery.post(Url( 'place&try=confirm', village.id ), data, function( html ) {
					// pega o elemento de erro do comando
					var error = jQuery( '#error', html );
					
					// caso tenha algum erro, adiciona ao log e para o comando
					if ( error.text() ) {
						return $log.append( '<tr><td colspan="5">' + time + ' - ' + error.text() + '</td></tr>' );
					}
					
					var form = jQuery( 'form', html );
					
					// confirma e envia o ataque e adiciona ao log
					jQuery.post(form[ 0 ].action, form.serialize(), function() {
						$log.append( '<tr><td><a href="' + Url( 'info_village&id=' + village.id ) + '">' + village.name + '</a></td><td><a href="' + Url( 'info_village&id=' + target.id ) + '">' + target.name + '</a></td><td><strong>' + time + '</strong></td><td><img src="/graphic/command/' + ( command.support ? 'support' : 'attack' ) + '.png"/></td><td>' + createString( units, function( name ) { return '<img src="http://cdn.tribalwars.net/graphic/unit/unit_' + name + '.png" style="margin:0px -3px -3px;width:15px"/> ' + this + ' ' } ) + '</td></tr>' );
					});
				});
			};
			
			// caso o comando esteja selecionado para enviar todas tropas...
			command.all ?
				// carrega as tropas e prepara o ataque
				TWA.attackplanner.villageUnits(command.village, function() {
					callback( this );
				}) :
				// senão apenas carrega o ataque com as tropas pré-definidas
				callback();
		});
	},
	villageUnits: function( coords, callback ) {
		// obtem o id da aldeia apartir das coordenadas
		TWA.attackplanner.villageInfo(coords, function( village ) {
			// carrega a praça de reunião da aldeia
			jQuery.get(Url( 'place', village.id ), function( html ) {
				var vid = jQuery( '#menu_map_link', html )[ 0 ].href.match( /village=(\d+)/ )[ 1 ],
					units = {};
				
				// caso o id da aldeia seja o mesmo id da aldeia obtida
				// (verificação é feito porque caso a aldeia não seja do dono, retorna uma outra aldeia)
				if ( vid == village.id ) {
					// faz o loop em todos inputs de unidade da praça
					jQuery( '.unitsInput', html ).each(function() {
						// nome da unidade
						var unit = this.id.split( '_' )[ 2 ];
						// insere a unidade e quantidade no objeto
						units[ unit ] = Number( this.nextElementSibling.innerHTML.match( /\d+/ )[ 0 ] );
					});
					
					callback.call( units );
				}
			});
		});
	}
};

})();
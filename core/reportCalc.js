TWA.reportCalc = function() {
	var remove = { spy: true, catapult: true, ram: true, snob: true },
		necessaryUnits = {},
		options = TWA.settings._reportcalc,
		attackButton;
	
	// caso não tenha executado a função antes...
	if ( !document.getElementById( 'twaReportCalc' ) ) {
		Style.add('reportCalc', {
			'#twaReportCalc': { width: 475, background: '#eee', 'border-radius': 4, border: '1px solid rgba(0,0,0,0.2)', 'margin-bottom': 15 },
			'#twaReportCalc td': { 'text-align': 'center' },
			'#twa-spy, #twa-ram': { width: 30, 'text-align': 'center' },
			'.twaUnits': { margin: '-1px -2px -2px' },
			'#twa-attack': { display: 'none' },
			'#twa-results td': { border: '1px solid #ddd', 'border-radius': 5, background: '#fff', height: 20 }
		});
		
		console.log( 'TWA.reportCalc()' );
		
		var inputs = '',
			unitsAttack = '',
			colspan = 0;
		
		for ( var name in TWA.data.units ) {
			if ( !remove[ name ] ) {
				colspan++;
				inputs += '<td><img src="http://cdn.tribalwars.net/graphic/unit/unit_' + name + '.png"/> <input type="checkbox" class="twaUnits" unit="' + name + '" ' + ( options.actives.indexOf( name ) >= 0 ? 'checked="true"' : '' ) + '/></td>';
				unitsAttack += '<td name="' + name + '"></td>';
			}
		}
		
		jQuery( 'table[width=470]' ).before( ( '<div id="twaReportCalc"><table class="twa-table"><tr><th colspan="__colspan">' + lang.reportcalc.unitscalc + '</th></tr><tr><td style="text-align:left" colspan="__colspan"><label><input type="checkbox" id="twa-currentVillage"> ' + lang.reportcalc.currentvillage + '</label></td></tr><tr><td style="text-align:left" colspan="__colspan"><label><input class="twaInput" id="twa-spy" value="' + this.settings._reportcalc.spy + '"/> Enviar exploradores.</label></td></tr><tr><td style="text-align:left" colspan="__colspan"><label><input class="twaInput" id="twa-ram" value="' + this.settings._reportcalc.ram + '"/> Enviar arietes.</label></td></tr><tr>__inputs</tr><tr id="twa-results">__unitsAttack</tr></table><div style="margin:5px"><a href="#" id="twa-attack">» ' + lang.reportcalc.attack + '</a></div></div>' ).replace( '__inputs', inputs ).replace( '__unitsAttack', unitsAttack ).replace( /__colspan/g, colspan ) );
		
		attackButton = jQuery( '#twa-attack' );
		
		// ao alterar as opções executa a função novamente com os novos paramentros
		jQuery( '.twaUnits, #twa-spy, #twa-ram, #twa-currentVillage' ).change(function() {
			if ( this.id === 'twa-spy' ) {
				options.spy = isNaN( this.value ) ? 0 : Number( this.value );
			} else if ( this.id === 'twa-ram' ) {
				options.ram = isNaN( this.value ) ? 0 : Number( this.value );
			} else if ( this.id === 'twa-currentVillage' ) {
				options.currentVillage = this.checked;
			} else {
				options.actives = [];
				
				jQuery( '.twaUnits:checked' ).each(function() {
					options.actives.push( this.getAttribute( 'unit' ) );
				});
			}
			
			TWA.settings._reportcalc = options;
			TWA.storage( true );
			attackButton.hide();
			TWA.reportCalc();
		});
		
		// ao clicar no botão para enviar ataque...
		attackButton.click(function() {
			jQuery.post(TWA.url( 'place&try=confirm', vid ), jQuery.extend({
				x: coords[ 0 ],
				y: coords[ 1 ],
				attack: true
			}, necessaryUnits), function( html ) {
				var error = jQuery( '#error', html );
				
				// caso tenha algum erro no ataque...
				if ( error.text() ) {
					return alert( lang.reportcalc.error + ' ' + error.text() );
				}
				
				var form = jQuery( 'form', html );
				
				// confirma o ataque e envia
				jQuery.post(form[ 0 ].action, form.serialize(), function() {
					alert( lang.reportcalc.success );
				});
			});
			
			return false;
		});
	} else {
		attackButton = jQuery( '#twa-attack' );
	}
	
	jQuery( '#twa-results td' ).html( '' );
	
	var necessary2farm = 0,
	// recursos descobertos na aldeia
	discovery = jQuery( '#attack_spy tr:first td' ).text().trim().replace( /\./g, '' ).split( '  ' ),
	// leveis dos edificios da aldeia
	buildsLvl = jQuery( '#attack_spy tr:eq(1) td:last' ).text().replace( /\t/g, '' ).split( '\n' ),
	builds = {};
	buildsLvl = buildsLvl.splice( 1, buildsLvl.length - 2 );
	
	for ( var i = 0; i < buildsLvl.length; i++ ) {
		var build = buildsLvl[ i ].split( /\s\(/ ),
			level = build[ 1 ].match( /\d+/ );
		
		builds[ TWA.data.builds[ build[ 0 ] ] ] = Number( level );
	}
	
	// calcula o tanto que o esconderijo protege
	var hideSize = builds.hide === 0 ? 0 : Math.round( 150 * Math.pow( 40 / 3, ( builds.hide - 1 ) / 9 ) ),
	// calcula o tamanho do armazem
	storageSize = ( builds.storage === 0 ? 1000 : Math.round( 1000 * Math.pow( 400, ( builds.storage - 1 ) / 29 ) ) ),
	// coordenadas da aldeia atacante
	attCoords = jQuery( '#attack_info_att tr:eq(1) a' ).text().match( /\s\((\d+)\|(\d+)\)\s\w+$/ ),
	// coordenadas da aldeia que será farmada
	defCoords = jQuery( '#attack_info_def tr:eq(1) a' ).text().match( /\s\((\d+)\|(\d+)\)\s\w+$/ ),
	// calcula a distancia entre as aldeias
	distance = Math.sqrt( Math.pow( Number( attCoords[ 1 ] ) - Number( defCoords[ 1 ] ), 2 ) + Math.pow( Number( attCoords[ 2 ] ) - Number( defCoords[ 2 ] ), 2 ) ),
	// leveis das minas
	resLvl = [ builds.wood || 0, builds.stone || 0, builds.iron || 0 ],
	farthest = 0;
	
	// calcula o tempo que as tropas levariam para chegar na aldeia
	for ( var i = 0; i < options.actives.length; i++ ) {
		if ( TWA.data.units[ options.actives[ i ] ] ) {
			var time = Math.round( TWA.data.units[ options.actives[ i ] ].speed * ( distance / TWA.data.world.unit_speed ) / TWA.data.world.speed );
			
			if ( time > farthest ) {
				farthest = time;
			}
		}
	}
	
	// calcula a quantidade de recursos que a aldeia produzira enquanto as tropas chegam
	discovery.map(function( item, i ) {
		var prod = ( resLvl[ i ] === 0 ? 5 * TWA.data.world.speed : Math.round( 30 * Math.pow( 80, ( resLvl[ i ] - 1 ) / 29 ) ) * TWA.data.world.speed ) / 3600;
		
		item = Number( item ) + ( farthest * prod );
		if ( item > storageSize ) {
			item = storageSize;
		}
		necessary2farm += item;
	});
	
	necessary2farm -= hideSize;
	
	// id do jogador atacante
	var attpid = jQuery( '#attack_info_att a:first' ).attr( 'href' ).match( /id=(\d+)/ )[ 1 ],
	// id da aldeia atacante
	attvid = jQuery( '#attack_info_att tr:eq(1) a' ).attr( 'href' ).match( /id=(\d+)/ )[ 1 ],
	// coordenadas da aldeia atacante
	coords = jQuery( '#attack_info_def a[href*=info_village]' ).text().match( /.*\((\d+)\|(\d+)\)\sK\d{1,2}/ ).slice( 1, 3 ),
	vid = game_data.village.id,
	showButton = false;
	
	// se o atacante for voce mesmo...
	if ( attpid === game_data.player.id ) {
		// caso esteja para atacar a aldeia atual, ira seleciona-la, se não, usará a aldeia atacante para atacar novamente
		vid = jQuery( '#twa-currentVillage:checked' ).length ? game_data.village.id : attvid;
	}
	
	// carrega a pagina do praça de reunião para obter as tropas atuais da aldeia
	jQuery.get(this.url( 'place', vid ), function( html ) {
		var units = {};
		
		// pega a quantidade de unidades
		for ( var unit in TWA.data.units ) {
			units[ unit ] = Number( jQuery( '[name=' + unit + ']', html ).next().text().match( /\d+/ )[ 0 ] );
		}
		
		// faz o loop em todas unidades que podem ser usadas para farmar
		for ( var i = 0; i < TWA.settings._reportcalc.actives.length; i++ ) {
			// nome da unidade
			var unit = TWA.settings._reportcalc.actives[ i ],
			// capacidade de farm da unidade
			carry = TWA.data.units[ unit ].carry,
			// capacidade que todas unidades juntas podem farmar
			carryLimit = units[ unit ] * carry;
			
			// caso possa farmar alguma coisa...
			if ( carryLimit ) {
				showButton = true;
				
				// se as unidades podem farmar mais do que é preciso...
				if ( carryLimit >= necessary2farm ) {
					// calcula quantas unidades são necessarias para farmar 100% e pula para a etapa de enviar o ataque
					necessaryUnits[ unit ] = Math.ceil( necessary2farm / carry );
					
					break;
				// se não há unidades sulficientes para farmar tudo...
				} else {
					// adiciona todas as unidades
					necessaryUnits[ unit ] = units[ unit ];
					// reduz a quantidade de unidades necessarias para calcular com a proxima unidade...
					necessary2farm -= carryLimit;
				}
			}
		}
		
		if ( showButton ) {
			for ( var unit in necessaryUnits ) {
				document.getElementsByName( unit )[ 0 ].innerHTML = necessaryUnits[ unit ];
			}
			
			if ( options.ram && units.ram >= options.ram ) {
				necessaryUnits.ram = options.ram;
			}
			
			if ( options.spy && units.spy >= options.spy ) {
				necessaryUnits.spy = options.spy;
			}
			
			attackButton.show();
		} else {
			attackButton.hide();
		}
	});
};
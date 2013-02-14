TWA.reportCalc = function( necessary2farm ) {
	var orderUnits = [ 'knight', 'light', 'marcher', 'heavy', 'spear', 'axe', 'archer', 'sword' ],
		necessaryUnits = {},
		options = TWA.settings._reportcalc;
	
	// caso não tenha executado a função antes...
	if ( !document.getElementById( 'twa-reportCalc' ) ) {
		console.log( 'TWA.reportCalc()' );
		
		var checkbox = '',
			icons = '',
			inputs = '',
			tds = 0;
		
		for ( var name in TWA.data.units ) {
			if ( name === 'spy' || name === 'catapult' || name === 'ram' || name === 'snob' ) {
				continue;
			}
			
			tds++;
			checkbox += '<td style="text-align:center"><input type="checkbox" class="' + name + '" style="margin:-1px -2px -2px" ' + ( options.actives.indexOf( name ) >= 0 ? 'checked="true"' : '' ) + '/></td>';
			icons += '<td style="text-align:center"><img src="http://cdn.tribalwars.net/graphic/unit/unit_' + name + '.png" style="width:15px"/></td>';
			inputs += '<td style="text-align:center;height:18px" name="' + name + '"></td>';
		}
		
		jQuery( 'table[width=470]' ).before( ( '<table class="vis" id="twa-reportCalc" style="width:478px"><tr><th colspan="' + tds + '">' + lang.reportcalc.unitscalc + '</th></tr><tr><td colspan="' + tds / 2 + '"><label><input type="checkbox" id="twa-currentVillage"> ' + lang.reportcalc.currentvillage + '</label></td><td colspan="' + tds / 2 + '"><label><input style="width:25px;border:1px solid #ccc" value="' + this.settings._reportcalc.spy + '" id="twa-spys"/> Enviar exploradores.</label></td></tr><tr id="twa-activeUnits">__checkbox</tr><tr>__icons</tr><tr id="twa-results">__inputs</tr></table><table style="width:478px;display:none" class="vis" id="twa-attack"><tr><td><a href="#">» ' + lang.reportcalc.attack + '</a></td></tr></table>' ).replace( '__checkbox', checkbox ).replace( '__icons', icons ).replace( '__inputs', inputs ) );
		
		// ao alterar as opções executa a função novamente com os novos paramentros
		jQuery( '#twa-activeUnits input, #twa-spys, #twa-currentVillage' ).change(function() {
			if ( this.id === 'twa-spys' ) {
				TWA.settings._reportcalc.spy = isNaN( this.value ) ? 0 : Number( this.value );
			} else if ( this.id === 'twa-currentVillage' ) {
				TWA.settings._reportcalc.currentVillage = this.checked;
			} else {
				TWA.settings._reportcalc.actives = [];
				
				jQuery( '#twa-activeUnits input:checked' ).each(function() {
					TWA.settings._reportcalc.actives.push( this.className );
				});
			}
			
			TWA.storage( true );
			document.getElementById( 'twa-attack' ).style.display = 'none';
			TWA.reportCalc( necessary2farm );
		});
	}
	
	jQuery( '#twa-results td' ).html( '' );
	
	if ( !necessary2farm ) {
		necessary2farm = 0;
		
		// recursos descobertos na aldeia
		var discovery = jQuery( '#attack_spy tr:first td' ).text().trim().replace( /\./g, '' ).split( '  ' ),
		// leveis dos edificios da aldeia
		buildsLvl = jQuery( '#attack_spy tr:last td:last' ).text().replace( /\t/g, '' ).split( '\n' ),
		builds = {};
		buildsLvl = buildsLvl.splice( 1, buildsLvl.length - 2 );
		
		for ( var i = 0; i < buildsLvl; i++ ) {
			var build = buildsLvl[ i ].split( /\s\(/ ),
				level = build[ 1 ].match( /\d+/ );
			
			builds[ TWA.data.builds[ build[ 0 ] ] ] = Number( level );
		}
		
		// calcula o tanto que o esconderijo protege
		var hideSize = builds.hide === 0 ? 0 : Math.round( 150 * Math.pow( 40 / 3, ( builds.hide - 1 ) / 9 ) ),
		// calcula o tamanho do armazem
		storageSize = ( builds.storage === 0 ? 1000 : Math.round( 1000 * Math.pow( 400, ( builds.storage - 1 ) / 29 ) ) ) - hideSize,
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
		for ( var i = 0; i < orderUnits.length; i++ ) {
			if ( TWA.data.units[ orderUnits[ i ] ] ) {
				var time = TWA.data.units[ orderUnits[ i ] ].speed * ( distance / TWA.data.world.unit_speed ),
					hour = Math.floor( time / 3600 ),
					min = Math.floor( ( time - ( hour * 3600 ) ) / 60 ),
					times = parseFloat( hour + '.' + min );
				
				if ( times > farthest ) {
					farthest = times;
				}
			}
		}
		
		var timeCommand = String( farthest ).split( '.' );
		
		// calcula a quantidade de recursos que a aldeia produzira enquanto as tropas chegam
		discovery.map(function( item, i ) {
			var prod = resLvl[ i ] === 0 ? 5 * TWA.data.world.speed : Math.round( 30 * Math.pow( 80, ( resLvl[ i ] - 1 ) / 29 ) ) * TWA.data.world.speed;
			
			item = Number( item );
			item += ( hour * prod ) + min * ( prod / 60 ) + ( timeCommand[ 0 ] * prod ) + ( timeCommand[ 1 ] * ( prod / 60 ) );
			
			if ( item > storageSize ) {
				item = storageSize;
			}
			
			necessary2farm += item;
		});
	}
	
	// id do jogador atacante
	var attpid = jQuery( '#attack_info_att a:first' ).attr( 'href' ).match( /id=(\d+)/ )[ 1 ],
	// id da aldeia atacante
	attvid = jQuery( '#attack_info_att tr:eq(1) a' ).attr( 'href' ).match( /id=(\d+)/ )[ 1 ],
	// coordenadas da aldeia atacante
	coords = jQuery( '#attack_info_def a[href*=info_village]' ).text().match( /.*\((\d+)\|(\d+)\)\sK\d{1,2}/ ).slice( 1, 3 ),
	vid = game_data.village.id;
	
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
		for ( var i = 0; i < orderUnits.length; i++ ) {
			var unit = orderUnits[ i ];
			
			// caso a unidade esteja selecionada para atacar...
			if ( TWA.data.units[ unit ] && jQuery( '#twa-activeUnits input.' + unit + ':checked' ).length ) {
				// capacidade de farm da unidade
				var carry = TWA.data.units[ unit ].carry,
				// capacidade que todas unidades juntas podem farmar
				carryLimit = units[ unit ] * carry;
				
				// caso possa farmar alguma coisa...
				if ( carryLimit ) {
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
		}
		
		var min = 0,
			elemUnits = document.getElementById( 'twa-results' );
		
		for ( var unit in necessaryUnits ) {
			document.getElementsByName( unit )[ 0 ].innerHTML = necessaryUnits[ unit ];
		}
		
		if ( options.spy && units.spy >= options.spy ) {
			min++;
			necessaryUnits.spy = options.spy;
		}
		
		// ao clicar no botão para enviar ataque...
		document.getElementById( 'twa-attack' ).onclick = function() {
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
		};
		
		document.getElementById( 'twa-attack' ).style.display = Object.keys( necessaryUnits ).length <= min ? 'none' : '';
	});
};
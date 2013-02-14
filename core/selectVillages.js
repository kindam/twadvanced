TWA.selectVillages = {
	init: function() {
		console.log('TWA.selectVillages()');
		
		// todos os modos
		var modes = TWA.selectVillages.modes;
			ready = false;
		
		// verifica se tem existe algum filtro para o visualização atual
		for ( var name in modes ) {
			if ( overview === modes[ name ][ 0 ] ) {
				ready = true;
			}
		}
		
		// caso tenha, adiciona o menu com as opções
		if ( ready ) {
			jQuery( '#twa-overviewtools' ).show().append( '<tr><td>' + lang.selectvillages.selectvillages + ' <span id="twa-selectvillages"></span></td></tr>' );
		}
		
		// pega a ordem das unidades
		jQuery( '#combined_table tr:first th:has(img[src*="unit/unit"]) img' ).each(function() {
			TWA.selectVillages.tools.unitsorder.push( this.src.match( /unit_(\w+)/ )[ 1 ] );
		});
		
		// executa todos os fitros possiveis para a visualização atual
		for ( var name in modes ) {
			if ( overview === modes[ name ][ 0 ] ) {
				modes[ name ][ 1 ]();
			}
		}
	},
	modes: {
		// seleciona aldeias com tropas de ataque
		unitsattack: ['combined', function() {
			// todas as aldeias da tabela
			var villages = jQuery( '#combined_table tr:gt(0)' );
			
			// cria o checkbox
			// ao alterar seleciona/deseleciona as aldeias com ataque
			jQuery( '<input type="checkbox" id="twa-selectvillages-unitsattack"/>' ).change(function() {
				var i,
					units,
					popatt,
					popdef;
				
				// loop em todas aldeias
				for( i = 0; i < villages.length; i++) {
					// pega todas unidades da aldeia
					units = TWA.selectVillages.tools.getunits( villages[ i ] );
					// pega a quantidade de tropas de ataque da aldeias
					popatt = TWA.selectVillages.tools.getpop( 'att', units );
					// pega a quantidade de tropas de defesa da aldeias
					popdef = TWA.selectVillages.tools.getpop( 'def', units );
					
					if ( popatt > popdef ) {
						jQuery( '.addcheckbox', villages[ i ] ).attr( 'checked', this.checked );
					}
				}
			// adiciona label ao checkbox e envia elementos para o menu
			}).add( ' <label for="twa-selectvillages-unitsattack">' + lang.selectvillages.unitsattack + '</label>' ).appendTo( '#twa-selectvillages' );
		}],
		unitsdefence: ['combined', function() {
			// todas as aldeias da tabela
			var villages = jQuery( '#combined_table tr:gt(0)' );
			
			// cria o checkbox
			// ao alterar seleciona/deseleciona as aldeias com defesa
			jQuery( '<input type="checkbox" id="twa-selectvillages-unitsdefence"/>' ).change(function() {
				var i,
					units,
					popatt,
					popdef;
				
				// loop em todas aldeias
				for( i = 0; i < villages.length; i++) {
					// pega todas unidades da aldeia
					units = TWA.selectVillages.tools.getunits( villages[ i ] );
					// pega a quantidade de tropas de ataque da aldeias
					popatt = TWA.selectVillages.tools.getpop( 'att', units );
					// pega a quantidade de tropas de defesa da aldeias
					popdef = TWA.selectVillages.tools.getpop( 'def', units );
					
					if ( popatt < popdef ) {
						jQuery( '.addcheckbox', villages[ i ] ).attr( 'checked', this.checked );
					}
				}
			// adiciona label ao checkbox e envia elementos para o menu
			}).add( ' <label for="twa-selectvillages-unitsdefence">' + lang.selectvillages.unitsdefence + '</label>' ).appendTo( '#twa-selectvillages' );
		}],
		unitsnob: ['combined', function() {
			// todas as aldeias da tabela
			var villages = jQuery( '#combined_table tr:not(:first)' );
			
			// cria o checkbox
			// ao alterar seleciona/deseleciona as aldeias com nobres
			jQuery( '<input type="checkbox" id="twa-selectvillages-unitsnob">' ).change(function() {
				var units,
					i;
				
				// loop em todas aldeias
				for ( i = 0; i < villages.length; i++ ) {
					// pega todas unidades da aldeia
					units = TWA.selectVillages.tools.getunits( villages[ i ] );
					
					// verifica se tem nobres na aldeia, se tiver, seleciona
					if ( units.snob > 0 ) {
						jQuery( '.addcheckbox', villages[ i ] ).attr( 'checked', this.checked );
					}
				}
			// adiciona label ao checkbox e envia elementos para o menu
			}).add( ' <label for="twa-selectvillages-unitsnob">' + lang.selectvillages.unitsnob + '</label>' ).appendTo( '#twa-selectvillages' );
		}]
	},
	tools: {
		// pega todas tropas da aldeia
		getunits: function( village ) {
			var elems = jQuery('.unit-item', village),
				units = {};
			
			elems = elems.add(elems.next().last());
			
			for ( var i = 0; i < TWA.selectVillages.tools.unitsorder.length; i++ ) {
				units[ TWA.selectVillages.tools.unitsorder[ i ] ] = Number( elems.eq( i ).text() );
			}
			
			return units;
		},
		// pega a população usada pegas unidades passadas
		getpop: function( type, units ) {
			var pop = 0,
				unit,
				i = 0;
			
			switch( type ) {
				case 'att':
					for ( ; i < TWA.selectVillages.tools.unitsatt.length; i++ ) {
						unit = TWA.selectVillages.tools.unitsatt[ i ];
						pop += units[ unit ] * TWA.data.units[ unit ].pop;
					}
				break;
				case 'def':
					for ( ; i < TWA.selectVillages.tools.unitsdef.length; i++ ) {
						unit = TWA.selectVillages.tools.unitsdef[ i ];
						pop += units[ unit ] * TWA.data.units[ unit ].pop;
					}
				break;
				case 'all':
					for ( i in units ) {
						if ( TWA.data.units[ units[ i ] ] ) {
							pop += units[ i ] * TWA.data.units[ units[ i ] ].pop;
						}
					}
				break;
			}
			
			return pop;
		},
		unitsatt: [ 'axe', 'light', 'marcher', 'ram', 'catapult', 'knight', 'snob' ],
		unitsdef: [ 'light', 'sword', 'archer', 'heavy' ],
		unitsorder: []
	}
};
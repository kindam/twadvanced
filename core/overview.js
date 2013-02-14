TWA.overview = {
	init: function() {
		$overviewTools.show().append( '<tr><td>' + lang.overview.changemode + ' <select id="twa-overview-modes"></select> (' + lang.overview.needreload + ')</td></tr>' );
		
		var modes = document.getElementById( 'twa-overview-modes' );
		
		// ao alterar o modo de visualização salva para a proxima utilização
		modes.onchange = function() {
			TWA.settings._overviewmode = this.value;
			TWA.storage( true );
			
			if ( TWA.settings.renamevillages ) {
				if ( game_data.player.premium ) {
					TWA.renamevillages.mode = TWA.renamevillages.modes[ overview ];
				} else {
					TWA.renamevillages.mode = TWA.renamevillages.modes.nopremium[ TWA.settings.overview ? TWA.settings._overviewmode : 'nooverview' ];
				}
			}
		};
		
		for ( var mode in TWA.overview.modes ) {
			modes.innerHTML += '<option value="' + mode + '"' + ( TWA.settings._overviewmode === mode ? ' selected="selected"' : '' ) + '>' + lang.overview[ mode ] + '</option>';
		}
		
		// caso o tamanho da pagina do jogo seja pequena é enviado
		// um aviso que é melhor visualizado maior que 1000px
		if ( jQuery( '.maincell' ).width() < 950 ) {
			$contentValue.prepend( '<p><b>' + lang.overview.warning + '</b></p>' );
		}
		
		// insere a nova tabela e remove a antiga
		jQuery( '.overview_table' ).before( TWA.overview.modes[ TWA.settings._overviewmode ]() ).remove();
	},
	modes: {
		production: function() {
			var table = buildFragment( '<table id="production_table" class="vis overview_table" width="100%"><thead><tr><th width="400px">Aldeia</th><th style="width:50px;text-align:center">Madeira</th><th style="width:50px;text-align:center">Argila</th><th style="width:50px;text-align:center">Ferro</th><th style="width:46px;text-align:center"><span class="icon header ressources"></span></th><th style="width:53px;text-align:center"><img src="http://cdn2.tribalwars.net/graphic/overview/trader.png"/></th><th>Contruções</th><th>Pesquisas</th><th>Recrutamento</th></tr></thead></table>' ),
				elems = jQuery( '.overview_table tr[class]' ).get(),
				vid,
				village,
				points,
				storage,
				resource,
				resourceHtml,
				resourceNames,
				farm,
				amount,
				span;
			
			for ( var i = 0; i < elems.length; i++ ) {
				// id da aldeia
				vid = elems[ i ].getElementsByTagName( 'td' )[ 0 ].getElementsByTagName( 'a' )[ 0 ].href.match( /village=(\d+)/ )[ 1 ];
				// clona o elemento com nome e entrada para renomear
				village = elems[ i ].getElementsByTagName( 'td' )[ 0 ].cloneNode( true );
				span = village.getElementsByTagName( 'span' )[ 0 ];
				// armazem da aldeia
				storage = elems[ i ].getElementsByTagName( 'td' )[ 3 ].innerHTML;
				// recursos
				resource = elems[ i ].getElementsByTagName( 'td' )[ 2 ].innerHTML.replace( /<\/?span( class="[^\d]+")?>|\.|\s$/g, '' ).split( ' ' );
				resourceHtml = '';
				resourceNames = [ 'wood', 'stone', 'iron' ];
				farm = elems[ i ].getElementsByTagName( 'td' )[ 4 ].innerHTML;
				
				for ( var j = 0; j < 3; j++ ) {
					resourceHtml += '<td style="text-align:center;padding:0 2px;font-size:12px">' + resource[ j ] + '<div style="width:100%;height:2px;border:1px solid #aaa"><div style="width:' + ( resource[ j ] / storage * 100 ) + '%;background:#ccc;height:2px"></div></div></td>';
				}
				
				span.style.display = 'block';
				span.style[ 'float' ] = 'left'
				
				table.innerHTML += '<tr class="twa-overview-' + vid + '"><td style="line-height:10px;white-space:nowrap">' + village.innerHTML + '<span style="text-align:right;font-size:9px;display:block;float:right;margin-left:30px">' + elems[ i ].getElementsByTagName( 'td' )[ 1 ].innerHTML + ' pontos (' + farm + ')</span></td>' + resourceHtml + '<td style="text-align:center">' + storage + '</td><td class="market" style="text-align:center"></td><td class="builds" style="text-align:center"></td><td class="research" style="text-align:center"></td><td class="recruit" style="text-align:center"></td></tr>';
				
				// pega os dados do mercado para adicionar na tabela
				jQuery.get(TWA.url( 'market', vid ), function( html ) {
					var traders = jQuery( 'th:first', html );
					
					table.getElementsByTagName( 'td' )[ 6 ].innerHTML = traders.length ? '<a href="' + TWA.url( 'market' ) + '">' + traders[ 0 ].innerHTML.match( /\d+\/\d+/ )[ 0 ] + '</a>' : '0/0';
				});
				
				// pega os edificios que estão em contrução para adicionar na tabela
				jQuery.get(TWA.url( 'main', vid ), function( html ) {
					var imgs = '',
						builds = jQuery( '#buildqueue tr:gt(0)', html ).get();
					
					for ( var i = 0; i < builds.length; i++ ) {
						imgs += '<img style="margin-right:2px" src="' + jQuery( '#buildings tr:not(:first) td:has(a:contains(' + jQuery.trim( jQuery( 'td:first', builds[ i ] ).text().split( ' (' )[ 0 ] ) + ')) img', html )[ 0 ].src + '" tooltip="' + builds[ i ].getElementsByTagName( 'td' )[ 2 ].innerHTML + '"/>';
					}
					
					table.getElementsByTagName( 'td' )[ 7 ].innerHTML = imgs;
				});
				
				// pega as unidades em recrutamento para adicionar na tabela
				jQuery.get(TWA.url( 'train', vid ), function( html ) {
					var imgs = '',
						recruits = jQuery( '.trainqueue_wrap tr[class]', html).get(),
						data,
						unit;
					
					for ( var i = 0; i < recruits.length; i++ ) {
						data = recruits[ i ].getElementsByTagName( 'td' )[ 0 ].innerHTML.match( /(\d+)\s(.*)/ );
						data[ 2 ] = data[ 2 ].split( ' ' ).length === 1 ? data[ 2 ].slice( 0, 7 ) : data[ 2 ];
						
						imgs += '<img src="' + jQuery( '#train_form table tr[class] td:contains(' + data[ 2 ] + ') img', html )[ 0 ].src + '" tooltip="' + data[ 1 ] + '"/>';
					}
					
					table.getElementsByTagName( 'td' )[ 8 ].innerHTML = imgs;
					// adiciona o tooltip ao passar o mouse no icone da unidade
					jQuery( 'img[tooltip]', table.getElementsByTagName( 'td' )[ 8 ] ).tooltip();
				});
				
				// pega as pesquisas em andamento para adicionar na tabela
				jQuery.get(TWA.url( 'smith', vid ), function( html ) {
					var imgs = '',
						researchs = jQuery('#current_research tr[class]', html).get();
					
					for ( var i = 0; i < researchs.length; i++ ) {
						imgs += '<img src="' + jQuery( '#tech_list img[alt=' + researchs[ i ].getElementsByTagName( 'td' )[ 0 ].innerHTML + ']', html )[ 0 ].src + '" tooltip="' + researchs[ i ].getElementsByTagName( 'td' )[ 2 ].innerHTML + '"/>';
					}
					
					table.getElementsByTagName( 'td' )[ 9 ].innerHTML = imgs;
					jQuery( 'img[tooltip]', table.getElementsByTagName( 'td' )[ 9 ] ).tooltip();
				});
			}

			jQuery( '.overview_table' ).replaceWith( table );
		},
		combined: function() {
			var table = buildFragment( '<table id="combined_table" class="vis overview_table" width="100%"><thead>' + createStringList( '<style>.overview_table th{text-align:center}</style><tr><th width="400px" style="text-align:left">Aldeia</th><th><img src="http://cdn2.tribalwars.net/graphic/overview/main.png"/></th><th><img src="http://cdn2.tribalwars.net/graphic/overview/barracks.png"/></th><th><img src="http://cdn2.tribalwars.net/graphic/overview/stable.png"/></th><th><img src="http://cdn2.tribalwars.net/graphic/overview/garage.png"/></th><th><img src="http://cdn2.tribalwars.net/graphic/overview/smith.png"/></th><th><img src="http://cdn2.tribalwars.net/graphic/overview/farm.png"/></th>', TWA.data.units, '<th><img src="http://cdn2.tribalwars.net/graphic/unit/unit_{0}.png"/></th>', true ) + '<th><img src="http://cdn2.tribalwars.net/graphic/overview/trader.png"/></th></tr></thead></table>' ),
				elems = jQuery( '.overview_table tr[class]' ).get(),
				tds,
				vid,
				village,
				unit;
			
			// função para obter as informações de recrutamento, construções e pesquisas
			function insert( expr, html, elem ) {
				var img = document.createElement( 'img' ),
					recruits = [],
					// pega todas as produções em andamento
					queues = jQuery( expr + ' tr[class]', html ).get(),
					length = queues.length;
				
				// caso tenha alguma produção em andamento
				if ( length ) {
					// faz o loop em cada uma delas
					for ( var j = 0; j < length; j++ ) {
						// caso seja a ultima, adiciona a informação do tempo de término ao final
						j === length - 1
							? recruits.push( queues[ j ].getElementsByTagName( 'td' )[ 1 ].innerHTML + ' - ' + queues[ j ].getElementsByTagName( 'td' )[ 2 ].innerHTML )
							: recruits.push( queues[ j ].getElementsByTagName( 'td' )[ 1 ].innerHTML );
					}
					
					// altera a imagem para "produzindo" e adiciona o titulo com a lista de todas as produções
					img.title = recruits.join( ', ' );
					img.src = 'http://cdn2.tribalwars.net/graphic/overview/prod_running.png';
				} else {
					img.src = 'http://cdn2.tribalwars.net/graphic/overview/prod_avail.png';
				}
				
				elem.appendChild( img );
			}
			
			// faz o loop em todas as aldeias da tabela
			for ( var i = 0; i < elems.length; i++ ) {
				// clona o elemento com nome e entrada para renomear
				village = elems[ i ].getElementsByTagName( 'td' )[ 0 ].cloneNode( true );
				// id da aldeia
				vid = village.getElementsByTagName( 'a' )[ 0 ].href.match( /village=(\d+)/ )[ 1 ];
				
				// novo HTML da aldeia na tabela
				table.innerHTML += '<tr class="' + elems[ i ].className + ' twa-overview-' + vid + '">' + createStringList( '<td style="line-height:10px;white-space:nowrap">' + village.innerHTML + '<span style="text-align:right;font-size:9px;display:block;float:right;margin-left:30px">' + elems[ i ].getElementsByTagName( 'td' )[ 1 ].innerHTML + ' pontos</span></td><td class="main"></td><td class="barracks"></td><td class="stable"></td><td class="garage"></td><td class="smith"></td><td><a href="' + TWA.url( 'farm', vid ) + '">' + elems[ i ].getElementsByTagName( 'td' )[ 4 ].innerHTML + '</a></td>', TWA.data.units, '<td class="unit-item {0}"></td>', true ) + '<td class="market"></td></tr>';
				
				// todos os elementos TD da aldeia na tabela
				tds = table.getElementsByTagName( 'tr' )[ elems.length ].getElementsByTagName( 'td' );
				
				// obtem as informações das contruções
				jQuery.get(TWA.url( 'main' ), function( html ) {
					insert( '#buildqueue', html, tds[ 2 ] );
				});
				
				jQuery.get(TWA.url( 'train' ), function( html ) {
					// obtem a quantidade de tropas na aldeia
					var troops = {},
						troopsElem = jQuery( '#train_form tr[class]', html ).get(),
						unit,
						unitElem,
						unitIndex = 8;
					
					for ( var i = 0; i < troopsElem.length; i++ ) {
						// nome da unidade
						unit = troopsElem[ i ].getElementsByTagName( 'td' )[ 0 ].getElementsByTagName( 'img' )[ 0 ].src.match( /unit_(\w+)\./ )[ 1 ];
						// adiciona a quantidade de tropas no objeto
						troops[ unit ] = Number( troopsElem[ i ].getElementsByTagName( 'td' )[ 6 ].innerHTML.split( '/' )[ 0 ] );
					}
					
					for ( var name in TWA.data.units ) {
						unitElem = tds[ unitIndex++ ];
						
						// caso tenha alguma unidade, adiciona a tabela
						if ( troops[ name ] ) {
							unitElem.innerHTML = troops[ name ];
						} else {
							// caso nao tenha nenhuma unidade, adiciona 0 e adiciona a classe
							unitElem.innerHTML = '0';
							unitElem.className += ' hidden';
						}
					}
					
					// obtem as informações dos recrutamentos
					insert( '#trainqueue_wrap_barracks', html, tds[ 3 ] );
					insert( '#trainqueue_wrap_stable', html, tds[ 4 ] );
					insert( '#trainqueue_wrap_garage', html, tds[ 5 ] );
				});
				
				// obtem as informações das pesquisas
				jQuery.get(TWA.url( 'smith' ), function( html ) {
					insert( '#current_research', html, tds[ 6 ] );
				});
				
				// obtem as informações do mercado
				jQuery.get(TWA.url( 'market' ), function( html ) {
					var elem = jQuery( 'th:first', html )[ 0 ];
					
					if ( !elem ) {
						return tds[ tds.length - 1 ].innerHTML = '-';
					}
					
					tds[ tds.length - 1 ].innerHTML = '<a href="' + TWA.url( 'market' ) + '">' + elem.innerHTML.match( /(\d+\/\d+)/ )[ 1 ] + '</a>';
				});
			}
			
			return table;
		}
	}
};
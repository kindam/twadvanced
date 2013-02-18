TWA.renamevillages = {
	init: function() {
		$overviewTools.show().append( '<tr><td>' + lang.renamevillages.renamevillages + ': <input type="text" id="twa-renamevillages" style="padding:1px 2px;border:1px solid red;border-radius:2px;border-radius:2px;height:15px"/> <a href="http://code.google.com/p/tribalwars-scripts/wiki/Renomeador_de_Aldeias" target="_blank">(' + lang.renamevillages.mask + ')</a> <label><input type="checkbox" id="twa-onlyselected"/> ' + lang.renamevillages.onlySelected + '.</label></td></tr>');
		
		// ao digitar verifica se é possivel renomear, caso seja, altera a
		// cor da borda no input, caso precine "Enter" é renomeado as aldeias
		document.getElementById( 'twa-renamevillages' ).onkeyup = function( event ) {
			if ( !this.value || this.value.length < 3 ) {
				this.style.border = '1px solid red';
			}
			
			this.style.border = '1px solid silver';
			
			if ( event.keyCode === 13 ) {
				TWA.renamevillages.newname = this.value;
				TWA.renamevillages.prepare( document.getElementById( 'twa-onlyselected' ).checked );
				
				return false;
			}
		};
		
		// pega a chave "crsf" para poder ser usado na requisição de
		// renomear caso o usuario não seja premium
		jQuery.get(TWA.url( 'main' ), function( html ) {
			TWA.renamevillages.hkey = jQuery( 'form', html )[ 0 ].action.match( /h=(\w+)/ )[ 1 ];
		});
		
		// caso o jogador tenha premium, apenas adiciona a entrada para renomear todas aldeias
		if ( game_data.player.premium ) {
			TWA.renamevillages.mode = TWA.renamevillages.modes[ overview ];
		// caso não tenha premium...
		} else {
			// adiciona a opção de renomear aldeias individualmente
			TWA.renamevillages.individual();
			// pega o modo usado para usar na informações repassadas pelas mascaras ao renomear
			TWA.renamevillages.mode = TWA.renamevillages.modes.nopremium[ TWA.settings.overview ? TWA.settings._overviewmode : 'nooverview' ];
		}
	},
	// substitue as mascaras pelas informações corretas
	replace: function( name, elem ) {
		// {nome}, {nome()}, {nome( ... )}
		return name.replace(/\{([^}]+)\}/g, function( part, name ) {
			// pegas os dados dentro da mascara passado
			name = name.match(/([^(]+)(?:\s?\(([^)]+)\))?/);
			
			// nome da função passado pela mascara
			var fn = name[1].toLowerCase(),
				args = [];
			
			// verifica se foi passado argumentos
			if ( name[ 2 ] ) {
				// divide os argumentos pelas virgulas
				args = jQuery.trim( name[ 2 ] ).split( /\s*,\s*/ );
			}
			
			// verifica se a função passada existe nas funções que funcionam em qualquer modo
			if ( TWA.renamevillages.modes.all[ fn ] ) {
				return TWA.renamevillages.modes.all[ fn ].apply( this, args );
			// verifica se a função passada existe na lista de funções do modo atual
			} else if ( TWA.renamevillages.mode[ fn ] ) {
				return TWA.renamevillages.mode[ fn ].apply( jQuery( elem ), args );
			// caso não exista função a passada retorna a mascara inteira
			} else {
				return part;
			}
		});
	},
	prepare: function( selected ) {
		var elems = jQuery( '.overview_table tr[class]' + ( selected ? ':has(.addcheckbox:checked)' : '' ) ).get(),
			index = overview === 'groups' ? 3 : 2,
			elem,
			name;
		
		for ( var i = 0; i < elems.length; i++ ) {
			elem = elems[ i ].getElementsByTagName( 'span' );
			
			if ( !elem || !elem[ index ] ) {
				continue;
			}
			
			// substitue as mascaras
			name = TWA.renamevillages.replace( TWA.renamevillages.newname, elems[ i ] );
			
			// chama função para renomear a aldeia
			TWA.renamevillages.rename( elem[ index ].id.split( '_' )[ 1 ], name );
		}
	},
	rename: function( vid, name ) {
		// envia requisição ajax para renomear a aldeia
		jQuery.post(TWA.url( 'main&action=change_name&h=' + TWA.renamevillages.hkey, vid ), { name: name }, function( html ) {
			// pega o id da aldeia
			var vid = this.url.match( /village=(\d+)/ )[ 1 ],
				elem = document.getElementById( 'label_text_' + vid );
			
			elem.innerHTML = name + elem.innerHTML.match( /\s\(\d+\|\d+\)\s\w+$/ )[ 0 ];
		});
	},
	individual: function() {
		// pega todas as aldeias da tabela
		var elems = jQuery( '.overview_table tr[class]' ).get(),
			vid,
			span;
		
		for ( var i = 0; i < elems.length; i++ ) {
			span = elems[ i ].getElementsByTagName( 'span' )[ 0 ];
			// id da aldeia
			vid = span.id.split( '_' )[ 1 ];
			
			// ao clicar no botão de renomear, renomeia
			elems[ i ].getElementsByTagName( 'input' )[ 1 ].onclick = function() {
				if ( game_data.player.premium ) {
					var elem = document.getElementById( 'edit_input_' + vid );
					
					elem.value = TWA.renamevillages.replace( elem.value, elems[ i ] );
					elem.nextElementSibling.click();
				} else {
					TWA.renamevillages.rename( vid, TWA.renamevillages.replace( document.getElementById( 'edit_input_' + vid ).value, elems[ i ] ) );
					
					document.getElementById( 'edit_' + vid ).style.display = 'none';
					document.getElementById( 'label_' + vid ).style.display = '';
				}
			};
			
			// cria o icone para clicar e mostrar o campo para pesquisa
			jQuery( '<a>' ).addClass( 'rename-icon' ).click(function() {
				document.getElementById( 'edit_' + vid ).style.display = '';
				document.getElementById( 'label_' + vid ).style.display = 'none';
			}).appendTo( span );
		}
	},
	modes: {
		// funções usadas em visualização sem conta premium
		nopremium: {
			// funções usadas na visualização basica do jogo
			nooverview: {
				points: function() { return this.find( 'td:eq(2)' ).text(); },
				wood: function() { return this.find( 'td:eq(3)' ).text().split( ' ' )[ 0 ]; },
				stone: function() { return this.find( 'td:eq(3)' ).text().split( ' ' )[ 1 ]; },
				iron: function() { return this.find( 'td:eq(3)' ).text().split( ' ' )[ 2 ]; },
				storage: function() { return this.find( 'td:eq(4)' ).text(); },
				farmused: function() { return this.find( 'td:eq(5)' ).text().split( '/' )[ 0 ]; },
				farmtotal: function() { return this.find( 'td:eq(5)' ).text().split( '/' )[ 1 ]; },
				current: function() { return jQuery.trim( this.find( 'td:first' ).text() ).match( /(.*) \(\d+\|\d+\)\s\w{3}.?$/ )[ 1 ]; },
				x: function() { return jQuery.trim( this.find( 'td:eq(1)' ).text() ).match( /.* \((\d+)\|\d+\)\s\w{3}.?$/ )[ 1 ]; },
				y: function() { return jQuery.trim( this.find( 'td:eq(1)' ).text() ).match( /.* \(\d+\|(\d+)\)\s\w{3}.?$/ )[ 1 ]; }
			},
			// funções usadas na visualização Produção do proprio script
			production: {
				points: function() { return this.find( 'td:eq(1) span:last' ).text().split( ' ' )[ 0 ]; },
				wood: function() { return this.find( 'td:eq(2)' ).text(); },
				stone: function() { return this.find( 'td:eq(3)' ).text(); },
				iron: function() { return this.find( 'td:eq(4)' ).text(); },
				storage: function() { return this.find( 'td:eq(5)' ).text(); },
				farmused: function() { return this.find( 'td:eq(1) span:last' ).html().match( /\((\d+)/ )[ 1 ]; },
				farmtotal: function() { return this.find( 'td:eq(1) span:last' ).html().match( /\/(\d+)\)/ )[ 1 ]; },
				current: function() { return $.trim(this.find( 'td:eq(1) a:first' ).text()).match( /(.*) \(\d+\|\d+\)\s\w{3}.?$/ )[ 1 ] },
				x: function() { return $.trim(this.find( 'td:eq(1) a:first' ).text()).match( /.* \((\d+)\|\d+\)\s\w{3}.?$/ )[ 1 ]; },
				y: function() { return $.trim(this.find( 'td:eq(1) a:first' ).text()).match( /.* \(\d+\|(\d+)\)\s\w{3}.?$/ )[ 1 ]; }
			},
			// funções usadas na visualização Combinada do proprio script
			combined: {
				points: function() { return this.find( 'td:eq(1) span:last' ).text().split( ' ' )[ 0 ]; },
				farmused: function() { return this.find( 'td:eq(7) a' ).text().split( '/' )[ 0 ]; },
				farmtotal: function() { return this.find( 'td:eq(7) a' ).text().split( '/' )[ 1 ]; },
				current: function() { return jQuery.trim( this.find( 'td:eq(1) a:first' ).text() ).match( /(.*) \(\d+\|\d+\)\s\w{3}.?$/ )[ 1 ] },
				x: function() { return jQuery.trim( this.find( 'td:eq(1) a:first' ).text() ).match( /.* \((\d+)\|\d+\)\s\w{3}.?$/ )[ 1 ]; },
				y: function() { return jQuery.trim( this.find( 'td:eq(1) a:first' ).text() ).match( /.* \(\d+\|(\d+)\)\s\w{3}.?$/ )[ 1 ]; },
				unit: function( unit ) {
					if ( !TWA.data.units[ unit ] ) {
						UI.ErrorMessage( 'Renomeador de Aldeias - Argumento inválido: {unit(' + unit + ')} Correto: {unit(UNIDADE)}' );
						return '{unit(ERROR)}';
					}
					
					var index = TWA.renamevillages.modes.nopremium.combined.unit.cache;
					
					if ( !index ) {
						index = {};
						
						jQuery( '.overview_table tr:first th' ).each(function( i ) {
							var img = jQuery( 'img[src*=unit_]', this );
							
							if ( img.length ) {
								index[ img[ 0 ].src.match( /unit_(\w+)\./)[ 1 ] ] = i;
							}
						});
						
						TWA.renamevillages.modes.nopremium.combined.unit.cache = index;
					}
					
					return this[ 0 ].getElementsByTagName( 'td' )[ index[ unit ] ].innerHTML;
				}
			}
		},
		// funções que podem ser usadas em qualquer modo
		all: {
			random: function( min, max ) {
				min = Number( min || 0 );
				max = Number( max || 10000 );
				
				if ( isNaN( min ) || isNaN( max ) ) {
					UI.ErrorMessage( lang.renamevillages.renamevillages + ' - ' + lang.renamevillages.argumentError + ': {random(' + min + ', ' + max + ')} ' + lang.renamevillages.correct + ': {random( NUM, NUM )}' );
					return '{random(ERROR)}';
				}
				
				return Math.floor( Math.random() * ( max - min + 1 ) + min );
			}
		}
	}
};
TWA.config = function() {
	console.log( 'TWA.config()' );
	
	// html da lista de linguagens disponiveis no script
	var langs = '<select style="width:120px" name="lang">';
	
	for ( var name in languages ) {
		langs += '<option value=' + name + '>' + languages[ name ].lang + '</option>'
	}
	
	// html do conteudo da tela de configurações
	var html = '<div id="twa-tooltip"></div><div class="content">',
	// lista de configurações para serem ativadas/desativadas
	settingList = {
		other: [ 'autofarm', 'lastattack', 'reportfilter', 'villagefilter', 'reportrename', 'commandrename', 'renamevillages', 'mapgenerator', 'reportcalc', 'troopcounter', 'assistentfarm', 'building', 'research', 'changegroups', 'attackplanner', 'selectvillages', 'overview' ],
		coords: [ 'mapcoords', 'profilecoords', 'mapidentify', 'mapmanual' ],
		graphicstats: [ 'rankinggraphic', 'allygraphic', 'profilestats' ]
	};
	
	for ( var item in settingList ) {
		var list = settingList[ item ];
		
		html += '<div><h1>' + lang.config[ item ] + '</h1>';
		
		for ( var i = 0, name; i < list.length; name = list[ ++i ] ) {
			html += '<label tooltip="' + lang.config.tooltip[ list[ i ] ] + '"><input type="checkbox" name="' + list[ i ] + '"/> <span>' + lang.config[ list[ i ] ] + '</span></label>';
		}
		
		html += '</div>';
	}
	
	Style.add('config', {
		'.config .content div:first-child': { 'margin-left': 0 },
		'.config .content div': { display: 'block', 'float': 'left', 'margin-left': '1%', width: '49.5%' },
		'.config .content .bottom': { width: '100%', 'text-align': 'center' },
		'.config textarea': { border: '1px solid #999', width: 280, height: 80, 'font-size': 12 },
		'.config select': { border: '1px solid #999', width: 70, margin: '0 2px', 'font-size': 12 },
		'.config input': {border: '1px solid #999', margin: 3 },
		'.config h1': { background: '#e4e4e4', 'border-bottom': '1px solid #c4c4c4', 'border-top': '1px solid #fff', color: '#333', 'font-size': 13, 'font-weight': 'bold', 'line-height': 20, margin: '6px 0 10px', padding: '3px 7px' },
		'.config label': { margin: '3px 0', display: 'block', height: 20, 'line-height': 21 },
		'.config label span': { 'margin-left': 5 }
	});
	
	Menu.add('config', '</div>' + lang.config.config, html + '<div><h1>Languages</h1><label>Language: ' + langs + '</select></label></div><div class="bottom"><button class="twaButton">' + lang.config.save + '</button></div>', function() {
		this.find( 'input[type=checkbox]' ).checkStyle();
	});
	
	// adiciona os dados das configurações nas entradas de configuração
	for ( var name in TWA.settings ) {
		if ( name[ 0 ] !== '_' ) {
			document.getElementsByName( name )[ 0 ][ typeof TWA.settings[ name ] === 'boolean' ? 'checked' : 'value' ] = TWA.settings[ name ];
		}
	}
	
	// adiciona os tooltips de ajuda nas entradas de configuração
	jQuery( '.config [tooltip]' ).tooltip();
	
	// ao clicar no botão "Salvar" as configuração são salvas
	jQuery( '.config button' ).click(function() {
		jQuery( '.config input' ).each(function() {
			TWA.settings[ this.name ] = this.type === 'checkbox' ? jQuery( this ).is( ':checked' ) : this.value;
		});
		
		TWA.settings.lang = jQuery( '[name=lang]' ).val();
		TWA.storage( true );
		
		alert( lang.config.savealert );
	});
}
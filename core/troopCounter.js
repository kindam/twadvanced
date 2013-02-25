TWA.troopCounter = function() {
	var units = {},
		table = jQuery( '<table id="twa-troopcounter" class="vis" style="width:100%;margin:0 auto"><thead>' + jQuery( '#units_table thead' ).html() + '</thead><tbody>' + jQuery( '#units_table tbody:first' ).html() + '</tbody></table>' ).insertAfter( '#units_table' ),
		img = document.getElementById( 'units_table' ).getElementsByTagName( 'tr' )[ 0 ].getElementsByTagName( 'img' ),
		tbody = document.getElementById( 'units_table' ).getElementsByTagName( 'tbody' ),
		mytr = table.getElementsByTagName( 'tbody' )[ 0 ].getElementsByTagName( 'tr' );
	
	for ( var i = 0; i < img.length; i++ ) {
		units[ img[ i ].src.match( /_(\w+)\.png/ )[ 1 ] ] = [
			[ i + 2, 0 ],
			[ i + 1, 0 ],
			[ i + 1, 0 ],
			[ i + 1, 0 ]
		];
	}
	
	for ( var i = 0; i < tbody.length; i++ ) {
		var tr = tbody[ i ].getElementsByTagName( 'tr' );
		
		for ( var j = 0; j < tr.length; j++ ) {
			for ( var name in units ) {
				units[ name ][ j ][ 1 ] += Number( tr[ j ].getElementsByTagName( 'td' )[ units[ name ][ j ][ 0 ] ].innerHTML );
			}
		}
	}
	
	jQuery( 'td:first', table ).empty().width( jQuery( '#units_table td:first' ).width() );
	jQuery( 'th:first', table ).html( 'Contagem de Tropas:' );
	jQuery( 'th:last, td:has(a)', table ).remove();
	
	for ( var i = 0; i < mytr.length; i++ ) {
		for ( var name in units ) {
			var td = mytr[ i ].getElementsByTagName( 'td' )[ units[ name ][ i ][ 0 ] ];
			
			td.className = 'unit-item' + ( units[ name ][ i ][ 1 ] == 0 ? ' hidden' : '' );
			td.innerHTML = units[ name ][ i ][ 1 ];
		}
	}
};
TWA.storage = function( props, value, type ) {
	var name = type ? memory[ type ] : memory.settings;
	type = type ? 'data' : 'settings';
	
	if ( props === true ) {
		localStorage[ name ] = JSON.stringify( TWA[ type ] );
	} else if ( typeof props === 'string' ) {
		if ( !value ) {
			return TWA[ type ][ props ];
		} else {
			TWA[ type ][ props ] = value;
			localStorage[ name ] = JSON.stringify( TWA[ type ] );
			
			return value;
		}
	}
	
	return true;
};
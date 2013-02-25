TWA.mapVillages = function( callback ) {
	var village;
	
	for ( var x = 0; x < TWMap.size[ 1 ]; x++ ) {
		for ( var y = 0; y < TWMap.size[ 0 ]; y++ ) {
			var coord = TWMap.map.coordByPixel( TWMap.map.pos[ 0 ] + ( TWMap.tileSize[ 0 ] * y ), TWMap.map.pos[ 1 ] + ( TWMap.tileSize[ 1 ] * x ) );
			
			if ( village = TWMap.villages[ coord.join( '' ) ] ) {
				village.player = TWMap.players[ village.owner ];
				
				if ( typeof village.points === 'string' ) {
					village.points = Number( village.points.replace( '.', '' ) );
				}
				
				callback.call( village, coord );
			}
		}
	}
};
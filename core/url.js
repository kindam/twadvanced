TWA.url = function( screen, vid ) {
	return game_data.link_base_pure.replace( /village=\d+/, 'village=' + ( vid || game_data.village.id ) ) + screen;
};
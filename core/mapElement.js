TWA.mapElement = function( data, css ) {
	// seleciona todas as aldeias visiveis no mapa
	var img = jQuery( '#map_village_' + data.vid ),
		// posição do elemento ao ser adicionado
		pos = data.pos || [ 0, 0 ],
		// elemento que será adicionado no mapa
		elem = jQuery( '<div/>' ).css(jQuery.extend(css, {
			top: Number( img.css( 'top' ).replace( 'px', '' ) ) + pos[ 0 ],
			left: Number( img.css( 'left' ).replace( 'px', '' ) ) + pos[ 1 ],
			zIndex: 10,
			position: 'absolute',
			'-moz-border-radius': css.borderRadius,
			'-webkit-border-radius': css.borderRadius
		})).addClass( data.Class );
	
	data.id && elem.attr( 'id', data.id );
	data.html && elem.html( data.html );
	img.parent().prepend( elem );
};
TWA.reportFilter = function() {
	Style.add('reportfinder', {
		'#twa-reportfinder': { padding: '1px 2px', border: '1px solid silver', 'border-radius': 2, height: 15 }
	});
	
	jQuery( '<table class="vis" width="100%"><tr><th>{search} <input type="text" id="twa-reportfinder"/></th></tr></table>'.lang( 'reportfilter' ) ).insertBefore( '#report_list' ).find( '#twa-reportfinder' ).keyup(function() {
		var param = this.value.toLowerCase();
		
		jQuery( '#report_list tr:not(:first, :last)' ).each(function() {
			this.style.display = jQuery( this ).text().toLowerCase().indexOf( param ) < 0 ? 'none' : 'block';
		});
	});
	
	selectAll = function( form, checked ) {
		jQuery( '#report_list tr:not(:first, :last):visible input[type=checkbox]' ).attr( 'checked', checked );
	};
};
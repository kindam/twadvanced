TWA.reportFilter = function() {
	console.log( 'TWA.reportFilter()' );
	
	jQuery( '#report_list' ).before( '<table class="vis" width="100%"><tr><th>' + lang.reportfilter.search + ' <input type="text" id="twa-reportfinder" style="padding:1px 2px;border:1px solid silver;border-radius:2px;-webkit-border-radius:2px;-moz-border-radius:2px;height:15px"/></th></tr></table>' );
	
	jQuery( '#twa-reportfinder' ).keyup(function() {
		var param = this.value.toLowerCase();
		
		jQuery( '#report_list tr:not(:first, :last)' ).each(function() {
			this.style.display = jQuery( this ).text().toLowerCase().indexOf( param ) < 0 ? 'none' : 'block';
		});
	});
	
	selectAll = function( form, checked ) {
		jQuery( '#report_list tr:not(:first, :last):visible input[type=checkbox]' ).attr( 'checked', checked );
	};
};
TWA.villageFilter = function() {
	console.log('TWA.villageFilter()');
	
	var villagesExpr = '.overview_table tr:not(:first)';
	var nameExpr = 'span[id^=label_text]';
	var timeout;
	
	if ( overview === 'units' ) {
		villagesExpr = '.overview_table tbody';
	} else if ( overview === 'commands' || overview === 'incomings' ) {
		villagesExpr = '.overview_table tr.nowrap';
		nameExpr = 'span[id^=labelText]';
	}
	
	var villages = jQuery( villagesExpr ).get();
	
	jQuery( '#twa-overviewtools' ).show().append( '<tr><td>' + lang.villagefilter.search + ' <input type="text" id="twa-villagefilter" style="padding:1px 2px;border:1px solid silver;border-radius:2px;height:15px"/></td></tr>' );
	
	jQuery( '#twa-villagefilter' ).keyup(function () {
		var param = this.value.toLowerCase();
		
		clearTimeout( timeout );
		
		timeout = setTimeout(function() {
			for ( var i = 0; i < villages.length; i++ ) {
				villages[ i ].style.display = villages[ i ].getElementsByTagName( 'span' )[ 1 ].innerHTML.toLowerCase().indexOf( param ) < 0 ? 'none' : '';
			}
		}, 200);
	});
	
	selectAll = function( form, checked ) {
		jQuery( '.overview_table tr.nowrap:visible input[type=checkbox]' ).attr( 'checked', checked );
	};
};
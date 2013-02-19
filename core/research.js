TWA.research = {
	init: function() {
		jQuery( '.overview_table' ).before( '<table class="vis" width="100%" id="twa-research"><tr><th>' + lang.research.help + ' <a href="#" id="twa-research-cancel">» ' + lang.research.cancel + '</a></th></tr></table>' );
		
		jQuery( '#twa-research-cancel' ).click(function() {
			if ( confirm( lang.research.confirmcancel ) ) {
				TWA.research.cancel();
			}
			
			return false;
		});
		
		jQuery( '#techs_table tr:first a:has(img)' ).click(function() {
			return TWA.research._do( this.href.match( /order=(\w+)/ )[ 1 ] );
		});
	},
	_do: function( unit ) {
		var villages = document.getElementById( 'techs_table' ).getElementsByTagName( 'tr' );
		
		for ( var i = 1; i < villages.length; i++ ) {
			var vid = villages[ i ].id.split( '_' )[ 1 ];
			
			if ( document.getElementById( vid + '_' + unit ) ) {
				jQuery.ajax({
					type: 'post',
					url: TechOverview.urls.ajax_research_link.replace( /village=\d+/, 'village=' + vid ),
					data: { tech_id: unit },
					dataType: 'json',
					vid: vid,
					success: function( complete ) {
						if ( complete.success ) {
							document.getElementById( 'village_tech_order_' + this.vid ).innerHTML = complete.tech_order;
							TechOverview.change_dot( jQuery( '#' + this.vid + '_' + unit ), this.vid, unit, 'brown' );
							
							if ( game_data.village.id == this.vid ) {
								jQuery( '#wood' ).html( complete.resources[ 0 ] );
								jQuery( '#stone' ).html( complete.resources[ 1 ] );
								jQuery( '#iron' ).html( complete.resources[ 2 ] );
								startTimer();
							}
						}
					}
				});
			}
		}
		
		return false;
	},
	cancel: function() {
		jQuery( '#techs_table div.tech-cancel-icon img' ).each(function() {
			var data = this.onclick.toString().match( /cancel_research_order\((\d+), (\d+), '(\w+)'\)/ );
			
			jQuery.ajax({
				url: TechOverview.urls.ajax_cancel_tech_order_link.replace( /village=\d+/, 'village=' + data[ 1 ] ),
				dataType: 'json',
				type: 'post',
				data: { tech_order_id: data[ 2 ] },
				name: data[ 3 ],
				vid: data[ 1 ],
				success: function( complete ) {
					if ( complete.success ) {
						document.getElementById( 'village_tech_order_' + this.vid ).innerHTML = complete.tech_order;
						TechOverview.restore_dot( this.vid, this.name );
					}
				}
			});
		});
	}
};
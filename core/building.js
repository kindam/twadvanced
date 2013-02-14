TWA.building = {
	init: function() {
		console.log( 'TWA.building()' );
		
		jQuery( '#twa-overviewtools' ).show().append( '<tr id="twa-building"><th><label><input type="radio" checked name="twa-building" id="twa-building-build"/> ' + lang.building.buildtitle + ' <img src="graphic/questionmark.png" width="13" title="' + lang.building.buildhelp + '"/></label> <a href="#" id="twa-cancel-builds">» ' + lang.building.cancelbuilds + '</a></th></tr><tr><td class="twa-buildings"></td></tr><tr><th><label><input type="radio" name="twa-building" id="twa-building-destroy"/> ' + lang.building.destroytitle + ' <img src="graphic/questionmark.png" width="13" title="' + lang.building.destroyhelp + '"/></label> <a href="#" id="twa-cancel-destroy">» ' + lang.building.canceldestroy + '</a></th></tr><tr><td class="twa-buildings"></td></tr><tr><th>' + lang.building.help + '</th></tr>' );
		
		jQuery( '#twa-building-build, #twa-building-destroy' ).click(function() {
			if ( ( BuildingOverview._display_type === 1 && this.id === 'twa-building-destroy' ) || ( BuildingOverview._display_type === 0 && this.id === 'twa-building-build' ) ) {
				return;
			}
			
			BuildingOverview.show_all_upgrade_buildings( this.id === 'twa-building-destroy' );
		});
		
		jQuery( '#twa-cancel-builds, #twa-cancel-destroy' ).unbind( 'click' ).click(function() {
			if ( confirm( lang.building.confirmcancel.springf( this.id === 'twa-cancel-destroy' ? lang.building.demolitions : lang.building.buildings ) ) ) {
				TWA.building.cancel( this.id === 'twa-cancel-destroy' );
			}
			
			return false;
		});
		
		if ( BuildingOverview._display_type === false ) {
			BuildingOverview.show_all_upgrade_buildings();
		} else if ( BuildingOverview._display_type ) {
			jQuery( '#twa-building-destroy' ).attr( 'checked', true );
		}
		
		for ( var i = 0; i < 2; i++ ) {
			var td = jQuery( '.twa-buildings' ).eq( i );
			
			for ( var build in TWA.data.builds ) {
				build = TWA.data.builds[ build ];
				
				td.append( '<img src="graphic/buildings/' + build + '.png"/> <input type="text" style="width:25px" name="' + build + '" value="' + TWA.settings[ i ? '_buildingdestroy' : '_buildingbuild' ][ build ] + '"/> ' );
			}
		}
		
		var timeout;

		jQuery( '.twa-buildings' ).each(function( tableIndex ) {
			jQuery( 'input', this ).keyup(function() {
				var index = tableIndex;
				var elem = this;
				
				clearTimeout( timeout );
				
				setTimeout(function() {
					TWA.settings[ index ? '_buildingdestroy' : '_buildingbuild' ][ elem.name ] = elem.value;
					TWA.storage( true );
				}, 2000);
			}).keypress(function( event ) {
				return event.charCode > 47 && event.charCode < 58 && this.value.length < 3;
			});
		});
		
		jQuery( '#buildings_table tr:first th:has(img[src*=buildings]) a' ).click(function () {
			return TWA.building._do( jQuery( 'img', this )[ 0 ].src.match( /\/([a-z]+)\.png/ )[ 1 ], BuildingOverview._display_type );
		});
	},
	_do: function( build, destroy ) {
		var url = jQuery( '#upgrade_building_link' ).val();
		var max = destroy ? 5 : TWA.settings._buildingmaxorders;
		var limit = Number( jQuery( '.twa-buildings' ).eq( destroy ).find( 'input[name=' + build + ']' ).val() );
		
		jQuery( '#buildings_table tr:not(:first)' ).each(function() {
			var vid = this.className.match( /\d+/ )[ 0 ];
			
			if ( BuildingOverview._upgrade_villages[ vid ].buildings[ build ] ) {
				var curOrders = jQuery( 'td:last li:has(.build-status-light[style*=' + ( destroy ? 'red' : 'green' ) + ']) img[src*="' + build + '.png"]', this );
				var cur = Number( jQuery( '.b_' + build + ' a', this ).text() ) + curOrders.length;
				
				for ( var orders = jQuery( '#building_order_' + vid + ' img' ).length / 2; orders < max; orders++ ) {
					if ( destroy ? cur-- > limit : cur++ < limit ) {
						jQuery.ajax({
							url: url.replace( /village=\d+/, 'village=' + vid ),
							data: { id: build, destroy: destroy, force: 1 },
							async: false,
							dataType: 'json',
							success: function( complete ) {
								if ( complete.success ) {
									if ( !jQuery( '#building_order_' + vid ).length ) {
										var ul = jQuery( '<ul class="building_order" id="building_order_' + vid + '"></ul>' );
										
										BuildingOverview.create_sortable( ul );
										jQuery( '#v_' + vid + ' td:last' ).append( ul );
									}
									
									jQuery( '#building_order_' + vid ).html( complete.building_orders );
								}
							}
						});
					}
				}
			}
		});

		return false;
	},
	cancel: function( destroy ) {
		jQuery( 'li:has(.build-status-light[style*=' + ( destroy ? 'red' : 'green' ) + ']) .build-cancel-icon img' ).click();
	}
};
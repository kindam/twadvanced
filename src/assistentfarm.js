TWA.assistentfarm = {
	id: 0,
	init: function() {
		return alert( 'Essa ferramenta estará disponivel na proxima atualização...' );
		
		jQuery( 'h3:first' ).append( ' <span id="twa-assistentfarm">(' + lang.assistentfarm.auto + ')</span>' );
		jQuery( '#farm_units' ).parent().after( '<div class="vis" style="overflow:auto;height:100px"><table style="width:100%"><tr id="twa-assistent-log"><th><h4>' + lang.assistentfarm.log + '</h4></th></tr></table></div>' );
		TWA.assistentfarm.prepare();
	},
	log: function( log, error ) {
		jQuery( '#twa-assistent-log' ).after( '<tr><td>' + ( TWA.assistentfarm.id++ ) + ': <img src="' + ( error ? '/graphic/delete_small.png' : '/graphic/command/attack.png' ) + '"/> ' + log + '</td></tr>' );
	},
	prepare: function() {
		var elems = [];
		var index = 0;
		
		jQuery.get(location.href, function( html ) {
			jQuery( '#am_widget_Farm table tr[class]', html ).each(function() {
				elems.push( this );
			});
			
			setInterval(function() {
				TWA.assistentfarm.attack( elems[ index ] );
				
				if ( ++index === elems.length ) {
					index = 0;
				}
			}, 5000);
		});
	},
	attackHandler: {
		sendUnits: function( village, template, name ) {
			jQuery.ajax({
				type: 'post',
				url: Accountmanager.send_units_link,
				data: {
					target: village,
					template_id: template
				},
				village: name,
				success: function( complete ) {
					complete = JSON.parse( complete );
					
					if ( complete.success ) {
						TWA.assistentfarm.log( complete.success.replace( '\n', ' ' ) + ' ' + lang.assistentfarm.onvillage + ' ' + this.village );
					} else if ( complete.error ) {
						TWA.assistentfarm.log( complete.error + ' ' + lang.assistentfarm.onvillage + ' ' + this.village, true );
					}
				}
			});
		},
		reportAttack: function( village, report, name ) {
			jQuery.ajax({
				type: 'post',
				url: Accountmanager.send_units_link_from_report,
				data: { report_id: report },
				village: name,
				success: function( complete ) {
					complete = JSON.parse( complete );
					
					if ( complete.success ) {
						TWA.assistentfarm.log( complete.success.replace( '\n', ' ' ) + ' ' + lang.assistentfarm.onvillage + ' ' + this.village );
					} else if ( complete.error ) {
						TWA.assistentfarm.log( complete.error + ' ' + lang.assistentfarm.onvillage + ' ' + this.village, true );
					}
				}
			});
		}
	},
	attack: function( elem ) {
		var icon_a = jQuery( '.farm_icon_a:not(.farm_icon_disabled)', elem );
		var icon_b = jQuery( '.farm_icon_b:not(.farm_icon_disabled)', elem );
		var icon_c = jQuery( '.farm_icon_c:not(.farm_icon_disabled)', elem );
		var index = icon_c.length ? 10 : icon_a.length ? 8 : icon_b.length ? 9 : 0;
		var data = jQuery( 'td:eq(' + index + ') a', elem ).attr( 'onclick' ).toString().match( /(\d+), (\d+)/ );
		
		TWA.assistentfarm.attackHandler[ index === 10 ? 'reportAttack' : 'sendUnits' ]( data[ 1 ], data[ 2 ], jQuery( 'td:eq(3) a', elem ).html() );
	}
};
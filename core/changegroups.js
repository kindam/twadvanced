TWA.changegroups = {
	init: function() {
		jQuery( '#twa-overviewtools' ).show().append( '<tr id="twa-changegroups"><td>' + lang.changegroups.changegroups + ' <select id="twa-group" name="selected_group"></select> <input type="submit" value="' + lang.changegroups.add + '" name="add_to_group"/> <input type="submit" value="' + lang.changegroups.remove + '" name="remove_from_group"/> <input type="submit" value="' + lang.changegroups.move + '" name="change_group"/> <img src="http://www.preloaders.net/preloaders/252/preview.gif" style="width:25px;display:none" id="twa-loader"/></td></tr>' );
		
		jQuery( '#twa-changegroups input' ).click(function() {
			TWA.changegroups.change( this );
		});
		
		var elemGroups = document.getElementById( 'twa-group' ),
			groups = TWA.changegroups.getgroups();
		
		for ( var id in groups ) {
			elemGroups.innerHTML += '<option value="' + id + '" name="village_ids[]">' + groups[ id ] + '</option>';
		}
	},
	change: function( button ) {
		jQuery( '#twa-loader' ).show();
		
		var data = jQuery( '[name="village_ids[]"], [name=selected_group]' ).serializeArray();
		
		data.push({
			name: button.name,
			value: button.value
		});
		
		jQuery.post(Url( 'overview_villages&mode=groups&action=bulk_edit_villages&h=' + game_data.csrf ), data, function() {
			jQuery( '#twa-loader' ).hide();
		});
	},
	getgroups: function() {
		var groups = {};
		
		jQuery( '#group_table tr:not(:first, :last) td[id^=show_group] a' ).each(function() {
			groups[ this.href.match( /edit_group=(\d+)/ )[ 1 ] ] = this.innerHTML;
		});
		
		return groups;
	}
};
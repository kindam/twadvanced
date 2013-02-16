TWA.rename = {
	init: function( expr, type, id ) {
		console.log( 'TWA.rename()' );
		
		var elem = jQuery( expr );
		
		if ( expr !== '.overview_table' ) {
			elem = elem.parent();
		}
		
		elem.before( '<table class="vis" width="100%"><tr><th>' + lang.rename.rename + ' ' + type + ': <input type="text" id="twa-' + id + '" style="padding:1px 2px;border:1px solid red;border-radius:2px;border-radius:2px;height:15px"/> <input type="button" value="' + lang.rename.rename + '"/><label><input type="checkbox" id="twa-onlyselected"/> ' + lang.rename.only + ' ' + type + ' ' + lang.rename.selected + '</label> <img src="http://www.preloaders.net/preloaders/252/preview.gif" style="width:25px;display:none" id="twa-loader"/></th></tr></table>' );
	},
	reports: function() {
		TWA.rename.init( '#report_list', lang.rename.report, 'reportrename' );
		
		TWA.rename._do({
			entry: '#twa-reportrename',
			input: '#report_list tr:not(:first, :last):visible input:not([type=checkbox])',
			inputChecked: '#report_list tr:not(:first, :last):visible:has(input:checked) input:not([type=checkbox])'
		});
	},
	commands: function() {
		TWA.rename.init('.overview_table', lang.rename.commands, 'commandrename', 'o');
		jQuery('.overview_table input[type=checkbox]').removeAttr('disabled');

		TWA.rename._do({
			entry: '#twa-commandrename',
			input: '.overview_table tr:not(:first, :last):visible input[id^=editInput]',
			inputChecked: '.overview_table tr:not(:first, :last):visible:has(input:checked) input[id^=editInput]'
		});
	},
	_do: function( o ) {
		function handle( go ) {
			if ( !this.val() || this.val().length < ( o.min || 1 ) || this.val().length > ( o.max || 255 ) ) {
				return this.css( 'border', '1px solid red' );
			} else {
				this.css( 'border', '1px solid silver' );
			}
			
			if ( !go ) {
				return;
			}
			
			jQuery( jQuery( '#twa-onlyselected:checked' ).length ? o.inputChecked : o.input ).val( this.val() ).next().click();
		}
		
		jQuery( o.entry ).keyup(function( event ) {
			handle.call( jQuery( this ), event.keyCode === 13 );
			return false;
		}).keypress(function( event ) {
			return event.keyCode !== 13;
		});
		
		jQuery( o.entry ).next().click(function () {
			handle.call( jQuery( this ).prev(), true );
		});
	}
};
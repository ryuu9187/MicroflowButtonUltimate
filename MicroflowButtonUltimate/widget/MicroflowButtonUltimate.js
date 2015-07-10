
require(['dojo/_base/declare', 'mxui/widget/_WidgetBase', "dojo/query", "dojo/NodeList-traverse"], function (declare, _WidgetBase) {

	return declare("MicroflowButtonUltimate.widget.MicroflowButtonUltimate", [_WidgetBase], {
		inputargs  : {
			mf: '',
			passObjects : 'selection',
			passContext : false,
			ask: true,
			question: '',
			proceed: '',
			cancel: '',
			progBarType : 'none',
			progMsg : '',
			mfCallType : 'sync',
			caption : '',
			tooltip : '',
			img : '',
			renderType : 'button',
			btnStyle : 'default',
			targetSelector : '', // Target class of a dijit that implements getSelectedParameters()
			parentFilterSelector : ''
		},
		
		context : null,
		
		constructor: function () {
			// Initalize non-primitives
		},
		
		postCreate : function(){
			var btn = new mxui.widget.Button({
				caption: this.caption,
				renderType: this.renderType,
				iconUrl: this.img,
				title: this.tooltip,
				onClick: dojo.hitch(this, this.executeMicroflow)
			});
			
			dojo.addClass(btn.domNode, "btn-" + this.btnStyle.toLowerCase());
			dojo.place(btn.domNode, this.domNode);
			this.actLoaded();
		},

		update : function(contextObj, callback) {
			this.context = new mendix.lib.MxContext();
			this.context.setTrackObject(contextObj);
			if(callback){callback();}
		},
		
		executeMicroflow : function () {
			if (this.ask) {
				mx.ui.confirmation({
					content: this.question,
					proceed: this.proceed,
					cancel: this.cancel,
					handler: dojo.hitch(this, this._executeMicroflow)
				});
			} else { this._executeMicroflow(); }
		},
		
		_executeMicroflow : function () {
			var underlay, progress, callback, params;
		
			callback = function () {
				if (progress) {mx.ui.hideProgress(progress);}
				if (underlay) {mx.ui.hideUnderlay();}
			};
			
			// Validate there is a proper selection
			if ((params = this._getParameters()) != null) {
			
				// Show progress msg/underlay
				if (this.progBarType == "block") {
					underlay = true;
					mx.ui.showUnderlay();
				} 
				
				if (this.progBarType != "none") {
					progress = mx.ui.showProgress(this.progMsg);
				}

				params.actionname = this.mf; // Set microflow name
				
				mx.data.action({ // Execute
					params : params,
					async : this.mfCallType === "async",
					callback : dojo.hitch(this, callback),
					context : (this.passContext ? this.context : null),
					error : function (err) {
						console.error(err);
					}
				}, this);
				
			}
		},
		
		_getParameters : function () {
			var params = null, widget, dijitNodes = this.parentFilterClass ? 
				$(this.domNode).closest(this.parentFilterClass).find(this.targetSelector) :
				$(this.targetSelector);
			
			try {
				widget = dijit.byNode(dijitNodes[0]);
				params = widget.getSelectedParameters(this.passObjects);
			} catch (ex) {
				console.log(ex);
			}
			
			return params;
		}
	});
});
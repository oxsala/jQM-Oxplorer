//Global Variables
App = new Application();
DB = new DBManager();
EM = new EventManager();
trans = new translator();
groupCount = 0;
addedMandant = new Array();
/*End Global Variables Define*/
function main(){
	DB.getAjax("mandant", null);
	
	App.run();
}

function Application(){
	this.run = function(){
		this.config();
		//draw
		this.drawFirstScreen();
	}
	
	this.config = function(){
		if(localStorage.getItem("firstRun") != "false"){
			
			DB.set("firstRun", "false");
			DB.set("groupCount", 0);
			var group_0 = new group("0000000000", "No Group", "group_0"); //Default Id for No Group
			group_0.save();
			
			DB.set("group_fontstyle", "font-large color-white");
			DB.set("mandant_fontstyle", "font-normal color-red");
			DB.set("wb_fontstyle", "font-normal color-blue");
		}

		//get value for global variables
		groupCount = parseInt(DB.get("groupCount"));
		addedMandant = jQuery.parseJSON(DB.get("localMandant"));
	}
	
	this.drawFirstScreen = function(){
		$("#main_screen_content").html("");
		for(i = 0; i < groupCount; i++){
			controlGroup = DB.getEntity("group", "group_" + i);
			controlGroup.draw();
			controlGroup.drawWBasket();
			$("#" + controlGroup.storageName + "_Bar").trigger("create");
		}
		this.setFontStyle("group");
		this.setFontStyle("mandant");
		this.setFontStyle("wb");
	}
	
	this.setFontStyle = function(object){
		$("*[class='"+ object +"-namespace']").removeClass(DB.getSS(object + "_fontstyle"));
		$("*[class='"+ object +"-namespace']").addClass(DB.get(object + "_fontstyle"));
		DB.setSS(object + "_fontstyle", DB.get(object + "_fontstyle"));
	}
	
	this.displayLastFontStyle = function(){
		$("#select_object").attr("onchange", "App.displayLastFontStyle()");
		object = $("#select_object option:selected").val();
		fontStyle = DB.get(object + "_fontstyle")
		styleArray = fontStyle.split(" ");
		$("#font-style-place #block-select-color").remove();
		$("#font-style-place #block-select-size").remove();
		
		$("#font-style-place").append("<span class='ui-block-a' id='block-select-color'></span>");
		$("#block-select-color").append("<label for='choice_color' class='select'>Select color:</label>");
		$("#block-select-color").append("<select name='choice_color' id='select_color' data-theme='c'></select>");
		$("#select_color").append("<option value='color-black'>black</option>");
		$("#select_color").append("<option value='color-red'>red</option>");
		$("#select_color").append("<option value='color-blue'>blue</option>");
		$("#select_color").append("<option value='color-white'>white</option>");
		$("#select_color").append("<option value='color-yellow'>yellow</option>");
		$("[value='"+ styleArray[1] +"']").attr("selected", "selected");
		$("#block-select-color").trigger("create");
		
		$("#font-style-place").append("<span class='ui-block-a' id='block-select-size'></span>");
		$("#block-select-size").append("<label for='select_size' class='select'>Select size:</label>");
		$("#block-select-size").append("<select name='select_size' id='select_size' data-theme='c'></select>");
		$("#select_size").append("<option value='font-small'>small</option>");
		$("#select_size").append("<option value='font-normal'>normal</option>");
		$("#select_size").append("<option value='font-large'>large</option>");
		$("#select_size").append("<option value='font-xlarge'>xlarge</option>");
		$("[value='"+ styleArray[0] +"']").attr("selected", "selected");
		$("#block-select-size").trigger("create");		
	}
	
	this.applyConfig = function(){
	}
	
	this.showLoading = function(){
		$("body").append("<div id='loading-page'></div>");
		$("#loading-page").css("z-index", "999999");
		$("#loading-page").append("<div id='loading-image'><img src='css/loading.gif'/><br /><span id='loading-text'>Loading...</span></div>");
		topPos = (window.innerHeight-30)/2;
		leftPos = (window.innerWidth-30)/2;
		$("#loading-image").css("position", "absolute").css("top", topPos + "px").css("left", leftPos + "px");
		$("#loading-text").css("position", "absolute").css("left", "-10px").css("font-weight", "bold");
	}
	
	this.hideLoading = function(){
		$("#loading-page").remove();
	}
	
	this.makeId = function(numberOfChar){
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for( var i=0; i < numberOfChar; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	}
}
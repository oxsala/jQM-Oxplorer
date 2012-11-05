//Font
function fontStyle(object){
	this.object = object + "Config";
	this.fontStyle = "font-normal color-black"; //Default
	this.save = function(){
		localStorage.setItem(this.object, this.fontStyle);
	}
}


// Group Object
function group(id, name, storageName){
	this.id = id;
	this.name=name;
	this.storageName = storageName;
	this.wBasket = new Array();
	//Collapsed Function
	this.collapsed = "true";
	this.isCollapsed = function(){
		return group.collapsed;
	}
	this.setCollapsed = function(boolean){
		this.collapsed = boolean;
	}
	
	//Draw Group
	this.draw = function(){
		$("#main_screen_content").append("<div id='"+ this.storageName +"_Bar' class='group-bar ui-bar ui-bar-b'></div>");
		groupBar = $("#" + this.storageName + "_Bar");
		
		groupBar.append("<span class='btn-collapse'><button data-inline='true' data-icon='arrow-d' data-iconpos='notext'></button></span>");
		$("#"+ this.storageName + "_Bar .btn-collapse button").attr("onclick", "EM.toggleGroup('"+ this.storageName +"')");
		
		groupBar.append("<span class='group-namespace'>" + this.name + "</span>");
		
		if(this.id != "0000000000"){
			groupBar.append("<span class='btn-edit'><a href='#create_and_edit_group' data-inline='true' data-role='button' data-rel='dialog' data-mini='true' id='btn-edit-"+ this.id +"' data-transition='slideup'>Edit</a></span>");
			$("#btn-edit-" + this.id).attr("onclick", "EM.addAndEditGroup('"+ this.storageName +"', 'edit')");
			groupBar.append("<span class='btn-delete'><button data-inline='true' data-icon='delete' data-iconpos='notext' id='btn-delete-"+ this.id +"' data-transition='slideup'></button></span>");
			$("#btn-delete-" + this.id).attr("onclick", "EM.deleteGroup('"+ this.storageName +"')");
		}
		
		groupBar.append("<span class='btn-down'><button data-inline='true' data-icon='arrow-d' data-iconpos='notext' id='btn-down-"+ this.id +"' data-transition='slideup'></button></span>");
		$("#btn-down-" + this.id).attr("onclick", "EM.setDownGroup('"+ this.storageName +"')");
		
		$("#main_screen_content").append("<div id='"+ this.id +"-collapse' data-role='collapsible' data-collapsed='false' class='no-padding'></div>");
		
		$("#" + this.id + "-collapse").append("<ul data-role='listview'></ul>");
		if(this.collapsed == "true"){
			$("#"+ this.storageName + "_Bar .btn-collapse button").buttonMarkup({icon: "arrow-d"});
			$("#" + this.id + "-collapse").show();
		}else{
			$("#"+ this.storageName + "_Bar .btn-collapse button").buttonMarkup({icon: "arrow-r"});
			$("#" + this.id + "-collapse").hide();
		}
	}
	
	//Rename
	this.renameGroup = function(newName){
		this.name = newName;
		DB.set(this.storageName, JSON.stringify(this));
		$("#"+ this.id +"-name-space").html(this.name);
	}
	
	//Save Group
	this.save = function(){
		DB.set(this.storageName, JSON.stringify(this));
		groupCount += 1;
		DB.set("groupCount", groupCount);
	}
	
	//Delete Group
	this.remove = function(){
		groupCount = parseInt(DB.get("groupCount"));
		noGroup = 0;
		for(i=0; i<groupCount; i++){
			noGroup = DB.getEntity("group", "group_" + i);
			if(noGroup.id == "0000000000"){
				length = this.wBasket.length;
				for(i=0; i< length; i++){
					controlWBasket = DB.getEntity("wBasket", this.wBasket.shift());
					controlWBasket.groupId = noGroup.id;
					DB.set(controlWBasket.storageName, JSON.stringify(controlWBasket));
					noGroup.wBasket.push(controlWBasket.storageName);
					DB.set(noGroup.storageName, JSON.stringify(noGroup));
				}
				break;
			}
		}
		$("#"+ this.storageName + "_Bar").remove();
		DB.remove(this.storageName);
		groupCount -=1;
		DB.set("groupCount", groupCount);
	}
	
	//Call function draw of each work basket in this group
	this.drawWBasket = function(){
		length = this.wBasket.length;
		count = 0;
		while(count < length){
			controlWBasket = this.wBasket.shift();
			basket = DB.getEntity("wBasket", controlWBasket);
			basket.draw();
			basket.displayName();
			count++;
		}
	}
}

/*--------------------------Mandant------------------------------*/


function mandant(id, storageName){
	this.id = id;
	this.storageName = storageName;
	this.wBasket = new Array();
	
	this.add = function(){
		DB.getAjax("wBasket", this);
		this.wBasket = jQuery.parseJSON(DB.getSS("tempwb"));
		noGroup = "";
		for(i =0; i < groupCount; i++){
			noGroup = DB.getEntity("group", "group_" + i);
			if(noGroup.id == "0000000000"){
				break;
			}
		}
		noGroup.wBasket = noGroup.wBasket.concat(this.wBasket);
		DB.set(noGroup.storageName, JSON.stringify(noGroup));
		DB.set("m_" + this.id, JSON.stringify(this));
		
		mandantList = new Array();
		mandantList = mandantList.concat(jQuery.parseJSON(DB.get("mandantList")));
		mandantList.push(this.storageName);
		DB.set("mandantList", JSON.stringify(mandantList));
	}
	
	this.update = function(){
		alert(this.id);
	}
	
	this.remove = function(){
		$.each(this.wBasket, function(index, dataItem){
			wb = DB.getEntity("wBasket", dataItem);
			controlGroup = "";
			for(i =0; i < groupCount; i++){
				controlGroup = DB.getEntity("group", "group_" + i);
				if(controlGroup.id == wb.groupId){
					break;
				}
			}
			length = controlGroup.wBasket.length;
			for(i =0; i< length; i++){
				if(controlGroup.wBasket[i] == wb.storageName){
					controlGroup.wBasket.splice(i, 1);
					DB.set(controlGroup.storageName, JSON.stringify(controlGroup));
					break;
				}
			}
			wb.remove();
		});
		DB.remove(this.storageName);
	}
}

function wBasket(id, mandantId, groupId, storageName){
	this.id = id;
	this.mandantId = mandantId;
	this.groupId = groupId;
	this.storageName = storageName;
	var d = new Date();
	this.lastBuild = d.getTime();
	this.processList = new Array();
	
	this.save = function(){
		DB.set(this.storageName, JSON.stringify(this));
	}
	
	this.remove = function(){
		DB.remove(this.storageName);
	}
	
	this.draw = function(){
		var date = new Date();
		var timestamp = "";
		if((date.getTime() - this.lastBuild) <= 60000){
			timestamp = "Just now";
		}else if((date.getTime() - this.lastBuild) > 60000 &&(date.getTime() - this.lastBuild) <= 3600000){
			if(Math.round((date.getTime()-this.lastBuild)/60000) == 1){
				timestamp = "One minute ago";
			}else{
				timestamp = parseInt(Math.round((date.getTime()-this.lastBuild)/60000)) + " minutes ago";
			}
		}else if((date.getTime() - this.lastBuild) > 3600000 &&(date.getTime() - this.lastBuild) <= 86400000){
			if(Math.round((date.getTime()-this.lastBuild)/3600000) == 1){
				timestamp = "One hour ago"
			}else{
				timestamp = parseInt(Math.round((date.getTime()-this.lastBuild)/3600000)) + " hours ago";
			}
		}else if((date.getTime() - this.lastBuild) > 86400000 &&(date.getTime() - this.lastBuild) <= 2592000000){
			if(Math.round((date.getTime()-this.lastBuild)/86400000) == 1){
				timestamp = "One day ago"
			}else{
				timestamp = parseInt(Math.round((date.getTime()-this.lastBuild)/86400000)) + " days ago";
			}
		}else if((date.getTime() - this.lastBuild) > 2592000000){
			timestamp = "Long ago";
		}
		controlMandant = DB.getEntity("mandant", "m_" + this.mandantId);
		$("#" + this.groupId + "-collapse ul").append("<li id='wb-item-"+ this.id +"' class='ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-btn-hover-c ui-li-static ui-body-c ui-btn-up-undefined'></li>");
		$("#" + this.groupId + "-collapse ul li:last").append("<div class='listview-custom-style'></div>");
		$("#" + this.groupId + "-collapse ul li:last div").append("<a href='#main_screen'></a>");
		$("#" + this.groupId + "-collapse ul li:last div a").append("<span class='wb-mandant'><span class='mandant-namespace'>"+ controlMandant.id +"</span><br />"+ timestamp +"</span>");
		$("#" + this.groupId + "-collapse ul li:last div a").append("<span class='wb-namespace' id='"+ this.storageName +"-wb'>"+ /*this.displayName()*/ +"</span>");
		$("#" + this.groupId + "-collapse ul li:last div a").append("<span class='wb-unread'>"+ "0/3" +"</span>");
		$(".wb-mandant").css("position", "absolute").css("top", "15%").css("width", "30%");
		$(".wb-namespace").css("position", "absolute").css("left", "35%").css("width", "50%").css("top", "35%");
		$(".wb-unread").css("position", "absolute").css("left", "80%").css("top", "35%").css("width", "50%");
		$("#" + this.groupId + "-collapse ul li:last div a:visited").css("color", "black");
		$("#" + this.groupId + "-collapse ul li:last div a").css("color", "black").css("text-decoration", "none");
	}
	this.displayName = function(){
		type = "wBasket";
		lang = DB.get("language");
		word = this.id;
		wbName = trans.translate(type, lang, word);
		$("#" + this.storageName + "-wb").html(wbName);
	}
}

function translator(){
	this.translate = function(type, lang, word){
		return "Kylynk";
	}
}
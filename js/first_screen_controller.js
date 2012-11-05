function EventManager(){
	this.createGroup = function(){
		if(!$("#txtGroupName").val() == ""){
			groupControl = new group(App.makeId(10), $("#txtGroupName").val(), "group_" + groupCount);
			groupControl.save();
			App.drawFirstScreen();
		}else{
			alert("Group name is null!");
		}
	}
	
	this.renameGroup = function(storageName){
		controlGroup = DB.getEntity("group", storageName);
		controlGroup.renameGroup($("#txtGroupName").val());
		$("#txtGroupName").attr("value", "");
		App.drawFirstScreen();
	}
	
	this.deleteGroup = function(storageName){
		controlGroup = DB.getEntity("group", storageName);
		controlGroup.remove();
		a = storageName.split("_");
		index = parseInt(a[1]);
		for(i = index; i < groupCount; i++){
			storageIndex = i+1;
			groupControl = DB.getEntity("group", "group_"+ storageIndex);
			groupControl.storageName = "group_" + i;
			DB.set("group_" + i, JSON.stringify(groupControl));
		}
		DB.remove("group_" + groupCount);
		App.drawFirstScreen();
	}
	
	this.setDownGroup = function(storageName){
		controlGroup = DB.getEntity("group", storageName);
		a = storageName.split("_");
		index = parseInt(a[1]) + 1;
		if(index == groupCount){
			return false;
		}else{
			changedStorage = "group_" + index;
			changedGroup = DB.getEntity("group", changedStorage);
			controlGroup.storageName = changedStorage;
			changedGroup.storageName = storageName;
			DB.set(changedStorage, JSON.stringify(controlGroup));
			DB.set(storageName, JSON.stringify(changedGroup));
			App.drawFirstScreen();
		}
	}
	
	this.toggleGroup = function(storageName){
		groupControl = DB.getEntity("group", storageName);
		groupDOM = $("#"+ groupControl.storageName + "_Bar .btn-collapse button");
		if(groupDOM.attr("data-icon") == "arrow-d"){
			groupDOM.buttonMarkup({icon: "arrow-r"});
			$("#" + groupControl.id + "-collapse").hide();
			groupControl.collapsed = "false";
			DB.set(groupControl.storageName, JSON.stringify(groupControl));
		}else{
			groupDOM.buttonMarkup({icon: "arrow-d"});
			$("#" + groupControl.id + "-collapse").show();
			groupControl.collapsed = "true";
			DB.set(groupControl.storageName, JSON.stringify(groupControl));
		}
	}
	
	
	this.addAndEditGroup = function(storageName, processType){
		if(storageName == "new" && processType == "create"){
			$("#create_and_edit_group_header").html("Create new group");
			$("#txtGroupName").attr("value", "");
			$("#agree_change_group").attr("onclick", "return EM.createGroup()");
		}else if(processType == "edit"){
			$("#create_and_edit_group_header").html("Rename Group");
			var controlGroup = DB.getEntity("group", storageName);
			$("#txtGroupName").attr("value", controlGroup.name);
			$("#agree_change_group").attr("onclick", "return EM.renameGroup('"+ storageName +"')");
			$("#txtGroupName").live('click', function (event) {
				this.select();
				event.stopPropagation();
				event.preventDefault();
				return false;
			});
		}
	}
	
	this.drawMandant = function(){
		sessionMandant = jQuery.parseJSON(DB.getSS("mandantList"));
		main_place = $("#add_remove_mandant_content");
		main_place.html("");
		$.each(sessionMandant, function(i, dataItem){
			processType = "Add";
			if(DB.get(dataItem) != null)
				processType = "Remove";
			mand = jQuery.parseJSON(DB.getSS(dataItem));
			main_place.append("<a href='' data-role='button' data-rel='back' data-theme='c' id='btn-add-remove-"+ mand.id +"'>"+ mand.id + "- [" + processType +"]</a>");
			$("#btn-add-remove-" + mand.id).attr("onclick", "EM.addAndRemoveMandant('"+ dataItem +"')");
		});
		main_place.trigger("create");
	}
	
	this.addAndRemoveMandant = function(storageName){
		if(DB.get(storageName) == null){
			mandantInfor = jQuery.parseJSON(DB.getSS(storageName));
			mand = new mandant(mandantInfor.id, "m_" + mandantInfor.id);
			mand.add();
			App.drawFirstScreen();
		}else{
			mand = DB.getEntity("mandant", storageName);
			mand.remove();
			App.drawFirstScreen();
		}
	}
	
	this.drawMoveWB = function(){
		$("#choice_group_place").remove();
		$("#move_work_basket_content").append("<div id='choice_group_place' style='margin: 50px 15px;'></div>");
		$("#choice_group_place").append("Move to group: <br />");
		$("#choice_group_place").append("<select id='choice_group' data-theme='b'></select>");
		groupCount = parseInt(localStorage.getItem("groupCount"));
		for(i=0; i<groupCount; i++){
			controlGroup = DB.getEntity("group", "group_" + i);
			if(controlGroup.id == "0000000000")
				continue;
			$("#choice_group").append("<option value='"+ controlGroup.storageName +"'>"+ controlGroup.name +"</option>");
		}
		$("#choice_group").change(function(){
			EM.drawMoveWbPlace();
		});
		EM.drawMoveWbPlace();
		$("#move_work_basket").trigger("create");
	}
	
	this.drawMoveWbPlace = function(){
		targetGroup = $("#choice_group option:selected").val();
		if(groupCount <2){
			$("#choice_group_place").html("");
			$("#move_work_basket_content").html("Don't have a group");
		}else{
			$("#select_wb_place").remove();
			$("#move_work_basket_content").append("<div id='select_wb_place'></div>");
			for(i=0; i<groupCount; i++){
				controlGroup = DB.getEntity("group", "group_" + i);
				if(controlGroup.storageName == targetGroup || controlGroup.wBasket.length == 0){
					continue;
				}else{
					$("#select_wb_place").append("<div id='"+ controlGroup.storageName +"_list' class='ui-bar ui-bar-d'>"+ controlGroup.name +"</div>");
					length = controlGroup.wBasket.length;
					for(j=0; j<length; j++){
						wB = controlGroup.wBasket.shift();
						controlWBasket = DB.getEntity("wBasket", wB);
						$("#select_wb_place").append("<input type='checkbox' name='" + controlWBasket.storageName + "' id='" + controlWBasket.storageName+ "_checkbox' class='custom'/>");
						$("#select_wb_place").append("<label for='" + controlWBasket.storageName + "_checkbox'>" + controlWBasket.storageName + "</label>");
						$("#move_work_basket").trigger("create");
					}
				}
			}
		}
	}
	
	this.moveWB = function(){
		if(groupCount > 1){
			targetGroup = $("#choice_group option:selected").val();
			controlGroup = DB.getEntity("group", targetGroup);
			$("#select_wb_place input[type=checkbox]:checked").each(function(index, element) {
				controlWBasket = DB.getEntity("wBasket", element.name);
				for(i=0; i< groupCount; i++){
					oldGroup = DB.getEntity("group", "group_" + i);
					if(oldGroup.id == controlWBasket.groupId){
						length = parseInt(oldGroup.wBasket.length);
						for(j=0; j< length; j++){
							if(oldGroup.wBasket[j] == controlWBasket.storageName){
								oldGroup.wBasket.splice(j,1);
								DB.set(oldGroup.storageName, JSON.stringify(oldGroup));
								break;
							}
						}
					}
				}
				controlWBasket.groupId = controlGroup.id;
				DB.set(controlWBasket.storageName, JSON.stringify(controlWBasket));
				controlGroup.wBasket.push(element.name);
			});
			DB.set(controlGroup.storageName, JSON.stringify(controlGroup));
			App.drawFirstScreen();
		}
	}
	
	this.applyMoveWB = function(){
		this.moveWB();
		this.drawMoveWbPlace();
	}
	
	this.fontStyleProcess = function(type){
		object = $("#select_object option:selected").val();
		size = $("#select_size option:selected").val();
		color = $("#select_color option:selected").val()
		DB.set(object + "_fontstyle", size + " " + color);
		App.drawFirstScreen(object);
		if(type == "apply"){
			alert("Font style has been changed!");
		}
	}
}
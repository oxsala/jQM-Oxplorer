// This file include all function to process web database
function DBManager(){
	this.set = function(key, value){
		localStorage.setItem(key, value);
	}
	
	this.get = function(key){
		return localStorage.getItem(key);
	}
	
	this.remove = function(key){
		localStorage.removeItem(key);
	}
	
	//set, get, remove on session storage
	this.setSS = function(key, value){
		sessionStorage.setItem(key, value);
	}
	
	this.getSS = function(key){
		return sessionStorage.getItem(key);
	}
	
	this.removeSS = function(key){
		sessionStorage.removeItem(key);
	}
	
	//get data from ajax and return to coresponding type.
	this.getAjax = function(type, varItem){
		if(type == "mandant"){
			$.ajax({
				url : "http://application.pedev.lan:8888/oxseedadmin/ext/oxplorer?content=mandantList&login=admin&pass=oxseed&format=json",
				dataType : "json",
				success : function(data){
					DB.update("mandant", JSON.stringify(data));
				},
				beforeSend : function(){
					App.showLoading();
				},
				complete : function(){
					App.hideLoading();
				}
			})
		}else if(type == "wBasket"){
			$.ajax({
				url : "http://application.pedev.lan:8888/"+ varItem.id +"/ext/oxplorer?content=wbList&login=admin&pass=oxseed&format=json",
				dataType : "json",
				success : function(data){
					$.each(data, function(index, dataItem){
						wb = new wBasket(dataItem.id, jQuery.parseJSON(DB.getSS(varItem.storageName)).id, "0000000000", jQuery.parseJSON(DB.getSS(varItem.storageName)).id + "_" + this.id);
						DB.setSS("temp_" + varItem.id + "_" + wb.id, JSON.stringify(wb));
					});
					varItem.update();
				},
				beforeSend : function(){
					App.showLoading();
				},
				complete : function(){
					App.hideLoading();
				},
				async : false
			});
		}
	}
	
	//update data from session to local storage.
	this.update = function(type, data){
		if(type == "mandant"){
			
			mandantList = jQuery.parseJSON(data);
			mandantArray = new Array();
			main_place = $("#add_remove_mandant_content");
			$.each(mandantList, function(i, dataItem){
				if(dataItem.id != "abcd"){	
					DB.setSS("m_" + dataItem.id, JSON.stringify(dataItem));
					mandantArray.push("m_" + dataItem.id);
				}
			});
			DB.setSS("mandantList", JSON.stringify(mandantArray));
			
			//Chua update mandant
		}else if(type = "wBasket"){
			
		}
	}
	
	//mapping json object to coresponding entity
	this.getEntity = function(type, storageName){
		
		if(type == "group"){//get group entity
			storageGroup = jQuery.parseJSON(this.get(storageName));
			groupEntity = new group(storageGroup.id, storageGroup.name, storageGroup.storageName);
			groupEntity.collapsed = storageGroup.collapsed;
			groupEntity.wBasket = storageGroup.wBasket;
			return groupEntity;
		}else if(type == "mandant"){//get mandant entity
			storageMandant = jQuery.parseJSON(DB.get(storageName));
			mandantEntity = new mandant(storageMandant.id, storageName);
			mandantEntity.wBasket = storageMandant.wBasket;
			return mandantEntity;
		}else if(type == "wBasket"){//get wBasket entity
			storageWBasket = jQuery.parseJSON(DB.get(storageName));
			wBasketEntity = new wBasket(storageWBasket.id, storageWBasket.mandantId, storageWBasket.groupId, storageWBasket.storageName);
			wBasketEntity.processList = storageWBasket.processList;
			wBasketEntity.lastBuild = storageWBasket.lastBuild;
			return wBasketEntity;
		}else if(type == "process"){//get process entity
			
		}else if(type == "translate"){//get translated word entity
			
		}
	}
}
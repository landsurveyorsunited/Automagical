var builder;
if (!builder)
{
	builder =
	{
	};
}
builder.init = (function ()
{
	var init =
	{
	},
		/* DEBUGGING VARIABLE: Use this to specify whether to use the grid system or not*/
		gridSystem = true,
		
		hideElements,
		initializeMenuDisplayControl,
		populateNavList,
		populateToolboxList,
		initializeDroppableAreas,
		clearDroppableAreas,
		reinitializeDroppableAreas,
		
		snapToGrid,
		snapSize;
		
		
	hideElements = function () {
		$("#navContainer").hide();
		$("#menuToolbox").hide();
	};
	
	initializeMenuDisplayControl = function() {
		$("#lblDropDown").click(function(){
			if($("#navContainer").is(":visible")){
				$("#navContainer").slideUp("fast");
				$("#lblDropDown").text("Show Menu");										
			}else{
				$("#navContainer").slideDown("fast");
				$("#lblDropDown").text("Hide Menu");				
			}
		});
	
	};
		
	/*This funtion populates the MenuBar and Toolbox bar with extensions and their various elements*/	
	populateNavList = function ()
	{
		//Get INDEX JSON file to iterate through extensions
		$.getJSON('Toolbox/index.json', function (json, status)
		{
			//Iterate Through extensions
			$.each(json.main.tools, function (name, element)
			{
				//console.log("Found Folder: " + element.Folder_Name);
				//Populate MenuBar with extension folder names.
				$("nav#nav").append('<a id="' + element.Folder_Name + '" href="#">' + element.Folder_Name + '</a>');
				//Add on-click behaviour to MenuBar Items.
				$('a#' + element.Folder_Name).click(function ()
				{
					//If this menu item is active then remove active class and hide Toolbox Bar.
					if ($(this).hasClass('active'))
					{
						$(".active").removeClass("active");
						$("nav#menuToolbox").slideUp();
					}
					else
					{
					//Else if any MenuBar item is active, remove active class and hide menu.
					//Make item clicked active and slide menuToolbox Bar.
						if ($("nav#menuToolbox").is(":visible"))
						{
							$("nav#menuToolbox").hide();
						}
						$("nav#menuToolbox").slideDown("fast");
						$(".active").removeClass("active");
						$(this).addClass("active");
					}
					
					populateToolboxList(element.Folder_Name);
				});
			});
		});
	};
	
	/* This function snaps the dropped element to the underlying grid*/
	snapToGrid = function(element){
		
		
		var top = 70 * Math.round(parseInt(element.css("top").replace("px",""), 10)/70);
		var left = 70 * Math.round(parseInt(element.css("left").replace("px",""), 10)/70);
		
		//if element is at left most region, no need for a left margin; also no need for margin if it is an element inside another
		if ((left === 0) || (element.parent().attr("id") != "canvas")) {
			element.css("margin", "0px 0px 10px 0px");
		}
		else {
			element.css("margin", "0px 0px 10px 10px");
		}

		element.css("top",	top + 'px');
		element.css("left", left + 'px');
	};
	
	/* This function snaps the size of a resized element so it conforms to the underlying grid*/
	snapSize = function(element){
	
		var width = 70 * Math.round(element.width() / 70);
		var height = 70 * Math.round(element.height() / 70);
		
		if (width === 0) {
			width = 70;
		}
		
		if (height === 0) {
			height = 70;
		}
		
		element.css('width', width + 'px');
		element.css('height', height + 'px');
	};
	


	
	populateToolboxList = function(folderName)
	{
	
				//Populate the Toolbox items using the json file in the correct folder pointed to by main json file
			$.getJSON('Toolbox/'+folderName+'/'+folderName+'.json',function(jsonInner, statusInnter){

				//Clear everything currently in ToolBox
				$('nav#menuToolbox').html("");
				
				//Append to the nav
				$.each(jsonInner.main.elements,function(nameInner, elementInner){
						$('nav#menuToolbox').append('<a href=\"#\" id=\"'+folderName+elementInner.name+'\"><img src=\"Toolbox/General/images/'+elementInner.icon+'\" alt=\"'+elementInner.name+'\" width=\"55\" height=\"27\" /></a>');
						
					//Make the item draggable
					$("#"+folderName+elementInner.name).draggable({
						revert: "invalid",
						appendTo: "body",
						containment: "#canvas",
						helper: function() {
							//Return the new tag to be created
						   return $( elementInner.tag )[0];
						},
						start: function(event, ui) {
							//We need to know if something is a container so it can be initialized properly
							if (elementInner.container === true) {
								$(ui.helper).addClass("container");
							}
							
						}

					});
					

			
				});
				

				
			});
	};
	
	initializeDroppableAreas = function( droppableAttr )
	{


		
		droppableAttr.droppable({
			greedy: true,	//Stop droppable event propogation
			drop: function(ev, ui) { 
				if (!ui.draggable.hasClass("added")) {	//Hasn't been placed on canvas yet
					var cloned = ui.helper.clone();
					$(this).append(cloned
						.draggable({containment:"#canvas"})
						.addClass("added")
						.removeClass("ui-draggable-dragging")
						.resizable({
							containment:"parent",
							resize: function(event, ui) {
								
								if (gridSystem) {				
									snapSize(cloned);
								}
					

							}
							
						
						})
					);
					
					
					//TODO: Preliminary step to implement contentEditable areas at some point in future
					cloned.click(function(event) {

						$(this).focus();
					});
					
					
					//Need these offsets when appending children to a container that's not the canvas
					cloned.css('top', ui.position.top - $(this).offset().top);
					cloned.css('left', ui.position.left - $(this).offset().left);
					
					if (gridSystem) {
						snapToGrid(cloned);
						snapSize(cloned);
					}
					
					
					//TODO: Find a better solution. Hack so that nested dynamic droppables will work.
					if ($(cloned).hasClass("container")) {
						clearDroppableAreas();
						initializeDroppableAreas($(cloned));
						reinitializeDroppableAreas();

					}

				}
				else { //Element already on canvas
					

					$(this).append($(ui.draggable));
					
					//Need these offsets when appending children to a container that's not the canvas
					$(ui.draggable).css('top', ui.offset.top - $(this).offset().top);
					$(ui.draggable).css('left', ui.offset.left - $(this).offset().left);
					
					if (gridSystem) {
						snapToGrid(ui.draggable);
						snapSize(ui.draggable);
					}
				}
			}
		});
	};
	
	reinitializeDroppableAreas = function() {
	
		var droppableAreas = $("#canvasContainer .container");
		
		$.each(droppableAreas, function(index, element) { 
			initializeDroppableAreas($(element));
		});
		
	};
	
	clearDroppableAreas = function() {
	
		var droppableAreas = $("#canvasContainer .container");
		
		$.each(droppableAreas, function(index, element) { 
			$(element).droppable("destroy");
		});


	
	};
	
	init.initialize = function ()
	{
		initializeMenuDisplayControl();
		hideElements();
		populateNavList();
		initializeDroppableAreas($("#canvas"));
	};
	return init;
}());
$(document).ready(function() {
	
	var last = [];
	
	function flipper(row, newtext) {
		window.setTimeout(function(){
			$("#" + row + " .flipchar-base .inner").html(newtext);
			$("#" + row + " .flipchar-drop .inner").html(newtext);
			$("#" + row + " .flipchar-top").addClass("on");
		}, 0);
		window.setTimeout(function(){
			$("#" + row + " .flipchar-drop").removeClass("off");
			$("#" + row + " .flipchar-drop").addClass("on");
			$("#" + row + " .flipchar-top .inner").html(newtext);
			$("#" + row + " .flipchar-top").addClass("off");
			$("#" + row + " .flipchar-top").removeClass("on");
		}, 300);
		window.setTimeout(function(){
			$("#" + row + " .flipchar-bottom .inner").html(newtext);
			$("#" + row + " .flipchar-top").removeClass("off");
			$("#" + row + " .flipchar-drop").addClass("off");
			$("#" + row + " .flipchar-drop").removeClass("on");
		}, 600);
		
	}


	function rowText(text) {
			if (text["message"] === true){
				contents = text["text"];
			}
			else if (text["plat"] === undefined){
				contents = text["time"] + ": " +text["dest"];
			}
			else{
				contents = text["time"] + ": " +text["dest"] + '<span class="platform">' + text["plat"] + '&nbsp;</span>';
			}
			
			return contents;
		}
		

	function blocky(lines){
		function cell(contents, rowid){
			console.log(contents);
			return '<div id="row'+ rowid +'" class="row"><span class="flipchar-base"><span class="inner">'+ contents +'</span></span><span class="flipchar-top"><span class="inner">'+ contents +'</span></span><span class="flipchar-bottom"><span class="inner">'+ contents +'</span></span><span class="flipchar-drop"><span class="inner">'+ contents +'</span></span></div><div style="clear:both;"></div>';
		}
		var rowlen = $('.row').length;
		if(rowlen < lines.length) {
			var extra = lines.length - rowlen;
			for(var j=0; j < extra; j++) {
				
				$('#wrapper').append(cell(" ", j+rowlen));
			}
		}
		
		$('.row').each(function(i, el){
			var newtext = rowText(lines[i]);
			window.setTimeout(function(){
				flipper(el.id, newtext);
			}, i*103);
		});
		
		last = lines;
	}
	
	function shouldRender(lines, last) {
		var refresh = false;
		if(lines.length != last.length) {
			refresh = true;
		} else {
			for(var i=0; i < lines.length; i++) {
				if(lines[i]["dest"] != last[i]["dest"]) {
					refresh = true;
				}
			}
		}
		
		return refresh;
	}
	
	blocky([{"message": true, "text" : "Welcome"},{"message": true, "text" : "to"} , {"message": true, "text" : "Departures"}])
		
	var refreshGrid = function(){
		$.getJSON('/platformdata?stn=BRI', function(data) { 
			var lines = data['trains']
			if(shouldRender(lines, last)){
				blocky(lines);
			}
		});
	};
	
	var timer;
	
	document.addEventListener('visibilitychange', function onVisibilityChange() { 
		if (document.hidden) { 
			window.clearInterval(timer); 
			} 
		else { 
			refreshGrid();
			timer = window.setInterval(refreshGrid, 1000*90)
			}});
	
	timer = window.setInterval(refreshGrid, 1000*90);
	window.setTimeout(refreshGrid, 2000);

  
});
$(document).ready(function(){
	$('#player-ui').hide(0); //hide the player until we know there is a cast
	//why didn't I just have it hidden to begin with from the css?
	//in case the user doesn't have javascript!
	
	$('#status').html("Loading player...");
	var stream = {
		title: "dr3v Radio",
		mp3: "http://dr3v.com:8000/stream"
	};
	var ready = false;
	$("#player").jPlayer({
		ready: function (event) {
			ready = true;
			//$(this).jPlayer("setMedia", stream);
		},
		pause: function() {
			$(this).jPlayer("clearMedia");
		},
		error: function(event) {
			if(ready && event.jPlayer.error.type === $.jPlayer.error.URL_NOT_SET) {
				//if we tried to play but we already erased the thing, load the thing
				$(this).jPlayer("setMedia", stream).jPlayer("play");
				$('.jp-current-time').css('visibility','visible');;
			}
		},
		cssSelectorAncestor: "#player-ui",
		swfPath: "bower_components/jplayer/dist/jplayer",
		supplied: "mp3",
		preload: "none",
		wmode: "window",
		useStateClassSkin: true,
		autoBlur: false,
		smoothPlayBar: false,
		keyEnabled: true,
		remainingDuration: false,
		toggleDuration: true
	});

	function refreshTitle() {
		console.log("Going for current status");
		$.ajax({
			url:"cast/json.xsl?mount=/stream",
			dataType:"json",
			minmeType:"text/json",
			cache:false
		}).done(function(data){
			if ( data.sources.length > 0 ) {
				//there is someone streaming
				var title = data.sources[0].title;
				var desc = data.sources[0].description;
				console.log(title);
				$('#title').html(title);
				$('#status').html(desc);
				console.log(desc);
				$('#player-ui').show(400);
				console.log('Ok');
			} else {
				$('#player-ui').hide(400);
				console.log("Not broadcasting");
				$('#status').html("Sorry we missed&nbsp;you!");
				$('#title').html("There is no DJ broadcasting right now.");
			}
		});
		setTimeout(refreshTitle, 10*1000);
	};
	$('#status').html("Loading status...");
	refreshTitle();
});

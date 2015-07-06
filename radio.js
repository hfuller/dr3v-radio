$(document).ready(function(){
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
		$.ajax({
			url:"cast/json.xsl?mount=/stream",
			dataType:"json",
			minmeType:"text/json",
			cache:false
		}).done(function(data){
			var title = data.sources[0].title;
			console.log(title);
			$('#title').html(title);
			console.log('Ok');
		});
		setTimeout(refreshTitle, 10*1000);
	};
	$('#status').html("Loading status...");
	refreshTitle();
});

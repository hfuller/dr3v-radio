$(document).ready(function(){

	var oldtitle = "";

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
			mimeType:"text/json",
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
				$('#player-ui').show(0);
				$('#no-broadcast').hide(400, function() {
					$('#broadcast').show(400);
				});
				console.log('Ok');

				//do we need to update album art?
				if ( title != oldtitle ) {
					//we do
					console.log("We need to go for album art");
					oldtitle = title;
					var artist = title.substring(0,title.indexOf(' - '));
					var track = title.substring(title.lastIndexOf(' - ')+3);
					console.log("New artist is " + artist + " and track is " + track);
					var searchuri = "http://ws.audioscrobbler.com/2.0/?method=track.search&track=" + encodeURIComponent(track) + "&artist=" + encodeURIComponent(artist) + "&api_key=d0c10030924080a2ac3b909e7cd96cee&format=json";
					console.log("Build search URI: " + searchuri);

					$.ajax({
						url: searchuri,
						dataType:"jsonp"
					}).done(function(data) {
						console.log(data);
					});
				}

			} else {
				$('#broadcast').delay(400).hide(400, function() {
					$('#no-broadcast').show(400);
				});
				console.log("Not broadcasting");
				oldtitle = "";
			}
		});
		setTimeout(refreshTitle, 10*1000);
	};
	$('#status').html("Loading status...");
	refreshTitle();
});

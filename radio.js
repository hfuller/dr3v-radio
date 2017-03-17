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
			url:"cast/xml.xsl?mount=/stream",
			dataType:"xml",
			/* mimeType:"application/xml",*/
			cache:false
		}).done(function(data){
			console.log("length:" + data.childNodes.length);
			console.log(data.childNodes);
			if ( data.childNodes.length > 1 && data.childNodes[1].childNodes.length > 0 ) {
				//There is a list of sources present and that list is bigger than 0

				$data = $(data);

				//there is someone streaming
				$('#player-ui').show(0);
				$('#no-broadcast').hide(400, function() {
					$('#broadcast').show(400);
				});
				console.log('Ok');

				var title = $data.find("title").text();
				console.log(title);

				//do we need to update album art?
				if ( title != oldtitle ) {
					//we do
					console.log("We need to go for album art");

					//first update the basics
					var desc = $data.find("description").text();
					console.log(desc);
					$('#status').html(desc);
					var name = $data.find("name").text();
					var dj = name.substring(name.indexOf(' - ')+3);
					console.log("DJ " + dj);
					$('#dj').html(dj);
					$('#dj-subtitle').show();

					oldtitle = title;
					
					var artist = title.substring(0,title.indexOf(' - '));
					if ( artist == "" ) artist = null;

					var track = title;
					var album = null;
					if ( title.indexOf('|') != -1 ) {
						console.log("fucked-up nelson title format");
						track = title.substring(title.lastIndexOf(' - ')+3,title.indexOf('|')-1);
						var album = title.substring(title.indexOf(' from ')+6,title.lastIndexOf(' ('));
					} else if ( title.lastIndexOf(' - ') != -1 ) {
						console.log("normal person format (guessing)");
						track = title.substring(title.lastIndexOf(' - ')+3);
						if ( title.indexOf(' - ') != title.lastIndexOf(' - ') ) {
							//maybe there's an album?
							album = title.substring(title.indexOf(' - ')+3,title.lastIndexOf(' - '));
						}
					}

					console.log("New artist is " + artist + " and track is " + track + " and album is " + album);

					//fix dumb stuff
					if ( artist == "?" ) artist = null;
					if ( album == "?" ) album = null;

					console.log("Updating metadata on page");
					if ( artist == null ) {
						$('#title').html(track);
					} else {
						$('#title').html(artist + ' - ' + track);
					}
					if ( album == null ) {
						$('#album-subtitle').hide();
					} else {
						$('#album').html(album);
						$('#album-subtitle').show();
					}

					console.log("Going for album art");
					var art = null;
					//TODO: make this more efficient
					$("#art").fadeTo(1000,0);
					$.ajax({
						url: "art.php",
						data:{
							artist:artist,
							album:album,
							track:track
						}
					}).done(function(data) {
						console.log("Preload " + data);
						img = new Image();
						img.onload = function(){
							console.log("splat");
							$("#art").attr("src",data);
							$("#art").fadeTo(1000,1);
						};
						img.src = data;
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

	//admin area setup and handlers
	let password = "";
	$('.secret').on('dblclick', function(e) {
		e.preventDefault(); //so it doesn't highlight all over the page
		password = prompt("Password, please.", "Whatever! It's 2009!");
		$.ajax({
			type: "POST", url: "settings.php", dataType: "json", data: {
				"password": password
			}, success: function(ret) {
				console.log(ret);
				if ( ret === true ) {
					$('#admin').show(1000);
				}
			}
		});
	});
	$('#admin-save').on('click', function(e) {
		e.preventDefault(); //don't submit the form
		$.ajax({
			type: "POST", url: "settings.php", dataType: "json", data: {
				"password": password,
				"dj-name": $("#admin-dj-name").val(),
				"show-name": $("#admin-show-name").val(),
				"album-art-url": $("#admin-album-art-url").val(),
				"requests-enabled": $('#admin-requests-enabled').is(":checked"),
			}, success: function(ret) {
				if ( ret === true ) {
					alert("Saved!");
				}
			}
		});
	});
});

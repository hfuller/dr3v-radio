<?php
require_once("app.php"); //must define $lastapi as your api key
if ( array_key_exists("album",$_REQUEST) && array_key_exists("artist",$_REQUEST) ) {

	//we have enough data to try an album search
	$url = "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=" . $lastapi . "&format=json&artist=" . urlencode($_REQUEST["artist"]) . "&album=" . urlencode($_REQUEST["album"]);
	$j = json_decode(file_get_contents($url));
	$images = $j->album->image;

} else if ( array_key_exists("track",$_REQUEST) ) {

	$url = "http://ws.audioscrobbler.com/2.0/?method=track.search&track=" . urlencode($_REQUEST["track"]) . "&api_key=" . $lastapi . "&format=json";
	if ( array_key_exists("artist",$_REQUEST) ) {
		$url .= "&artist=" . urlencode($_REQUEST["artist"]);
	}
	$j = json_decode(file_get_contents($url));
	$images = $j->results->trackmatches->track[0]->image;

}

$ia = array();
foreach ( $images as $image ) {
	$ia[$image->size] = $image->{'#text'};
}

$url = $ia[count($ia)-1];
if ( array_key_exists("large",$ia) ) $url = $ia["large"];
if ( array_key_exists("extralarge",$ia) )$url = $ia["extralarge"];

if ( $url == "" ) {
	$url = "jimmy_eat_world.jpg";
}

echo $url; die();


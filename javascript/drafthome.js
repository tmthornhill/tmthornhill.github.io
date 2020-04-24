

//Global variables

var spotifyClientID = "dcf56317bfa84c41a44f302eb0e3915e";
var lastFMkey = "4aa3f95a4fcd624d7cafeed5c29bc05f";

var username = "";
var bearer = "";
var artist = "";
var song = "";
var artwork = "";
var oldSong = "";
var cadence;
var uri = "";
var uri2 = "";
var playlistName = "";
var usersUsername= "";
var spotifyUserName= "";
var friends = [];
var topTracks = [];
var k = 0;
var stopper = 0;
var uriArray = [];
var playlistURI = "";
var resultArray = [];
var cleanedToken = "";



//***Start Drafting***

window.onload = function WindowLoad(event) {
    getSpotifyToken();
    $(".result").hide();
}

document.querySelector('.button').addEventListener('click', function() {

  username = document.getElementById("textInput").value;
  getLastFM();
  if (!cadence) {
    cadence = setInterval(getLastFM,5000);
  }

});

document.querySelector('.button2').addEventListener('click', function() {
  resultArray = [];
  topTracks = [];
  stopper = 0;
  // usersUsername="";
  playlistName="";
  usersUsername = document.getElementById("textInputUsername").value.trim();
  spotifyUserName = document.getElementById("textInputUsername2").value.trim();
  playlistName = document.getElementById("textInputPlaylist").value;
  $(".button2").hide();
  $(".loader").show();
  $(".result").hide();
  getUserFriends();

});

//***Spotify functions. Get token and change playback state***

function getSpotifyToken() {

  if(window.location.hash) {
    spotifyToken = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
    cleanedToken = spotifyToken.substring(13,247);
    console.log(cleanedToken);
    bearer = "Bearer " + cleanedToken;
  }
}

function spotifyTest() {

  bearer = "Bearer " + cleanedToken;
  var songAndArtist = song + " " + artist;

  $.ajax({
     url: "https://api.spotify.com/v1/search",
     type: "GET",
     headers: {
       "Authorization" : bearer
     },
     data: {
       "q": songAndArtist,
       "type": "track",
       "limit": 1
     },
     success: function(data) {
       uri = data.tracks.items[0].id;
       playViaSpotify(uri,bearer);
     },
     error: function (request, status, error) {
         console.log(request.responseText);
         if(request.responseText = "Only valid bearer authentication supported"){
           window.location.href = 'https://tmthornhill.github.io/draft';
         }
         $(".loader").hide();
         $(".button2").show();
     }
     });
  }

function playViaSpotify(uri,bearer) {

  var passThroughURI = "spotify:track:" + uri;

  var json = {"uris":[passThroughURI]};
  var jsonString = JSON.stringify(json);

  $.ajax({
     url: "	https://api.spotify.com/v1/me/player/play",
     type: "PUT",
     contentType: "application/json",
     headers: {
       "Authorization" : bearer
     },
     data: jsonString,
     success: function(data) {
       document.getElementById("albumart").src=artwork;
       document.getElementById("artistTitle").innerHTML=artist;
       document.getElementById("songTitle").innerHTML=song;
     },
     error: function (request, status, error) {
         console.log(request.responseText);
     }
     });

}

//***Last.fm functions. Get listener data***

function getLastFM() {

  $.ajax({
     url: 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user='+ username +'&api_key='+ lastFMkey + '&format=json&limit=1',
     type: "GET",
     success: function(data) {

       if (data.message == "User not found" ){
         document.getElementById("headerMessage").innerHTML = "Invalid last.fm username. Please try again.";
       }

       else if (data.recenttracks.track.length == 0) {
         document.getElementById("headerMessage").innerHTML = "Invalid last.fm username. Please try again.";

       } else {
       document.getElementById("headerMessage").innerHTML = "Tune into a friend's live Last.fm stream via Spotify";
       oldSong = song;
       artist = data.recenttracks.track[0].artist['#text'];
       song = data.recenttracks.track[0].name;
       artwork = data.recenttracks.track[0].image[3]['#text'];
       document.getElementById('viauser').innerHTML="@" + username + " is offline."
       document.getElementById('viauser').href="http://www.last.fm/user/" + username;

       console.log(song);

       if (data.recenttracks.track.length > 1) {
         document.getElementById('viauser').innerHTML="@" + username + " is live now!";
       }

       if (oldSong != song) {
         spotifyTest();
       }
     }
   },

     error: function (request, status, error) {
         console.log(request.responseText);
         if(request.responseText = "User not found"){
         }
       }


  });
}

function getUserFriends(){

  k=0;
  friends=[];

  $.ajax({
     url: 'https://ws.audioscrobbler.com/2.0/?method=user.getfriends&user=' + usersUsername.trim() +'&api_key='+ lastFMkey + '&format=json&limit=200&recenttracks=1',
     type: "GET",
     success: function(data) {

       if (typeof data.error != "undefined"){
         document.getElementById("result").innerHTML = "Invalid Last.fm username. Please try again.";
         $(".result").show();
         $(".loader").hide();
         $(".button2").show();
       }

       numberOfFriends = Object.keys(data.friends.user).length;

       while (k < numberOfFriends) {
         var currentFriend = data.friends.user[k].name;
         friends.push(currentFriend);
         k+=1;
      }

       if (numberOfFriends == k) {
         console.log(friends)
         getTopTracks();
       }
   },

     error: function (request, status, error) {
         console.log(request.responseText);
         if(request.responseText = "User not found"){
         }
         $(".loader").hide();
         $(".button2").show();
       }
  });


}

function getTopTracks(){

  if (stopper == 0) {

    var period = document.getElementById("timeframe").value;
    var limit = document.getElementById("tracks").value;

    switch(period) {
    case "week":
      period = "7day";
      break;
    case "month":
      period = "1month";
      break;
    case "year":
      period = "12month";
      break;
    default:
      period = "overall";
        }

    for (friend in friends){

      $.ajax({
         url: 'https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=' + friends[friend] +'&api_key='+ lastFMkey + '&format=json&period=' + period + '&limit=' + limit,
         type: "GET",
         success: function(data) {

         var j = 0;
         while (j<limit){
           topTracks.push({
            artist:   data.toptracks.track[j].artist.name,
            song: data.toptracks.track[j].name,
            user: data.toptracks["@attr"].user
          });
          j+=1;
        }
       },

         error: function (request, status, error) {
             console.log(request.responseText);
             if(request.responseText = "User not found"){
             }
             $(".loader").hide();
             $(".button2").show();
           }
      });

    }

  console.log(topTracks);
  stopper+=1;
  setTimeout(function() { getSpotifyURIs(topTracks); }, 4500);
}
}

function getSpotifyURIs(topTracks){
  var x = 0;
  uriArray = [];
  console.log(topTracks.length);
  console.log(bearer);

  while(x < topTracks.length) {

  var songAndArtist2 = topTracks[x].song + " " + topTracks[x].artist;
  x+=1;
    $.ajax({
       url: "https://api.spotify.com/v1/search",
       type: "GET",
       headers: {
         "Authorization" : bearer
       },
       data: {
         "q": songAndArtist2,
         "type": "track",
         "limit": 1
       },
       success: function(data) {

         uri2 = data.tracks.items[0].id;
         uriArray.push("spotify:track:" + uri2);
       },
       error: function (request, status, error) {
           console.log(request.responseText);
           $(".loader").hide();
           $(".button2").show();
       }
       });
  }
  setTimeout(function() { createSpotifyPlaylist(); }, 2500);
}

function createSpotifyPlaylist(){

  bearer = "Bearer " + cleanedToken;

  var jsondata = {
    "name": playlistName,
    "description": "Top Tracks Last.fm Playlist created by Draft.fm on " + new Date().toLocaleDateString(),
    "public": false};
  var jsonString2 = JSON.stringify(jsondata);

  $.ajax({
     url: "https://api.spotify.com/v1/users/" + spotifyUserName + "/playlists",
     type: "POST",
     headers: {
       "Authorization" : bearer,
       "Content-Type" : "application/json"
     },
     data: jsonString2,
     success: function(data) {
       playlistURI = data.id;
       console.log(playlistURI);
       setTimeout(function() { addTracksToPlaylist(); }, 1000);
     },
     error: function (request, status, error) {

         if (request.status == 400){
           document.getElementById("result").innerHTML = "Authentication failed. Please re-grant Spotify access.";
           $(".result").show();
         }
         if (request.status== 403){
           document.getElementById("result").innerHTML = "You cannot create a playlist for another Spotify user. Please try again.";
           $(".result").show();
         }
         $(".loader").hide();
         $(".button2").show();
     }
     });

}

function addTracksToPlaylist(){

  bearer = "Bearer " + cleanedToken;

  uriArray.sort(function() { return 0.5 - Math.random() });

  uriArray = [...new Set(uriArray)];

  if (uriArray.length > 100) {
    uriArray.length = 100;
  }

  var jsondata2 = uriArray;
  var jsonString3 = JSON.stringify(jsondata2);

  var y=0;
  resultArray = [];

  while(y < topTracks.length) {
    var resultItem = topTracks[y].song + " - " + topTracks[y].artist + "\n(" + topTracks[y].user + ")";
    resultArray.push(resultItem);
    y+=1;
  }

  $.ajax({
     url: "https://api.spotify.com/v1/playlists/" + playlistURI + "/tracks",
     type: "POST",
     headers: {
       "Authorization" : bearer,
       "Content-Type" : "application/json"
     },
     data: jsonString3,
     success: function(data) {
       console.log("SUCCESS");
       $(".loader").hide();
       $(".result").show();
       $(".button2").show();
       document.getElementById("result").innerHTML = "<b>Your playlist has been successfully added to Spotify, comprised of the following tracks:</b><br><br>" + resultArray.join("<br><br>") + "<br>";
       // window.location.href = "https://tmthornhill.github.io/drafthome.html#access_token=" + cleanedToken + "&token_type=Bearer&expires_in=3600";
     },
     error: function (request, status, error) {
         console.log(request.responseText);
         if(request.responseText = "Only valid bearer authentication supported"){
           window.location.href = 'https://tmthornhill.github.io/draft';
         }
         $(".loader").hide();
         $(".button2").show();
     }
     });


}

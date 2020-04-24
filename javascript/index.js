

//Global variables

var spotifyClientID = 'dcf56317bfa84c41a44f302eb0e3915e';
var spotifyToken = '';
var spotifyTokenType = '';
var spotifyTokenExpiresIn = "";
var spotifyState = "";
var lastFMkey = '4aa3f95a4fcd624d7cafeed5c29bc05f';

//***Start Drafting***

document.querySelector('.loginButton').addEventListener('click', function() {

  spotifyAuth();

});

//***Spotify authorization***

function spotifyAuth() {

  // Get the hash of the url
  const hash = window.location.hash
  .substring(1)
  .split('&')
  .reduce(function (initial, item) {
    if (item) {
      var parts = item.split('=');
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});
  window.location.hash = '';

  // Set token
  let _token = hash.access_token;
  spotifyToken = _token;

  const authEndpoint = 'https://accounts.spotify.com/authorize';

  // Replace with your app's client ID, redirect URI and desired scopes
  const clientId = spotifyClientID;
  const redirectUri = 'https://tmthornhill.github.io/drafthome.html';
  const scopes = [
    'user-modify-playback-state',
    'playlist-modify-public',
    'playlist-modify-private'
  ];

  // If there is no token, redirect to Spotify authorization /
  if (!_token) {
    window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
  }
}

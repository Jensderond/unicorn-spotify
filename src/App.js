import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes } from "./config";
import hash from "./hash";
import Player from "./Player";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      token: null,
      item: {
        album: {
          images: [{ url: "" }]
        },
        name: "",
        artists: [{ name: "" }],
        duration_ms:0,
      },
      is_playing: "Paused",
      progress_ms: 0
    };
    this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
  }
  componentDidMount() {
    // Set token
    let _token = hash.access_token;

    if (_token) {
      // Set token
      this.setState({
        token: _token
      });
      this.getCurrentlyPlaying(_token);
    }
    this.interval = setInterval(() => this.updateProgress(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getCurrentlyPlaying(token) {
    // Make a call using the token
    $.ajax({
      url: "https://api.spotify.com/v1/me/player",
      type: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        console.log("data", data);
        this.setState({
          item: data.item,
          is_playing: data.is_playing,
          progress_ms: data.progress_ms,
        });
      }
    });
  }

  updateProgress() {
    const _progress_ms = this.state.progress_ms;
    const _duration_ms = this.state.item.duration_ms;
    const _token = this.state.token;

    if(_progress_ms !== undefined) {
      if(_progress_ms < _duration_ms) {
        this.setState({
          progress_ms: _progress_ms + 1000,
        });
      }
      if(_progress_ms >= _duration_ms && _token !== null) {
        console.log('Song ended, checking for a new song.');
        this.getCurrentlyPlaying(_token);
      }
    }
  }

  render() {

    return (
      <div className="App">
        <header className="App-header">
        <h1>Sailor Vibes</h1>
          {!this.state.token && (
            <a
              className="btn btn--loginApp-link"
              href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                "%20"
              )}&response_type=token&show_dialog=true`}
            >
              Login to Spotify
            </a>
          )}
          {this.state.token && (
            <Player
              item={this.state.item}
              is_playing={this.state.is_playing}
              progress_ms={this.state.progress_ms}
            />
          )}
        </header>
      </div>
    );
  }
}

export default App;
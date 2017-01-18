import React, { Component } from 'react';
import GMap from './GMap';
import GitHubAPI from './api/github';
import MapsAPI from './api/maps';
import StorageAPI from './api/storage';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: 'rviscomi',
      repo: 'webpagetest',
      description: '',
      stars: 0,
      locations: [],
      geocodes: [],
      lastCursor: null
    };
  }

  parseLocation(callback) {
    const [_, user, repo] = location.pathname.split('/');
    if (user && repo) {
      this.setState({
        ...this.state,
        user,
        repo
      }, callback);
    }
  }

  componentDidMount() {
    StorageAPI.init();
    this.parseLocation(this.getGeocodes);
  }

  getGeocodes() {
    const cachedGeocodes = StorageAPI.get(this.state.user, this.state.repo);
    if (cachedGeocodes) {
      this.setState({
        ...this.state,
        geocodes: MapsAPI.inlateGeocodes(cachedGeocodes)
      });
    } else {
      this.queryGitHub();
    }
  }

  queryGitHub() {
    GitHubAPI.getEverything(this.state.user, this.state.repo).then(({
      user,
      repo,
      description,
      stars,
      locations,
      lastCursor
    }) => {
      this.setState({
        ...this.state,
        user,
        repo,
        description,
        stars,
        locations,
        lastCursor
      });
    }).catch(e => {
      console.error(e);
    });
  }

  handleGeocodingComplete(geocodes) {
    const deflatedGeocodes = JSON.stringify(geocodes);
    StorageAPI.set(this.state.user,
        this.state.repo,
        deflatedGeocodes,
        this.state.lastCursor);
    this.setState({
      ...this.state,
      geocodes
    });
  }

  render() {
    return (
      <div className="App">
        <header>
          <a className="logo" href="/">Corona</a>
          <span className="about">
            <span className="stars">{this.state.stars} {this.state.stars === 1 ? 'star' : 'stars'}</span>
            <span title={this.state.description}>
              <span className="user">{this.state.user}</span>
              /
              <span className="repo">{this.state.repo}</span>
            </span>
          </span>
        </header>
        <GMap geocodes={this.state.geocodes}
              locations={this.state.locations}
              handleGeocodingComplete={this.handleGeocodingComplete.bind(this)}>
        </GMap>
      </div>
    );
  }
}

export default App;

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
      isFork: false,
      stars: 0,
      locations: [],
      geocodes: [],
      cursor: null
    };
  }

  parseLocation(callback) {
    const [_, user, repo] = location.pathname.split('/');
    if (user && repo) {
      return new Promise((resolve, reject) => {
        this.setState({
          ...this.state,
          user,
          repo
        }, resolve);
      });
    }

    return Promise.resolve();
  }

  componentDidMount() {
    StorageAPI.init();
    this.parseLocation().then(this.getGeocodes.bind(this));
  }

  getGeocodes() {
    StorageAPI.get(this.state.user, this.state.repo).then(this.onStorageUpdated.bind(this));
  }

  onStorageUpdated(data) {
    const {geocodes, cursor, stars, isFork} = data;
    if (geocodes && cursor) {
      this.setState({
        ...this.state,
        geocodes: MapsAPI.inflateGeocodes(geocodes),
        cursor,
        stars,
        isFork
      });
    }

    this.queryGitHub();
  }

  queryGitHub() {
    const {user, repo, cursor} = this.state;
    GitHubAPI.getEverything(user, repo, cursor).then((data) => {
      console.log(data)
      this.setState({
        ...this.state,
        ...data
      });
    }).catch(e => {
      console.error(e);
    });
  }

  handleGeocodingComplete(geocodes) {
    StorageAPI.set(this.state.user,
        this.state.repo,
        geocodes,
        this.state.stars,
        this.state.description,
        this.state.isFork,
        this.state.cursor);
    this.setState({
      ...this.state,
      geocodes
    });
  }

  render() {
    return (
      <div>
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

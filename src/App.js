import React, { Component } from 'react';
import GMap from './GMap';
import MapsAPI from './api/maps';
import StorageAPI from './api/storage';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: 'rviscomi',
      repo: 'corona',
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
    this.parseLocation().then(() => {
      this.getGeocodes();
      document.title = `Corona: ${this.state.user}/${this.state.repo}`;
    });
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
    const apiHost = this.getApiHost();
    fetch(`${apiHost}?user=${user}&repo=${repo}&cursor=${cursor || ''}`, {
      'Accept': 'application/json'
    }).then(response => {
      return response.json();
    }).then(data => {
      this.setState({
        ...this.state,
        ...data
      });
    }).catch(e => {
      console.error(e);
    });
  }

  getApiHost() {
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3061/';
    }

    const url = new URL(location.origin);
    url.port = 8080;
    return url.href;
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
            <a href={`https://github.com/${this.state.user}/${this.state.repo}`} title={this.state.description}>
              <span className="user">{this.state.user}</span>
              /
              <span className="repo">{this.state.repo}</span>
            </a>
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

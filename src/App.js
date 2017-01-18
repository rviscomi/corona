import React, { Component } from 'react';
import GMap from './GMap';
import GitHubAPI from './api/github';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: 'rviscomi',
      repo: 'red-dwarf',
      description: '',
      stars: 0,
      users: [],
      locations: []
    };
  }

  componentDidMount() {
    // Get summary information about the repository.
    GitHubAPI.getRepo(this.state.user, this.state.repo).then(response => {
      const stars = response.stargazers_count;
      const description = response.description;
      this.setState({
        ...this.state,
        description,
        stars
      });
      return Promise.resolve(stars);
    }).then(stars => {
      // Get all stargazers.
      return GitHubAPI.getUsers(this.state.user, this.state.repo, this.state.stars).then((users) => {
        this.setState({
          ...this.state,
          users
        });
        return Promise.resolve(users);
      });
    }).then(users => {
      return GitHubAPI.getLocations(this.state.users).then(locations => {
        this.setState({
          ...this.state,
          locations
        });
      });
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
        <GMap locations={this.state.locations}></GMap>
      </div>
    );
  }
}

export default App;

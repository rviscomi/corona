import React, { Component } from 'react';
import MapsAPI from './api/maps';
import './GMap.css';

class GMap extends Component {
  constructor() {
    super();

    this.state ={
      map: null,
      layer: null
    }
    window.initCorona = this.init.bind(this);
  }

  init() {
    const map = MapsAPI.init(this.refs.map);
    const layer = MapsAPI.getLayer(map);
    this.setState({
      ...this.state,
      map,
      layer
    });
  }

  componentDidMount() {
    MapsAPI.loadScript();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.layer) {
      console.warn('No layer. Cant render heatmap data');
      return;
    }
    const geocodes = nextProps.locations.map(location => {
      return MapsAPI.getGeoCode(location);
    });

    Promise.all(geocodes).then(geocodes => {
      geocodes = geocodes.filter(geocode => geocode);
      this.state.layer.setData(geocodes);
    });
  }

  render() {
    return (
      <div id="map" ref="map"></div>
    );
  }
}

export default GMap;

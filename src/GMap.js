import React, { Component } from 'react';
import MapsAPI from './api/maps';
import './GMap.css';

class GMap extends Component {
  constructor() {
    super();

    this.state ={
      map: null,
      layer: null,
      geocodes: []
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

    if (nextProps.geocodes.length) {
      this.setState({
        ...this.state,
        geocodes: nextProps.geocodes
      });
      this.state.layer.setData(nextProps.geocodes);
      return;
    }

    if (!nextProps.locations.length) {
      return;
    }

    MapsAPI.enqueueLocations(nextProps.locations);
    MapsAPI.startGeocoding(this,
      this.addToHeatmap,
      this.handleGeocodingComplete,
      this.handleGeocodingError);
  }

  addToHeatmap(geocode) {
    const geocodes = Array.from(this.state.geocodes);
    geocodes.push(geocode);
    this.setState({
      ...this.state,
      geocodes
    });
    this.state.layer.setData(geocodes);
  }

  handleGeocodingComplete() {
    this.props.handleGeocodingComplete(this.state.geocodes);
  }

  handleGeocodingError(e) {
    console.warn(e);
  }

  render() {
    return (
      <div id="map" ref="map"></div>
    );
  }
}

export default GMap;

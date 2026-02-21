/*global google*/
import React, { Component } from "react";
import {
  withGoogleMap,
  withScriptjs,
  GoogleMap,
  Polyline,
  Marker,
  InfoWindow
} from "react-google-maps";
import * as Papa from "papaparse";

class Map extends Component {
  state = {
    lineCoordinates: null,
    lineCoordinates2: null,
    lineCoordinates3: null,
    a: [],
    b: [],
    c: [],
    d: [],
    e: [],
    f: [],
    dates: [],
    index: -1,
    sC: "blue",
    sC2: "blue",
    sC3: "blue",
    nR: 0,
    nR2: 0,
    nR3: 0,
    tweets: [],
    liveTraffic: [],
    showInfoWindow: false
  };

  componentDidMount() {
    // 🐦 Load tweets.json from public folder
    fetch("/tweets.json")
      .then(res => res.json())
      .then(data => {
        this.setState({ tweets: data });
      })
      .catch(err => console.error("Error loading tweets.json:", err));

    // 🚦 Load traffic.json from public folder
    fetch("/traffic.json")
      .then(res => res.json())
      .then(data => {
        this.setState({ liveTraffic: data });
      })
      .catch(err => console.error("Error loading traffic.json:", err));

    // ===== Directions setup =====
    const directionsService = new google.maps.DirectionsService();
    const directionsService2 = new google.maps.DirectionsService();
    const directionsService3 = new google.maps.DirectionsService();

    const origin = { lat: 28.750616, lng: 77.116578 };
    const destination = { lat: 30.727546, lng: 76.844814 };
    const origin2 = { lat: 30.727546, lng: 76.844814 };
    const destination2 = { lat: 30.752827, lng: 76.806375 };
    const origin3 = { lat: 30.752827, lng: 76.806375 };
    const destination3 = { lat: 28.750616, lng: 77.116578 };

    Papa.parse("dataset.csv", {
      download: true,
      complete: this.updateData
    });
    Papa.parse("Dataset_TCF.csv", {
      download: true,
      complete: this.updateTCFData
    });

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.setState({ lineCoordinates: result.routes });
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );

    directionsService2.route(
      {
        origin: origin2,
        destination: destination2,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.setState({ lineCoordinates2: result.routes });
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );

    directionsService3.route(
      {
        origin: origin3,
        destination: destination3,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.setState({ lineCoordinates3: result.routes });
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  }

  updateData = result => {
    const data = result.data;
    let a = [],
      b = [],
      c = [],
      dates = [];
    let mini = Infinity;
    let i = -1;
    data.forEach((x, j) => {
      const t = new Date(x[0]);
      if (Math.abs(t - Date.now()) < mini) {
        mini = Math.abs(t - Date.now());
        i = j;
      }
    });
    this.setState({ index: i });
    data.forEach((x, j) => {
      if (j !== 0) {
        dates.push(x[0]);
        a.push(x[1]);
        b.push(x[2]);
        c.push(x[3]);
      }
    });
    this.setState({ a, b, c, dates });
  };

  updateTCFData = result => {
    const data = result.data;
    let d = [],
      e = [],
      f = [];
    data.forEach((x, j) => {
      if (j !== 0) {
        d.push(x[4]);
        e.push(x[5]);
        f.push(x[6]);
      }
    });
    this.setState({ d, e, f });
  };

  forward = () => {
    const { index, a, b, c, d, e, f } = this.state;

    if (parseFloat(a[index + 1]) < 15347.921667999999)
      this.setState({ sC: "green" });
    else if (
      parseFloat(a[index + 1]) >= 15347.921667999999 &&
      parseFloat(a[index + 1]) < 15812.43572736
    )
      this.setState({ sC: "yellow" });
    else this.setState({ sC: "red" });

    if (parseFloat(b[index + 1]) < 986.8435) this.setState({ sC2: "green" });
    else if (
      parseFloat(b[index + 1]) >= 986.8435 &&
      parseFloat(b[index + 1]) < 1083.1565
    )
      this.setState({ sC2: "yellow" });
    else this.setState({ sC2: "red" });

    if (parseFloat(c[index + 1]) < 15579.240338000001)
      this.setState({ sC3: "green" });
    else if (
      parseFloat(c[index + 1]) >= 15579.240338000001 &&
      parseFloat(c[index + 1]) < 16198.596098999999
    )
      this.setState({ sC3: "yellow" });
    else this.setState({ sC3: "red" });

    this.setState({
      nR: parseFloat(d[index + 1]) > 0.7 ? 1 : 0,
      nR2: parseFloat(e[index + 1]) > 0.7 ? 1 : 0,
      nR3: parseFloat(f[index + 1]) > 0.7 ? 1 : 0,
      index: index + 1
    });
  };

  backward = () => {
    const { index, a, b, c, d, e, f } = this.state;

    if (parseFloat(a[index - 1]) < 15347.921667999999)
      this.setState({ sC: "green" });
    else if (
      parseFloat(a[index - 1]) >= 15347.921667999999 &&
      parseFloat(a[index - 1]) < 15812.43572736
    )
      this.setState({ sC: "yellow" });
    else this.setState({ sC: "red" });

    if (parseFloat(b[index - 1]) < 986.8435) this.setState({ sC2: "green" });
    else if (
      parseFloat(b[index - 1]) >= 986.8435 &&
      parseFloat(b[index - 1]) < 1083.1565
    )
      this.setState({ sC2: "yellow" });
    else this.setState({ sC2: "red" });

    if (parseFloat(c[index - 1]) < 15579.240338000001)
      this.setState({ sC3: "green" });
    else if (
      parseFloat(c[index - 1]) >= 15579.240338000001 &&
      parseFloat(c[index - 1]) < 16198.596098999999
    )
      this.setState({ sC3: "yellow" });
    else this.setState({ sC3: "red" });

    this.setState({
      nR: parseFloat(d[index - 1]) > 0.7 ? 1 : 0,
      nR2: parseFloat(e[index - 1]) > 0.7 ? 1 : 0,
      nR3: parseFloat(f[index - 1]) > 0.7 ? 1 : 0,
      index: index - 1
    });
  };

  render() {
    // 🐦 Tweet Markers (expecting lat/lng in JSON)
    const tweetMarkers = this.state.tweets.map((tweet, i) => (
      <Marker
        key={`tweet-${i}`}
        position={{ lat: tweet.lat, lng: tweet.lng }}
        icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      >
        <InfoWindow>
          <div>
            <h4>{tweet.text}</h4>
          </div>
        </InfoWindow>
      </Marker>
    ));

    // 🚦 Live Traffic Markers
    const trafficMarkers = this.state.liveTraffic.map((point, i) => (
      <Marker
        key={`traffic-${i}`}
        position={{ lat: point.lat, lng: point.lng }}
        icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
      >
        <InfoWindow>
          <div>
            <h4>{point.message}</h4>
            <p>Severity: {point.severity}</p>
          </div>
        </InfoWindow>
      </Marker>
    ));

    // ===== Polylines =====
    const newq = this.state.lineCoordinates ? (
      <Polyline
        path={this.state.lineCoordinates[this.state.nR].overview_path}
        options={{
          strokeColor: this.state.sC,
          strokeOpacity: 1,
          strokeWeight: 7
        }}
      />
    ) : null;

    const newq2 = this.state.lineCoordinates2 ? (
      <Polyline
        path={this.state.lineCoordinates2[this.state.nR2].overview_path}
        options={{
          strokeColor: this.state.sC2,
          strokeOpacity: 1,
          strokeWeight: 7
        }}
      />
    ) : null;

    const newq3 = this.state.lineCoordinates3 ? (
      <Polyline
        path={this.state.lineCoordinates3[this.state.nR3].overview_path}
        options={{
          strokeColor: this.state.sC3,
          strokeOpacity: 1,
          strokeWeight: 7
        }}
      />
    ) : null;

    const GoogleMapExample = withGoogleMap(() => (
      <GoogleMap
        defaultCenter={{ lat: 30.7112003, lng: 76.8098778 }}
        defaultZoom={13}
      >
        {/* Fixed markers */}
        <Marker position={{ lat: 28.750616, lng: 77.116578 }} />
        <Marker position={{ lat: 30.727546, lng: 76.844814 }} />
        <Marker position={{ lat: 30.752827, lng: 76.806375 }} />

        {/* Dynamic markers */}
        {tweetMarkers}
        {trafficMarkers}

        {/* Polylines */}
        {newq}
        {newq2}
        {newq3}
      </GoogleMap>
    ));

    return (
      <div>
        <div style={{ float: "right" }}>
          <p style={{ padding: "20px" }}>
            <b>Prediction Time - </b> {this.state.dates[this.state.index]}
          </p>
          <p style={{ padding: "20px" }}>
            <b>Duration from DTU to Infosys - </b>{" "}
            {Math.round(this.state.a[this.state.index] / 60)} minutes
          </p>
          <p style={{ padding: "20px" }}>
            <b>Duration from Infosys to Rock Garden - </b>{" "}
            {Math.round(this.state.b[this.state.index] / 60)} minutes
          </p>
          <p style={{ padding: "20px" }}>
            <b>Duration from Rock Garden to DTU - </b>{" "}
            {Math.round(this.state.c[this.state.index] / 60)} minutes
          </p>
        </div>

        <GoogleMapExample
          containerElement={<div style={{ height: `800px`, width: "1500px" }} />}
          mapElement={<div style={{ height: `100%` }} />}
        />

        <div style={{ width: "1500px", textAlign: "center", padding: "30px" }}>
          <button onClick={this.backward}>Backward</button>
          <button onClick={this.forward}>Forward</button>
        </div>
      </div>
    );
  }
}

export default Map;

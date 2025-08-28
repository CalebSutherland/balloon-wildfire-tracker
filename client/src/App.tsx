import "./App.css";
import Leaflet from "./components/leaflet";
import Map from "./components/map";

function App() {
  return (
    <div className="app-wrapper">
      <div className="map-wrapper">
        <Map />
      </div>
    </div>
  );
}

export default App;

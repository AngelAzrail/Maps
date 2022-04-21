import './App.css';
import Maps from "./Map/Map";
import VectorSource from "ol/source/Vector";

const source = new VectorSource();

function App() {
  return (
    <div className="App">
        <Maps source={source}/>
    </div>
  );
}

export default App;

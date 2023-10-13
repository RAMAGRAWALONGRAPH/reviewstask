import "./App.css";
import { useState } from "react";

import GooglePlacesAutocomplete from "react-google-places-autocomplete";

function App() {
  const [location, setLocation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      console.error("Location is missing");
      return;
    }
    const response = await fetch("http://localhost:5000/screenshot", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ location: location.label }),
    });

    setLocation(null);
    console.log(response);
  };
  return (
    <>
      <div>
        <label>Please fill your location</label>

        <div>
          <div>
            <GooglePlacesAutocomplete
              apiKey="AIzaSyBOCNiSor1-8OrLS4eRbyreriFcI__Pg64"
              selectProps={{
                location,
                onChange: setLocation,
                placeholder: "Select your address",
              }}
              location={location ? location.label : ""}
            />
          </div>
          <p>Selected Location: {location ? location.label : ""}</p>
          <button className="button" onClick={handleSubmit}>
            Search
          </button>
        </div>
      </div>
    </>
  );
}

export default App;

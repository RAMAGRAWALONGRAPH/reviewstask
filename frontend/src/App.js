import "./App.css";
import { useState } from "react";

import GooglePlacesAutocomplete from "react-google-places-autocomplete";

function App() {
  const [location, setLocation] = useState(null);
  const [reviewsData, setReviewsData] = useState([]);
  const [lastReviewCount, setLastReviewCount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!location) {
    //   console.error("Location is missing");
    //   return;
    // }
    setReviewsData([]);
    setLastReviewCount(0);
    const response = await fetch("http://localhost:5000/screenshot", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({ location: location.label, lastReviewCount }),
      body: JSON.stringify({ lastReviewCount }),
    });
    const data = await response.json();
    setReviewsData(data.reviews);
    setLastReviewCount(data.reviews.length);
    setLocation(null);
  };

  const handleLoadMore = async () => {
    const response = await fetch("http://localhost:5000/screenshot", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lastReviewCount }),
    });
    const data = await response.json();
    setReviewsData([...reviewsData, ...data.reviews]);
    setLastReviewCount(reviewsData.length + data.reviews.length);
  };

  return (
    <>
      <div>
        <label>Please fill your location</label>

        <div>
          <div>
            <GooglePlacesAutocomplete
              apiKey="api key"
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
        {reviewsData.length > 0 && (
          <>
            <table>
          <thead>
            <tr>
              <th>Author</th>
              <th>Review Text</th>
              <th>Rating</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {reviewsData.map((review, index) => (
              <tr key={index}>
                <td>{review.Author}</td>
                <td>{review.reviewText}</td>
                <td>{review.ratingStars}</td>
                <td>{review.reviewTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
            <button onClick={handleLoadMore}>
          Load More
        </button>
          </>
        )}
      </div>
    </>
  );
}

export default App;

// import "./App.css";
// import { useState} from "react";

// import GooglePlacesAutocomplete from "react-google-places-autocomplete";

// function App() {
//   const [location, setLocation] = useState(null);
//   const [reviewsData, setReviewsData] = useState([]);
//   const [lastReviewCount, setLastReviewCount] = useState(0)

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!location) {
//       console.error("Location is missing");
//       return;
//     }
//     const response = await fetch("http://localhost:5000/screenshot", {
//       method: "post",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ location: location.label }),
//     });
//     const data = await response.json();
//     console.log(data)
//     setLocation(null);

//   };
//   return (
//     <>
//       <div>
//         <label>Please fill your location</label>

//         <div>
//           <div>
//             <GooglePlacesAutocomplete
//               apiKey="AIzaSyBOCNiSor1-8OrLS4eRbyreriFcI__Pg64"
//               selectProps={{
//                 location,
//                 onChange: setLocation,
//                 placeholder: "Select your address",
//               }}
//               location={location ? location.label : ""}
//             />
//           </div>
//           <p>Selected Location: {location ? location.label : ""}</p>
//           <button className="button" onClick={handleSubmit}>
//             Search
//           </button>
//         </div>
//         {/* <table>
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Age</th>
//             </tr>
//           </thead>
//           <tbody>
//             {userData.map((user) => (
//               <tr key={user._id}>
//                 <td>{user.Name}</td>
//                 <td>{user.Age}</td>
//                 <td onClick={() => handleEdit(user._id)}>Edit</td>
//                 <td className="delete" onClick={() => handleDelete(user._id)}>
//                   Delete
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table> */}
//       </div>
//     </>
//   );
// }

// export default App;

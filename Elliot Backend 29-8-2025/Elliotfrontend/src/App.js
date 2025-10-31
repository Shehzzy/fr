import "./App.css";
import "./Responsive.css";
import { BrowserRouter as Router } from "react-router-dom";
import RoutesComponent from "./RoutesComponent";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { HelmetProvider } from "react-helmet-async";

function App() {
  const stripeKey = process.env.REACT_APP_STRIPE_PUBLISH_KEY;
  const stripePromise = loadStripe(stripeKey);

  return (
    <Router>
      <Elements stripe={stripePromise}>
        <RoutesComponent />
        <ToastContainer />
      </Elements>
    </Router>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux"; // Import Provider from react-redux
import { PersistGate } from "redux-persist/integration/react"; // Import PersistGate
import store, { persistor } from "./store"; // Import store and persistor
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FaqSupportPage from "./components/FaqSupportPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import LoginRegisterPage from "./components/LoginRegisterPage";
import AddProperty from "./components/AddProperties";
import ProfilePage from "./components/ProfilePage";
import HomePage from "./components/HomePage";
import PropertyDetail from "./components/PropertyDetail";
import SavedProperties from "./components/SavedProperties";
import "leaflet/dist/leaflet.css";
import "./index.css";

const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <div className="content-wrapper">
        <Router>
          <Navbar />
          <div>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/faq-support" element={<FaqSupportPage />} />
              <Route path="/login" element={<LoginRegisterPage />} />
              <Route path="/register" element={<LoginRegisterPage />} />
              <Route path="/addproperties" element={<AddProperty />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/SavedProperties" element={<SavedProperties />} />
            </Routes>
          </div>
          <Footer />
        </Router>
      </div>
    </PersistGate>
  </Provider>
);

export default App;

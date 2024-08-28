import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/header_footer/Header";
import Footer from "../components/header_footer/Footer";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "https://fairscape.net/api";

const MyDashboard = () => {
  const [rocrates, setRocrates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRocrates = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API_URL}/rocrate`, { headers });
        setRocrates(response.data.rocrates);
      } catch (error) {
        console.error("Error fetching ROCrates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRocrates();
  }, []);

  const extractArkIdentifier = (url) => {
    const match = url.match(/(ark:.+)/);
    return match ? match[1] : "";
  };

  return (
    <div id="root">
      <Header />
      <div className="page-content">
        <div className="container">
          <h3>My Dashboard</h3>
          {loading ? (
            <p>Loading ROCrates...</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Elements in Graph</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rocrates.map((rocrate) => (
                    <tr key={rocrate["@id"]}>
                      <td>{rocrate.name}</td>
                      <td>{rocrate.description}</td>
                      <td>{rocrate["@graph"]?.length || 0}</td>
                      <td>
                        <a
                          href={`/rocrate/${extractArkIdentifier(
                            rocrate["@id"]
                          )}`}
                          className="btn btn-primary btn-sm"
                        >
                          View Details
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyDashboard;

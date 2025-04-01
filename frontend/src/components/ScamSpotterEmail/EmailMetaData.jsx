import React, { useState, useEffect } from "react";
import "../../styles/ScamSpotter.css"; // Adjust the path as needed

// A function to fetch metadata based on email id
const EmailMetaData = ({ id }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (id) => {
    try {
      // Commenting out the actual fetch for now, since the database is not ready
      // const response = await fetch(""); // insert API from database CRUD operations

      // Simulate mock data for testing (replace this with actual API call later)
      // Set mock data to state for visualization
      setData(mockData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData(id); // Call fetchData with mock data
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    // Create a table with className for styling
    <table className="emailData">
      <tbody>
        {data.from && (
          <tr>
            <th>From:</th>
            <td>{data.from}</td>
          </tr>
        )}
        {data["reply-to"] && (
          <tr>
            <th>Reply-To:</th>
            <td>{data["reply-to"]}</td>
          </tr>
        )}
        {data.to && (
          <tr>
            <th>To:</th>
            <td>{data.to}</td>
          </tr>
        )}
        {data.date && (
          <tr>
            <th>Date:</th>
            <td>{data.date}</td>
          </tr>
        )}
        {data.subject && (
          <tr>
            <th>Subject:</th>
            <td>{data.subject}</td>
          </tr>
        )}
        {data["mailed-by"] && (
          <tr>
            <th>Mailed-By:</th>
            <td>{data["mailed-by"]}</td>
          </tr>
        )}
        {data["signed-by"] && (
          <tr>
            <th>Signed-By:</th>
            <td>{data["signed-by"]}</td>
          </tr>
        )}
        {data.security && (
          <tr>
            <th>Security:</th>
            <td>{data.security}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default EmailMetaData;

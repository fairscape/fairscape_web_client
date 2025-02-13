import React, { useState } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";
const FE_URL =
  import.meta.env.VITE_FAIRSCAPE_FE_URL || "http://localhost:5173/";

const urlPattern = /^(http|https):\/\/[^\s]+/;
const identifierPattern = /^ark:[0-9]{5}\/.*$/;
const arkInUrlPattern = /ark:[0-9]{5}\/[^\s/]+/;
const rocrateDowloadPattern = new RegExp(`^${API_URL}.*?download/`);

const CustomAlert = ({ message, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#f8d7da",
      color: "#721c24",
      padding: "20px",
      borderRadius: "5px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
      zIndex: 1000,
      maxWidth: "80%",
      textAlign: "center",
    }}
  >
    <div>{message}</div>
    <button
      onClick={onClose}
      style={{
        marginTop: "10px",
        background: "none",
        border: "1px solid #721c24",
        color: "#721c24",
        padding: "5px 10px",
        borderRadius: "3px",
        cursor: "pointer",
      }}
    >
      Close
    </button>
  </div>
);

const Link = ({ value }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const getToken = () => {
    return localStorage.getItem("token") || "";
  };

  const handleDownload = async (downloadUrl) => {
    const token = getToken();

    if (!token) {
      setAlertMessage("You must be logged in to download files.");
      setShowAlert(true);
      return;
    }

    try {
      const response = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers["content-disposition"];
      let filename = null;
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      // If filename not found in header, extract from URL
      if (!filename) {
        const urlParts = downloadUrl.split("/");
        filename = urlParts[urlParts.length - 1];
        // Add .zip extension if it's not already there
        if (!filename.toLowerCase().endsWith(".zip")) {
          filename += ".zip";
        }
      }

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      if (error.response && error.response.status === 401) {
        setAlertMessage(
          "You must be a member of the group to download this data."
        );
      } else {
        setAlertMessage(
          `Download failed. Please try again. Error: ${error.message}`
        );
      }
      setShowAlert(true);
    }
  };

  if (rocrateDowloadPattern.test(value)) {
    return (
      <>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleDownload(value);
          }}
        >
          Download Link
        </a>
        {showAlert && (
          <CustomAlert
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}
      </>
    );
  } else if (identifierPattern.test(value)) {
    return <a href={`${FE_URL}${value}`}>{value}</a>;
  } else if (urlPattern.test(value)) {
    const arkMatch = value.match(arkInUrlPattern);
    if (arkMatch) {
      const ark = arkMatch[0];
      return <a href={`${FE_URL}${ark}`}>{value}</a>;
    }
    return <a href={value}>{value}</a>;
  }
  return value;
};
const Accordion = ({
  title,
  children,
  isExpanded,
  onToggle,
  isSubItem = false,
}) => (
  <div className={`accordion-item ${isSubItem ? "sub-item" : ""}`}>
    <h2 className="accordion-header">
      <button
        className={`accordion-button ${isExpanded ? "" : "collapsed"} ${
          isSubItem ? "sub-item-button" : ""
        }`}
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        {title}
      </button>
    </h2>
    <div className={`accordion-collapse collapse ${isExpanded ? "show" : ""}`}>
      <div className={`accordion-body ${isSubItem ? "sub-item-body" : ""}`}>
        {children}
      </div>
    </div>
  </div>
);

const ArrayRenderer = ({ items }) => (
  <ul>
    {items.map((item, index) => (
      <li key={index}>
        {typeof item === "object" ? (
          <ObjectRenderer object={item} />
        ) : (
          <Link value={item} />
        )}
      </li>
    ))}
  </ul>
);

const ObjectRenderer = ({ object }) => {
  if (object === null || object === undefined) {
    return <span>No data</span>;
  }
  return (
    <ul>
      {Object.entries(object).map(([key, value], index) => (
        <li key={index}>
          <strong>{key}: </strong>
          <ValueRenderer value={value} />
        </li>
      ))}
    </ul>
  );
};

const PropertiesRenderer = ({ properties }) => {
  const [expandedProps, setExpandedProps] = useState({});

  return (
    <div>
      <button
        className="btn btn-secondary"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseProperties"
      >
        Show/Hide Properties
      </button>
      <div className="collapse" id="collapseProperties">
        {Object.entries(properties).map(([propName, propDetails], index) => (
          <Accordion
            key={index}
            title={propName}
            isExpanded={expandedProps[propName] || false}
            onToggle={() => {
              setExpandedProps((prev) => ({
                ...prev,
                [propName]: !prev[propName],
              }));
            }}
            isSubItem={true}
          >
            <strong>Description:</strong>{" "}
            {propDetails.description || "No description"}
            <br />
            <strong>Type:</strong> {propDetails.type || "No type specified"}
            <br />
            <strong>Index:</strong> {propDetails.index || "No index specified"}
          </Accordion>
        ))}
      </div>
    </div>
  );
};

const ValueRenderer = ({ value }) => {
  if (value === null || value === undefined) {
    return <span>No data</span>;
  }
  if (Array.isArray(value)) {
    return <ArrayRenderer items={value} />;
  } else if (typeof value === "object") {
    return <ObjectRenderer object={value} />;
  }
  return (
    <div className="max-h-32 overflow-y-auto break-words whitespace-pre-wrap">
      <Link value={value} />
    </div>
  );
};

const TableRow = ({ property, value }) => {
  const [isMainExpanded, setIsMainExpanded] = useState(false);
  const [expandedSubItems, setExpandedSubItems] = useState({});

  const renderValue = () => {
    if (property === "Properties") {
      return <PropertiesRenderer properties={value} />;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return <ValueRenderer value={value} />;
    }

    if (
      Array.isArray(value) &&
      value.every((item) => typeof item === "object" && item !== null)
    ) {
      // Filter out items with name "Evidence Graph"
      const filteredValue = value.filter(
        (item) =>
          !(
            (item.name && item.name.includes("Evidence Graph")) ||
            (item["@type"] && item["@type"] === "EVI:EvidenceGraph")
          )
      );

      return (
        <Accordion
          title={`${property} (${filteredValue.length} items)`}
          isExpanded={isMainExpanded}
          onToggle={() => setIsMainExpanded(!isMainExpanded)}
        >
          {filteredValue.map((item, index) => (
            <Accordion
              key={index}
              title={item.name || `Item ${index + 1}`}
              isExpanded={expandedSubItems[index] || false}
              onToggle={() => {
                setExpandedSubItems((prev) => ({
                  ...prev,
                  [index]: !prev[index],
                }));
              }}
              isSubItem={true}
            >
              <ObjectRenderer object={item} />
            </Accordion>
          ))}
        </Accordion>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <Accordion
          title={property}
          isExpanded={isMainExpanded}
          onToggle={() => setIsMainExpanded(!isMainExpanded)}
        >
          <ObjectRenderer object={value} />
        </Accordion>
      );
    }

    return <span>No data</span>;
  };

  return (
    <tr>
      <td>{property}</td>
      <td>{renderValue()}</td>
    </tr>
  );
};

export default TableRow;

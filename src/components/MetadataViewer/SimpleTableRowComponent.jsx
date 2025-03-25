import React from "react";

const LinkComponent = ({ value }) => {
  // Updated patterns to better match ARK formats
  const urlPattern = /^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i;
  const arkInUrlPattern = /ark:[0-9]+\/[^\s]+/i;
  const identifierPattern = /^ark:[0-9]+\/[^\s]+$/i;

  const FE_URL =
    import.meta.env.VITE_FAIRSCAPE_FE_URL || "http://localhost:5173/";

  const createLink = (href, text) => (
    <a href={href} className="text-blue-600 hover:text-blue-800 underline">
      {text}
    </a>
  );

  if (identifierPattern.test(value)) {
    return createLink(`${FE_URL}${value}`, value);
  } else if (urlPattern.test(value)) {
    const arkMatch = value.match(arkInUrlPattern);
    if (arkMatch) {
      const ark = arkMatch[0];
      return createLink(`${FE_URL}${ark}`, value);
    }
    return createLink(value, value);
  }
  return value;
};

const SimpleTableRowComponent = ({ property, value }) => {
  const renderValue = (val) => {
    if (Array.isArray(val)) {
      return (
        <ul className="list-disc pl-4 space-y-1">
          {val.map((item, index) => (
            <li key={index} className="break-words">
              {typeof item === "object" && item !== null ? (
                item["@id"] ? (
                  <LinkComponent value={item["@id"]} />
                ) : (
                  renderValue(item)
                )
              ) : (
                <LinkComponent value={item} />
              )}
            </li>
          ))}
        </ul>
      );
    } else if (typeof val === "object" && val !== null) {
      if (val["@id"]) {
        return <LinkComponent value={val["@id"]} />;
      }

      return (
        <ul className="list-disc pl-4 space-y-1">
          {Object.entries(val).map(([key, nestedVal], index) => (
            <li key={index} className="break-words">
              <strong>{key}: </strong>
              {typeof nestedVal === "object" && nestedVal !== null ? (
                renderValue(nestedVal)
              ) : (
                <LinkComponent value={nestedVal} />
              )}
            </li>
          ))}
        </ul>
      );
    }
    return val;
  };

  return (
    <tr>
      <td className="align-top px-4 py-2 border">{property}</td>
      <td className="px-4 py-2 border overflow-auto max-h-48">
        <div className="max-w-xl overflow-x-auto">
          {typeof value === "object" && value !== null ? (
            renderValue(value)
          ) : (
            <LinkComponent value={value} />
          )}
        </div>
      </td>
    </tr>
  );
};

export default SimpleTableRowComponent;

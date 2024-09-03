import * as $rdf from "rdflib";

const convertToRdfXml = (nquads) => {
  return new Promise((resolve, reject) => {
    console.log("Input N-Quads:", nquads);
    if (!nquads || nquads.trim() === "") {
      console.error("Empty N-Quads input");
      reject(new Error("Empty N-Quads input"));
      return;
    }

    const store = $rdf.graph();
    console.log("RDF Store created");

    $rdf.parse(
      nquads,
      store,
      "http://example.org/",
      "application/n-quads",
      (err) => {
        if (err) {
          console.error("Error parsing N-Quads:", err);
          reject(err);
        } else {
          console.log(
            "N-Quads parsed successfully. Store size:",
            store.statements.length
          );

          if (store.statements.length === 0) {
            console.warn("RDF Store is empty after parsing");
          }

          $rdf.serialize(
            null,
            store,
            "http://example.org/",
            "application/rdf+xml",
            (err, result) => {
              if (err) {
                console.error("Error serializing to RDF/XML:", err);
                reject(err);
              } else {
                console.log("RDF/XML serialization completed");
                if (!result || result.trim() === "") {
                  console.warn("Empty RDF/XML output");
                } else {
                  console.log(
                    "RDF/XML result (first 100 chars):",
                    result.substring(0, 100)
                  );
                }
                resolve(result);
              }
            }
          );
        }
      }
    );
  });
};

export default convertToRdfXml;

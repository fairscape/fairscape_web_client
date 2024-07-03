import React from "react";
import Header from "../components/header_footer/Header";
import "./HomePage.css";
import Footer from "../components/header_footer/Footer";

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <main className="main-content">
        <section className="hero">
          <h1 id="welcome-to-fairscape">Welcome to FAIRSCAPE</h1>
          <div className="content">
            <div className="description">
              <h2>Description</h2>
              <p>
                FAIRSCAPE
                <sup id="fnref:1">
                  <a className="footnote-ref" href="#fn:1">
                    1
                  </a>
                </sup>{" "}
                is a computational framework written in Python that implements
                the FAIR
                <sup id="fnref:2">
                  <a className="footnote-ref" href="#fn:2">
                    2
                  </a>
                </sup>{" "}
                data principles on components such as datasets, software,
                computations, runtime parameters, environment and personnel
                involved in a computational analysis. It generates fully FAIR
                evidence of correctness of the analysis by recording formal
                representations of the components and their interactions in the
                form of a graph called Evidence Graph. For every computational
                result, FAIRSCAPE creates a machine interpretable Evidence Graph
                whose nodes and edges may contain persistent identifiers with
                metadata resolvable to the underling components.
              </p>
              <p>
                FAIRSCAPE provides a command line client tool to package and
                validate the components with metadata, a schema generation and
                validation component for the datasets, and a REST API to perform
                various operations on the server-side.
              </p>
            </div>
            <div className="features">
              <h2>Key Features</h2>
              <ul className="feature-list">
                <li>
                  <strong>
                    <a href="https://fairscape.github.io/fairscape-cli/">
                      FAIRSCAPE CLI - A Validation and Packaging Command Line
                      Tool
                    </a>
                  </strong>
                  : A data validation and packaging utility for the FAIRSCAPE
                  ecosystem. Provides a command line interface that allows the
                  client side remote teams to create
                  <a href="https://www.researchobject.org/ro-crate/">
                    RO-Crate
                  </a>{" "}
                  and{" "}
                  <a href="https://datatracker.ietf.org/doc/html/rfc8493">
                    BagIt
                  </a>
                  .
                </li>
                <li>
                  <strong>
                    <a href="">Schema Validation</a>
                  </strong>
                  : ...
                </li>
                <li>
                  <strong>
                    <a href="https://fairscape.pods.uvarc.io/docs">
                      FAIRSCAPE REST docs UI
                    </a>
                  </strong>
                  : It is provided by{" "}
                  <a href="https://github.com/swagger-api/swagger-ui">
                    Swagger UI
                  </a>{" "}
                  and allows a client to use <code>Try it out</code> button to
                  run operations on the endpoints.
                </li>
                <li>
                  <strong>
                    <a href="https://fairscape.pods.uvarc.io/redoc">
                      FAIRSCAPE REST ReDoc UI
                    </a>
                  </strong>
                  : It is provided by{" "}
                  <a href="https://github.com/Redocly/redoc">ReDoc</a> offering
                  a three panel responsive layout containing a search bar on the
                  left, documentation in the middle, and request and response
                  examples on the right.
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section className="call-to-action">
          <h2>Get Started with Fairscape</h2>
          <p>
            Join the Fairscape community today and start making your scientific
            data FAIR. Explore our documentation to learn more about how to get
            started.
          </p>
          <a
            href="https://github.com/fairscape/fairscape"
            className="cta-button"
          >
            Visit our GitHub
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;

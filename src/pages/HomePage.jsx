import React, { useState } from "react";
import "./HomePage.css";

const HomePage = () => {
  const [expandedFeature, setExpandedFeature] = useState(null);

  const features = [
    {
      title: "FAIRSCAPE CLI",
      details:
        "A data validation and packaging utility for the FAIRSCAPE ecosystem. Provides a command line interface that allows the client side remote teams to create RO-Crate and BagIt.",
      link: "https://fairscape.github.io/fairscape-cli/",
    },
    {
      title: "FAIRSCAPE GUI Client",
      details:
        "The FAIRSCAPE Electron App provides a user-friendly interface for packaging research objects and validating metadata, making it easier than ever to ensure your research data is FAIR (Findable, Accessible, Interoperable, and Reusable).",
      link: "https://github.com/fairscape/FairscapeGUIClient/releases/tag/1.0",
    },
    {
      title: "FAIRSCAPE MDS",
      details:
        "The Metadata Service (MDS) of the FAIRSCAPE application, is the core backend service responsible for metadata managment. MDS is a RESTfull API implemented in python with the fastAPI framework. This service provides persitant globally unique identifiers (guids) as ARKS for many types of digital objects and maintains provenance metadata during the data science life-cycle.",
      link: "https://github.com/fairscape/mds_python",
    },
  ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Making Scientific Data FAIR</h1>
          <p className="hero-subtitle">
            Transform your research with our comprehensive framework that
            implements FAIR principles while tracking complete data provenance
            through Evidence Graphs.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">FAIR</span>
              <span className="stat-label">Best practices built-in</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">Evidence Graphs</span>
              <span className="stat-label">Complete provenance</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">Open Source</span>
              <span className="stat-label">Transparent & extensible</span>
            </div>
          </div>
        </div>
      </section>

      <main className="main-content">
        <div className="content-wrapper">
          <div className="left-column">
            <section className="overview-section">
              <h2>Framework Overview</h2>
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
            </section>
          </div>

          <div className="right-column">
            <section className="features-section">
              <h2>Key Features</h2>
              <div className="feature-list">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="feature-item"
                    onMouseEnter={() => setExpandedFeature(index)}
                    onMouseLeave={() => setExpandedFeature(null)}
                  >
                    <h3>
                      <a href={feature.link}>{feature.title}</a>
                    </h3>
                    <div
                      className={`feature-details ${
                        expandedFeature === index ? "expanded" : ""
                      }`}
                    >
                      {feature.details}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="cta-section">
          <h2>Get Started with Fairscape</h2>
          <p>
            Join the Fairscape community today and start making your scientific
            data FAIR. Explore our documentation to learn more about how to get
            started.
          </p>
          <a href="https://github.com/fairscape/" className="cta-button">
            Visit our GitHub
          </a>
        </section>
      </main>
    </div>
  );
};

export default HomePage;

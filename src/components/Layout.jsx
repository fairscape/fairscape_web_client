import React from "react";
import Header from "./header_footer/Header";
import Footer from "./header_footer/Footer";

const Layout = ({ children }) => {
  return (
    <div id="root">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;

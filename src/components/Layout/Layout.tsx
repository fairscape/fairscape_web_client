// src/components/Layout/Layout.tsx
import React from "react";
import styled from "styled-components";
import Header from "./Header";
import Footer from "./Footer";

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  padding: 1;
`;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LayoutWrapper>
    <Header />
    <MainContent>{children}</MainContent>
    <Footer />
  </LayoutWrapper>
);

export default Layout;

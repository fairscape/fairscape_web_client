import styled from "styled-components";

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  background: #f7f9f9;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
`;

export const OverallScoreBanner = styled.div`
  width: 100%;
  padding: 1rem 2rem;
  text-align: center;
  font-weight: 700;
  font-size: 1.8rem;
  color: white;
  background: #2c3e50;
  flex-shrink: 0;
`;

export const Body = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    overflow-y: auto;
  }
`;

export const LeftNav = styled.div`
  width: 260px;
  background: white;
  border-right: 1px solid #e1e4e8;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  overflow-y: auto;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    max-height: 240px;
    border-right: none;
    border-bottom: 1px solid #e1e4e8;
  }
`;

export const LeftNavList = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: stretch;
  height: 100%;
`;

export const CriteriaItem = styled.div<{
  $active: boolean;
  $accent: string;
  $bg: string;
  $complete: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 2px;
  background: ${(e) => e.$bg};
  border-left: 4px solid ${(e) => e.$accent};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${(e) => (e.$complete ? "none" : "inset 0 0 0 1px rgba(231,76,60,0.25)")};

  ${(e) =>
    e.$active &&
    `
    transform: translateX(4px);
  `}

  &:hover {
    transform: translateX(4px);
  }
`;

export const CriteriaStatus = styled.span<{ $complete: boolean }>`
  width: 22px;
  height: 22px;
  min-width: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  background: ${(e) => (e.$complete ? "#d4edda" : "#f8d7da")};
  color: ${(e) => (e.$complete ? "#155724" : "#721c24")};
`;

export const CriteriaText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;

export const CriteriaTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CriteriaScoreMini = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  font-weight: 600;
`;

export const RightPane = styled.div<{ $accent: string }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  background: white;
`;

export const PaneHeader = styled.div`
  margin-bottom: 24px;
`;

export const PaneTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

export const PaneTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

export const PaneScoreChip = styled.div`
  padding: 4px 12px;
  border-radius: 20px;
  border: 2px solid;
  font-weight: 700;
  font-size: 14px;
`;

export const PaneDescription = styled.p`
  color: #586069;
  line-height: 1.6;
  margin: 0;
`;

export const SectionTitle = styled.h3<{ $accent: string }>`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${(e) => e.$accent};
  border-bottom: 2px solid ${(e) => e.$accent}33;
  padding-bottom: 8px;
`;

export const SubCriteriaGrid = styled.div`
  display: grid;
  gap: 16px;
  padding-bottom: 8px;
`;

export const SubCriterionCard = styled.div<{ $accent: string }>`
  background: #fafbfc;
  border: 1px solid #e1e4e8;
  border-radius: 2px;
  padding: 16px;
  transition: box-shadow 0.15s ease;

  &:hover {
  }
`;

export const SubCriterionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SubCriterionName = styled.span`
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
`;

export const StatusChip = styled.span<{ $met: boolean }>`
  padding: 4px 8px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 600;
  background: ${(e) => (e.$met ? "#d4edda" : "#f8d7da")};
  color: ${(e) => (e.$met ? "#155724" : "#721c24")};
`;

export const InfoIcon = styled.span`
  position: relative;
  cursor: help;
  color: #586069;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f7f9f9;

  &:hover > div,
  &:focus > div {
    visibility: visible;
    opacity: 1;
  }
`;

export const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 1000;
`;

export const TooltipInner = styled.div`
  background: #2c3e50;
  color: white;
  padding: 12px;
  border-radius: 2px;
  width: 300px;
  font-size: 12px;
  line-height: 1.5;

  strong {
    display: block;
    margin-top: 8px;
  }

  div {
    margin-top: 4px;
  }
`;

export const ViewSwitch = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
`;

export const View = styled.div<{ $visible: boolean }>`
  display: ${(e) => (e.$visible ? "block" : "none")};
  height: 100%;
`;

export const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const SummaryTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
`;

export const SummaryGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  padding-bottom: 8px;
`;

export const SummaryCard = styled.div<{
  $accent: string;
  $complete: boolean;
}>`
  border: 1px solid #e1e4e8;
  border-radius: 2px;
  background: #fafbfc;
  padding: 16px;
  transition:
    box-shadow 0.18s ease,
    transform 0.18s ease,
    border-color 0.18s ease;
  cursor: pointer;
  border-top: 4px solid ${(e) => e.$accent};
  box-shadow: ${(e) => (e.$complete ? "none" : "inset 0 0 0 1px rgba(231,76,60,0.18)")};

  &:hover {
    border-color: ${(e) => e.$accent};
  }
`;

export const SummaryCardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

export const SummaryCardTitle = styled.div`
  font-weight: 700;
  color: #2c3e50;
  font-size: 16px;
  flex: 1;
`;

export const SummaryScoreChip = styled.div<{ $accent: string }>`
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  border: 2px solid ${(e) => e.$accent};
  color: ${(e) => e.$accent};
`;

export const MiniList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
`;

export const MiniItem = styled.li<{ $met: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  background: ${(e) => (e.$met ? "#eef8f0" : "#fff0f0")};
  color: ${(e) => (e.$met ? "#155724" : "#721c24")};
  padding: 8px 10px;
  border-radius: 2px;
`;

export const MiniIcon = styled.span<{ $met: boolean }>`
  width: 18px;
  height: 18px;
  min-width: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  background: ${(e) => (e.$met ? "#d4edda" : "#f8d7da")};
  color: ${(e) => (e.$met ? "#155724" : "#721c24")};
`;

export const BackLink = styled.button`
  border: none;
  background: transparent;
  color: #3498db;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;

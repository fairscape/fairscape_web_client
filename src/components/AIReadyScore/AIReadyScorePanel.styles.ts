import styled from "styled-components";

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #f8f9fa;
  position: relative;
`;

export const OverallScoreBanner = styled.div`
  width: 100%;
  padding: 1rem 2rem;
  text-align: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: white;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary} 0%,
    ${({ theme }) => theme.colors.secondary} 100%
  );
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

export const Body = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export const LeftNav = styled.div`
  width: 240px;
  background: white;
  border-right: 1px solid #e1e4e8;
  padding: 16px;
  overflow-y: auto;
`;

export const CriteriaItem = styled.div<{
  $active: boolean;
  $accent: string;
  $bg: string;
}>`
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: ${(props) => props.$bg};
  border-left: 3px solid ${(props) => props.$accent};
  cursor: pointer;
  transition: all 0.2s ease;

  ${(props) =>
    props.$active &&
    `
    background: ${props.$bg};
    transform: translateX(4px);
  `}

  &:hover {
    transform: translateX(4px);
  }
`;

export const CriteriaTitle = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 4px;
`;

export const CriteriaScoreMini = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  font-weight: 600;
`;

export const RightPane = styled.div<{ $accent: string }>`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
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
  font-weight: 600;
  margin: 0;
`;

export const PaneScoreChip = styled.div`
  padding: 4px 12px;
  border-radius: 20px;
  border: 2px solid;
  font-weight: 600;
  font-size: 14px;
`;

export const PaneDescription = styled.p`
  color: #586069;
  line-height: 1.6;
  margin: 0;
`;

export const SectionTitle = styled.h3<{ $accent: string }>`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: ${(props) => props.$accent};
  border-bottom: 2px solid ${(props) => props.$accent}33;
  padding-bottom: 8px;
`;

export const SubCriteriaGrid = styled.div`
  display: grid;
  gap: 16px;
`;

export const SubCriterionCard = styled.div<{ $accent: string }>`
  background: #fafbfc;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  padding: 16px;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const SubCriterionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SubCriterionName = styled.span`
  font-weight: 500;
  color: #2c3e50;
  flex: 1;
`;

export const StatusChip = styled.span<{ $met: boolean }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) => (props.$met ? "#d4edda" : "#f8d7da")};
  color: ${(props) => (props.$met ? "#155724" : "#721c24")};
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
  background: #f0f0f0;

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
  border-radius: 6px;
  width: 300px;
  font-size: 12px;
  line-height: 1.5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  strong {
    display: block;
    margin-top: 8px;
    &:first-child {
      margin-top: 0;
    }
  }

  div {
    margin-top: 4px;
  }
`;

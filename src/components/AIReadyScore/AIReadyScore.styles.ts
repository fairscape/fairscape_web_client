import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

export const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
`;

export const WheelContainer = styled.div`
  position: relative;
  width: min(80vh, 80vw);
  height: min(80vh, 80vw);
  max-width: 600px;
  max-height: 600px;
  aspect-ratio: 1;
`;

export const SVGWheel = styled.svg`
  width: 100%;
  height: 100%;
  cursor: pointer;
  overflow: visible;
`;

export const Segment = styled.g`
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    transform-origin: center;
  }
`;

export const SegmentPath = styled.path`
  stroke: white;
  stroke-width: 3;
  transition: all 0.3s ease;
`;

export const SegmentText = styled.text`
  font-family: "Arial", sans-serif;
  font-weight: 600;
  font-size: 14px;
  text-anchor: middle;
  dominant-baseline: middle;
  fill: white;
  pointer-events: none;
`;

export const CenterCircle = styled.circle`
  fill: white;
  stroke: #34495e;
  stroke-width: 4;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
`;

export const CenterContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 45%;
  height: 45%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1rem;
  border-radius: 50%;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export const CenterTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

export const CenterDescription = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
`;

export const DetailPanel = styled.div`
  margin-top: 2rem;
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
`;

export const DetailTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
`;

export const DetailDescription = styled.p`
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

export const MetadataGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
`;

export const MetadataItem = styled.div<{ color?: string }>`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid ${(props) => props.color || "#3498db"};
`;

export const MetadataLabel = styled.h4`
  color: #2c3e50;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

export const MetadataValue = styled.p`
  color: #34495e;
  line-height: 1.5;
  margin: 0;

  a {
    color: #3498db;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

export const LoadingMessage = styled.p`
  margin-top: 10px;
  color: #666;
  text-align: center;
`;

export const ErrorContainer = styled.div`
  padding: 20px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c00;
  text-align: center;
`;

export const TotalScoreDisplay = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

export const TotalScoreLabel = styled.h2`
  color: #2c3e50;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

export const TotalScoreValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #27ae60;
`;

export const TotalScorePercent = styled.div`
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-top: 0.5rem;
`;

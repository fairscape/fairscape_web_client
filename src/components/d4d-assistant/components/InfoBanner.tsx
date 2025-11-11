// src/components/d4d-assistant/components/InfoBanner.tsx
import React from "react";
import { FiInfo, FiAlertCircle } from "react-icons/fi";
import {
  InfoBanner as StyledInfoBanner,
  InfoBannerIcon,
  InfoBannerContent,
  InfoBannerTitle,
  InfoBannerText,
  InfoBannerList,
  InfoBannerWarning,
  AIInteractionBanner,
  AIBannerIcon,
  AIBannerContent,
  AIBannerTitle,
  AIBannerText,
  AIBannerSection,
  AIBannerSectionTitle,
  AIBannerList,
  AIBannerLink,
} from "../styles/D4DAssistant.styles";

export const CreateInfoBanner: React.FC = () => {
  return (
    <StyledInfoBanner>
      <InfoBannerIcon>
        <FiInfo size={24} />
      </InfoBannerIcon>
      <InfoBannerContent>
        <InfoBannerTitle>🤖 AI-Powered D4D Creation</InfoBannerTitle>
        <InfoBannerText>
          This form uses an AI assistant (@d4dassistant) to automatically create
          a Datasheet for Datasets (D4D) from your documentation. The AI will:
        </InfoBannerText>
        <InfoBannerList>
          <li>Analyze your uploaded files and URLs</li>
          <li>
            Extract relevant metadata about data collection, ethics, and use
            cases
          </li>
          <li>Generate a comprehensive D4D datasheet in YAML format</li>
          <li>Allow you to refine the output through comments</li>
        </InfoBannerList>
        <InfoBannerWarning>
          <FiAlertCircle size={16} />
          <span>
            <strong>Important:</strong> All materials you provide will be
            PUBLIC. Only upload documents you're authorized to share publicly.
          </span>
        </InfoBannerWarning>
      </InfoBannerContent>
    </StyledInfoBanner>
  );
};

export const DetailInfoBanner: React.FC = () => {
  return (
    <AIInteractionBanner>
      <AIBannerIcon>
        <FiInfo size={24} />
      </AIBannerIcon>
      <AIBannerContent>
        <AIBannerTitle>🤖 Interacting with AI Assistant</AIBannerTitle>
        <AIBannerText>
          You're reviewing a <strong>D4D (Datasheet for Datasets)</strong>{" "}
          created by @d4dassistant. This is a comprehensive metadata document
          describing your dataset.
        </AIBannerText>
        <AIBannerSection>
          <AIBannerSectionTitle>
            To request changes or additions:
          </AIBannerSectionTitle>
          <AIBannerList>
            <li>
              <strong>Just comment</strong> what you want adjusted below
            </li>
            <li>
              <strong>Be specific:</strong> "Add instance count of 5000 to the
              composition section"
            </li>
            <li>
              <strong>The AI will respond</strong> and update the D4D datasheet
            </li>
            <li>
              <strong>Keep refining</strong> until you're satisfied with the
              result
            </li>
          </AIBannerList>
        </AIBannerSection>
        <AIBannerSection>
          <AIBannerSectionTitle>When you're finished:</AIBannerSectionTitle>
          <AIBannerText>
            Click <strong>"Review Created D4D"</strong> below to finalize your
            datasheet and complete the AI interaction. The D4D will be available
            in FAIRSCAPE for final review.
          </AIBannerText>
        </AIBannerSection>
        <AIBannerLink href="#" onClick={(e) => e.preventDefault()}>
          What is a D4D? Learn more →
        </AIBannerLink>
      </AIBannerContent>
    </AIInteractionBanner>
  );
};

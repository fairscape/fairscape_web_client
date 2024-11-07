import styled from "styled-components";
import { ExternalLink, ArrowUpRight } from "lucide-react";

export const StyledForm = styled.form`
  background-color: #1a2238; // Changed from #282828
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

export const FormTitle = styled.h2`
  color: #ffffff;
  margin-bottom: 30px;
  text-align: center;
  font-size: 1.75rem;
  font-weight: bold;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  color: #ffffff;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
  font-size: 0.875rem;
`;

export const Input = styled.input`
  background-color: #2a3552; // Changed from #3e3e3e
  border: 1px solid #3f4c73; // Changed from #555
  color: #ffffff;
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  &:focus {
    background-color: #2a3552; // Changed from #3e3e3e
    color: #ffffff;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    outline: none;
  }
  &::placeholder {
    color: #a0aec0;
  }
`;

export const TextArea = styled.textarea`
  background-color: #2a3552; // Changed from #3e3e3e
  border: 1px solid #3f4c73; // Changed from #555
  color: #ffffff;
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  min-height: 100px;
  resize: vertical;
  font-size: 0.875rem;
  &:focus {
    background-color: #2a3552; // Changed from #3e3e3e
    color: #ffffff;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    outline: none;
  }
  &::placeholder {
    color: #a0aec0;
  }
`;

export const Button = styled.button`
  background-color: #007bff;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.875rem;
  &:hover {
    background-color: #0056b3;
  }
  &:disabled {
    background-color: #2a3552; // Changed from #4a5568
    cursor: not-allowed;
  }
  &:not(:last-child) {
    margin-right: 10px;
  }
`;

export const Alert = styled.div`
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  ${({ type }) =>
    type === "error"
      ? `
    background-color: #2D1C2E;  // Changed from #2D2223
    border-left: 4px solid #DC2626;
    color: #FCA5A5;
    `
      : `
    background-color: #1a2238;  // Changed from #1F2937
    border-left: 4px solid #059669;
    color: #6EE7B7;
    `}
`;

export const LinkContainer = styled.div`
  background: #1e40af; /* Darker blue background */
  background: linear-gradient(
    135deg,
    #3b82f6,
    #1d4ed8
  ); /* Gradient from blue-500 to blue-700 */
  border-radius: 9999px;
  padding: 1.5rem 2rem;
  margin: 2rem auto 0;
  width: fit-content;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

export const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 500;
  transition: all 200ms ease-in-out;

  &:hover {
    color: #bfdbfe; /* blue-200 for a subtle hover effect */
    transform: translateY(-1px);
  }
`;

export const DatasetLink = ({ url }) => (
  <LinkContainer>
    <div className="text-white text-sm">Your dataset is ready to view</div>
    <LinkButton href={url} target="_blank" rel="noopener noreferrer">
      <span>View Dataset in Dataverse</span>
      <ArrowUpRight className="h-5 w-5" />
    </LinkButton>
  </LinkContainer>
);

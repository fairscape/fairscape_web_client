import React, { useState, useRef, useEffect } from "react";
import styled, { ThemeProvider } from "styled-components";
import {
  FiDownload,
  FiEye,
  FiEyeOff,
  FiUpload,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";

// --- Theme and Interfaces (Expanded FormData) ---
const theme = {
  spacing: { sm: "8px", md: "16px", lg: "24px", xl: "32px" },
  borderRadius: "4px",
  colors: { primary: "#3e7aa8" },
};

interface FormData {
  name: string;
  id_value: string;
  organizationName: string;
  projectName: string;
  version: string;
  doi: string;
  description: string;
  keywords: string; // Store as comma-separated string for uncontrolled input
  associatedPublication: string; // Store as comma-separated string
  citation: string;
  usageInfo: string;
  funder: string;
  author: string;
  principal_investigator: string;
  contact_email: string;
  publisher: string;
  release_date: string;
  license_value: string;
  conditionsOfAccess: string;
  copyrightNotice: string;
  content_size: string;
  completeness: string;
  intended_uses: string;
  prohibited_uses: string;
  limitations: string;
  potential_sources_of_bias: string;
  confidentiality_level: string;
  human_subject: string;
  ethicalReview: string;
  maintenance_plan: string;
  additionalProperties: string;
  customProperties: string;
}

// Use Partial for initial values as not all might be pre-filled
type InitialFormValues = Partial<FormData>;

interface UploadedCrateInfo {
  fileName: string;
  parsedJson: any;
  rootNodeId?: string;
  rootNode?: any;
}

// Modified InputField props for uncontrolled components
interface InputFieldProps {
  label: string;
  field: keyof FormData;
  placeholder: string;
  defaultValue: string; // Use defaultValue
  multiline?: boolean;
  type?: "text" | "date" | "url" | "email";
  isJson?: boolean;
}

interface PreviewFieldProps {
  label: string;
  value?: string | string[]; // Preview can still handle arrays if needed downstream
  placeholder: string;
  isJson?: boolean;
}

// --- Styled Components (Unchanged from previous version) ---
const FormContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  font-family: sans-serif;
`;
const StepContainer = styled.div`
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 30px;
  background-color: #f9f9f9;
`;
const StepTitle = styled.h2`
  margin-top: 0;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: 20px;
`;
const SummarySection = styled.div`
  background-color: white;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  border: 1px solid #eee;
`;
const SectionTitle = styled.h2`
  font-size: 22px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;
const SummaryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid #e8e8e8;
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;
const SummaryLabel = styled.label`
  width: 240px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  padding-right: ${({ theme }) => theme.spacing.md};
  flex-shrink: 0;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;
const SummaryValue = styled.div`
  flex: 1;
  min-width: 250px;
`;
const StyledInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  box-sizing: border-box;
  &::placeholder {
    color: #aaa;
    font-style: italic;
  }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(62, 122, 168, 0.2);
  }
`;
const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 100px;
  font-size: 14px;
  background-color: white;
  font-family: sans-serif;
  box-sizing: border-box;
  &::placeholder {
    color: #aaa;
    font-style: italic;
  }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(62, 122, 168, 0.2);
  }
`;
const JsonHint = styled.small`
  display: block;
  margin-top: 4px;
  color: #555;
  font-style: italic;
  font-size: 0.8em;
`;
const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  margin-bottom: 40px;
`;
const BaseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s, opacity 0.2s;
  font-size: 14px;
  &:hover {
    opacity: 0.9;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  &:active {
    opacity: 1;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.7;
    box-shadow: none;
  }
`;
const DownloadButton = styled(BaseButton)`
  background-color: #1e64a6;
  &:hover:not(:disabled) {
    background-color: #13517a;
  }
`;
const PreviewButton = styled(BaseButton)`
  background-color: #4a566e;
  &:hover:not(:disabled) {
    background-color: #394053;
  }
`;
const UploadButton = styled(BaseButton)`
  background-color: #28a745;
  &:hover:not(:disabled) {
    background-color: #218838;
  }
`;
const NextButton = styled(BaseButton)`
  background-color: #ff8c00;
  &:hover:not(:disabled) {
    background-color: #cc7000;
  }
`;
const BackButton = styled(BaseButton)`
  background-color: #6c757d;
  &:hover:not(:disabled) {
    background-color: #5a6268;
  }
`;
const FileInput = styled.input`
  display: none;
`;
const PreviewContainer = styled.div`
  margin-top: 30px;
  border-top: 2px solid #3e7aa8;
  padding-top: 20px;
  background-color: #f9f9f9;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 4px;
`;
const PreviewTitle = styled.h2`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;
const PreviewSection = styled.div`
  background-color: white;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee;
`;
const PreviewSectionTitle = styled.h3`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid #eee;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;
const PreviewRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;
const PreviewLabel = styled.div`
  width: 240px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  padding-right: ${({ theme }) => theme.spacing.md};
  flex-shrink: 0;
  margin-bottom: 4px;
`;
const PreviewValue = styled.div`
  flex: 1;
  min-width: 250px;
  white-space: pre-wrap;
  word-break: break-word;
`;
const UploadedFilesContainer = styled.div`
  margin-top: 20px;
  margin-bottom: 30px;
  background-color: #eaf3fa;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid #c1d9ed;
`;
const UploadedFileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;
  background-color: transparent;
  border-radius: 0;
  margin-bottom: 5px;
  border-bottom: 1px dashed #b0cce0;
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;
const UploadedFileName = styled.div`
  flex: 1;
  font-weight: normal;
  margin-left: 10px;
  font-size: 0.9em;
  color: #333;
`;

// --- Component Implementation ---

const ReleaseForm = () => {
  const formRef = useRef<HTMLFormElement>(null); // Ref for the uncontrolled form
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Partial<FormData>>({}); // For displaying preview
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedCrates, setUploadedCrates] = useState<UploadedCrateInfo[]>([]);
  const [currentStep, setCurrentStep] = useState<"upload" | "edit">("upload");
  // State to hold the aggregated values to be used as defaultValues
  const [initialFormValues, setInitialFormValues] = useState<InitialFormValues>(
    {
      // Set initial defaults for uncontrolled form fields here
      version: "1.0",
      release_date: new Date().toISOString().split("T")[0],
      license_value: "https://creativecommons.org/licenses/by/4.0/",
      conditionsOfAccess: "Open Access",
      additionalProperties: "[]",
      customProperties: "{}",
      keywords: "", // Initialize string fields
      associatedPublication: "",
      // ... other fields default to empty string via || '' in InputField
    }
  );
  // State to force form re-mount when initial values change
  const [formKey, setFormKey] = useState<number>(Date.now());

  const placeholders: Record<keyof FormData, string> = {
    name: "Aggregated Dataset Name (e.g., Cell Maps AI Release 1)",
    description: "Overall description of the data release...",
    id_value:
      "Leave blank to auto-generate (e.g., ark:59852/...) or enter specific GUID",
    principal_investigator: "Primary contact or lead researcher",
    contact_email: "public-contact@example.org",
    version: "1.0",
    release_date: "YYYY-MM-DD",
    content_size: "Total size (e.g., 15.2 GB)",
    license_value: "https://creativecommons.org/licenses/by/4.0/",
    confidentiality_level: "e.g., HL7 Unrestricted, Public",
    human_subject: "e.g., No, Yes (IRB #12345)",
    intended_uses: "Primary research goals, applications...",
    prohibited_uses:
      "Restrictions (e.g., clinical diagnosis, commercial resale)",
    maintenance_plan: "Update frequency, versioning strategy...",
    limitations: "Known issues, scope boundaries...",
    potential_sources_of_bias:
      "e.g., Sample selection, experimental artifacts...",
    organizationName: "Your Institution or Organization Name",
    projectName: "Specific Project Name (e.g., CM4AI)",
    keywords: "Comma-separated keywords (e.g., genomics, proteomics, AI)",
    author: "List of authors or contributors",
    associatedPublication:
      "Comma-separated DOIs or citations (e.g., 10.1000/xyz123)",
    conditionsOfAccess: "e.g., Open Access, Embargoed until YYYY-MM-DD",
    copyrightNotice: "e.g., © 2024 University of Example",
    doi: "Optional DOI for this release (e.g., 10.5072/abc.123)",
    publisher: "Entity publishing this release",
    citation: "Preferred citation format",
    funder: "Funding agencies or grants",
    usageInfo: "Instructions, prerequisites...",
    completeness: "Statement on data completeness",
    ethicalReview: "Details on ethical approvals...",
    additionalProperties: `JSON array of PropertyValue objects, e.g., [{"@type": "PV", "name": "F", "value": "V"}]`,
    customProperties: `JSON object for direct merge, e.g., {"myNs:myTerm": "value"}`,
  };

  // Removed handleInputChange - not needed for uncontrolled form

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const newCrates: UploadedCrateInfo[] = [];
    const promises = Array.from(files).map((file) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const json = JSON.parse(content);
            if (
              !json["@context"] ||
              !json["@graph"] ||
              !Array.isArray(json["@graph"])
            ) {
              console.warn(`Skipping ${file.name}: Invalid structure.`);
              resolve();
              return;
            }
            const rootNode =
              json["@graph"].find(
                (node: any) =>
                  node["@id"] !== "./" &&
                  node["@id"] !== "ro-crate-metadata.json" &&
                  (node["@type"]?.includes("Dataset") ||
                    node["@type"]?.includes("https://w3id.org/EVI#ROCrate"))
              ) || json["@graph"][1];
            if (!rootNode) {
              console.warn(`Skipping ${file.name}: No root node.`);
              resolve();
              return;
            }
            newCrates.push({
              fileName: file.name,
              parsedJson: json,
              rootNodeId: rootNode["@id"],
              rootNode: rootNode,
            });
            resolve();
          } catch (error) {
            console.error(`Error parsing ${file.name}:`, error);
            resolve();
          }
        };
        reader.onerror = (error) => {
          console.error(`Error reading ${file.name}:`, error);
          resolve();
        };
        reader.readAsText(file);
      });
    });

    Promise.all(promises)
      .then(() => {
        if (newCrates.length > 0) {
          const allCrates = [...uploadedCrates, ...newCrates];
          setUploadedCrates(allCrates);
          updateInitialValuesFromCrates(allCrates); // Call function to update initial values
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
      })
      .catch((error) => {
        console.error("Error processing uploaded files:", error);
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  };

  // Function to aggregate data and update the initialFormValues state
  const updateInitialValuesFromCrates = (crates: UploadedCrateInfo[]) => {
    if (crates.length === 0) return;

    // Start with current initial values to preserve defaults or previous uploads
    let aggregatedValues: InitialFormValues = { ...initialFormValues };

    // Use Sets for unique aggregation where applicable (will join later for defaultValue)
    const aggregatedKeywords = new Set<string>(
      aggregatedValues.keywords
        ?.split(",")
        .map((k) => k.trim())
        .filter(Boolean) ?? []
    );
    const aggregatedAuthors = new Set<string>(
      aggregatedValues.author
        ?.split(",")
        .map((a) => a.trim())
        .filter(Boolean) ?? []
    );
    const aggregatedPublications = new Set<string>(
      aggregatedValues.associatedPublication
        ?.split(",")
        .map((p) => p.trim())
        .filter(Boolean) ?? []
    );

    crates.forEach((crate) => {
      const root = crate.rootNode;
      if (!root) return;
      // Simple fields: Overwrite if empty or take first non-empty found
      if (!aggregatedValues.name && root.name)
        aggregatedValues.name = root.name;
      if (!aggregatedValues.description && root.description)
        aggregatedValues.description = root.description;
      if (!aggregatedValues.version && root.version)
        aggregatedValues.version = root.version;
      if (!aggregatedValues.license_value && root.license)
        aggregatedValues.license_value = root.license;
      if (!aggregatedValues.release_date && root.datePublished)
        aggregatedValues.release_date = root.datePublished.split("T")[0];
      if (!aggregatedValues.content_size && root.contentSize)
        aggregatedValues.content_size = root.contentSize;
      if (!aggregatedValues.contact_email && root.contactEmail)
        aggregatedValues.contact_email = root.contactEmail;
      if (!aggregatedValues.publisher && root.publisher?.name)
        aggregatedValues.publisher = root.publisher.name;
      if (!aggregatedValues.publisher && typeof root.publisher === "string")
        aggregatedValues.publisher = root.publisher;
      if (!aggregatedValues.funder && root.funder?.name)
        aggregatedValues.funder = root.funder.name;
      if (!aggregatedValues.funder && typeof root.funder === "string")
        aggregatedValues.funder = root.funder;
      if (!aggregatedValues.doi && root.identifier) {
        if (
          typeof root.identifier === "string" &&
          (root.identifier.startsWith("10.") ||
            root.identifier.includes("doi.org"))
        )
          aggregatedValues.doi = root.identifier;
        else if (Array.isArray(root.identifier)) {
          const doi = root.identifier.find(
            (id: string) =>
              typeof id === "string" &&
              (id.startsWith("10.") || id.includes("doi.org"))
          );
          if (doi) aggregatedValues.doi = doi;
        }
      }

      // Aggregate keywords, authors, publications using Sets
      if (root.keywords)
        (Array.isArray(root.keywords)
          ? root.keywords
          : [root.keywords]
        ).forEach((kw: string) => kw && aggregatedKeywords.add(kw.trim()));
      if (root.author)
        (Array.isArray(root.author) ? root.author : [root.author]).forEach(
          (auth: any) => {
            if (typeof auth === "string") aggregatedAuthors.add(auth.trim());
            else if (typeof auth === "object" && auth.name)
              aggregatedAuthors.add(auth.name.trim());
          }
        );
      if (root.associatedPublication)
        (Array.isArray(root.associatedPublication)
          ? root.associatedPublication
          : [root.associatedPublication]
        ).forEach((pub: any) => {
          if (typeof pub === "string") aggregatedPublications.add(pub.trim());
          else if (typeof pub === "object" && pub["@id"])
            aggregatedPublications.add(pub["@id"].trim());
          else if (typeof pub === "object" && pub.name)
            aggregatedPublications.add(pub.name.trim());
        });
      if (
        !aggregatedValues.principal_investigator &&
        root.principalInvestigator?.name
      )
        aggregatedValues.principal_investigator =
          root.principalInvestigator.name;
      if (
        !aggregatedValues.principal_investigator &&
        typeof root.principalInvestigator === "string"
      )
        aggregatedValues.principal_investigator = root.principalInvestigator;

      // Extract PropertyValues
      if (root.additionalProperty && Array.isArray(root.additionalProperty)) {
        root.additionalProperty.forEach((prop: any) => {
          if (prop["@type"] === "PropertyValue" && prop.name && prop.value) {
            if (prop.name === "Intended Use" && !aggregatedValues.intended_uses)
              aggregatedValues.intended_uses = prop.value;
            if (
              prop.name === "Prohibited Uses" &&
              !aggregatedValues.prohibited_uses
            )
              aggregatedValues.prohibited_uses = prop.value;
            if (
              prop.name === "Maintenance Plan" &&
              !aggregatedValues.maintenance_plan
            )
              aggregatedValues.maintenance_plan = prop.value;
            if (prop.name === "Limitations" && !aggregatedValues.limitations)
              aggregatedValues.limitations = prop.value;
            if (
              prop.name === "Potential Sources of Bias" &&
              !aggregatedValues.potential_sources_of_bias
            )
              aggregatedValues.potential_sources_of_bias = prop.value;
            if (
              prop.name === "Human Subject" &&
              !aggregatedValues.human_subject
            )
              aggregatedValues.human_subject = prop.value;
            if (prop.name === "Completeness" && !aggregatedValues.completeness)
              aggregatedValues.completeness = prop.value;
            // Add others here
          }
        });
      }
    });

    // Convert Sets back to comma-separated strings for defaultValue
    aggregatedValues.keywords = Array.from(aggregatedKeywords).join(", ");
    const finalAuthorString = Array.from(aggregatedAuthors).join(", ");
    aggregatedValues.author =
      finalAuthorString || aggregatedValues.principal_investigator || ""; // Use PI if author empty
    if (!aggregatedValues.principal_investigator && finalAuthorString) {
      // Guess PI from first author if PI empty
      aggregatedValues.principal_investigator = finalAuthorString
        .split(",")[0]
        .trim();
    }
    aggregatedValues.associatedPublication = Array.from(
      aggregatedPublications
    ).join(", ");

    // Generate Release Crate ID if needed
    const releaseId =
      aggregatedValues.id_value || `ark:59852/release-crate-${Date.now()}`;
    aggregatedValues.id_value = releaseId;

    // Update the state that holds the initial values
    setInitialFormValues(aggregatedValues);
    // Update the form key to force re-mount in Step 2
    setFormKey(Date.now());
  };

  // Function to read form data using FormData API
  const readFormData = (): Partial<FormData> => {
    if (!formRef.current) return {};
    const formData = new FormData(formRef.current);
    const data: Partial<FormData> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        // We store keywords/pubs as comma-separated strings in the input
        data[key as keyof FormData] = value;
      }
    }
    return data;
  };

  // Function to generate the final JSON from form data
  const generateJson = () => {
    const data = readFormData(); // Read current values from the form

    // Default values for potentially empty fields read from the form
    const finalData: Partial<FormData> = {
      ...initialFormValues, // Start with initial defaults/uploads
      ...data, // Override with current form values
    };

    // Ensure critical fields have defaults if STILL empty
    if (!finalData.name) finalData.name = "Untitled Data Release";
    if (!finalData.description)
      finalData.description = "No description provided.";
    finalData.id_value =
      finalData.id_value || `ark:59852/release-crate-${Date.now()}`;
    finalData.release_date =
      finalData.release_date || new Date().toISOString().split("T")[0];
    finalData.license_value =
      finalData.license_value || "https://creativecommons.org/licenses/by/4.0/";

    // Split comma-separated strings back into arrays for JSON
    const keywordsArray = finalData.keywords
      ? finalData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : [];
    const associatedPublicationArray = finalData.associatedPublication
      ? finalData.associatedPublication
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      : [];
    const authorsArray = finalData.author
      ? finalData.author
          .split(",")
          .map((a) => ({ "@type": "Person", name: a.trim() }))
      : undefined;

    const additionalProperties = [];
    if (finalData.intended_uses)
      additionalProperties.push({
        "@type": "PropertyValue",
        name: "Intended Use",
        value: finalData.intended_uses,
      });
    if (finalData.prohibited_uses)
      additionalProperties.push({
        "@type": "PropertyValue",
        name: "Prohibited Uses",
        value: finalData.prohibited_uses,
      });
    if (finalData.maintenance_plan)
      additionalProperties.push({
        "@type": "PropertyValue",
        name: "Maintenance Plan",
        value: finalData.maintenance_plan,
      });
    if (finalData.limitations)
      additionalProperties.push({
        "@type": "PropertyValue",
        name: "Limitations",
        value: finalData.limitations,
      });
    if (finalData.potential_sources_of_bias)
      additionalProperties.push({
        "@type": "PropertyValue",
        name: "Potential Sources of Bias",
        value: finalData.potential_sources_of_bias,
      });
    if (finalData.human_subject)
      additionalProperties.push({
        "@type": "PropertyValue",
        name: "Human Subject",
        value: finalData.human_subject,
      });
    if (finalData.completeness)
      additionalProperties.push({
        "@type": "PropertyValue",
        name: "Completeness",
        value: finalData.completeness,
      });

    try {
      const userAddProps = JSON.parse(finalData.additionalProperties || "[]");
      if (Array.isArray(userAddProps))
        additionalProperties.push(...userAddProps);
      else console.warn("additionalProperties not valid JSON array.");
    } catch (e) {
      console.warn("Error parsing additionalProperties JSON:", e);
    }
    let customProps = {};
    try {
      const userCustomProps = JSON.parse(finalData.customProperties || "{}");
      if (
        typeof userCustomProps === "object" &&
        userCustomProps !== null &&
        !Array.isArray(userCustomProps)
      )
        customProps = userCustomProps;
      else console.warn("customProperties not valid JSON object.");
    } catch (e) {
      console.warn("Error parsing customProperties JSON:", e);
    }

    const releaseRootNode: any = {
      "@id": finalData.id_value,
      "@type": ["Dataset", "https://w3id.org/EVI#ROCrate"],
      name: finalData.name,
      description: finalData.description,
      version: finalData.version,
      datePublished: finalData.release_date,
      license: finalData.license_value,
      keywords: keywordsArray.length > 0 ? keywordsArray : undefined,
      author: authorsArray,
      principalInvestigator: finalData.principal_investigator
        ? { "@type": "Person", name: finalData.principal_investigator }
        : undefined,
      contactPoint: finalData.contact_email
        ? {
            "@type": "ContactPoint",
            email: finalData.contact_email,
            contactType: "Contact",
          }
        : undefined,
      publisher: finalData.publisher
        ? { "@type": "Organization", name: finalData.publisher }
        : undefined,
      identifier: finalData.doi ? finalData.doi : undefined,
      organizationName: finalData.organizationName || undefined,
      projectName: finalData.projectName || undefined,
      associatedPublication:
        associatedPublicationArray.length > 0
          ? associatedPublicationArray
          : undefined,
      conditionsOfAccess: finalData.conditionsOfAccess || undefined,
      copyrightNotice: finalData.copyrightNotice || undefined,
      citation: finalData.citation || undefined,
      funder: finalData.funder
        ? { "@type": "Organization", name: finalData.funder }
        : undefined,
      usageInfo: finalData.usageInfo || undefined,
      contentSize: finalData.content_size || undefined,
      confidentialityLevel: finalData.confidentiality_level || undefined,
      ethicalReview: finalData.ethicalReview || undefined,
      additionalProperty:
        additionalProperties.length > 0 ? additionalProperties : undefined,
      hasPart: uploadedCrates
        .map((crate) => (crate.rootNodeId ? { "@id": crate.rootNodeId } : null))
        .filter((part) => part !== null),
      ...customProps,
    };
    Object.keys(releaseRootNode).forEach(
      (key) => releaseRootNode[key] === undefined && delete releaseRootNode[key]
    );

    const roCrateJson = {
      "@context": ["https://w3id.org/ro/crate/1.2-DRAFT/context", {}],
      "@graph": [
        {
          "@id": "ro-crate-metadata.json",
          "@type": "CreativeWork",
          conformsTo: { "@id": "https://w3id.org/ro/crate/1.2-DRAFT" },
          about: { "@id": releaseRootNode["@id"] },
        },
        releaseRootNode,
      ],
    };
    return JSON.stringify(roCrateJson, null, 2);
  };

  const downloadJson = () => {
    const jsonString = generateJson();
    const blob = new Blob([jsonString], { type: "application/ld+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ro-crate-metadata.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const togglePreview = () => {
    if (!showPreview) {
      setPreviewData(readFormData()); // Read current form values for preview
    }
    setShowPreview(!showPreview);
  };
  const triggerFileUpload = () => fileInputRef.current?.click();
  const goToEditStep = () => setCurrentStep("edit");
  const goToUploadStep = () => setCurrentStep("upload");

  // Uncontrolled InputField Component
  const InputField: React.FC<InputFieldProps> = ({
    label,
    field,
    placeholder,
    defaultValue,
    multiline = false,
    type = "text",
    isJson = false,
  }) => {
    const inputId = `input-${field}`;
    return (
      <SummaryRow>
        <SummaryLabel htmlFor={inputId}>{label}</SummaryLabel>
        <SummaryValue>
          {multiline ? (
            <StyledTextarea
              id={inputId}
              name={field} // Use name attribute for FormData API
              defaultValue={defaultValue} // Use defaultValue
              placeholder={placeholder}
              rows={isJson ? 5 : 3}
            />
          ) : (
            <StyledInput
              id={inputId}
              type={type}
              name={field} // Use name attribute
              defaultValue={defaultValue} // Use defaultValue
              placeholder={placeholder}
            />
          )}
          {isJson && (
            <JsonHint>
              Enter valid JSON{" "}
              {field === "additionalProperties" ? "array" : "object"}
            </JsonHint>
          )}
          {(field === "keywords" || field === "associatedPublication") && (
            <JsonHint>Use comma (,) to separate multiple items.</JsonHint>
          )}
        </SummaryValue>
      </SummaryRow>
    );
  };

  const PreviewField: React.FC<PreviewFieldProps> = ({
    label,
    value,
    placeholder,
    isJson = false,
  }) => {
    const displayValue = Array.isArray(value) ? value.join(", ") : value || "";
    const finalDisplay = displayValue || (
      <i style={{ color: "#aaa" }}>{placeholder}</i>
    );
    let formattedValue: React.ReactNode = finalDisplay;
    // Basic JSON preview formatting (can be enhanced)
    if (
      isJson &&
      typeof displayValue === "string" &&
      displayValue.trim().length > 1 &&
      (displayValue.trim().startsWith("{") ||
        displayValue.trim().startsWith("["))
    ) {
      try {
        const parsed = JSON.parse(displayValue);
        formattedValue = (
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              fontSize: "0.9em",
              background: "#f0f0f0",
              padding: "5px",
            }}
          >
            {JSON.stringify(parsed, null, 2)}
          </pre>
        );
      } catch (e) {
        formattedValue = (
          <span style={{ color: "red", fontFamily: "monospace" }}>
            Invalid JSON: {displayValue}
          </span>
        );
      }
    }
    return (
      <PreviewRow>
        <PreviewLabel>{label}</PreviewLabel>
        <PreviewValue>{formattedValue}</PreviewValue>
      </PreviewRow>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <FormContainer>
        {/* Step 1: Upload */}
        {currentStep === "upload" && (
          <StepContainer>
            <StepTitle>Step 1: Upload Sub-Crate Files</StepTitle>
            <ButtonContainer style={{ marginBottom: theme.spacing.lg }}>
              <UploadButton onClick={triggerFileUpload}>
                <FiUpload size={18} /> Upload RO-Crate JSON Files
              </UploadButton>
              <FileInput
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json,application/ld+json"
                multiple
              />
            </ButtonContainer>

            {uploadedCrates.length > 0 && (
              <UploadedFilesContainer>
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: theme.spacing.md,
                    color: theme.colors.primary,
                  }}
                >
                  Uploaded Files ({uploadedCrates.length})
                </h3>
                {uploadedCrates.map((crate, index) => (
                  <UploadedFileItem key={index}>
                    <FiUpload
                      size={14}
                      style={{ color: "#555", flexShrink: 0 }}
                    />
                    <UploadedFileName title={crate.fileName}>
                      {crate.fileName}{" "}
                      {crate.rootNodeId
                        ? `(ID: ${crate.rootNodeId})`
                        : "(No Root ID Found)"}
                    </UploadedFileName>
                  </UploadedFileItem>
                ))}
              </UploadedFilesContainer>
            )}

            <ButtonContainer>
              <NextButton
                onClick={goToEditStep}
                disabled={uploadedCrates.length === 0}
              >
                Next: Edit Metadata <FiArrowRight size={18} />
              </NextButton>
            </ButtonContainer>
            {uploadedCrates.length === 0 && (
              <p style={{ textAlign: "center", color: "#777" }}>
                Upload at least one RO-Crate JSON file to proceed.
              </p>
            )}
          </StepContainer>
        )}

        {/* Step 2: Edit Form (Uncontrolled) */}
        {currentStep === "edit" && (
          <StepContainer>
            <StepTitle>Step 2: Review and Edit Release Metadata</StepTitle>

            {/* Use key prop to force re-mount when initial values change */}
            <form ref={formRef} key={formKey}>
              {/* Form Sections with Uncontrolled InputFields */}
              <SummarySection>
                <SectionTitle>Release Crate - Core Information</SectionTitle>
                <InputField
                  label="Release Name"
                  field="name"
                  placeholder={placeholders.name}
                  defaultValue={initialFormValues.name || ""}
                />
                <InputField
                  label="Organization"
                  field="organizationName"
                  placeholder={placeholders.organizationName}
                  defaultValue={initialFormValues.organizationName || ""}
                />
                <InputField
                  label="Project"
                  field="projectName"
                  placeholder={placeholders.projectName}
                  defaultValue={initialFormValues.projectName || ""}
                />
                <InputField
                  label="Release GUID/ID"
                  field="id_value"
                  placeholder={placeholders.id_value}
                  defaultValue={initialFormValues.id_value || ""}
                />
                <InputField
                  label="Release DOI"
                  field="doi"
                  placeholder={placeholders.doi}
                  defaultValue={initialFormValues.doi || ""}
                />
                <InputField
                  label="Version"
                  field="version"
                  placeholder={placeholders.version}
                  defaultValue={initialFormValues.version || "1.0"}
                />
                <InputField
                  label="Release Date"
                  field="release_date"
                  placeholder={placeholders.release_date}
                  defaultValue={initialFormValues.release_date || ""}
                  type="date"
                />
                <InputField
                  label="Keywords"
                  field="keywords"
                  placeholder={placeholders.keywords}
                  defaultValue={initialFormValues.keywords || ""}
                />
                <InputField
                  label="Description"
                  field="description"
                  placeholder={placeholders.description}
                  defaultValue={initialFormValues.description || ""}
                  multiline={true}
                />
              </SummarySection>

              <SummarySection>
                <SectionTitle>People & Roles</SectionTitle>
                <InputField
                  label="Author(s)"
                  field="author"
                  placeholder={placeholders.author}
                  defaultValue={initialFormValues.author || ""}
                />
                <InputField
                  label="Principal Investigator"
                  field="principal_investigator"
                  placeholder={placeholders.principal_investigator}
                  defaultValue={initialFormValues.principal_investigator || ""}
                />
                <InputField
                  label="Contact Email"
                  field="contact_email"
                  placeholder={placeholders.contact_email}
                  defaultValue={initialFormValues.contact_email || ""}
                  type="email"
                />
                <InputField
                  label="Publisher"
                  field="publisher"
                  placeholder={placeholders.publisher}
                  defaultValue={initialFormValues.publisher || ""}
                />
                <InputField
                  label="Funder"
                  field="funder"
                  placeholder={placeholders.funder}
                  defaultValue={initialFormValues.funder || ""}
                />
              </SummarySection>

              <SummarySection>
                <SectionTitle>Licensing, Access & Citation</SectionTitle>
                <InputField
                  label="License URL"
                  field="license_value"
                  placeholder={placeholders.license_value}
                  defaultValue={initialFormValues.license_value || ""}
                  type="url"
                />
                <InputField
                  label="Conditions of Access"
                  field="conditionsOfAccess"
                  placeholder={placeholders.conditionsOfAccess}
                  defaultValue={initialFormValues.conditionsOfAccess || ""}
                />
                <InputField
                  label="Copyright Notice"
                  field="copyrightNotice"
                  placeholder={placeholders.copyrightNotice}
                  defaultValue={initialFormValues.copyrightNotice || ""}
                />
                <InputField
                  label="Associated Publications"
                  field="associatedPublication"
                  placeholder={placeholders.associatedPublication}
                  defaultValue={initialFormValues.associatedPublication || ""}
                  multiline
                />
                <InputField
                  label="Preferred Citation"
                  field="citation"
                  placeholder={placeholders.citation}
                  defaultValue={initialFormValues.citation || ""}
                  multiline
                />
              </SummarySection>

              <SummarySection>
                <SectionTitle>Usage, Limitations & Ethics</SectionTitle>
                <InputField
                  label="Intended Uses"
                  field="intended_uses"
                  placeholder={placeholders.intended_uses}
                  defaultValue={initialFormValues.intended_uses || ""}
                  multiline={true}
                />
                <InputField
                  label="Prohibited Uses"
                  field="prohibited_uses"
                  placeholder={placeholders.prohibited_uses}
                  defaultValue={initialFormValues.prohibited_uses || ""}
                  multiline={true}
                />
                <InputField
                  label="Limitations"
                  field="limitations"
                  placeholder={placeholders.limitations}
                  defaultValue={initialFormValues.limitations || ""}
                  multiline={true}
                />
                <InputField
                  label="Potential Sources of Bias"
                  field="potential_sources_of_bias"
                  placeholder={placeholders.potential_sources_of_bias}
                  defaultValue={
                    initialFormValues.potential_sources_of_bias || ""
                  }
                  multiline={true}
                />
                <InputField
                  label="Usage Info / Instructions"
                  field="usageInfo"
                  placeholder={placeholders.usageInfo}
                  defaultValue={initialFormValues.usageInfo || ""}
                  multiline={true}
                />
                <InputField
                  label="Confidentiality Level"
                  field="confidentiality_level"
                  placeholder={placeholders.confidentiality_level}
                  defaultValue={initialFormValues.confidentiality_level || ""}
                />
                <InputField
                  label="Human Subject Data"
                  field="human_subject"
                  placeholder={placeholders.human_subject}
                  defaultValue={initialFormValues.human_subject || ""}
                />
                <InputField
                  label="Ethical Review Info"
                  field="ethicalReview"
                  placeholder={placeholders.ethicalReview}
                  defaultValue={initialFormValues.ethicalReview || ""}
                  multiline={true}
                />
              </SummarySection>

              <SummarySection>
                <SectionTitle>Technical Details & Maintenance</SectionTitle>
                <InputField
                  label="Total Content Size"
                  field="content_size"
                  placeholder={placeholders.content_size}
                  defaultValue={initialFormValues.content_size || ""}
                />
                <InputField
                  label="Completeness"
                  field="completeness"
                  placeholder={placeholders.completeness}
                  defaultValue={initialFormValues.completeness || ""}
                  multiline
                />
                <InputField
                  label="Maintenance Plan"
                  field="maintenance_plan"
                  placeholder={placeholders.maintenance_plan}
                  defaultValue={initialFormValues.maintenance_plan || ""}
                  multiline={true}
                />
              </SummarySection>

              <SummarySection>
                <SectionTitle>Custom & Additional Properties</SectionTitle>
                <InputField
                  label="Additional Properties (JSON Array)"
                  field="additionalProperties"
                  placeholder={placeholders.additionalProperties}
                  defaultValue={initialFormValues.additionalProperties || "[]"}
                  multiline={true}
                  isJson={true}
                />
                <InputField
                  label="Custom Properties (JSON Object)"
                  field="customProperties"
                  placeholder={placeholders.customProperties}
                  defaultValue={initialFormValues.customProperties || "{}"}
                  multiline={true}
                  isJson={true}
                />
              </SummarySection>
            </form>

            {/* Action Buttons */}
            <ButtonContainer>
              <BackButton onClick={goToUploadStep}>
                <FiArrowLeft size={18} /> Back to Upload
              </BackButton>
              <PreviewButton onClick={togglePreview}>
                {showPreview ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                {showPreview ? "Hide Preview" : "Show Preview"}
              </PreviewButton>
              <DownloadButton onClick={downloadJson}>
                <FiDownload size={18} /> Download Release Metadata
              </DownloadButton>
            </ButtonContainer>

            {/* Preview Section (conditional) */}
            {showPreview && (
              <PreviewContainer>
                <PreviewTitle>Release Crate Preview</PreviewTitle>
                {/* PreviewFields read from previewData state, which is populated from formRef */}
                <PreviewSection>
                  <PreviewSectionTitle>Core Information</PreviewSectionTitle>
                  <PreviewField
                    label="Release Name"
                    value={previewData.name}
                    placeholder={placeholders.name}
                  />
                  <PreviewField
                    label="Organization"
                    value={previewData.organizationName}
                    placeholder={placeholders.organizationName}
                  />
                  <PreviewField
                    label="Project"
                    value={previewData.projectName}
                    placeholder={placeholders.projectName}
                  />
                  <PreviewField
                    label="Release GUID/ID"
                    value={
                      previewData.id_value ||
                      `(Will be: ark:59852/release-crate-...)`
                    }
                    placeholder={placeholders.id_value}
                  />
                  <PreviewField
                    label="Release DOI"
                    value={previewData.doi}
                    placeholder={placeholders.doi}
                  />
                  <PreviewField
                    label="Version"
                    value={previewData.version}
                    placeholder={placeholders.version}
                  />
                  <PreviewField
                    label="Release Date"
                    value={previewData.release_date}
                    placeholder={placeholders.release_date}
                  />
                  <PreviewField
                    label="Keywords"
                    value={previewData.keywords}
                    placeholder={placeholders.keywords}
                  />
                  <PreviewField
                    label="Description"
                    value={previewData.description}
                    placeholder={placeholders.description}
                  />
                </PreviewSection>
                <PreviewSection>
                  <PreviewSectionTitle>People & Roles</PreviewSectionTitle>
                  <PreviewField
                    label="Author(s)"
                    value={previewData.author}
                    placeholder={placeholders.author}
                  />
                  <PreviewField
                    label="Principal Investigator"
                    value={previewData.principal_investigator}
                    placeholder={placeholders.principal_investigator}
                  />
                  <PreviewField
                    label="Contact Email"
                    value={previewData.contact_email}
                    placeholder={placeholders.contact_email}
                  />
                  <PreviewField
                    label="Publisher"
                    value={previewData.publisher}
                    placeholder={placeholders.publisher}
                  />
                  <PreviewField
                    label="Funder"
                    value={previewData.funder}
                    placeholder={placeholders.funder}
                  />
                </PreviewSection>
                <PreviewSection>
                  <PreviewSectionTitle>
                    Licensing, Access & Citation
                  </PreviewSectionTitle>
                  <PreviewField
                    label="License URL"
                    value={previewData.license_value}
                    placeholder={placeholders.license_value}
                  />
                  <PreviewField
                    label="Conditions of Access"
                    value={previewData.conditionsOfAccess}
                    placeholder={placeholders.conditionsOfAccess}
                  />
                  <PreviewField
                    label="Copyright Notice"
                    value={previewData.copyrightNotice}
                    placeholder={placeholders.copyrightNotice}
                  />
                  <PreviewField
                    label="Associated Publications"
                    value={previewData.associatedPublication}
                    placeholder={placeholders.associatedPublication}
                  />
                  <PreviewField
                    label="Preferred Citation"
                    value={previewData.citation}
                    placeholder={placeholders.citation}
                  />
                </PreviewSection>
                <PreviewSection>
                  <PreviewSectionTitle>
                    Usage, Limitations & Ethics
                  </PreviewSectionTitle>
                  <PreviewField
                    label="Intended Uses"
                    value={previewData.intended_uses}
                    placeholder={placeholders.intended_uses}
                  />
                  <PreviewField
                    label="Prohibited Uses"
                    value={previewData.prohibited_uses}
                    placeholder={placeholders.prohibited_uses}
                  />
                  <PreviewField
                    label="Limitations"
                    value={previewData.limitations}
                    placeholder={placeholders.limitations}
                  />
                  <PreviewField
                    label="Potential Sources of Bias"
                    value={previewData.potential_sources_of_bias}
                    placeholder={placeholders.potential_sources_of_bias}
                  />
                  <PreviewField
                    label="Usage Info / Instructions"
                    value={previewData.usageInfo}
                    placeholder={placeholders.usageInfo}
                  />
                  <PreviewField
                    label="Confidentiality Level"
                    value={previewData.confidentiality_level}
                    placeholder={placeholders.confidentiality_level}
                  />
                  <PreviewField
                    label="Human Subject Data"
                    value={previewData.human_subject}
                    placeholder={placeholders.human_subject}
                  />
                  <PreviewField
                    label="Ethical Review Info"
                    value={previewData.ethicalReview}
                    placeholder={placeholders.ethicalReview}
                  />
                </PreviewSection>
                <PreviewSection>
                  <PreviewSectionTitle>
                    Technical Details & Maintenance
                  </PreviewSectionTitle>
                  <PreviewField
                    label="Total Content Size"
                    value={previewData.content_size}
                    placeholder={placeholders.content_size}
                  />
                  <PreviewField
                    label="Completeness"
                    value={previewData.completeness}
                    placeholder={placeholders.completeness}
                  />
                  <PreviewField
                    label="Maintenance Plan"
                    value={previewData.maintenance_plan}
                    placeholder={placeholders.maintenance_plan}
                  />
                </PreviewSection>
                <PreviewSection>
                  <PreviewSectionTitle>
                    Custom & Additional Properties
                  </PreviewSectionTitle>
                  <PreviewField
                    label="Additional Properties (JSON)"
                    value={previewData.additionalProperties}
                    placeholder={placeholders.additionalProperties}
                    isJson={true}
                  />
                  <PreviewField
                    label="Custom Properties (JSON)"
                    value={previewData.customProperties}
                    placeholder={placeholders.customProperties}
                    isJson={true}
                  />
                </PreviewSection>
                <PreviewSection>
                  <PreviewSectionTitle>
                    Linked Sub-Crates ({uploadedCrates.length})
                  </PreviewSectionTitle>
                  {uploadedCrates.length > 0 ? (
                    uploadedCrates.map((crate, index) => (
                      <PreviewRow key={`preview-${index}`}>
                        <PreviewLabel>Sub-Crate {index + 1}</PreviewLabel>
                        <PreviewValue>
                          {crate.fileName}{" "}
                          {crate.rootNodeId ? (
                            <span style={{ fontSize: "0.9em", color: "#555" }}>
                              (Linked via ID: {crate.rootNodeId})
                            </span>
                          ) : (
                            <span style={{ color: "orange" }}>
                              (Could not find root ID)
                            </span>
                          )}
                        </PreviewValue>
                      </PreviewRow>
                    ))
                  ) : (
                    <PreviewRow>
                      <PreviewLabel>Sub-Crates</PreviewLabel>
                      <PreviewValue>
                        <i>No sub-crates uploaded.</i>
                      </PreviewValue>
                    </PreviewRow>
                  )}
                </PreviewSection>
              </PreviewContainer>
            )}
          </StepContainer>
        )}
      </FormContainer>
    </ThemeProvider>
  );
};

export default ReleaseForm;

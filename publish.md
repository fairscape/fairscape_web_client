# Publishing ROCrate to Dataverse: Step-by-Step Guide

## 1. Generate Dataverse API Token

![Step 1](../screenshots/pub1.png)

1. Log in to your Dataverse account
2. Click on your username in the top right corner
3. Select "API Token" from the dropdown menu
4. Click "Create Token" if you don't have one
5. Copy the generated API token

## 2. Configure Fairscape Token Management

![Step 1](../screenshots/pub2.png)

1. Log in to Fairscape
2. Click "Manage Tokens" in the top navigation
3. Fill in the required fields:
   - Token ID (e.g., "Example Dataverse")
   - Endpoint URL (e.g., "https://dataverse.uva.edu")
   - Token Value (paste your Dataverse API token)
4. Click "ADD TOKEN" to save
   ![Step 1](../screenshots/pub3.png)

## 3. Navigate to ROCrate Publication

![Step 1](../screenshots/pub4.png)

1. Go to your ROCrate metadata page in Fairscape
2. Verify the ROCrate details are correct:
   - Name
   - Persistent Identifier
   - Description
   - Keywords
   - Contained items
3. Click the "Publish ROCrate to Dataverse" button at the bottom of the page

## 4. Complete Publication Form

![Step 1](../screenshots/pub5.png)

Fill in the required fields (marked with \*):

1. Select Dataverse Instance from the dropdown

   - Choose your configured Dataverse instance

2. Database Configuration:

   - Confirm Database Name (default: "libradata")

3. Publication Details:
   - Title\*: Verify or update the ROCrate title
   - Authors\*: Add all relevant authors
   - Description\*: Review and update as needed
   - Keywords\*: Confirm or modify keywords
   - Publication Date\*: Verify the date is correct

## 5. Publish ROCrate

1. Final Review:

   - Double-check all entered information
   - Ensure all required fields are completed
   - Verify Dataverse instance selection

2. Publication:
   - Click "Publish to Dataverse" button
   - Wait for the publication process to complete

## Important Notes

### Prerequisites

- Active Dataverse account with API access
- Valid API token
- ROCrate uploaded to Fairscape

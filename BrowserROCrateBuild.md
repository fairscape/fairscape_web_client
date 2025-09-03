# ROCrate Creation Page

## Main Page

Page containing logic to decide view and all data.

### Views

1. RO-Crate Details + File Upload (Starting View)
2. Metadata Details Form (Users can access via File Details Table)

### State

1. RO-Crate metadata (class from fairscape-js-utils)
2. File list (file_name, file_type, file_data, file_metadata also class from js-utilss, complete y/n)
3. View
4. Selected File

## RO-Crate Details + File Upload View

Main view users input basic information about the RO-Crate and can upload files. When files are uploaded the information is displayed in the file details table.

### Conent Outline

RO-Crate form on top, file drop below, and file details table below file drop.

### Subcomponents

1. RO-Crate Form
2. File Upload Zone
3. File Details Table

### State

1. RO-Crate metadata (class from fairscape-js-utils)
2. File list (file_name, file_type, file_data, file_metadata, complete y/n)

### Logic

1. Each uploaded file is parsed into FileObject with name, guessed type by extension, data, metadata (assume matching authors to RO-Crate form), and complete (Y/N)
2. Metadata completion depends if metadata meets minimum class requirments per js-utils.

### Returns

1. Completed RO-Crare (Once at least 1 file is uploaded and all uploaded files complete)

## Metadata Details Form

Form for user to file in file level metadata details. Should accept json config and which for is displayed depends on file type.

### State

1. File Metadata Prop
2. File Type

### Returns

1. Completed File Metadata

## File Upload Zone

Simple drag/drop area and file upload click.

### State

1. File list prop

### Returns

1. List of parsed file objects

## File Details table

Table showing all files uploaded. File Name, Type, Complete?, Link to Form to fill out metadata.

### State

1. File list prop

### Returns

1. Link to metadata edit view

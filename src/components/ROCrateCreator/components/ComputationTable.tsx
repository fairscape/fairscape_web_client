import React from "react";
import { ComputationMetadata } from "../types";
import {
  ComponentContainer,
  ComponentTitle,
  TableHeaderWithAction,
  AddButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  EmptyState,
} from "./ComputationComponents.styles";

interface ComputationTableProps {
  computations: ComputationMetadata[];
  onAddComputation: () => void;
  onEditComputation: (computation: ComputationMetadata) => void;
}

const ComputationTable: React.FC<ComputationTableProps> = ({
  computations,
  onAddComputation,
  onEditComputation,
}) => {
  return (
    <ComponentContainer>
      <TableHeaderWithAction>
        <ComponentTitle>Computations ({computations.length})</ComponentTitle>
        <AddButton onClick={onAddComputation}>Add Computation</AddButton>
      </TableHeaderWithAction>

      {computations.length === 0 ? (
        <EmptyState>
          No computations recorded yet. Click "Add Computation" to document the
          computational processes used to generate or process your files.
        </EmptyState>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Run By</TableHeaderCell>
              <TableHeaderCell>Date Created</TableHeaderCell>
              <TableHeaderCell>Inputs</TableHeaderCell>
              <TableHeaderCell>Outputs</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {computations.map((comp) => (
              <TableRow key={comp.id} onClick={() => onEditComputation(comp)}>
                <TableCell>{comp.name}</TableCell>
                <TableCell>{comp.runBy}</TableCell>
                <TableCell>{comp.dateCreated}</TableCell>
                <TableCell>{comp.usedDataset.length} datasets</TableCell>
                <TableCell>{comp.generated.length} datasets</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </ComponentContainer>
  );
};

export default ComputationTable;
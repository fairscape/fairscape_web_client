import json
import pathlib
from typing import Dict, Any, Optional, List, Tuple
from fairscape_models.experiment import Experiment
from fairscape_models.sample import Sample
from fairscape_cli.config import NAAN
from fairscape_cli.models.guid_utils import GenerateDatetimeSquid

def process_crate(input_file_path, output_file_path):
    # Load RO-Crate metadata
    with open(input_file_path, 'r') as f:
        crate_data = json.load(f)
    
    # Extract the @graph from the crate data
    if "@graph" not in crate_data:
        raise ValueError("RO-Crate does not contain @graph element")
    
    graph = crate_data["@graph"]
    
    # Extract datasets and identify unique cell lines and experiment combinations
    datasets = []
    unique_cell_lines = set()
    unique_experiment_combos = set()
    
    for item in graph:
        if isinstance(item, dict) and item.get("@type") == "EVI:Dataset":
            datasets.append(item)
            
            cell_line = None
            stain = None
            treatment = None
            
            if "usedCellLine" in item and isinstance(item["usedCellLine"], dict):
                cell_line = item["usedCellLine"].get("@id")
                if cell_line:
                    unique_cell_lines.add(cell_line)
                
            if "usedStain" in item and isinstance(item["usedStain"], dict):
                stain = item["usedStain"].get("@id")
                
            if "usedTreatment" in item and isinstance(item["usedTreatment"], dict):
                treatment = item["usedTreatment"].get("@id")
                
            if cell_line and stain and treatment:
                unique_experiment_combos.add((cell_line, stain, treatment))
    
    # Generate one sample per cell line
    cell_line_to_sample = {}
    samples = []
    
    for cell_line_id in unique_cell_lines:
        # Get cell line information from the graph
        cell_line_object = None
        for item in graph:
            if isinstance(item, dict) and item.get("@id") == cell_line_id:
                cell_line_object = item
                break
        
        # Get a nice name for the cell line
        cell_line_name = "Unknown Cell Line"
        if cell_line_object and "name" in cell_line_object:
            cell_line_name = cell_line_object["name"]
            if " Cell Line" in cell_line_name:
                cell_line_name = cell_line_name.split(" Cell Line")[0]
        else:
            cell_line_name = cell_line_id.split('/')[-1]
            
        # Create sample metadata
        sample_name = f"{cell_line_name} Sample"
        sample_description = f"Cell culture sample prepared from {cell_line_name} cell line for immunofluorescence imaging."
        
        # Generate sample
        sample = {
            "@id": f"ark:{NAAN}/sample-{cell_line_name.lower().replace(' ', '-')}-{GenerateDatetimeSquid()}",
            "@type": "https://w3id.org/EVI#Sample",
            "name": sample_name,
            "author": "Hansen JN et al.",
            "description": sample_description,
            "keywords": ["cell culture", "immunofluorescence", cell_line_name],
            "cellLineReference": {"@id": cell_line_id}
        }
        
        # Validate the sample
        validated_sample = Sample.model_validate(sample)
        sample_dict = validated_sample.model_dump(by_alias=True)
        
        # Store mapping and add to samples list
        cell_line_to_sample[cell_line_id] = sample_dict["@id"]
        samples.append(sample_dict)
    
    # Generate experiments for each unique combination
    experiments = {}
    for combo in unique_experiment_combos:
        cell_line, stain, treatment = combo
        
        # Skip if we don't have a sample for this cell line
        if cell_line not in cell_line_to_sample:
            continue
            
        sample_id = cell_line_to_sample[cell_line]
        
        # Create descriptive names
        cell_line_name = cell_line.split('/')[-1]
        stain_name = stain.split('/')[-1]
        treatment_name = treatment.split('/')[-1]
        
        experiment_name = f"Experiment_{cell_line_name}_{stain_name}_{treatment_name}"
        
        # Generate experiment metadata
        experiment_metadata = {
            "@id": f"ark:{NAAN}/experiment-{experiment_name.lower().replace(' ', '-')}-{GenerateDatetimeSquid()}",
            "@type": "https://w3id.org/EVI#Experiment",
            "name": experiment_name,
            "experimentType": "Immunofluorescence Imaging",
            "runBy": "Hansen JN et al.",
            "description": f"Immunofluorescence imaging experiment using {cell_line_name} cells treated with {treatment_name} and stained with {stain_name}.",
            "datePerformed": "2025-02-28",
            "usedSample": [{"@id": sample_id}],
            "usedStain": [{"@id": stain}],
            "usedTreatment": [{"@id": treatment}],
            "generated": []
        }
        
        # Validate experiment
        experiment = Experiment.model_validate(experiment_metadata)
        experiments[combo] = experiment.model_dump(by_alias=True)
    
    # Update datasets to reference the appropriate experiment
    for dataset in datasets:
        cell_line = None
        stain = None
        treatment = None
        
        if "usedCellLine" in dataset and isinstance(dataset["usedCellLine"], dict):
            cell_line = dataset["usedCellLine"].get("@id")
            
        if "usedStain" in dataset and isinstance(dataset["usedStain"], dict):
            stain = dataset["usedStain"].get("@id")
            
        if "usedTreatment" in dataset and isinstance(dataset["usedTreatment"], dict):
            treatment = dataset["usedTreatment"].get("@id")
        
        if cell_line and stain and treatment:
            combo = (cell_line, stain, treatment)
            if combo in experiments:
                # Add dataset to experiment's generated list
                dataset_id = dataset.get("@id")
                if dataset_id:
                    if "generated" not in experiments[combo]:
                        experiments[combo]["generated"] = []
                    experiments[combo]["generated"].append({"@id": dataset_id})
                
                # Remove cell line, stain, and treatment from dataset
                if "usedCellLine" in dataset:
                    del dataset["usedCellLine"]
                if "usedStain" in dataset:
                    del dataset["usedStain"]
                if "usedTreatment" in dataset:
                    del dataset["usedTreatment"]
                
                # Add reference to the experiment
                dataset["wasGeneratedBy"] = {"@id": experiments[combo]["@id"]}
                dataset["format"] = "image/jpeg"
    
    # Update the graph with samples, experiments, and modified datasets
    updated_graph = []
    
    # Add all items that are not the modified datasets
    for item in graph:
        if not (isinstance(item, dict) and item.get("@type") == "EVI:Dataset" and any(item.get("@id") == d.get("@id") for d in datasets)):
            updated_graph.append(item)
    
    # Add the samples
    for sample in samples:
        updated_graph.append(sample)
    
    # Add the experiments
    for experiment in experiments.values():
        updated_graph.append(experiment)
    
    # Add the updated datasets
    for dataset in datasets:
        updated_graph.append(dataset)
    
    # Update the graph in the crate data
    updated_crate = crate_data.copy()
    updated_crate["@graph"] = updated_graph
    
    # Write the updated RO-Crate to the output file
    with open(output_file_path, 'w') as f:
        json.dump(updated_crate, f, indent=2)
    
    return {
        "samples_created": len(samples),
        "experiments_created": len(experiments),
        "datasets_updated": len(datasets)
    }

# Example usage
if __name__ == "__main__":
    input_file = "crate-metadata.json"
    output_file = "ro-crate-metadata.json"
    results = process_crate(input_file, output_file)
    print(f"Created {results['samples_created']} samples, {results['experiments_created']} experiments, and updated {results['datasets_updated']} datasets.")
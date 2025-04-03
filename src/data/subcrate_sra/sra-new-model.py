import json
import os
from fairscape_models.experiment import Experiment
from fairscape_models.sample import Sample
from fairscape_models.instrument import Instrument
from fairscape_cli.models.experiment import GenerateExperiment
from fairscape_cli.models.sample import GenerateSample
from fairscape_cli.models.instrument import GenerateInstrument

def is_sra_experiment(computation):
    """Check if a computation is an SRA experiment"""
    if not isinstance(computation, dict):
        return False
    
    name = computation.get("name", "")
    description = computation.get("description", "")
    return "SRA Experiment" in name or "RNA-Seq experiment" in description

def extract_accession(url):
    """Extract the accession number from a URL"""
    if not url:
        return "unknown"
    
    parts = url.split("/")
    return parts[-1] if parts else "unknown"

def create_sample_from_dataset(dataset_url, keywords):
    """Create a Sample entity from a dataset URL"""
    accession = extract_accession(dataset_url)
    sample_name = f"SRA Sample {accession}"
    
    return GenerateSample(
        name=sample_name,
        author="Doctor Y; Dailamy A; Forget A; Lee YH; Chinn B; Khaliq H; Polacco B; Muralidharan, M; Pan E; Zhang Y; Sigaeva A; Hansen JN; Gao J; Parker JA; Obernier K; Clark T; Chen JY; Metallo C; Lundberg E; Idkeker T; Krogan N; Mali P",
        description=f"RNA-Seq sample with accession {accession}",
        keywords=keywords,
        contentUrl=dataset_url,
        cellLineReference="ark:59852/cell-line-KOLF2.1J"
    )

def transform_ro_crate(input_path, output_path=None):
    """Transform Computations in an RO-Crate to Experiments, Samples, and Instruments"""
    if output_path is None:
        base, ext = os.path.splitext(input_path)
        output_path = f"{base}-transformed{ext}"
    
    # Load the RO-Crate
    with open(input_path, 'r') as f:
        ro_crate = json.load(f)
    
    # Extract the graph
    graph = ro_crate.get('@graph', [])
    
    # Track new entities to add
    new_entities = []
    computation_ids_to_remove = []
    computation_to_experiment_map = {}
    
    # Create a single sequencing instrument that all experiments will use
    sequencing_instrument = GenerateInstrument(
        name="Illumina NovaSeq X",
        manufacturer="Illumina",
        model="NovaSeq X",
        description="High-throughput sequencing platform for genomic research",
        contentUrl="https://www.illumina.com/systems/sequencing-platforms/novaseq-x-plus.html"
    )
    new_entities.append(sequencing_instrument.model_dump(by_alias=True))
    
    # First pass - identify and transform SRA Experiment computations
    for entity in graph:
        if entity.get('@type') == "https://w3id.org/EVI#Computation" and is_sra_experiment(entity):
            # This is an SRA experiment to transform
            computation_id = entity.get('@id')
            experiment_id = computation_id.replace("computation", "experiment")
            computation_ids_to_remove.append(computation_id)
            computation_to_experiment_map[computation_id] = experiment_id
            
            # Create samples from usedDataset
            samples = []
            for dataset in entity.get('usedDataset', []):
                dataset_url = dataset.get('@id')
                if dataset_url:
                    sample = create_sample_from_dataset(dataset_url, entity.get('keywords', []))
                    samples.append(sample)
                    new_entities.append(sample.model_dump(by_alias=True))
            
            # Create the experiment - using the common instrument
            experiment = GenerateExperiment(
                guid=experiment_id,
                name=entity.get('name', '').replace("Computation", "Experiment"),
                experimentType="RNA-Seq",
                runBy=entity.get('runBy', 'Unknown'),
                description=entity.get('description', ''),
                datePerformed=entity.get('dateCreated', ''),
                associatedPublication=entity.get('associatedPublication'),
                protocol=entity.get('additionalDocumentation'),
                usedInstrument=[sequencing_instrument.guid],  # Using the common instrument
                usedSample=[sample.guid for sample in samples],
                generated=entity.get('generated', [])
            )
            
            new_entities.append(experiment.model_dump(by_alias=True))
    
    # Second pass - update references to computations in other entities
    updated_graph = []
    for entity in graph:
        if entity.get('@id') not in computation_ids_to_remove:
            # Update generatedBy references
            generated_by = entity.get('generatedBy', [])
            if generated_by:
                updated_generated_by = []
                for gen in generated_by:
                    gen_id = gen.get('@id')
                    if gen_id in computation_to_experiment_map:
                        # Replace with experiment ID
                        updated_generated_by.append({"@id": computation_to_experiment_map[gen_id]})
                    else:
                        updated_generated_by.append(gen)
                entity['generatedBy'] = updated_generated_by
            
            updated_graph.append(entity)
    
    # Add new entities
    updated_graph.extend(new_entities)
    
    # Update the graph
    ro_crate['@graph'] = updated_graph
    
    with open(output_path, 'w') as f:
        json.dump(ro_crate, f, indent=2)
    
    return output_path

if __name__ == "__main__":
    input_file = "ro-crate-metadata.json"
    output_file = transform_ro_crate(input_file)
    print(f"Transformed RO-Crate saved to {output_file}")
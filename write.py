import os
import sys

def collect_code(source_dir, output_file):
    # File extensions to include
    exts = {".tsx", ".ts", ".jsx", ".js"}
    
    with open(output_file, "w", encoding="utf-8") as out:
        for root, _, files in os.walk(source_dir):
            for file in files:
                if any(file.endswith(ext) for ext in exts):
                    filepath = os.path.join(root, file)
                    try:
                        with open(filepath, "r", encoding="utf-8") as f:
                            content = f.read()
                    except Exception as e:
                        content = f"<< Could not read file: {e} >>"
                    
                    out.write("="*80 + "\n")
                    out.write(f"FILE: {filepath}\n")
                    out.write("="*80 + "\n\n")
                    out.write(content)
                    out.write("\n\n\n")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python collect_code.py <source_directory> <output_file>")
        sys.exit(1)
    
    source_dir = sys.argv[1]
    output_file = sys.argv[2]
    collect_code(source_dir, output_file)
    print(f"Collected code written to {output_file}")

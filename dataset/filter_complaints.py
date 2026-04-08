import pandas as pd
import os

def filter_and_label_complaints():
    # Define file paths
    # Using relative paths assuming script is run from the project root or dataset directory
    # Adjusting logic to find the file based on user description
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Possible locations based on user input and discovery
    possible_inputs = [
        os.path.join(base_dir, "rows.csv", "public_utility_complaints.csv"), # Discovered location
        os.path.join(base_dir, "public_utility_complaints.csv"),             # Standard location
    ]
    
    input_path = None
    for path in possible_inputs:
        if os.path.exists(path):
            input_path = path
            break
            
    if not input_path:
        print(f"Error: Input file 'public_utility_complaints.csv' not found in expected locations: {possible_inputs}")
        return

    output_path = os.path.join(base_dir, "filtered_public_utility_complaints.csv")
    
    print(f"Loading dataset from: {input_path}")
    
    try:
        df = pd.read_csv(input_path)
    except Exception as e:
        print(f"Failed to read CSV: {e}")
        return

    # Check if required column exists
    if "Consumer complaint narrative" not in df.columns:
        print("Error: Column 'Consumer complaint narrative' not found in dataset.")
        print(f"Available columns: {df.columns.tolist()}")
        return

    # Define keywords
    electricity_keywords = ["electricity", "power", "outage", "voltage", "transformer", "power cut"]
    water_keywords = ["water", "leakage", "pipeline", "supply", "drainage", "tap"]

    def get_category(text):
        if not isinstance(text, str):
            return None
        
        text_lower = text.lower()
        
        # Check for matches
        has_electricity = any(k in text_lower for k in electricity_keywords)
        has_water = any(k in text_lower for k in water_keywords)
        
        # Prioritize or handle overlap? 
        # User request implies specific categorization. 
        # We'll prioritize based on keyword presence. 
        # If both, maybe label as one or the other? 
        # Detailed logic: Just return first match or specific logic.
        # Let's assume mutually exclusive or prioritize Electricity for this snippet?
        # Actually, simpler: if matches electricity -> Electricity, elif water -> Water.
        
        if has_electricity:
            return "Electricity"
        elif has_water:
            return "Water"
        return None

    # Apply categorization
    # Drop rows with missing narrative first if needed, or handle in function (done via isinstance check)
    df = df.dropna(subset=["Consumer complaint narrative"])
    
    print("Filtering and categorizing data...")
    df['category'] = df['Consumer complaint narrative'].apply(get_category)

    # Filter to keep only "Electricity" or "Water"
    filtered_df = df[df['category'].notna()].copy()

    # Save to new CSV
    print(f"Saving {len(filtered_df)} filtered rows to: {output_path}")
    filtered_df.to_csv(output_path, index=False)
    print("Done!")

if __name__ == "__main__":
    filter_and_label_complaints()

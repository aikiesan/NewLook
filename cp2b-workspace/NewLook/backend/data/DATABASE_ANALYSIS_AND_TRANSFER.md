# Database Analysis and Data Transfer Guide

This document provides a comprehensive analysis of the project's database structure, focusing on how scientific references are linked to chemical parameters. It also outlines a strategy for exporting this data for use in another web application.

## 1. Database Architecture and Schema

The core of the application's data is stored in a SQLite database file:

-   **Database File:** `data/CP2B_Precision_Biogas.db`

Our analysis indicates the following key tables are involved in managing references and chemical data:

### Key Tables

-   **`refs`**: This table stores the details of the scientific references.
    -   `id` (Primary Key): Unique identifier for each reference.
    -   `title`: The title of the publication.
    -   `author`: The author(s) of the publication.
    -   `year`: The year of publication.
    -   `doi`: The Digital Object Identifier.
    -   Other metadata fields...

-   **`chem_param`**: This table stores the chemical parameter measurements for different residues.
    -   `id` (Primary Key): Unique identifier for each measurement.
    -   `id_residue`: A foreign key linking to the `residues` table.
    -   `parameter`: The name of the chemical parameter (e.g., 'Total Solids', 'Volatile Solids').
    -   `value`: The measured value of the parameter.
    -   `unit`: The unit of measurement.
    -   **`id_ref`** (Foreign Key): This is the crucial column that links the chemical measurement to a specific scientific reference in the `refs` table.

-   **`residues`**: This table contains information about the different types of residues (biomass).
    -   `id` (Primary Key): Unique identifier for each residue.
    -   `name`: The name of the residue (e.g., 'Sugarcane Bagasse').

### Relationship Diagram

The relationship is straightforward: Each record in the `chem_param` table has an `id_ref` field that points to the `id` of a record in the `refs` table. This creates a many-to-one relationship, where many chemical parameter entries can be associated with a single scientific reference.

```
+-----------------+       +--------------------+
|      refs       |       |     chem_param     |
+-----------------+       +--------------------+
| id (PK)         |<------| id_ref (FK)        |
| title           |       | id (PK)            |
| author          |       | id_residue (FK)    |
| year            |       | parameter          |
| ...             |       | value              |
+-----------------+       | ...                |
                        +--------------------+
                                 |
                                 |
                        +--------------------+
                        |      residues      |
                        +--------------------+
                        | id (PK)            |
                        | name               |
                        | ...                |
                        +--------------------+
```

## 2. Code Interaction

The application interacts with the database through the following key components:

-   **Data Handling Logic:** The file `src/data_handler.py` appears to contain the functions responsible for connecting to the SQLite database, executing queries, and returning data as pandas DataFrames.
-   **Streamlit Pages:**
    -   `pages/2_🧪_Parametros_Quimicos.py`: This page likely queries the `chem_param` table and, when displaying the data, performs a `JOIN` with the `refs` table to show the source reference for each parameter.
    -   `pages/3_📚_Referencias_Cientificas.py`: This page is dedicated to displaying the list of all references from the `refs` table, possibly with filtering and search functionality.

## 3. Data Export and Transfer Strategy

To transfer the data to another web application, you need to extract it from the SQLite database into a portable format like JSON or CSV.

Here is a recommended approach:

### Step 1: Create an Export Script

Create a Python script (e.g., `export_data.py`) to connect to the database and export the data.

```python
import sqlite3
import pandas as pd
import json

def export_linked_data(db_path, output_json_path, output_csv_path):
    """
    Connects to the SQLite database, joins the chemical parameters with their
    references, and exports the result to JSON and CSV formats.
    """
    try:
        # Connect to the database
        con = sqlite3.connect(db_path)

        # Define the SQL query to join the tables
        # This query combines data from residues, chemical parameters, and references
        query = """
        SELECT
            r.name AS residue_name,
            cp.parameter,
            cp.value,
            cp.unit,
            ref.title,
            ref.author,
            ref.year,
            ref.doi
        FROM chem_param AS cp
        JOIN residues AS r ON cp.id_residue = r.id
        JOIN refs AS ref ON cp.id_ref = ref.id
        """

        # Execute the query and load the data into a pandas DataFrame
        df = pd.read_sql_query(query, con)

        # Close the database connection
        con.close()

        # Export to JSON
        df.to_json(output_json_path, orient='records', indent=4)
        print(f"Data successfully exported to {output_json_path}")

        # Export to CSV
        df.to_csv(output_csv_path, index=False)
        print(f"Data successfully exported to {output_csv_path}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == '__main__':
    DATABASE_FILE = 'data/CP2B_Precision_Biogas.db'
    OUTPUT_JSON = 'exported_data.json'
    OUTPUT_CSV = 'exported_data.csv'
    export_linked_data(DATABASE_FILE, OUTPUT_JSON, OUTPUT_CSV)

```

### Step 2: Run the Export Script

1.  Save the code above as `export_data.py` in the root of your project.
2.  Run the script from your terminal:
    ```bash
    python export_data.py
    ```

This will generate two files: `exported_data.json` and `exported_data.csv`. These files will contain the combined data, linking chemical parameters directly with their scientific references.

### Step 3: Import into the New Web Application

The generated JSON or CSV file can now be used to import the data into your new application. The import mechanism will depend on the new application's technology stack:

-   **If the new app has a database:** You will need to write a script to parse the JSON/CSV file and insert the data into the new database tables. You will need to create a similar table structure in the new database.
-   **If the new app reads from files directly:** You can place the JSON or CSV file in a location where the new application can read it.

This approach ensures a clean and structured transfer of your valuable, interconnected data.

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings("ignore")

# File paths
books_path = "dataset/Books.csv"
users_path = "dataset/Users.csv"
ratings_path = "dataset/Book-Ratings.csv"
output_path = "dataset/merged_data.csv"

# Read CSV files
books = pd.read_csv(books_path, delimiter=';', encoding='ISO-8859-1', on_bad_lines='skip')
users = pd.read_csv(users_path, delimiter=';', encoding='ISO-8859-1', on_bad_lines='skip')
ratings = pd.read_csv(ratings_path, delimiter=';', encoding='ISO-8859-1', on_bad_lines='skip')

# Preprocess Books
# Drop image URL columns
books.drop(['Image-URL-S', 'Image-URL-M', 'Image-URL-L'], axis=1, inplace=True, errors='ignore')

# Handle missing values
books['Book-Author'].fillna('Other', inplace=True)
books['Publisher'].fillna('Other', inplace=True)

# Clean Year-Of-Publication
def clean_year(year):
    try:
        year = str(year).strip().replace('"', '').replace("'", '')
        return int(year) if year.isdigit() and 1800 <= int(year) <= 2025 else 0
    except:
        return 0

books['Year-Of-Publication'] = books['Year-Of-Publication'].apply(clean_year)

# Preprocess Ratings: Keep only explicit ratings (non-zero)
ratings = ratings[ratings['Book-Rating'] != 0]

# Preprocess Users: Ensure User-ID is numeric
users['User-ID'] = users['User-ID'].apply(lambda x: str(x).strip().replace('"', '').replace("'", ''))
users = users[users['User-ID'].str.isdigit()]
users['User-ID'] = users['User-ID'].astype(np.int64)

# Merge datasets
# Merge ratings with books on ISBN
merged_df = pd.merge(ratings, books, on='ISBN', how='inner')

# Merge with users on User-ID
merged_df = pd.merge(merged_df, users, on='User-ID', how='inner')

# Select relevant columns
merged_df = merged_df[['ISBN', 'Book-Rating', 'Book-Title', 'Book-Author', 'Year-Of-Publication', 'Publisher']]

# Remove duplicates
merged_df = merged_df.drop_duplicates()

# Save to CSV
merged_df.to_csv(output_path, sep=';', index=False, encoding='ISO-8859-1')

print(f"Merged data saved to {output_path}")
print(f"Shape of merged DataFrame: {merged_df.shape}")
print("Columns in merged DataFrame:", list(merged_df.columns))
print(merged_df.head())
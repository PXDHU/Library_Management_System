from fastapi import FastAPI, HTTPException
import pandas as pd
import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction import DictVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors
from scipy.sparse import csr_matrix
import psycopg2
from typing import List
import operator

app = FastAPI()

# Database connection
try:
    conn = psycopg2.connect(
        dbname="Library",
        user="postgres",
        password="Redim04$",  # Replace with your PostgreSQL password
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()
except Exception as e:
    raise Exception(f"Database connection failed: {e}")

def fetch_data():
    try:
        cursor.execute("SELECT id, isbn, title, author, publisher, year FROM book")
        books = pd.DataFrame(cursor.fetchall(), columns=['ID', 'ISBN', 'Book-Title', 'Book-Author', 'Publisher', 'Year-Of-Publication'])

        #cursor.execute("SELECT id, username, location FROM users")
        #users = pd.DataFrame(cursor.fetchall(), columns=['User-ID', 'Username', 'Location'])

        cursor.execute("SELECT book_id, rating FROM rating")
        ratings = pd.DataFrame(cursor.fetchall(), columns=['Book-ID', 'Book-Rating'])

        # Map book IDs in ratings to ISBN
        ratings = ratings.merge(books[['ID', 'ISBN']], left_on='Book-ID', right_on='ID', how='left')
        ratings = ratings.drop(columns=['ID', 'Book-ID'])  # Drop old ID
        ratings = ratings.rename(columns={'ISBN': 'Book-ID'})  # Replace with ISBN for consistency

        return books, ratings

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {e}")


@app.get("/popular", response_model=List[str])
def get_popular_books():
    try:
        books, ratings = fetch_data()

        books['ISBN'] = books['ISBN'].astype(str).str.strip()
        ratings['Book-ID'] = ratings['Book-ID'].astype(str).str.strip()

        print("Sample ISBNs from books:", books['ISBN'].head(10).tolist())
        print("Sample Book-IDs from ratings:", ratings['Book-ID'].head(10).tolist())

        average_rating = ratings.groupby('Book-ID')['Book-Rating'].mean().reset_index()
        rating_count = ratings.groupby('Book-ID')['Book-Rating'].count().reset_index().rename(columns={'Book-Rating': 'ratingCount'})
        average_rating = average_rating.merge(rating_count, on='Book-ID')
        top_books = average_rating.sort_values('ratingCount', ascending=False).head(5)

        print("Top Book-IDs:", top_books['Book-ID'].tolist())

        # Show which ones actually match
        print("Matching Book-IDs in books table:")
        for bid in top_books['Book-ID']:
            if bid in books['ISBN'].values:
                print(f"✓ {bid}")
            else:
                print(f"✗ {bid} - NOT FOUND in ISBNs")

        result = top_books.merge(books, left_on='Book-ID', right_on='ISBN')

        print("Matched books:\n", result[['Book-ID', 'Book-Title']])
        return result['Book-Title'].tolist()

    except Exception as e:
        print(" Error in /popular:", str(e))
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")


@app.get("/content-based/{book_id}", response_model=List[str])
def get_content_based_recommendations(book_id: str):
    try:
        # Fetch data
        books, _, ratings = fetch_data()

        # Clean ISBNs
        books['ISBN'] = books['ISBN'].astype(str).str.strip()
        ratings['Book-ID'] = ratings['Book-ID'].astype(str).str.strip()
        book_id = book_id.strip()

        # Verify book_id exists
        if book_id not in books['ISBN'].values:
            print(f"Book with ISBN {book_id} not found in books table")
            raise HTTPException(status_code=404, detail=f"Book with ISBN {book_id} not found")

        # Debug: Log sample data
        print(f"🔍 Processing content-based recommendations for ISBN: {book_id}")
        print("Sample ISBNs from books:", books['ISBN'].head(5).tolist())
        print("Sample Book Titles from books:", books['Book-Title'].head(5).tolist())

        # Create a combined text feature (title + author + publisher)
        books['combined_features'] = books.apply(
            lambda x: f"{x['Book-Title']} {x['Book-Author']} {x['Publisher']}".lower(), axis=1
        )
        # Clean text: remove special characters, extra spaces, and non-ASCII characters
        books['combined_features'] = books['combined_features'].apply(
            lambda x: re.sub(r'[^\w\s]', '', x.encode('ascii', 'ignore').decode('ascii')).strip()
        )

        # Filter books with sufficient ratings
        popularity_threshold = 20
        data = ratings.groupby('Book-ID')['Book-Rating'].count().reset_index().rename(
            columns={'Book-Rating': 'Total-Ratings'}
        )
        popular_books = data.merge(books, left_on='Book-ID', right_on='ISBN', how='right')
        popular_books['Total-Ratings'] = popular_books['Total-Ratings'].fillna(0)
        popular_books = popular_books[popular_books['Total-Ratings'] >= popularity_threshold].reset_index(drop=True)

        # Debug: Log filtered dataset info
        print(f"Total books after filtering (≥{popularity_threshold} ratings): {len(popular_books)}")
        print("Sample filtered book titles:", popular_books['Book-Title'].head(5).tolist())

        # Check if input book is in filtered dataset
        input_book = books[books['ISBN'] == book_id]
        input_title = input_book['Book-Title'].values[0]
        input_features = input_book['combined_features'].values[0]

        # Log input book details
        print(f"Input book: {input_title}, Features: {input_features}")

        if not popular_books['Book-ID'].isin([book_id]).any():
            print(f"[WARN] Book ID {book_id} ({input_title}) not in filtered popular books")
            print("Falling back to using all books for content-based recommendations")
            popular_books = books.copy()
            popular_books['Total-Ratings'] = 0
            popular_books['Book-ID'] = popular_books['ISBN']  # Ensure Book-ID column exists

        # Verify input book in dataset
        if input_features not in popular_books['combined_features'].values:
            print(f"[WARN] Book features for {input_title} ({input_features}) not in filtered dataset")
            print("Sample combined_features:", popular_books['combined_features'].head(5).tolist())
            raise HTTPException(status_code=404, detail=f"Book {input_title} not found in processed dataset")

        # TF-IDF Vectorization
        tf = TfidfVectorizer(ngram_range=(1, 2), min_df=1, stop_words='english')
        tfidf_matrix = tf.fit_transform(popular_books['combined_features'])
        normalized_df = tfidf_matrix.astype(np.float32)
        cosine_similarities = cosine_similarity(normalized_df, normalized_df)

        # Debug: Log TF-IDF matrix shape
        print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")

        # Find index of input book
        idx = popular_books.index[popular_books['combined_features'] == input_features].tolist()
        if not idx:
            print(f"[ERROR] Could not find index for book {input_title} with features: {input_features}")
            print("Sample combined_features in dataset:", popular_books['combined_features'].head(5).tolist())
            raise HTTPException(status_code=500, detail=f"Internal error: Could not process book features for {input_title}")

        idx = idx[0]

        # Get similar books
        similar_indices = cosine_similarities[idx].argsort()[::-1]
        similar_items = []
        for i in similar_indices:
            if popular_books['Book-Title'].iloc[i] != input_title and \
               popular_books['Book-Title'].iloc[i] not in similar_items and \
               len(similar_items) < 5:
                similar_items.append(popular_books['Book-Title'].iloc[i])

        # Debug: Log recommendations
        print(f"Recommended books for {input_title}: {similar_items}")

        # Fallback if no recommendations
        if not similar_items:
            print("[WARN] No similar books found, returning popular books as fallback")
            average_rating = ratings.groupby('Book-ID')['Book-Rating'].mean().reset_index()
            rating_count = ratings.groupby('Book-ID')['Book-Rating'].count().reset_index().rename(
                columns={'Book-Rating': 'ratingCount'}
            )
            average_rating = average_rating.merge(rating_count, on='Book-ID')
            top_books = average_rating.sort_values('ratingCount', ascending=False).head(5)
            result = top_books.merge(books, left_on='Book-ID', right_on='ISBN')
            similar_items = result['Book-Title'].tolist()
            print(f"Fallback recommendations: {similar_items}")

        return similar_items

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in /content-based: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
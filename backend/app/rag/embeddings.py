"""
CreditLens Semantic Embedding Engine
Generates 384-dimensional dense semantic vector representations for knowledge documents and user queries.
"""
import numpy as np
from typing import List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from app.rag.config import rag_settings

class EmbeddingEngine:
    def __init__(self, dimension: int = rag_settings.EMBEDDING_DIMENSION):
        self.dimension = dimension
        self._st_model = None
        self._tfidf = None
        self._svd = None
        self._is_initialized = False

    def initialize_with_corpus(self, corpus: List[str]):
        """Initializes the semantic dense encoder on the knowledge base corpus."""
        if self._is_initialized:
            return

        try:
            from sentence_transformers import SentenceTransformer
            self._st_model = SentenceTransformer(rag_settings.EMBEDDING_MODEL)
            self._is_initialized = True
            return
        except Exception:
            self._st_model = None

        clean_corpus = [c.lower().strip() for c in corpus if c.strip()]
        if not clean_corpus:
            clean_corpus = ["credit risk", "interest rate", "minimum amount due", "utilization ratio"]

        self._tfidf = TfidfVectorizer(
            ngram_range=(1, 3),
            analyzer="word",
            stop_words="english",
            sublinear_tf=True,
            max_features=2500,
            token_pattern=r"(?u)\b\w+\b"
        )
        tfidf_matrix = self._tfidf.fit_transform(clean_corpus)
        n_components = min(self.dimension, tfidf_matrix.shape[1] - 1, tfidf_matrix.shape[0] - 1)
        if n_components < 2:
            n_components = max(1, min(self.dimension, tfidf_matrix.shape[1]))

        self._svd = TruncatedSVD(n_components=n_components, random_state=42)
        self._svd.fit(tfidf_matrix)
        self._is_initialized = True

    def embed_text(self, text: str) -> List[float]:
        """Embeds a single string into a 384-dimensional unit vector."""
        return self.embed_batch([text])[0]

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embeds a batch of strings into a list of 384-dimensional unit vectors."""
        if not texts:
            return []

        if self._st_model is not None:
            embeddings = self._st_model.encode(texts, normalize_embeddings=True)
            return embeddings.tolist()

        if self._tfidf is None or self._svd is None:
            self.initialize_with_corpus(texts)

        lower_texts = [t.lower().strip() for t in texts]
        tfidf_vecs = self._tfidf.transform(lower_texts)
        reduced = self._svd.transform(tfidf_vecs)

        n_samples = reduced.shape[0]
        curr_dim = reduced.shape[1]
        dense_vectors = np.zeros((n_samples, self.dimension), dtype=np.float32)

        for i in range(n_samples):
            # If text has zero tokens matching the vocabulary, assign a pure zero vector
            if tfidf_vecs[i].nnz == 0:
                continue

            if curr_dim >= self.dimension:
                dense_vectors[i, :] = reduced[i, :self.dimension]
            else:
                dense_vectors[i, :curr_dim] = reduced[i]

            norm = np.linalg.norm(dense_vectors[i])
            if norm > 0:
                dense_vectors[i] = dense_vectors[i] / norm

        return dense_vectors.tolist()

embedding_engine = EmbeddingEngine()

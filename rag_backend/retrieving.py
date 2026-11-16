import os
import glob
from dotenv import load_dotenv

load_dotenv()

# 1. LOAD ENVIRONMENT VARIABLES
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
EMBEDDING_MODEL = "embed-english-v3.0"
QDRANT_COLLECTION_NAME = "humanoid_ai_book"

# 2. LOCAL TEXTBOOK INDEX (RESILIENT BACKUP)
_cached_chunks = []

def _load_local_book_chunks():
    global _cached_chunks
    if _cached_chunks:
        return _cached_chunks

    possible_dirs = [
        os.path.join(os.path.dirname(__file__), "book_docs"),
        os.path.join(os.path.dirname(__file__), "..", "docs"),
        os.path.abspath("docs"),
        os.path.abspath("book_docs"),
    ]

    docs_dir = None
    for d in possible_dirs:
        if os.path.exists(d) and os.path.isdir(d):
            docs_dir = d
            break

    chunks = []
    if docs_dir:
        for root, _, files in sorted(os.walk(docs_dir)):
            for file in sorted(files):
                if file.endswith(".md"):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()
                            raw_sections = content.split("\n## ")
                            for idx, sec in enumerate(raw_sections):
                                header = sec.split("\n")[0].replace("#", "").strip() if idx > 0 else "Introduction"
                                text = ("## " + sec) if idx > 0 else sec
                                chunks.append({
                                    "file": file,
                                    "title": header,
                                    "text": text.strip()
                                })
                    except Exception as err:
                        print(f"⚠️ Error reading {file_path}: {err}")

    _cached_chunks = chunks
    return _cached_chunks

_load_local_book_chunks()

def _search_local_textbook(query: str, top_k: int = 3) -> str:
    chunks = _load_local_book_chunks()
    if not chunks:
        return "No local textbook files available."

    query_tokens = [w.lower().strip("?,!.:;\"'()[]{}") for w in query.split() if len(w.strip()) > 1]
    stop_words = {"what", "is", "the", "a", "an", "and", "or", "in", "of", "to", "for", "with", "on", "at", "by", "from", "how", "why", "does", "can", "explain", "tell", "me", "about"}
    keywords = [w for w in query_tokens if w not in stop_words] or query_tokens

    scored = []
    for chunk in chunks:
        title_lower = chunk["title"].lower()
        text_lower = chunk["text"].lower()

        score = 0
        for kw in keywords:
            if kw in title_lower:
                score += 5
            count = text_lower.count(kw)
            if count > 0:
                score += min(count, 4)

        if score > 0:
            scored.append((score, chunk))

    scored.sort(key=lambda x: x[0], reverse=True)

    if not scored:
        return "No specific match found in the textbook for this query."

    results = []
    for score, chunk in scored[:top_k]:
        results.append(f"--- SOURCE: {chunk['file']} | SECTION: {chunk['title']} ---\n{chunk['text']}")

    return "\n\n".join(results)


# 3. QDRANT CLIENT SETUP
qdrant_client = None
cohere_client = None
qdrant_disabled = False

if QDRANT_URL and QDRANT_API_KEY and COHERE_API_KEY:
    try:
        from qdrant_client import QdrantClient
        import cohere
        qdrant_client = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY,
            check_compatibility=False,
            timeout=10
        )
        cohere_client = cohere.Client(COHERE_API_KEY, timeout=10)
        print("✅ Qdrant and Cohere clients successfully connected.")
    except Exception as e:
        print(f"⚠️ Qdrant client connection error: {e}")
        qdrant_disabled = True


def retrieve_textbook_info(query: str) -> str:
    """
    Searches the Qdrant vector database containing all 7 chapters of the Physical AI textbook.
    Returns matched chunks directly from the user's Qdrant cluster.
    """
    global qdrant_disabled
    print(f"🔎 [Tool] Searching Qdrant cluster for: '{query}'")

    # A. Primary: Search Qdrant cluster
    if qdrant_client and cohere_client and not qdrant_disabled:
        try:
            emb_resp = cohere_client.embed(
                texts=[query],
                model=EMBEDDING_MODEL,
                input_type="search_query"
            )
            query_vector = emb_resp.embeddings[0]

            result = qdrant_client.query_points(
                collection_name=QDRANT_COLLECTION_NAME,
                query=query_vector,
                limit=4
            )

            if result.points:
                contents = ""
                for point in result.points:
                    source_url = point.payload.get("url", "Textbook")
                    section = point.payload.get("section", "")
                    chapter = point.payload.get("chapter", "")
                    text = point.payload.get("text", "")
                    contents += f"--- SOURCE: {source_url} | {chapter} - {section} ---\n{text}\n\n"
                print(f"✅ [Tool] Qdrant search returned {len(result.points)} relevant vectors.")
                return contents
            else:
                print("⚠️ [Tool] Qdrant returned 0 points, checking backup docs...")
        except Exception as q_err:
            print(f"⚠️ [Tool] Qdrant search error ({q_err}), switching to local backup.")

    # B. Resilient fallback if cluster temporarily unreachable
    local_result = _search_local_textbook(query, top_k=3)
    print(f"✅ [Tool] Retrieved information from backup textbook docs.")
    return local_result

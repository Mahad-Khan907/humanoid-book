import os
import glob
from dotenv import load_dotenv
import cohere
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

# 1. Load Environment Variables
load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
COLLECTION_NAME = "humanoid_ai_book"
EMBED_MODEL = "embed-english-v3.0"

print("--- 🚀 INGESTING TEXTBOOK CHAPTERS TO QDRANT ---")
print(f"Connecting to Qdrant: {QDRANT_URL}")

qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, check_compatibility=False)
cohere_client = cohere.Client(COHERE_API_KEY)

# 2. Locate Docs
docs_dir = os.path.join(os.path.dirname(__file__), "..", "docs")
if not os.path.exists(docs_dir):
    docs_dir = os.path.join(os.path.dirname(__file__), "book_docs")

print(f"Reading chapters from: {docs_dir}")

# 3. Create or Recreate Collection
print(f"Creating Qdrant collection: '{COLLECTION_NAME}' (dim=1024, cosine)...")
qdrant.recreate_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
)

# 4. Extract Chunks from all Chapters
all_chunks = []
for root, _, files in sorted(os.walk(docs_dir)):
    for file in sorted(files):
        if file.endswith(".md"):
            rel_dir = os.path.basename(root)
            file_path = os.path.join(root, file)
            doc_url = f"/docs/{rel_dir}/{file.replace('.md', '')}"

            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Split content by sections (## )
            raw_sections = content.split("\n## ")
            chapter_title = raw_sections[0].split("\n")[0].replace("#", "").strip()

            for idx, sec in enumerate(raw_sections):
                if idx == 0:
                    title = chapter_title
                    text = sec.strip()
                else:
                    lines = sec.split("\n")
                    title = f"{chapter_title} - {lines[0].replace('#', '').strip()}"
                    text = ("## " + sec).strip()

                if len(text) > 30:
                    all_chunks.append({
                        "url": doc_url,
                        "chapter": chapter_title,
                        "section": title,
                        "text": text
                    })

print(f"Total sections extracted from chapters: {len(all_chunks)}")

# 5. Embed and Upload to Qdrant
points = []
batch_size = 16

for i in range(0, len(all_chunks), batch_size):
    batch = all_chunks[i:i + batch_size]
    texts = [b["text"] for b in batch]

    print(f"Embedding batch {i // batch_size + 1} ({len(batch)} chunks)...")
    response = cohere_client.embed(
        texts=texts,
        model=EMBED_MODEL,
        input_type="search_document"
    )

    for idx_in_batch, emb in enumerate(response.embeddings):
        global_idx = i + idx_in_batch
        item = batch[idx_in_batch]
        points.append(PointStruct(
            id=global_idx + 1,
            vector=emb,
            payload={
                "url": item["url"],
                "chapter": item["chapter"],
                "section": item["section"],
                "text": item["text"]
            }
        ))

print(f"Uploading {len(points)} vectors to Qdrant collection '{COLLECTION_NAME}'...")
qdrant.upsert(
    collection_name=COLLECTION_NAME,
    points=points
)

# 6. Verify Collection
info = qdrant.get_collection(collection_name=COLLECTION_NAME)
print(f"✅ Ingestion Complete! Collection points count: {info.points_count}")
print("--- 🎉 ALL CHAPTERS STORED IN QDRANT ---")

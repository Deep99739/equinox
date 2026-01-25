# pinecone vector db integration
# using integrated embeddings (llama-text-embed-v2)
# stores long-term memory: journal entries, insights, patterns

import os
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "equinox-memory")


def get_pinecone_index():
    """get the index handle"""
    return pc.Index(INDEX_NAME)


def store_memory(user_id: str, memory_id: str, text: str, metadata: dict) -> bool:
    """
    save a memory to pinecone
    uses integrated embedding - just send text, pinecone handles the rest
    
    args:
        user_id: user uuid (used as namespace)
        memory_id: unique id for this memory
        text: the actual content to store
        metadata: extra info (type, timestamp, etc)
    """
    try:
        index = get_pinecone_index()
        index.upsert_records(
            namespace=user_id,
            records=[{
                "_id": memory_id,
                "text": text,
                **metadata
            }]
        )
        return True
    except Exception as e:
        print(f"pinecone store failed: {e}")
        return False


def search_memories(user_id: str, query: str, top_k: int = 5) -> list[dict]:
    """
    find similar memories for a user
    returns list of matches with scores
    """
    try:
        index = get_pinecone_index()
        results = index.search_records(
            namespace=user_id,
            query={"inputs": {"text": query}, "top_k": top_k},
            fields=["text", "type", "timestamp"]
        )
        
        return [
            {
                "id": hit.get("_id"),
                "score": hit.get("_score"),
                "text": hit.get("text"),
                "metadata": {k: v for k, v in hit.items() if k not in ["_id", "_score", "text"]}
            }
            for hit in results.result.get("hits", [])
        ]
    except Exception as e:
        print(f"pinecone search failed: {e}")
        return []


def delete_memory(user_id: str, memory_id: str) -> bool:
    """remove a specific memory"""
    try:
        index = get_pinecone_index()
        index.delete(ids=[memory_id], namespace=user_id)
        return True
    except Exception as e:
        print(f"pinecone delete failed: {e}")
        return False


def delete_user_memories(user_id: str) -> bool:
    """nuke all memories for a user - use carefully"""
    try:
        index = get_pinecone_index()
        index.delete(delete_all=True, namespace=user_id)
        return True
    except Exception as e:
        print(f"pinecone delete all failed: {e}")
        return False


def test_pinecone_connection() -> bool:
    """verify pinecone is working"""
    try:
        index = get_pinecone_index()
        stats = index.describe_index_stats()
        print(f"pinecone ok - {stats.total_vector_count} vectors")
        return True
    except Exception as e:
        print(f"pinecone connection failed: {e}")
        return False


# memory types we track
MEMORY_TYPES = {
    "health_insight": "patterns from health data",
    "workout_feedback": "how they felt about workouts",
    "journal_entry": "gratitude and reflections", 
    "wellness_pattern": "recurring trends",
    "user_preference": "things they like/dislike",
    "conversation": "key moments from chat"
}

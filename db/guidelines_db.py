def fetch_guidelines_list(category, product_id, crop, topic, seasonal):
    return [
        {
            "guideline_id": -99999,
            "title": "mock_title",
            "thumbnail_url": "mock_thumbnail_url",
            "category": "mock_category",
            "related_product_id": -99999,
            "crops": "mock_crop",
            "topics": "mock_topic",
            "is_seasonal": False,
            "is_pinned": False,
            "pdf_url": "mock_pdf_url",
        }
    ]

def fetch_guideline_by_id(guideline_id):
    return {
        "guideline_id": guideline_id,
        "title": "mock_title",
        "author": "mock_author",
        "published_at": "2000-01-01",
        "category": "mock_category",
        "related_product_id": -99999,
        "crops": "mock_crop",
        "topics": "mock_topic",
        "is_seasonal": False,
        "is_pinned": False,
        "pdf_url": "mock_pdf_url",
        "body": "mock_body",
    }

def fetch_news_list():
    return [
        {
            "news_id": -99999,
            "title": "mock_title",
            "published_at": "2000-01-01",
            "thumbnail_url": "mock_thumbnail_url",
            "website_url": "mock_website_url",
        }
    ]

def insert_guideline(body: dict):
    return "mock_id"

def update_guideline_by_id(guideline_id: int, body: dict):
    return {"guideline_id": guideline_id}

def insert_news_item(body: dict):
    return "mock_id"
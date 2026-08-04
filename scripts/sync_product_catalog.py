import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))

import re
import uuid
from typing import Any, Dict, List, Optional, Set

from sqlalchemy import text

from api.routes.database import get_engine


REGION = "us-east-2"
SECRET_NAME = "database-2"

engine = get_engine(SECRET_NAME, REGION)


PRODUCT_CATALOG: List[Dict[str, Any]] = [
    {
        "source_name": "Entec 25+15",
        "product_name": "Entec 25+15",
        "weight": "50kg",
        "formula": "25+15",
        "company": "Entec",
        "category_group": "Fertilizer",
        "category": "Premium Imported Complex Fertilizer",
        "point_factor": 10,
        "short_desc": "THE STABILIZED MINERAL FERTILIZER FOR OPTIMAL NITROGEN EFFICIENCY",
        "description": """Optimized Nitrogen Stability
Slows nitrification for long-lasting N availability and balanced NH4+/NO3- nutrition.

Enhanced Nutrient Uptake
Boosts P availability and root-shoot development for stronger, more vigorous crops.

Environmental Protection
Cuts nitrate leaching and greenhouse gas emissions for cleaner, more sustainable farming.

Higher Yield & Profitability
Proven increases in crop yield, quality, and nitrogen-use efficiency across global trials.""",
        "nutrients": "",
        "brand_image": "entec-brand.png",
    },
    {
        "source_name": "Entec 24-8-7",
        "product_name": "Entec 24-8-7",
        "weight": "25kg",
        "formula": "24-8-7",
        "company": "Entec",
        "category_group": "Fertilizer",
        "category": "Premium Imported Complex Fertilizer",
        "point_factor": 10,
        "short_desc": "THE STABILIZED MINERAL FERTILIZER FOR OPTIMAL NITROGEN EFFICIENCY",
        "description": """Optimized Nitrogen Stability
Slows nitrification for long-lasting N availability and balanced NH4+/NO3- nutrition.

Enhanced Nutrient Uptake
Boosts P availability and root-shoot development for stronger, more vigorous crops.

Environmental Protection
Cuts nitrate leaching and greenhouse gas emissions for cleaner, more sustainable farming.

Higher Yield & Profitability
Proven increases in crop yield, quality, and nitrogen-use efficiency across global trials.""",
        "nutrients": "",
        "brand_image": "entec-brand.png",
    },
    {
        "source_name": "Entec 20-10-10",
        "product_name": "Entec 20-10-10",
        "weight": "50kg",
        "formula": "20-10-10",
        "company": "Entec",
        "category_group": "Fertilizer",
        "category": "Premium Imported Complex Fertilizer",
        "point_factor": 10,
        "short_desc": "THE STABILIZED MINERAL FERTILIZER FOR OPTIMAL NITROGEN EFFICIENCY",
        "description": """Optimized Nitrogen Stability
Slows nitrification for long-lasting N availability and balanced NH4+/NO3- nutrition.

Enhanced Nutrient Uptake
Boosts P availability and root-shoot development for stronger, more vigorous crops.

Environmental Protection
Cuts nitrate leaching and greenhouse gas emissions for cleaner, more sustainable farming.

Higher Yield & Profitability
Proven increases in crop yield, quality, and nitrogen-use efficiency across global trials.""",
        "nutrients": "P2O5 (10%), N (20%), K2O (10%), S (3%)",
        "brand_image": "entec-brand.png",
    },
    {
        "source_name": "Nitrophoska Blue",
        "product_name": "Nitrophoska Blue",
        "weight": "25kg",
        "formula": "12-12-17+1, 2Mg+8S+TE",
        "company": "Nitrophoska",
        "category_group": "Fertilizer",
        "category": "Premium Imported Complex Fertilizer",
        "point_factor": 10,
        "short_desc": "THE ALL-IN-ONE GRANULE SUFFICIENT SOLUTION FOR DURIAN",
        "description": """Balanced All-in-One Granules
Uniform NPK, secondary nutrients, and micronutrients in every granule for complete, efficient plant nutrition.

Superior Distribution & Root-Zone Delivery
Even spreading, zero segregation, and quick dissolution directly where roots need nutrients.

High Nutrient Efficiency
Reduced soil acidification, phosphorus availability, and lower nutrient losses for long-term soil health.

Yield & Quality Maximization
Enhanced growth, improved crop quality, and stronger profitability for every farming system.""",
        "nutrients": "P2O5 (12%), K2O (17%), N (12%), S (8%), TE, MgO (2%)",
        "brand_image": "nitrophoska-brand.png",
    },
    {
        "source_name": "Nitrophoska Green",
        "product_name": "Nitrophoska Green",
        "weight": "50kg",
        "formula": "15-15-15+2S",
        "company": "Nitrophoska",
        "category_group": "Fertilizer",
        "category": "Premium Imported Complex Fertilizer",
        "point_factor": 10,
        "short_desc": "THE ALL-IN-ONE GRANULE SUFFICIENT SOLUTION FOR DURIAN",
        "description": """Balanced All-in-One Granules
Uniform NPK, secondary nutrients, and micronutrients in every granule for complete, efficient plant nutrition.

Superior Distribution & Root-Zone Delivery
Even spreading, zero segregation, and quick dissolution directly where roots need nutrients.

High Nutrient Efficiency
Reduced soil acidification, phosphorus availability, and lower nutrient losses for long-term soil health.

Yield & Quality Maximization
Enhanced growth, improved crop quality, and stronger profitability for every farming system.""",
        "nutrients": "N (15%), S (2%), P2O5 (15%), K2O (15%)",
        "brand_image": "nitrophoska-brand.png",
    },
    {
        "source_name": "Nitrophoska Perfect",
        "product_name": "Nitrophoska Perfect",
        "weight": "25kg",
        "formula": "100% SOP",
        "company": "Nitrophoska",
        "category_group": "Fertilizer",
        "category": "Premium Imported Complex Fertilizer",
        "point_factor": 10,
        "short_desc": "THE ALL-IN-ONE GRANULE SUFFICIENT SOLUTION FOR DURIAN",
        "description": """Balanced All-in-One Granules
Uniform NPK, secondary nutrients, and micronutrients in every granule for complete, efficient plant nutrition.

Superior Distribution & Root-Zone Delivery
Even spreading, zero segregation, and quick dissolution directly where roots need nutrients.

High Nutrient Efficiency
Reduced soil acidification, phosphorus availability, and lower nutrient losses for long-term soil health.

Yield & Quality Maximization
Enhanced growth, improved crop quality, and stronger profitability for every farming system.""",
        "nutrients": "P2O5 (5%), TE, N (15%), K2O (20%), MgO (2%), S (8%)",
        "brand_image": "nitrophoska-brand.png",
    },
    {
        "source_name": "NovaTec Perfekt",
        "product_name": "NovaTec Perfekt",
        "weight": "25kg",
        "formula": "16-5-20+MgO+7S+TE",
        "company": "Novatec",
        "category_group": "Fertilizer",
        "category": "Chlorine-free Fertilizers",
        "point_factor": 6,
        "short_desc": "NovaTec is the COMPO EXPERT innovation in granular compound NPK-fertilizer stabilized with DMPP.",
        "description": """Lower N losses from leaching and volatilisation.
Reduced number of applications required.
Improved yield and quality due to extended N supply and increased ammonium nutrition.
Positive pH effect in the root zone gives superior P and micronutrient availability.
Crops develop and ripen more evenly due to a stabilised N supply.
Can help to reduce free nitrate levels in fresh mass.""",
        "nutrients": "",
        "brand_image": "novatec-brand.png",
    },
    {
        "source_name": "NovaTec Pro",
        "product_name": "NovaTec Pro",
        "weight": "25kg",
        "formula": "16-5-20+MgO+7S+TE",
        "company": "Novatec",
        "category_group": "Fertilizer",
        "category": "Chlorine-free Fertilizers",
        "point_factor": 6,
        "short_desc": "NovaTec is the COMPO EXPERT innovation in granular compound NPK-fertilizer stabilized with DMPP.",
        "description": """Lower N losses from leaching and volatilisation.
Reduced number of applications required.
Improved yield and quality due to extended N supply and increased ammonium nutrition.
Positive pH effect in the root zone gives superior P and micronutrient availability.
Crops develop and ripen more evenly due to a stabilised N supply.
Can help to reduce free nitrate levels in fresh mass.""",
        "nutrients": "",
        "brand_image": "novatec-brand.png",
    },
    {
        "source_name": "NovaTec 14-7-17",
        "product_name": "NovaTec 14-7-17",
        "weight": "25kg",
        "formula": "14-7-17-2-9S+TE",
        "company": "Novatec",
        "category_group": "Fertilizer",
        "category": "Chlorine-free Fertilizers",
        "point_factor": 6,
        "short_desc": "NovaTec is the COMPO EXPERT innovation in granular compound NPK-fertilizer stabilized with DMPP.",
        "description": """Lower N losses from leaching and volatilisation.
Reduced number of applications required.
Improved yield and quality due to extended N supply and increased ammonium nutrition.
Positive pH effect in the root zone gives superior P and micronutrient availability.
Crops develop and ripen more evenly due to a stabilised N supply.
Can help to reduce free nitrate levels in fresh mass.""",
        "nutrients": "",
        "brand_image": "novatec-brand.png",
    },
    {
        "source_name": "NovaTec Premium",
        "product_name": "NovaTec Premium",
        "weight": "25kg",
        "formula": "15-3-20-2+10S+TE",
        "company": "Novatec",
        "category_group": "Fertilizer",
        "category": "Chlorine-free Fertilizers",
        "point_factor": 6,
        "short_desc": "NovaTec is the COMPO EXPERT innovation in granular compound NPK-fertilizer stabilized with DMPP.",
        "description": """Lower N losses from leaching and volatilisation.
Reduced number of applications required.
Improved yield and quality due to extended N supply and increased ammonium nutrition.
Positive pH effect in the root zone gives superior P and micronutrient availability.
Crops develop and ripen more evenly due to a stabilised N supply.
Can help to reduce free nitrate levels in fresh mass.""",
        "nutrients": "N (15%), P2O5 (3%), K2O (20%), S (9%), TE, MgO (2%)",
        "brand_image": "novatec-brand.png",
    },
    {
        "source_name": "Yuroka Green",
        "product_name": "Yuroka 16-16-16",
        "weight": "25kg",
        "formula": "16-16-16",
        "company": "Yuroka",
        "category_group": "Fertilizer",
        "category": "Premium Compound Fertilizer",
        "point_factor": 1,
        "short_desc": "Premium compound fertilizer with balanced NPK composition.",
        "description": "Premium compound fertilizer formulated for balanced crop nutrition.",
        "nutrients": "NPK 16-16-16",
        "brand_image": "yuroka-brand.png",
    },
    {
        "source_name": "Yuroka Purple",
        "product_name": "Yuroka 17-7-17",
        "weight": "25kg",
        "formula": "17-7-17",
        "company": "Yuroka",
        "category_group": "Fertilizer",
        "category": "Premium Compound Fertilizer",
        "point_factor": 1,
        "short_desc": "Premium compound fertilizer with NPK 17-7-17 composition.",
        "description": "Premium compound fertilizer formulated for crop nutrition and retailer sales engagement.",
        "nutrients": "NPK 17-7-17",
        "brand_image": "yuroka-brand.png",
    },
    {
        "source_name": "Yuroka Red",
        "product_name": "Yuroka 19-6-19",
        "weight": "25kg",
        "formula": "19-6-19",
        "company": "Yuroka",
        "category_group": "Fertilizer",
        "category": "Premium Compound Fertilizer",
        "point_factor": 1,
        "short_desc": "Premium compound fertilizer with NPK 19-6-19 composition.",
        "description": "Premium compound fertilizer formulated for crop nutrition and retailer sales engagement.",
        "nutrients": "NPK 19-6-19",
        "brand_image": "yuroka-brand.png",
    },
    {
        "source_name": "Yuroka Yellow",
        "product_name": "Yuroka 21-0-21",
        "weight": "25kg",
        "formula": "21-0-21",
        "company": "Yuroka",
        "category_group": "Fertilizer",
        "category": "Premium Compound Fertilizer",
        "point_factor": 1,
        "short_desc": "Premium compound fertilizer with NPK 21-0-21 composition.",
        "description": "Premium compound fertilizer formulated for crop nutrition and retailer sales engagement.",
        "nutrients": "NPK 21-0-21",
        "brand_image": "yuroka-brand.png",
    },
    {
        "source_name": "Fertiganic 650M",
        "product_name": "Fertiganic 650M",
        "weight": "25kg",
        "formula": "65OM+3-2-2+70TE",
        "company": "Fertiganic",
        "category_group": "Fertilizer",
        "category": "Premium Organic Fertilizer",
        "point_factor": 3,
        "short_desc": "ADVANCED ORGANIC NUTRITION ENRICHED WITH NATURAL MINERALS AND BIOSTIMULATION.",
        "description": """Produced using cutting-edge technology, it features a high organic content and an optimal C/N ratio for superior performance.
Enriched with Auruma organic minerals, it provides over 70 essential minerals and trace elements to support robust plant growth and vitality.
Enhanced with Panengetic, a biological regulator technology from Switzerland, it maximizes crop yield potential by optimizing nutrient uptake and plant health.
Hard granules ensure easy handling, fast dissolution for quick nutrient availability, and a mild odor for user-friendly application.""",
        "nutrients": "65OM + 3-2-2 + 70TE",
        "brand_image": "fertiganic-brand.png",
    },
    {
        "source_name": "Gowin Mat Truoc",
        "product_name": "Gowin Mat Truoc",
        "weight": "25kg",
        "formula": "",
        "company": "Gowin",
        "category_group": "Fertilizer",
        "category": "Organic Fertilizer",
        "point_factor": 3,
        "short_desc": "Organic fertilizer product for crop nutrition support.",
        "description": "Organic fertilizer product for crop nutrition support and retailer engagement.",
        "nutrients": "",
        "brand_image": "",
    },
    {
        "source_name": "Growel M+",
        "product_name": "Growel M+",
        "weight": "25kg",
        "formula": "50OM+2-2-2+70TE",
        "company": "Growel",
        "category_group": "Fertilizer",
        "category": "Organic Fertilizer",
        "point_factor": 3,
        "short_desc": "Organic fertilizer with 50OM, 2-2-2 composition, and 70TE.",
        "description": "Organic fertilizer product with 50OM, 2-2-2 composition, and trace element support.",
        "nutrients": "50OM + 2-2-2 + 70TE",
        "brand_image": "",
    },
]


def slugify(name: str) -> str:
    cleaned = name.lower().strip()
    cleaned = re.sub(r"[^a-z0-9]+", "-", cleaned)
    return cleaned.strip("-")


def get_columns(conn, table_name: str) -> Set[str]:
    rows = conn.execute(
        text(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = :table_name;
            """
        ),
        {"table_name": table_name},
    ).fetchall()

    return {row[0] for row in rows}


def get_product_id_type(conn) -> Optional[str]:
    row = conn.execute(
        text(
            """
            SELECT udt_name
            FROM information_schema.columns
            WHERE table_name = 'products'
              AND column_name = 'product_id'
            LIMIT 1;
            """
        )
    ).first()

    return row[0] if row else None


def ensure_product_columns(conn) -> None:
    conn.execute(
        text(
            """
            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS brand TEXT,
            ADD COLUMN IF NOT EXISTS company TEXT,
            ADD COLUMN IF NOT EXISTS weight TEXT,
            ADD COLUMN IF NOT EXISTS formula TEXT,
            ADD COLUMN IF NOT EXISTS category_group TEXT,
            ADD COLUMN IF NOT EXISTS sub_cat TEXT,
            ADD COLUMN IF NOT EXISTS short_desc TEXT,
            ADD COLUMN IF NOT EXISTS nutrients TEXT,
            ADD COLUMN IF NOT EXISTS key_features TEXT,
            ADD COLUMN IF NOT EXISTS application TEXT,
            ADD COLUMN IF NOT EXISTS image_url TEXT,
            ADD COLUMN IF NOT EXISTS brand_image_url TEXT,
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT FALSE;
            """
        )
    )


def find_existing_product_id(conn, source_name: str, product_name: str) -> Optional[Any]:
    row = conn.execute(
        text(
            """
            SELECT product_id
            FROM products
            WHERE LOWER(product_name) = LOWER(:source_name)
               OR LOWER(product_name) = LOWER(:product_name)
            LIMIT 1;
            """
        ),
        {
            "source_name": source_name,
            "product_name": product_name,
        },
    ).first()

    return row[0] if row else None


def update_dynamic(conn, table_name: str, product_id: Any, data: Dict[str, Any]) -> None:
    assignments = ", ".join([f"{column} = :{column}" for column in data.keys()])

    conn.execute(
        text(
            f"""
            UPDATE {table_name}
            SET {assignments}
            WHERE product_id = :product_id;
            """
        ),
        {
            **data,
            "product_id": product_id,
        },
    )


def insert_dynamic(conn, table_name: str, data: Dict[str, Any]) -> None:
    columns = list(data.keys())
    column_sql = ", ".join(columns)
    value_sql = ", ".join([f":{column}" for column in columns])

    conn.execute(
        text(
            f"""
            INSERT INTO {table_name} ({column_sql})
            VALUES ({value_sql});
            """
        ),
        data,
    )


def build_product_data(row: Dict[str, Any], product_columns: Set[str]) -> Dict[str, Any]:
    product_name = row["product_name"]
    image_filename = f"{slugify(product_name)}.png"
    brand_image = row.get("brand_image") or ""

    raw_data = {
        "product_name": product_name,
        "brand": row["company"].strip(),
        "company": row["company"].strip(),
        "weight": row["weight"],
        "formula": row["formula"],
        "category_group": row["category_group"],
        "category": row["category"],
        "sub_cat": row["category"],
        "point_factor": row["point_factor"],
        "short_desc": row["short_desc"],
        "description": row["description"],
        "nutrients": row["nutrients"],
        "key_features": row["description"],
        "application": "",
        "image_url": f"/product-images/{image_filename}",
        "brand_image_url": f"/product-images/{brand_image}" if brand_image else None,
        "is_active": True,
        "is_seasonal": False,
    }

    return {
        key: value
        for key, value in raw_data.items()
        if key in product_columns
    }


def main() -> None:
    with engine.begin() as conn:
        ensure_product_columns(conn)

        product_columns = get_columns(conn, "products")
        product_id_type = get_product_id_type(conn)

        updated_count = 0
        inserted_count = 0

        for row in PRODUCT_CATALOG:
            product_id = find_existing_product_id(
                conn,
                source_name=row["source_name"],
                product_name=row["product_name"],
            )

            product_data = build_product_data(row, product_columns)

            if product_id:
                update_dynamic(conn, "products", product_id, product_data)
                updated_count += 1
            else:
                insert_data = dict(product_data)

                if "product_id" in product_columns and product_id_type == "uuid":
                    insert_data["product_id"] = str(uuid.uuid4())

                insert_dynamic(conn, "products", insert_data)
                inserted_count += 1

        print(f"Updated products: {updated_count}")
        print(f"Inserted products: {inserted_count}")
        print()
        print("Rename/upload product images to these exact paths:")
        print("-" * 72)

        for row in PRODUCT_CATALOG:
            product_name = row["product_name"]
            filename = f"{slugify(product_name)}.png"
            print(
                f"{product_name}  ->  "
                f"bm-admin/public/product-images/{filename}"
            )

        print("-" * 72)
        print("Done.")


if __name__ == "__main__":
    main()
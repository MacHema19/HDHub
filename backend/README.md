# HDS Consultancy Affiliate Backend

FastAPI backend for the Affiliate Partner Program.

It generates affiliate IDs, builds referral links and saves every submitted form to:

`backend/data/affiliates.csv`

## Run

```bash
cd /Users/mshema/Documents/GitHub/hds_test_dev_hd/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8014
```

## API

- `GET /api/health`
- `POST /api/affiliates`
- `GET /api/affiliates`
- `GET /api/affiliates/{id-or-affiliate-id}`
- `PATCH /api/affiliates/{id-or-affiliate-id}`
- `DELETE /api/affiliates/{id-or-affiliate-id}`

Affiliate ID examples:

- `HDS-AFF-0001`
- `HDS-REF-0001`
- `HDS-INF-0001`

Referral link format:

`https://mindzlabz.com/?ref=HDSAFF0001`

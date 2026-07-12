import os
import re
import uuid
import json
import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional, Literal
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import bcrypt
import jwt as pyjwt
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr


# --------------------- setup ---------------------
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "aurelia_db")
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


# --------------------- helpers ---------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id, "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    # Use secure=False and samesite="lax" for local HTTP development.
    # In production (HTTPS), set secure=True and samesite="none".
    is_production = os.environ.get("ENVIRONMENT", "development").lower() == "production"
    response.set_cookie(
        "access_token", access,
        httponly=True,
        secure=is_production,
        samesite="none" if is_production else "lax",
        max_age=43200,
        path="/"
    )
    response.set_cookie(
        "refresh_token", refresh,
        httponly=True,
        secure=is_production,
        samesite="none" if is_production else "lax",
        max_age=604800,
        path="/"
    )

def public_user(u: dict) -> dict:
    return {
        "id": u["id"],
        "email": u["email"],
        "name": u.get("name", ""),
        "role": u.get("role", "user"),
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        h = request.headers.get("Authorization", "")
        if h.lower().startswith("bearer ") and len(h) > 7:
            token = h[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    uid = payload.get("sub")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = await db.users.find_one({"id": uid}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user.pop("password_hash", None)
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# --------------------- models ---------------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=80)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class MenuItemIn(BaseModel):
    name: str
    description: str = ""
    price: float = Field(gt=0)
    category: str = "Main"
    image: str = ""
    badge: str = ""

class ReservationIn(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    persons: int = Field(default=2, ge=1)
    date: str      # ISO YYYY-MM-DD
    time: str      # e.g. "07:00pm"
    message: str = ""
    table: Optional[str] = None

class ContactIn(BaseModel):
    name: str
    email: EmailStr
    message: str = Field(min_length=1)

class ChatMessage(BaseModel):
    role: Literal["user", "bot"]
    text: str

class ChatIn(BaseModel):
    session_id: str
    message: str
    history: list[ChatMessage] = Field(default_factory=list)

class StatusIn(BaseModel):
    status: Literal["pending", "confirmed", "cancelled"]

class WaitlistIn(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    persons: int = Field(default=2, ge=1)
    message: str = ""

class FeedbackIn(BaseModel):
    name: str = ""
    email: Optional[EmailStr] = None
    rating: Optional[int] = None
    message: str = ""
    source: str = "web"
    # structured fields sent by the web feedback flow
    overall: Optional[str] = None
    ratings: dict = Field(default_factory=dict)
    comments: str = ""
    recommend: Optional[str] = None
    date: str = ""


class QuoteIn(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    phone: str = Field(min_length=1)
    guests: int = Field(default=2, ge=1)
    date: str = ""
    occasion: str = ""
    notes: str = ""


# --------------------- app & CORS (must be registered before routes) -----------
app = FastAPI(title="Aurelia API")

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
origins = {frontend_url, "http://localhost:3000"}
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api")


# --------------------- auth routes ---------------------
@api.post("/auth/register")
async def register(inp: RegisterIn, response: Response):
    email = inp.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    uid = str(uuid.uuid4())
    doc = {
        "id": uid, "email": email, "name": inp.name.strip(),
        "password_hash": hash_password(inp.password),
        "role": "user", "created_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        await db.users.insert_one(doc.copy())
    except Exception:
        raise HTTPException(status_code=400, detail="Email already registered")
    access = create_access_token(uid, email, "user")
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    doc.pop("password_hash", None)
    return public_user(doc)

@api.post("/auth/login")
async def login(inp: LoginIn, response: Response):
    email = inp.email.lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(inp.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access = create_access_token(user["id"], user["email"], user.get("role", "user"))
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    return public_user(user)

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}

@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)


# --------------------- menu ---------------------
@api.get("/menu")
async def list_menu():
    items = await db.menu.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items

@api.post("/menu")
async def create_menu(inp: MenuItemIn, _: dict = Depends(require_admin)):
    doc = {"id": str(uuid.uuid4()), **inp.model_dump(),
           "created_at": datetime.now(timezone.utc).isoformat()}
    await db.menu.insert_one(doc.copy())
    return doc

@api.put("/menu/{item_id}")
async def update_menu(item_id: str, inp: MenuItemIn, _: dict = Depends(require_admin)):
    r = await db.menu.update_one({"id": item_id}, {"$set": inp.model_dump()})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    doc = await db.menu.find_one({"id": item_id}, {"_id": 0})
    return doc

@api.delete("/menu/{item_id}")
async def delete_menu(item_id: str, _: dict = Depends(require_admin)):
    r = await db.menu.delete_one({"id": item_id})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


# --------------------- reservations ---------------------
@api.post("/reservations")
async def create_reservation(inp: ReservationIn, request: Request):
    user_id = None
    token = request.cookies.get("access_token")
    if token:
        try:
            p = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            if p.get("type") == "access":
                user_id = p.get("sub")
        except pyjwt.PyJWTError:
            user_id = None
    doc = {"id": str(uuid.uuid4()), **inp.model_dump(),
           "user_id": user_id, "status": "pending",
           "created_at": datetime.now(timezone.utc).isoformat()}
    await db.reservations.insert_one(doc.copy())
    return doc

@api.get("/reservations")
async def list_reservations(_: dict = Depends(require_admin)):
    docs = await db.reservations.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs

@api.get("/reservations/mine")
async def my_reservations(user: dict = Depends(get_current_user)):
    docs = await db.reservations.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs

@api.put("/reservations/{rid}/status")
async def update_status(rid: str, inp: StatusIn, _: dict = Depends(require_admin)):
    r = await db.reservations.update_one({"id": rid}, {"$set": {"status": inp.status}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


# --------------------- contact ---------------------
@api.post("/contact")
async def submit_contact(inp: ContactIn):
    doc = {"id": str(uuid.uuid4()), **inp.model_dump(),
           "created_at": datetime.now(timezone.utc).isoformat(), "read": False}
    await db.contact.insert_one(doc.copy())
    return {"ok": True}

@api.get("/contact")
async def list_contact(_: dict = Depends(require_admin)):
    docs = await db.contact.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


# --------------------- waitlist ---------------------
class WaitlistIn(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    persons: int = 2
    message: str = ""

@api.post("/waitlist")
async def join_waitlist(inp: WaitlistIn):
    waiting = await db.waitlist.count_documents({"status": "waiting"})
    doc = {"id": str(uuid.uuid4()), **inp.model_dump(),
           "status": "waiting", "position": waiting + 1,
           "created_at": datetime.now(timezone.utc).isoformat()}
    await db.waitlist.insert_one(doc.copy())
    return doc

@api.get("/waitlist")
async def list_waitlist(_: dict = Depends(require_admin)):
    docs = await db.waitlist.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs

@api.put("/waitlist/{wid}/status")
async def update_waitlist_status(wid: str, inp: StatusIn, _: dict = Depends(require_admin)):
    r = await db.waitlist.update_one({"id": wid}, {"$set": {"status": inp.status}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}

# --------------------- feedback ---------------------
_MOOD_RATING = {"exceptional": 5, "good": 4, "neutral": 3, "disappointed": 2, "unsatisfied": 1}

@api.post("/feedback")
async def submit_feedback(inp: FeedbackIn):
    # Derive a single numeric rating from whichever fields the client sent.
    numeric = inp.rating
    if numeric is None and inp.overall:
        numeric = _MOOD_RATING.get(inp.overall)
    if numeric is None and inp.ratings:
        vals = [v for v in inp.ratings.values() if isinstance(v, (int, float))]
        if vals:
            numeric = round(sum(vals) / len(vals))
    if numeric is None:
        numeric = 5
    doc = {
        "id": str(uuid.uuid4()),
        "name": inp.name,
        "email": inp.email,
        "rating": numeric,
        "message": inp.comments or inp.message,
        "source": inp.source,
        "overall": inp.overall,
        "ratings": inp.ratings,
        "recommend": inp.recommend,
        "visit_date": inp.date,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read": False,
        "alert": numeric < 4,
    }
    await db.feedback.insert_one(doc.copy())
    return doc

@api.get("/feedback")
async def list_feedback(_: dict = Depends(require_admin)):
    docs = await db.feedback.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


# --------------------- private dining / quote requests ---------------------
@api.post("/quote")
async def submit_quote(inp: QuoteIn):
    doc = {"id": str(uuid.uuid4()), **inp.model_dump(),
           "status": "pending",
           "created_at": datetime.now(timezone.utc).isoformat()}
    await db.quotes.insert_one(doc.copy())
    return doc

@api.get("/quote")
async def list_quotes(_: dict = Depends(require_admin)):
    docs = await db.quotes.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs

# --------------------- smart menu (time-based) ---------------------
@api.get("/menu/smart")
async def smart_menu():
    now = datetime.now(timezone.utc)
    ist_offset = timedelta(hours=5, minutes=30)
    ist_now = now + ist_offset
    hour = ist_now.hour
    items = await db.menu.find({}, {"_id": 0}).to_list(200)
    if hour < 11:
        meal = "breakfast"
    elif hour < 16:
        meal = "lunch"
    else:
        meal = "dinner"
    return {"meal": meal, "items": items, "hour": hour}

# --------------------- chatbot (intent-based smart reply) ---------------------

_CHAT_STOPWORDS = frozenset({
    "what", "does", "have", "your", "about", "tell", "know", "want", "like",
    "good", "best", "the", "and", "for", "are", "can", "you", "our", "any",
    "there", "this", "that", "with", "from", "how", "much", "many", "would",
    "could", "please", "also", "some", "more", "very", "really", "just",
    "will", "should", "they", "them", "was", "were", "been", "being",
})


def _dish_reply(item: dict) -> str:
    desc = item.get("description", "A beautifully crafted seasonal dish.")
    badge = f" ({item['badge']})" if item.get("badge") else ""
    return (
        f"Our {item['name']}{badge} is Rs.{item['price']}. {desc} "
        "Would you like to reserve a table to try it?"
    )


def _search_menu_by_keywords(keywords: list[str], menu_items: list) -> list:
    matched = []
    for item in menu_items:
        combined = (
            item["name"].lower()
            + " "
            + item.get("description", "").lower()
            + " "
            + item.get("category", "").lower()
        )
        if any(kw in combined for kw in keywords):
            matched.append(item)
    return list({i["name"]: i for i in matched}.values())


def _last_mentioned_dish(history: list, menu_items: list) -> dict | None:
    for entry in reversed(history):
        if entry.get("role") != "bot":
            continue
        text = entry.get("text", "").lower()
        for item in menu_items:
            if item["name"].lower() in text:
                return item
    return None


def _dietary_flags(item: dict) -> dict:
    text = (item.get("name", "") + " " + item.get("description", "")).lower()
    dairy = ("cheese", "cream", "milk", "butter", "ghee", "paneer", "yogurt",
             "yoghurt", "honey", "egg", "mayo", "mayonnaise", "ricotta",
             "mozzarella", "parmesan", "feta", "custard", "curd")
    gluten = ("pasta", "bread", "flour", "wheat", "bun", "noodle", "lasagne",
              "lasagna", "ravioli", "spaghetti", "pizza", "crumble", "crouton")
    nuts = ("peanut", "almond", "cashew", "walnut", "pistachio", "pine nut", "pine nuts")
    return {
        "vegan": not any(w in text for w in dairy),
        "gluten_free": not any(w in text for w in gluten),
        "nut_free": not any(w in text for w in nuts),
    }


def _detect_constraints(msg: str, tokens: set) -> tuple:
    dietary = set()
    if any(w in tokens for w in ("vegan", "plant", "dairy")) or any(p in msg for p in ("dairy free", "dairy-free")):
        dietary.add("vegan")
    if any(w in tokens for w in ("gluten", "wheat", "celiac")) or any(p in msg for p in ("gluten free", "gluten-free")):
        dietary.add("gluten_free")
    if any(w in tokens for w in ("nut", "nuts", "peanut")):
        dietary.add("nut_free")

    price_min = price_max = None
    nums = [int(n) for n in re.findall(r"\d{2,}", msg)]
    if nums:
        if any(w in tokens for w in ("cheap", "affordable", "budget")):
            price_max = min(nums)
            if price_max > 1500:
                price_max = None
        elif any(w in tokens for w in ("expensive", "premium", "luxury")):
            price_min = max(nums)
        elif any(p in msg for p in ("under", "below", "less than", "within", "up to", "upto", "maximum", "max")):
            price_max = min(nums)
        elif any(p in msg for p in ("above", "over", "more than", "minimum", "at least", "atleast")):
            price_min = max(nums)
    return dietary, price_min, price_max


def _filter_menu(items, dietary=None, price_min=None, price_max=None):
    res = items
    if dietary:
        res = [i for i in res if all(_dietary_flags(i).get(d, True) for d in dietary)]
    if price_min is not None:
        res = [i for i in res if i.get("price", 0) >= price_min]
    if price_max is not None:
        res = [i for i in res if i.get("price", 0) <= price_max]
    return res


def _menu_answer(filtered, dietary=None, price_min=None, price_max=None):
    if not filtered:
        bits = []
        if dietary:
            bits.append(" / ".join(dietary))
        if price_max:
            bits.append(f"under Rs.{price_max}")
        if price_min:
            bits.append(f"above Rs.{price_min}")
        constraint = ", ".join(bits) or "that"
        return (
            f"We don't currently have a dish matching {constraint}, but our menu is seasonal. "
            "Call +88-123-123456 and our team will gladly help you find the perfect option."
        )
    head = "Here's what I found"
    if dietary:
        head += " (100% vegetarian, " + " / ".join(dietary) + ")"
    if price_max:
        head += f" under Rs.{price_max}"
    if price_min:
        head += f" from Rs.{price_min} upwards"
    head += ":"
    listed = ", ".join(f"{i['name']} (Rs.{i['price']})" for i in filtered[:5])
    return f"{head} {listed}. Would you like details on any of these or help reserving a table?"


def _build_smart_reply(message: str, menu_items: list, history: list | None = None) -> str:
    msg = message.lower().strip()
    history = history or []
    tokens = set(re.findall(r"\b[\w']+\b", msg))

    def has_word(*words):
        return any(w in tokens for w in words)

    def has_phrase(*phrases):
        return any(p in msg for p in phrases)

    def score_words(*words, pts=5):
        return sum(pts for w in words if w in tokens)

    def score_phrases(*phrases, pts=8):
        return sum(pts for p in phrases if p in msg)

    by_cat: dict = {}
    for item in menu_items:
        cat = item.get("category", "Main").lower()
        by_cat.setdefault(cat, []).append(item)

    def items_in(*cats):
        result = []
        for c in cats:
            result.extend(by_cat.get(c.lower(), []))
        return result

    def fmt(lst, n=3):
        return ", ".join(f"{i['name']} (Rs.{i['price']})" for i in lst[:n])

    keywords = [w for w in tokens if len(w) >= 3 and w not in _CHAT_STOPWORDS]

    # 1. exact dish name match (highest priority)
    for item in menu_items:
        if item["name"].lower() in msg:
            return _dish_reply(item)

    # 2. follow-up on a dish mentioned in the previous bot reply
    if has_word("yes", "yeah", "sure", "ok", "okay") or has_phrase(
        "tell me more", "more info", "more details", "go on", "sounds good"
    ):
        prev_dish = _last_mentioned_dish(history, menu_items)
        if prev_dish:
            cat = prev_dish.get("category", "Main")
            related = [
                i for i in menu_items
                if i["name"] != prev_dish["name"]
                and i.get("category") == cat
            ][:2]
            reply = _dish_reply(prev_dish)
            if related:
                reply += f" You might also enjoy {fmt(related, 2)} from the same section."
            return reply

    # 3. score intents — pick the best match instead of first-match-wins
    scores: dict[str, int] = {}

    scores["greeting"] = score_words("hello", "hi", "hey", "namaste", "hola", pts=10)
    scores["greeting"] += score_phrases("good morning", "good evening", "good afternoon", pts=10)

    scores["reservation"] = score_words("reserve", "reservation", "booking", "book", "seat", pts=8)
    scores["reservation"] += score_phrases("book a table", "make a reservation", pts=12)

    scores["hours"] = score_phrases("what time", "opening hours", "closing time", "open today", pts=12)
    scores["hours"] += score_words("hours", "timing", "schedule", pts=8)
    scores["hours"] += score_words("open", "close", "closed", pts=4)
    if has_word("when") and has_word("open", "close", "hour", "hours", "timing"):
        scores["hours"] += 10

    scores["location"] = score_words("location", "address", "directions", "map", "ahmedabad", pts=8)
    scores["location"] += score_phrases("how to reach", "where are you", "where is", pts=10)

    scores["price"] = score_words("price", "cost", "expensive", "cheap", "affordable", "budget", "rupee", pts=8)
    scores["price"] += score_phrases("how much", pts=10)

    scores["allergens"] = score_words(
        "allergy", "allergic", "allergen", "gluten", "nut", "nuts", "peanut",
        "lactose", "intolerant", "celiac", "soy", "wheat", "diabetic", "jain", pts=10,
    )

    scores["alcohol"] = score_words(
        "alcohol", "alcoholic", "wine", "beer", "cocktail", "spirits", "whisky", "rum", "vodka", pts=10,
    )

    scores["drinks"] = score_words("drink", "drinks", "beverage", "mocktail", "juice", "tea", "coffee", "smoothie", pts=8)

    scores["soups"] = score_words("soup", "soups", "shorba", "broth", pts=10)
    scores["starters"] = score_words("starter", "starters", "appetizer", "appetizers", "snack", pts=10)
    scores["starters"] += score_phrases("small plate", pts=8)
    scores["pasta"] = score_words("pasta", "ravioli", "lasagne", "lasagna", "spaghetti", "noodle", pts=10)
    scores["pizza"] = score_words("pizza", "flatbread", pts=10)
    scores["pizza"] += score_phrases("wood-fired", "woodfired", pts=8)
    scores["salads"] = score_words("salad", "salads", "greens", pts=10)
    scores["desserts"] = score_words(
        "dessert", "desserts", "sweet", "sweets", "cake", "pudding", "semifreddo", "chocolate", "pastry", pts=10,
    )
    scores["desserts"] += score_phrases("ice cream", pts=8)
    scores["mains"] = score_words("main", "mains", "entree", pts=8)
    scores["mains"] += score_phrases("main course", pts=10)

    scores["vegetarian"] = score_words("vegetarian", "vegan", "plant", "dairy", pts=10)
    scores["vegetarian"] += score_phrases("non-veg", "non veg", pts=10)
    scores["vegetarian"] += score_words("meat", "chicken", "fish", "egg", pts=6)

    scores["recommend"] = score_words("recommend", "suggest", "popular", "favourite", "favorite", pts=8)
    scores["recommend"] += score_phrases("must try", "what should", pts=10)
    if has_word("best", "top") and not has_word("location", "price"):
        scores["recommend"] += 6

    scores["events"] = score_words("event", "party", "private", "wedding", "birthday", "anniversary", "corporate", "group", pts=10)
    scores["menu"] = score_words("menu", pts=4)
    scores["menu"] += score_phrases("full menu", "all dishes", "what do you have", "what do you serve", "everything", pts=10)

    scores["thanks"] = score_words("thank", "thanks", "appreciate", pts=10)
    scores["thanks"] += score_words("great", "awesome", "wonderful", "perfect", pts=4)

    scores["goodbye"] = score_words("bye", "goodbye", pts=10)
    scores["goodbye"] += score_phrases("see you", "nothing else", "that is all", pts=8)
    if has_word("done") and len(tokens) <= 3:
        scores["goodbye"] += 6

    scores["parking"] = score_words("parking", "valet", "park", pts=10)
    scores["kids"] = score_words("kids", "children", "child", "family", pts=8)
    scores["delivery"] = score_words("delivery", "takeaway", "takeout", "pickup", pts=10)

    # boost category scores when keywords match menu items
    for cat, cat_items in by_cat.items():
        if cat in msg or any(kw in cat for kw in keywords):
            key = cat.replace(" ", "_")
            scores[key] = scores.get(key, 0) + 6

    best_intent = max(scores, key=scores.get) if scores else ""
    best_score = scores.get(best_intent, 0)

    # Answer directly from the real menu when the question carries dietary or price constraints
    dietary, price_min, price_max = _detect_constraints(msg, tokens)
    non_veg = has_phrase("non-veg", "non veg") or has_word("meat", "chicken", "fish")
    if dietary or price_min is not None or price_max is not None or non_veg:
        if non_veg:
            return (
                "Aurelia is a 100% pure vegetarian restaurant - we don't serve meat, chicken, or fish. "
                "But our plant-forward kitchen creates dishes so rich you won't miss them! "
                "Tell me your preferences (e.g. vegan, gluten-free, or a budget) and I'll suggest real dishes."
            )
        filtered = _filter_menu(menu_items, dietary=dietary, price_min=price_min, price_max=price_max)
        return _menu_answer(filtered, dietary, price_min, price_max)

    if best_score >= 6:
        if best_intent == "greeting":
            return (
                "Welcome to Aurelia! I am your personal dining concierge. "
                "We are a 100% pure vegetarian fine-dining restaurant in Ahmedabad, open daily 8am-10pm. "
                "Ask me about our menu, prices, reservations, or anything about Aurelia. "
                "How can I make your evening special?"
            )

        if best_intent == "reservation":
            guests = ""
            for word in msg.split():
                if word.isdigit():
                    guests = f" for {word} guests"
                    break
            return (
                f"I would love to help you secure a table{guests} at Aurelia! "
                "You can book on our Reserve page or call +88-123-123456. "
                "We offer Chef Counter, Garden Terrace, and Private Dining. "
                "What date were you thinking?"
            )

        if best_intent == "hours":
            return (
                "Aurelia is open daily 8:00 AM to 10:00 PM. "
                "Lunch: 11am-2:30pm | Dinner: 5:30pm-11:30pm. "
                "Open 7 days a week including weekends. "
                "For private dining, book at least 48 hours in advance."
            )

        if best_intent == "location":
            return (
                "Aurelia is on SG Highway, Ahmedabad, Gujarat 380015, India. "
                "Valet parking available from 5pm. "
                "Open our Contact page for the Google Maps link, or call +88-123-123456."
            )

        if best_intent == "price":
            prices = sorted(set(i["price"] for i in menu_items))
            lo = prices[0] if prices else 495
            hi = prices[-1] if prices else 1195
            if has_word("cheap", "budget", "affordable"):
                affordable = sorted(menu_items, key=lambda i: i["price"])[:3]
                return (
                    f"Our most affordable dishes start at Rs.{lo}: {fmt(affordable)}. "
                    "All prices include taxes. Would you like more options in this range?"
                )
            if keywords:
                priced = _search_menu_by_keywords(keywords, menu_items)
                if priced:
                    return f"Here are prices for what you asked about: {fmt(priced, 5)}."
            return (
                f"Our menu ranges from Rs.{lo} to Rs.{hi}, offering exceptional value for fine vegetarian dining. "
                "All prices include taxes. Would you like a recommendation within a specific budget?"
            )

        if best_intent == "allergens":
            return (
                "Your health is our top priority at Aurelia. "
                "Please inform us of any allergies when booking and our kitchen will ensure a safe experience. "
                "We accommodate gluten-free, nut-free, Jain, and diabetic-friendly requests with 24 hours notice. "
                "Call +88-123-123456 to discuss your needs."
            )

        if best_intent == "alcohol":
            return (
                "Aurelia does not serve alcohol. "
                "Our Beverage Director crafts exceptional artisanal mocktails, botanical infusions, and wellness elixirs. "
                "These zero-proof beverages pair perfectly with each course. "
                "Would you like to know about our mocktail menu?"
            )

        if best_intent == "drinks":
            return (
                "Our beverage programme features handcrafted mocktails, fresh juices, botanical infusions, and wellness elixirs. "
                "Each drink pairs beautifully with our seasonal dishes. "
                "Ask for our pairing recommendations!"
            )

        if best_intent == "soups":
            soups = items_in("soup", "soups")
            return (
                f"We have {len(soups)} soups today: {fmt(soups)}. Rich, warming, and seasonal. Shall I add one to your reservation?"
                if soups else
                "Our soup selection changes seasonally. Please call +88-123-123456 for today's offerings."
            )

        if best_intent == "starters":
            apps = items_in("appetizer", "appetizers", "starter", "starters")
            return (
                f"For starters we recommend: {fmt(apps)}. Light, fresh, and perfect to begin your meal."
                if apps else
                "Our starters feature seasonal small plates. Ask our team for today's selection!"
            )

        if best_intent == "pasta":
            pastas = [i for i in menu_items if any(
                w in i["name"].lower() + " " + i.get("description", "").lower()
                for w in ["pasta", "ravioli", "lasagne", "lasagna", "spaghetti", "noodle"]
            )]
            return (
                f"For pasta lovers we have: {fmt(pastas)}. All pasta is handmade fresh daily. Reserve a table?"
                if pastas else
                "Our handmade pasta selection changes seasonally. Please check our Menu page."
            )

        if best_intent == "pizza":
            pizzas = [i for i in menu_items if "pizza" in i["name"].lower() + " " + i.get("description", "").lower()]
            return (
                f"Our wood-fired pizzas: {fmt(pizzas)}. Fired to perfection with seasonal toppings!"
                if pizzas else
                "Our wood-fired pizza menu varies by season. Check our Menu page for today's options."
            )

        if best_intent == "salads":
            salads = [i for i in menu_items if "salad" in i["name"].lower() + " " + i.get("description", "").lower()]
            return (
                f"Our fresh salads: {fmt(salads)}. Crisp, seasonal, and bursting with flavour."
                if salads else
                "We offer seasonal fresh salads. Please check our Menu page."
            )

        if best_intent == "desserts":
            deserts = items_in("dessert", "desserts", "sweet", "sweets")
            if not deserts:
                deserts = [i for i in menu_items if any(
                    w in i["name"].lower() for w in ["cake", "semifreddo", "pudding", "honey", "tart", "gelato"]
                )]
            if deserts:
                return f"Our desserts include: {fmt(deserts, 4)}. We highly recommend leaving room for something sweet!"
            return "Our dessert menu is crafted fresh each day. Ask your server for today's selection!"

        if best_intent == "mains":
            mains = items_in("main", "mains")
            return (
                f"Our main courses: {fmt(mains)}. Each dish is crafted from locally-sourced ingredients."
                if mains else
                "Our main course menu changes seasonally. Check our Menu page."
            )

        if best_intent == "vegetarian":
            picks = sorted(menu_items, key=lambda i: i["price"])[:5]
            return (
                "Aurelia is a 100% pure vegetarian restaurant - no meat, no fish, no eggs. "
                "We celebrate plant-forward cuisine using seasonal, farm-fresh ingredients. "
                f"Our current vegetarian selections include: {fmt(picks, 5)}. "
                "Vegan and dairy-free options are available with advance notice - just ask!"
            )

        if best_intent == "recommend":
            if has_word("cheap", "budget", "affordable"):
                picks = sorted(menu_items, key=lambda i: i["price"])[:3]
                return f"Great value picks: {fmt(picks)}. All are guest favourites at friendly prices!"
            specials = [i for i in menu_items if i.get("badge") in ("Chef", "Signature", "Chef Pick", "New", "Seasonal")]
            if keywords:
                themed = _search_menu_by_keywords(keywords, menu_items)
                if themed:
                    return f"Based on your taste, try: {fmt(themed)}. Shall I help you book a table?"
            if not specials:
                specials = menu_items[:3]
            idx = sum(ord(c) for c in msg) % len(specials)
            rec = specials[idx]
            alt = specials[(idx + 1) % len(specials)] if len(specials) > 1 else None
            reply = f"I would recommend {rec['name']} at Rs.{rec['price']} - {rec.get('description', 'a chef masterpiece')}. "
            if alt and alt["name"] != rec["name"]:
                reply += f"The {alt['name']} (Rs.{alt['price']}) is equally loved. "
            reply += "Shall I help you reserve a table tonight?"
            return reply

        if best_intent == "events":
            return (
                "Aurelia offers bespoke private dining for birthdays, anniversaries, weddings, and corporate events. "
                "Our rooms seat 12 to 110 guests with custom menus and a dedicated host. "
                "Call +88-123-123456 or visit our Contact page for a personalised quote."
            )

        if best_intent == "menu":
            cat_summary = []
            for cat, citems in by_cat.items():
                names = ", ".join(i["name"] for i in citems)
                cat_summary.append(f"{cat.title()}: {names}")
            overview = " | ".join(cat_summary)
            return f"Our current menu - {overview}. Everything is 100% vegetarian. Would you like details on any category?"

        if best_intent == "thanks":
            return "It is our absolute pleasure! We would love to welcome you to Aurelia soon. Is there anything else I can help with?"

        if best_intent == "goodbye":
            return "It was a delight speaking with you! We look forward to welcoming you to Aurelia. Bon appetit!"

        if best_intent == "parking":
            return (
                "Valet parking is available from 5pm at Aurelia on SG Highway, Ahmedabad. "
                "Self-parking options are nearby. Call +88-123-123456 if you need directions."
            )

        if best_intent == "kids":
            return (
                "Families are warmly welcome at Aurelia! We offer a relaxed atmosphere and can accommodate children. "
                "Let us know the number of guests when booking and we will arrange the best table for your family."
            )

        if best_intent == "delivery":
            return (
                "Aurelia focuses on the in-restaurant fine-dining experience. "
                "We do not offer delivery, but you are welcome to visit us daily 8am-10pm or call +88-123-123456."
            )

    # 4. keyword search against menu (for natural questions like "do you have truffle pasta?")
    if keywords:
        matched = _search_menu_by_keywords(keywords, menu_items)
        if matched:
            if len(matched) == 1:
                return _dish_reply(matched[0])
            return f"Yes! We have: {fmt(matched, 5)}. Want details on any of these?"

    # 5. contextual fallback — respond to the question shape, not a fixed template
    if has_word("how") and not has_word("much", "many"):
        return (
            "Happy to help! You can ask me things like: "
            "'How do I book a table?', 'How much is the pasta?', or 'How do I reach the restaurant?'"
        )
    if has_word("do", "is", "are", "can") and keywords:
        guess = _search_menu_by_keywords(keywords, menu_items)
        if guess:
            return f"Yes — we serve {fmt(guess, 3)}. Would you like to know more about any of these?"
    if has_word("what") and keywords:
        guess = _search_menu_by_keywords(keywords, menu_items)
        if guess:
            return f"For that, try: {fmt(guess, 3)}. I can share prices or help you book."

    top = [i for i in menu_items if i.get("badge")] or menu_items[:3]
    topic_hints = ", ".join(keywords[:4]) if keywords else "menu, reservations, or hours"
    return (
        f"I want to make sure I answer your question correctly. "
        f"I can help with {topic_hints}. "
        f"Some guest favourites: {fmt(top)}. What would you like to explore?"
    )

# --------------------- Gemini LLM concierge (optional) ---------------------
_SYSTEM_PROMPT = (
    "You are Aurelia's AI concierge for a 100% pure-vegetarian fine-dining restaurant "
    "on SG Highway, Ahmedabad, Gujarat, India.\n"
    "Hours: open daily 8:00 AM to 10:00 PM (lunch 11:00-14:30, dinner 17:30-23:30).\n"
    "Reservations: via the Reserve page or call +88-123-123456; private dining for 12-110 guests.\n"
    "The restaurant serves NO alcohol - only artisanal mocktails, fresh juices, botanical infusions and wellness elixirs.\n"
    "Vegan, gluten-free, Jain and diabetic-friendly options are available on request with notice.\n"
    "Be warm, elegant and concise (under 4 sentences unless the guest asks for detail).\n"
    "Use the LIVE MENU below to answer dish/price questions; never invent dishes or prices not on the menu.\n"
    "For actual bookings, direct guests to the Reserve page or the phone number. "
    "Sign off occasionally with 'Warm regards, Aurelia Concierge'."
)


def _build_gemini_contents(message: str, menu_items: list, history: list) -> list:
    menu_text = "\n".join(
        f"- {i.get('name')} (Rs.{i.get('price')}): {i.get('description', '')}"
        for i in menu_items[:30]
    )
    contents = []
    for h in history[-8:]:
        role = "model" if h.get("role") == "bot" else "user"
        contents.append({"role": role, "parts": [{"text": h.get("text", "")}]})
    # Gemini requires the conversation to begin with a user turn
    while contents and contents[0]["role"] != "user":
        contents.pop(0)
    contents.append({"role": "user", "parts": [{"text": message}]})
    return contents


async def _gemini_reply(message: str, menu_items: list, history: list, api_key: str) -> str | None:
    menu_text = "\n".join(
        f"- {i.get('name')} (Rs.{i.get('price')}): {i.get('description', '')}"
        for i in menu_items[:30]
    )
    payload = {
        "system_instruction": {"parts": [{"text": _SYSTEM_PROMPT + f"\n\nLIVE MENU:\n{menu_text}"}]},
        "contents": _build_gemini_contents(message, menu_items, history),
        "generationConfig": {"maxOutputTokens": 300, "temperature": 0.6},
    }
    # Try models in order; some accounts have quota on one but not another.
    models = ["gemini-flash-latest", "gemini-2.0-flash", "gemini-2.0-flash-lite"]
    url = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    for attempt in range(2):  # one retry pass to ride out transient 429/503 throttling
        for model in models:
            try:
                async with httpx.AsyncClient(timeout=20) as client:
                    r = await client.post(url.format(model=model), params={"key": api_key}, json=payload)
            except Exception:
                continue
            if r.status_code != 200:
                continue  # 429/503/5xx -> try next model / retry
            try:
                cand = r.json()["candidates"][0]
                text = "".join(p.get("text", "") for p in cand.get("content", {}).get("parts", []))
                finish = cand.get("finishReason")
            except Exception:
                continue
            # Reject degenerate/truncated replies (e.g. a few words cut at MAX_TOKENS)
            if text.strip() and not (finish == "MAX_TOKENS" and len(text.strip()) < 80):
                return text
        if attempt == 0:
            await asyncio.sleep(1.5)
    return None


@api.post("/chatbot")
async def chatbot(inp: ChatIn):
    import asyncio
    items = await db.menu.find(
        {}, {"_id": 0, "name": 1, "price": 1, "category": 1, "description": 1, "badge": 1}
    ).to_list(50)

    history = [{"role": m.role, "text": m.text} for m in inp.history]

    reply = None
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if api_key:
        try:
            reply = await _gemini_reply(inp.message, items, history, api_key)
        except Exception:
            reply = None
    if not reply:
        reply = _build_smart_reply(inp.message, items, history)

    async def gen():
        words = reply.split(" ")
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")
            if i % 5 == 4:
                await asyncio.sleep(0.02)

    return StreamingResponse(
        gen(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# --------------------- root ---------------------
@api.get("/")
async def root():
    return {"message": "Aurelia API is running"}


# --------------------- include router ---------------------
app.include_router(api)


# --------------------- startup / shutdown ---------------------
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.menu.create_index("name")
    await db.reservations.create_index("created_at")
    await db.waitlist.create_index("created_at")
    await db.feedback.create_index("created_at")

    # seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@aurelia.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Aurelia Admin",
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}}
        )

    # seed initial menu items if empty
    if await db.menu.count_documents({}) == 0:
        seed = [
            {"name": "Greek Salad", "price": 595, "category": "Appetizer",
             "description": "Tomatoes, green bell pepper, cucumber, olives and feta cheese.",
             "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
             "badge": "Seasonal"},
            {"name": "Vegetable Lasagne", "price": 895, "category": "Main",
             "description": "Layers of pasta, spinach, ricotta, tomato sauce and melted mozzarella.",
             "image": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80",
             "badge": ""},
            {"name": "Butternut Pumpkin Soup", "price": 495, "category": "Soup",
             "description": "Roasted butternut squash with cream and sage.",
             "image": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80",
             "badge": ""},
            {"name": "Stuffed Portobello Steak", "price": 1195, "category": "Main",
             "description": "Grilled portobello, herb stuffing, roasted vegetables, and balsamic glaze.",
             "image": "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80",
             "badge": "New"},
            {"name": "Stuffed Bell Peppers", "price": 595, "category": "Appetizer",
             "description": "Rice, herbs, and cheese stuffed bell peppers with tomato sauce.",
             "image": "https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=600&q=80",
             "badge": ""},
            {"name": "Crispy Stuffed Mushrooms", "price": 795, "category": "Main",
             "description": "Golden-baked portobello caps stuffed with herbed ricotta, sundried tomatoes, and pine nuts.",
             "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
             "badge": ""},
            {"name": "Wild Mushroom Risotto", "price": 995, "category": "Special",
             "description": "Creamy risotto with wild mushrooms, truffle oil, and parmesan.",
             "image": "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80",
             "badge": "Chef"},
        ]
        for s in seed:
            s.update({"id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat()})
        await db.menu.insert_many(seed)


@app.on_event("shutdown")
async def shutdown():
    client.close()




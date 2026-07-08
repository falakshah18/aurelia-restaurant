import os
import uuid
import json
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
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")

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


def build_ollama_payload(message: str, system_message: str) -> dict:
    return {
        "model": OLLAMA_MODEL,
        "stream": True,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": message},
        ],
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

class ChatIn(BaseModel):
    session_id: str
    message: str

class StatusIn(BaseModel):
    status: Literal["pending", "confirmed", "cancelled"]

class WaitlistIn(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    persons: int = Field(default=2, ge=1)
    message: str = ""

class FeedbackIn(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    rating: int = Field(default=5, ge=1, le=5)
    message: str = ""
    source: str = "post-dine"


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
@api.post("/feedback")
async def submit_feedback(inp: FeedbackIn):
    doc = {"id": str(uuid.uuid4()), **inp.model_dump(),
           "created_at": datetime.now(timezone.utc).isoformat(), "read": False,
           "alert": inp.rating < 4}
    await db.feedback.insert_one(doc.copy())
    return doc

@api.get("/feedback")
async def list_feedback(_: dict = Depends(require_admin)):
    docs = await db.feedback.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
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

# --------------------- chatbot ---------------------
SYSTEM_PROMPT = (
    "You are the Aurelia concierge, the warm and knowledgeable AI assistant for Aurelia, "
    "a fine-dining vegetarian restaurant. Answer briefly (max 4 sentences) about the menu, "
    "recommend dishes, suggest wine pairings, mention opening hours (daily 8am-10pm), "
    "and help guests book a table. If asked about anything unrelated to food or "
    "the restaurant, politely steer the conversation back. Tone: elegant, friendly, concise."
)

@api.post("/chatbot")
async def chatbot(inp: ChatIn):
    items = await db.menu.find({}, {"_id": 0, "name": 1, "price": 1, "category": 1, "description": 1}).to_list(50)
    menu_snippet = "\n".join(
        f"- {it['name']} (₹{it['price']}, {it['category']}): {it.get('description', '')}"
        for it in items
    ) or "Menu is being updated."
    system = f"{SYSTEM_PROMPT}\n\nCurrent menu:\n{menu_snippet}"

    async def fallback():
        yield "I'd be happy to help! Our menu features seasonal vegetarian dishes, wood-fired pizzas, and handmade pastas. We're open daily 8am-10pm. Would you like to book a table or ask about a specific dish?"

    async def gen():
        try:
            import httpx

            payload = build_ollama_payload(inp.message, system)
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("POST", f"{OLLAMA_BASE_URL}/api/chat", json=payload) as response:
                    if response.status_code != 200:
                        raise RuntimeError(f"Ollama returned {response.status_code}")
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            chunk = json.loads(line)
                        except json.JSONDecodeError:
                            continue
                        delta = chunk.get("message", {}).get("content", "")
                        if delta:
                            yield delta
        except Exception as e:
            yield f"\n[error: {e}]"

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
             "image": "https://images.unsplash.com/photo-1603064432115-ddcd7e888bb7?w=600&q=80",
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
             "image": "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=600&q=80",
             "badge": "New"},
            {"name": "Stuffed Bell Peppers", "price": 595, "category": "Appetizer",
             "description": "Rice, herbs, and cheese stuffed bell peppers with tomato sauce.",
             "image": "https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=600&q=80",
             "badge": ""},
            {"name": "Crispy Eggplant Milanese", "price": 795, "category": "Main",
             "description": "Breaded eggplant, marinara, melted mozzarella, and basil.",
             "image": "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600&q=80",
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




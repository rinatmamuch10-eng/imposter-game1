import random
import uuid
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Imposter Game API")

rooms = {}

WORDS = {
    "Локации": [
        "Подводная лодка", "Больница", "Школа", "Тюрьма",
        "Аэропорт", "Космическая станция", "Остров",
        "Ресторан", "Банк", "Музей", "Цирк", "Кинотеатр",
        "Отель", "Самолёт", "Зоопарк", "Метро",
        "Пляж", "Замок", "Военная база", "Стадион"
    ],
    "Еда": [
        "Пицца", "Суши", "Бургер", "Шаурма", "Пельмени",
        "Борщ", "Плов", "Лазанья", "Блины", "Хот-дог",
        "Шоколад", "Мороженое", "Арбуз", "Кебаб",
        "Паста", "Омлет", "Тако", "Пончик", "Салат", "Стейк"
    ],
    "Профессии": [
        "Врач", "Полицейский", "Повар", "Пожарный",
        "Космонавт", "Учитель", "Адвокат", "Программист",
        "Археолог", "Пилот", "Детектив", "Кальянный мастер",
        "Актёр", "Боксёр", "Журналист", "Хирург",
        "Дизайнер", "Военный", "Бармен", "Психолог"
    ],
    "Фильмы": [
        "Титаник", "Матрица", "Интерстеллар", "Начало",
        "Аватар", "Гарри Поттер", "Один дома", "Пила",
        "Джокер", "Крёстный отец", "Чужой", "Гладиатор",
        "Дюна", "Шрек", "Форрест Гамп", "Остров проклятых",
        "Терминатор", "Король Лев", "Бойцовский клуб",
        "Парк Юрского периода"
    ],
    "Животные": [
        "Лев", "Тигр", "Волк", "Медведь", "Слон",
        "Жираф", "Крокодил", "Пингвин", "Дельфин",
        "Акула", "Осьминог", "Орёл", "Змея", "Лиса",
        "Панда", "Обезьяна", "Кенгуру", "Черепаха",
        "Кит", "Летучая мышь"
    ],
    "Знаменитости": [
        "Леонардо Ди Каприо", "Криштиану Роналду",
        "Лионель Месси", "Илон Маск", "Джеки Чан",
        "Эминем", "Майкл Джексон", "Тейлор Свифт",
        "Дуэйн Джонсон", "Джим Керри", "Том Круз",
        "Роберт Дауни младший", "Киану Ривз",
        "Билл Гейтс", "Марк Цукерберг", "Рианна",
        "Шакира", "Уилл Смит", "Брэд Питт", "Снуп Догг"
    ],
    "Треш": [
        "Человек-невидимка", "Зомби-апокалипсис",
        "Инопланетное вторжение", "Похищение НЛО",
        "Свадьба с роботом", "Говорящий холодильник",
        "Президент-обезьяна", "Армия клонов",
        "Вечеринка в морге", "Побег из психушки",
        "Заговор котов", "Мир без интернета",
        "Восстание машин", "Застрял в лифте",
        "Злой клоун", "Каннибал на острове",
        "Проклятый смартфон", "Дом с привидениями",
        "Заброшенный торговый центр", "Поезд-призрак"
    ]
}


class CreateGame(BaseModel):
    players: list[str] = Field(min_length=3, max_length=12)
    category: str = "Локации"
    imposters_count: int = Field(default=1, ge=1, le=3)
    imposters_get_category: bool = True


@app.get("/")
async def home():
    return {"status": "online", "game": "Imposter"}


@app.get("/categories")
async def get_categories():
    return {
        name: len(words)
        for name, words in WORDS.items()
    }


@app.post("/games")
async def create_game(data: CreateGame):
    if data.category not in WORDS:
        raise HTTPException(400, "Неизвестная категория")

    if data.imposters_count >= len(data.players):
        raise HTTPException(400, "Слишком много импостеров")

    if any(not name.strip() for name in data.players):
        raise HTTPException(400, "Пустое имя игрока")

    imposters = random.sample(
        range(len(data.players)),
        data.imposters_count
    )

    room_id = str(uuid.uuid4())[:8]

    rooms[room_id] = {
        "players": data.players,
        "category": data.category,
        "secret_word": random.choice(WORDS[data.category]),
        "imposters": imposters,
        "imposters_get_category": data.imposters_get_category,
        "status": "distribution",
        "votes": {}
    }

    return {
        "room_id": room_id,
        "players_count": len(data.players),
        "status": "created"
    }


@app.get("/games/{room_id}/role/{player_index}")
async def get_role(room_id: str, player_index: int):
    room = rooms.get(room_id)

    if not room:
        raise HTTPException(404, "Игра не найдена")

    if not 0 <= player_index < len(room["players"]):
        raise HTTPException(400, "Неверный игрок")

    is_imposter = player_index in room["imposters"]

    return {
        "player": room["players"][player_index],
        "is_imposter": is_imposter,
        "category": (
            room["category"]
            if not is_imposter or room["imposters_get_category"]
            else None
        ),
        "word": None if is_imposter else room["secret_word"]
    }


@app.get("/games/{room_id}")
async def get_game(room_id: str):
    room = rooms.get(room_id)

    if not room:
        raise HTTPException(404, "Игра не найдена")

    return {
        "players": room["players"],
        "players_count": len(room["players"]),
        "status": room["status"]
    }
    
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        requested_file = FRONTEND_DIST / full_path

        if requested_file.is_file():
            return FileResponse(requested_file)

        return FileResponse(FRONTEND_DIST / "index.html")

import { useState } from "react";

const WORDS = {
  "Локации": ["Больница", "Школа", "Аэропорт", "Ресторан", "Тюрьма", "Кинотеатр"],
  "Еда": ["Пицца", "Суши", "Бургер", "Плов", "Шаурма", "Борщ"],
  "Профессии": ["Врач", "Повар", "Пилот", "Учитель", "Бармен", "Детектив"],
  "Фильмы": ["Матрица", "Титаник", "Аватар", "Джокер", "Шрек", "Интерстеллар"],
  "Животные": ["Лев", "Тигр", "Волк", "Панда", "Дельфин", "Крокодил"],
  "Знаменитости": ["Эминем", "Илон Маск", "Джеки Чан", "Том Круз"],
  "Треш": ["Зомби-апокалипсис", "Восстание машин", "Говорящий холодильник"]
};

export default function App() {
  const [players, setPlayers] = useState(["Игрок 1", "Игрок 2", "Игрок 3"]);
  const [newPlayer, setNewPlayer] = useState("");
  const [category, setCategory] = useState("Локации");
  const [impostersCount, setImpostersCount] = useState(1);
  const [screen, setScreen] = useState("home");
  const [roles, setRoles] = useState([]);
  const [word, setWord] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [votes, setVotes] = useState({});
  const [voter, setVoter] = useState(0);
  const [winner, setWinner] = useState("");

  function addPlayer() {
    const name = newPlayer.trim();

    if (!name || players.length >= 12) return;

    setPlayers([...players, name]);
    setNewPlayer("");
  }

  function removePlayer(index) {
    if (players.length <= 3) return;
    setPlayers(players.filter((_, i) => i !== index));
  }

  function createGame() {
    if (impostersCount >= players.length) return;

    const selectedWord = WORDS[category][
      Math.floor(Math.random() * WORDS[category].length)
    ];

    const selectedImposters = new Set();

    while (selectedImposters.size < impostersCount) {
      selectedImposters.add(Math.floor(Math.random() * players.length));
    }

    setWord(selectedWord);
    setRoles(players.map((name, i) => ({
      name,
      imposter: selectedImposters.has(i)
    })));

    setCurrentPlayer(0);
    setShowRole(false);
    setScreen("roles");
  }

  function nextPlayer() {
    setShowRole(false);

    if (currentPlayer + 1 < players.length) {
      setCurrentPlayer(currentPlayer + 1);
    } else {
      setScreen("discussion");
    }
  }

  function vote(target) {
    const updatedVotes = { ...votes, [voter]: target };
    setVotes(updatedVotes);

    if (voter + 1 < players.length) {
      setVoter(voter + 1);
      return;
    }

    const counts = {};

    Object.values(updatedVotes).forEach(targetIndex => {
      counts[targetIndex] = (counts[targetIndex] || 0) + 1;
    });

    const maxVotes = Math.max(...Object.values(counts));
    const leaders = Object.keys(counts)
      .filter(key => counts[key] === maxVotes)
      .map(Number);

    if (leaders.length !== 1) {
      setWinner("Ничья! Импостер выжил.");
    } else {
      const eliminated = leaders[0];

      setWinner(
        roles[eliminated].imposter
          ? "Мирные победили!"
          : "Импостер победил!"
      );
    }

    setScreen("result");
  }

  function restart() {
    setVotes({});
    setVoter(0);
    setWinner("");
    setScreen("home");
  }

  return (
    <main className="app">
      <header>
        <div className="logo">IMPOSTER</div>
        <div className="subtitle">КТО ЗДЕСЬ ЛИШНИЙ?</div>
      </header>

      {screen === "home" && (
        <section className="panel">
          <h1>Найди импостера</h1>
          <p>Создай игру и проверь друзей.</p>

          <label>Категория</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {Object.keys(WORDS).map(item => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <label>Количество импостеров</label>
          <select
            value={impostersCount}
            onChange={e => setImpostersCount(Number(e.target.value))}
          >
            {[1, 2, 3].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <label>Игроки ({players.length}/12)</label>

          <div className="player-list">
            {players.map((player, i) => (
              <div className="player" key={i}>
                <span>{i + 1}. {player}</span>
                <button className="remove" onClick={() => removePlayer(i)}>×</button>
              </div>
            ))}
          </div>

          <div className="add-player">
            <input
              value={newPlayer}
              onChange={e => setNewPlayer(e.target.value)}
              placeholder="Имя игрока"
            />
            <button onClick={addPlayer}>+</button>
          </div>

          <button className="start" onClick={createGame}>
            СОЗДАТЬ ИГРУ
          </button>
        </section>
      )}

      {screen === "roles" && (
        <section className="panel">
          <h1>Передайте телефон</h1>
          <p>Сейчас телефон у игрока:</p>
          <h2>{players[currentPlayer]}</h2>

          {!showRole ? (
            <button className="start" onClick={() => setShowRole(true)}>
              ПОКАЗАТЬ МОЮ РОЛЬ
            </button>
          ) : (
            <>
              {roles[currentPlayer].imposter ? (
                <h1 style={{ color: "#ff456b" }}>ТЫ ИМПОСТЕР</h1>
              ) : (
                <>
                  <p>Твоя категория: {category}</p>
                  <h1 style={{ color: "#bd45ff" }}>{word}</h1>
                </>
              )}

              <button className="start" onClick={nextPlayer}>
                СКРЫТЬ И ПЕРЕДАТЬ ТЕЛЕФОН
              </button>
            </>
          )}
        </section>
      )}

      {screen === "discussion" && (
        <section className="panel">
          <h1>Время обсуждать</h1>
          <p>Обсудите, кто из игроков может быть импостером.</p>
          <button className="start" onClick={() => {
            setVotes({});
            setVoter(0);
            setScreen("voting");
          }}>
            ПЕРЕЙТИ К ГОЛОСОВАНИЮ
          </button>
        </section>
      )}

      {screen === "voting" && (
        <section className="panel">
          <h1>Голосование</h1>
          <p>Голосует: {players[voter]}</p>
          <p>Выбери подозреваемого:</p>

          {players.map((player, i) => (
            <button
              key={i}
              className="start"
              onClick={() => vote(i)}
            >
              {player}
            </button>
          ))}
        </section>
      )}

      {screen === "result" && (
        <section className="panel">
          <h1>Результат</h1>
          <h2>{winner}</h2>
          <p>Загаданное слово: {word}</p>
          <p>
            Импостеры: {roles.filter(r => r.imposter).map(r => r.name).join(", ")}
          </p>
          <button className="start" onClick={restart}>
            НОВАЯ ИГРА
          </button>
        </section>
      )}

      <footer>IMPOSTER GAME • 2026</footer>
    </main>
  );
}
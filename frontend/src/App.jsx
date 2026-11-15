import { useState } from "react";

export default function App() {
  const [players, setPlayers] = useState(["Игрок 1", "Игрок 2", "Игрок 3"]);
  const [newPlayer, setNewPlayer] = useState("");
  const [imposters, setImposters] = useState(1);
  const [category, setCategory] = useState("Локации");
  const [screen, setScreen] = useState("home");

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
            {["Локации", "Еда", "Профессии", "Фильмы", "Животные", "Знаменитости", "Треш"].map(item => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <label>Количество импостеров</label>
          <select value={imposters} onChange={e => setImposters(Number(e.target.value))}>
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
              maxLength={20}
            />
            <button onClick={addPlayer}>+</button>
          </div>

          <button
            className="start"
            disabled={imposters >= players.length}
            onClick={() => setScreen("loading")}
          >
            СОЗДАТЬ ИГРУ
          </button>
        </section>
      )}

      {screen === "loading" && (
        <section className="panel">
          <h1>Игра почти готова</h1>
          <p>Игроков: {players.length}</p>
          <p>Импостеров: {imposters}</p>
          <p>Категория: {category}</p>
          <button className="start" onClick={() => setScreen("home")}>
            НАЗАД
          </button>
        </section>
      )}

      <footer>IMPOSTER GAME • 2026</footer>
    </main>
  );
}
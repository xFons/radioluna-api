const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = "database.json";

// Crear DB si no existe
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
}

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Registrar usuario
app.post("/registrar", (req, res) => {
  const { nick } = req.body;
  if (!nick) return res.status(400).json({ error: "Nick requerido" });

  const db = readDB();
  let user = db.users.find(u => u.nick === nick);

  if (!user) {
    user = {
      nick,
      puntos: 0,
      ultimoIntentoWeb: 0,
      ultimoIntentoBot: 0
    };
    db.users.push(user);
    writeDB(db);
  }

  res.json(user);
});

// Sumar puntos
app.post("/sumar", (req, res) => {
  const { nick, puntos } = req.body;
  if (!nick || !puntos) return res.status(400).json({ error: "Datos incompletos" });

  const db = readDB();
  let user = db.users.find(u => u.nick === nick);

  if (!user) {
    user = { nick, puntos: 0 };
    db.users.push(user);
  }

  user.puntos += puntos;
  writeDB(db);

  res.json({ puntos: user.puntos });
});

// Obtener puntos
app.get("/puntos/:nick", (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.nick === req.params.nick);
  res.json(user || { nick: req.params.nick, puntos: 0 });
});

// Ranking
app.get("/ranking", (req, res) => {
  const db = readDB();
  const ranking = [...db.users]
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, 10);
  res.json(ranking);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor activo en puerto", PORT));


import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';

const app = express()
app.use(cors())

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*", // later restrict this to your frontend URL
    methods: ["GET", "POST"]
  }
})

const PORT = 3000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static files from the Vue app build
app.use(express.static(path.join(__dirname, '../../dist')));

// Catch-all: send index.html for client-side routing
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});


const games = {} // gameCode -> { players: [], buzzed: null }

io.on('connection', (socket) => {
  console.log('Connected:', socket.id)

  socket.on('joinGame', ({ gameCode, playerName }) => {
    socket.join(gameCode)

    if (!games[gameCode]) {
      games[gameCode] = { players: [], buzzOrder: [] }
    }

    games[gameCode].players.push({
      id: socket.id,
      name: playerName,
      score: 0
    })

    console.log(`${playerName} joined ${gameCode}`)

    io.to(gameCode).emit('playersUpdated', games[gameCode].players)
  })

  socket.on('buzz', ({ gameCode }) => {
    const game = games[gameCode]
    if (!game) return

    const player = game.players.find(p => p.id === socket.id)
    if (!player) return

    // ❌ prevent duplicate buzzing
    const alreadyBuzzed = game.buzzOrder.find(p => p.id === socket.id)
    if (alreadyBuzzed) return

    // ✅ add to order
    game.buzzOrder.push({
        ...player,
        // time: Date.now() // Don't think I want this rn
    })

    // broadcast full order
    io.to(gameCode).emit('buzzOrderUpdated', game.buzzOrder)
    console.log('Buzz order:', game.buzzOrder)
  })

  socket.on('resetBuzz', ({ gameCode }) => {
    if (!games[gameCode]) return

    games[gameCode].buzzOrder = []

    io.to(gameCode).emit('buzzReset')
  })

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id)

    for (const gameCode in games) {
      const game = games[gameCode]
      game.players = game.players.filter(p => p.id !== socket.id)

      io.to(gameCode).emit('playersUpdated', game.players)
    }
  })

  socket.on('updateScore', ({ gameCode, playerId, delta }) => {
    //console.log(`Updating score for player ${playerId} in game ${gameCode} by ${delta}. Game code: ${gameCode}, Player ID: ${playerId}, Delta: ${delta}`)
    const game = games[gameCode]
    if (!game) return

    const player = game.players.find(p => p.id === playerId)
    if (!player) return

    player.score += delta

    io.to(gameCode).emit('playersUpdated', game.players)
  })

  socket.on('updateTeamScore', ({ gameCode, teamName, delta }) => {
    const game = games[gameCode]
    if (!game) return
    if (!game.teams) game.teams = []
    let team = game.teams.find(t => t.name === teamName)

    if (!team) {
      game.teams.push({
        name: teamName,
        score: delta
      })
      team = game.teams.find(t => t.name === teamName)
    }

    team.score += delta
    io.to(gameCode).emit('teamsUpdated', game.teams)
  })

  socket.on('setScoreboardMode', ({gameCode, isTeamsMode}) =>{
    io.to(gameCode).emit('applyScoreboardMode', isTeamsMode)
  })

  socket.on('showRound2', ({gameCode, isRound2}) =>{
    io.to(gameCode).emit('applyRound2Mode', isRound2)
  })
})

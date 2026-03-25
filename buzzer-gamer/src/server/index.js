
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

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
      name: playerName
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
})
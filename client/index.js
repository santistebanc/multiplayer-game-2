import geckos from '@geckos.io/client'
import Game from './game'

export let game;

window.addEventListener('load', () => {

  const channel = geckos({ port: 1444 })

  channel.onConnect(error => {
    if (error) console.error(error.message)

    channel.on('ready', ({playerId}) => {
      game = new Game(channel, playerId)
    })
  })
})

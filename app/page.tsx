'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spade, Heart, Diamond, Club } from 'lucide-react'

// Define card suits and values
const suits = ['♠', '♥', '♦', '♣'] as const
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const

type Suit = typeof suits[number]
type Value = typeof values[number]

interface PlayingCard {
  suit: Suit
  value: Value
}

// Create a deck of cards
const createDeck = (): PlayingCard[] => {
  return suits.flatMap(suit => 
    values.map(value => ({ suit, value }))
  )
}

// Shuffle the deck
const shuffleDeck = (deck: PlayingCard[]): PlayingCard[] => {
  const newDeck = [...deck]
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
  }
  return newDeck
}

// Calculate the value of a hand
const calculateHandValue = (hand: PlayingCard[]): number => {
  let value = 0
  let aces = 0
  for (let card of hand) {
    if (card.value === 'A') {
      aces += 1
      value += 11
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      value += 10
    } else {
      value += parseInt(card.value)
    }
  }
  while (value > 21 && aces > 0) {
    value -= 10
    aces -= 1
  }
  return value
}

export default function Blackjack() {
  const [deck, setDeck] = useState<PlayingCard[]>([])
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([])
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([])
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealerTurn' | 'gameOver'>('betting')
  const [message, setMessage] = useState('')

  // Initialize the game
  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = () => {
    const newDeck = shuffleDeck(createDeck())
    setDeck(newDeck)
    setPlayerHand([newDeck[0], newDeck[1]])
    setDealerHand([newDeck[2], newDeck[3]])
    setGameState('playing')
    setMessage('')
    setDeck(newDeck.slice(4))
  }

  const hit = () => {
    if (gameState !== 'playing') return
    const newPlayerHand = [...playerHand, deck[0]]
    setPlayerHand(newPlayerHand)
    setDeck(deck.slice(1))
    if (calculateHandValue(newPlayerHand) > 21) {
      setGameState('gameOver')
      setMessage('Player busts! Dealer wins.')
    }
  }

  const stand = () => {
    if (gameState !== 'playing') return
    setGameState('dealerTurn')
    let newDealerHand = [...dealerHand]
    let newDeck = [...deck]
    while (calculateHandValue(newDealerHand) < 17) {
      newDealerHand.push(newDeck[0])
      newDeck = newDeck.slice(1)
    }
    setDealerHand(newDealerHand)
    setDeck(newDeck)
    const playerValue = calculateHandValue(playerHand)
    const dealerValue = calculateHandValue(newDealerHand)
    if (dealerValue > 21) {
      setMessage('Dealer busts! Player wins.')
    } else if (dealerValue > playerValue) {
      setMessage('Dealer wins!')
    } else if (dealerValue < playerValue) {
      setMessage('Player wins!')
    } else {
      setMessage('It\'s a tie!')
    }
    setGameState('gameOver')
  }

  const renderCard = (card: PlayingCard) => {
    const suitIcon = {
      '♠': <Spade className="h-6 w-6 text-black" />,
      '♥': <Heart className="h-6 w-6 text-red-500" />,
      '♦': <Diamond className="h-6 w-6 text-red-500" />,
      '♣': <Club className="h-6 w-6 text-black" />
    }
    return (
      <Card className="w-14 h-20 flex items-center justify-center m-1">
        <CardContent>
          <div className="text-lg font-bold">{card.value}</div>
          {suitIcon[card.suit]}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-800 text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Blackjack</h1>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Dealer's Hand ({calculateHandValue(dealerHand)})</h2>
        <div className="flex">
          {dealerHand.map((card, index) => (
            <div key={index}>
              {gameState === 'playing' && index === 0 ? (
                <Card className="w-14 h-20 bg-red-500 m-1" />
              ) : (
                renderCard(card)
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Your Hand ({calculateHandValue(playerHand)})</h2>
        <div className="flex">
          {playerHand.map((card, index) => (
            <div key={index}>{renderCard(card)}</div>
          ))}
        </div>
      </div>
      {gameState === 'playing' && (
        <div className="flex space-x-4 mb-4">
          <Button onClick={hit}>Hit</Button>
          <Button onClick={stand}>Stand</Button>
        </div>
      )}
      {gameState === 'gameOver' && (
        <div className="flex flex-col items-center">
          <p className="text-xl font-bold mb-4">{message}</p>
          <Button onClick={startNewGame}>New Game</Button>
        </div>
      )}
    </div>
  )
}
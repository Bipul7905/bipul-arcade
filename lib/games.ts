export const games = [
  {
    "slug": "99-fail",
    "title": "99% Fail",
    "emoji": "🦊",
    "category": "Arcade",
    "description": "Jump over obstacles and survive as long as possible."
  },
  {
    "slug": "perfect-stack",
    "title": "Perfect Stack",
    "emoji": "🧱",
    "category": "Arcade",
    "description": "Drop moving blocks and build a tall tower."
  },
  {
    "slug": "memory-match",
    "title": "Memory Match",
    "emoji": "🧠",
    "category": "Puzzle",
    "description": "Find all matching pairs in as few moves as possible."
  },
  {
    "slug": "snake-challenge",
    "title": "Snake Challenge",
    "emoji": "🐍",
    "category": "Classic",
    "description": "Eat food, grow longer and avoid crashing."
  },
  {
    "slug": "tic-tac-toe",
    "title": "Tic Tac Toe",
    "emoji": "⭕",
    "category": "Board",
    "description": "Play the classic strategy game against the computer."
  },
  {
    "slug": "reaction-tap",
    "title": "Reaction Tap",
    "emoji": "⚡",
    "category": "Skill",
    "description": "Wait for green, then tap as quickly as possible."
  },
  {
    "slug": "whack-a-mole",
    "title": "Whack-a-Mole",
    "emoji": "🐹",
    "category": "Casual",
    "description": "Tap the critters before the timer runs out."
  },
  {
    "slug": "number-rush",
    "title": "Number Rush",
    "emoji": "🔢",
    "category": "Puzzle",
    "description": "Tap tiles to build up your number score."
  },
  {
    "slug": "bubble-pop",
    "title": "Bubble Pop",
    "emoji": "🫧",
    "category": "Puzzle",
    "description": "Tap matching bubbles and clear the board."
  },
  {
    "slug": "color-switch",
    "title": "Color Switch Rush",
    "emoji": "🎨",
    "category": "Reflex",
    "description": "Switch colors and test your reflexes."
  }
] as const;
export type GameSlug=typeof games[number]['slug'];

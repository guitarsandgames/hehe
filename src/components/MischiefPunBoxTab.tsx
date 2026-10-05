import React, { useState } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { fireConfetti } from '../utils/confetti';
import {
  Sparkles,
  ArrowRight,
  Shuffle,
  Smile,
  Zap,
  Dice5,
  Volume2
} from 'lucide-react';

interface JokeItem {
  id: number;
  setup: string;
  punchline: string;
  category: 'pun' | 'tech' | 'dad' | 'mischief';
}

const JOKES: JokeItem[] = [
  { id: 1, setup: 'Why do programmers prefer dark mode?', punchline: 'Because light attracts bugs! Hehehe.', category: 'tech' },
  { id: 2, setup: 'What do you call a fake noodle?', punchline: 'An impasta!', category: 'pun' },
  { id: 3, setup: 'Why did the scarecrow win an award?', punchline: 'Because he was outstanding in his field!', category: 'dad' },
  { id: 4, setup: 'How do you comfort a JavaScript bug?', punchline: 'You console it.', category: 'tech' },
  { id: 5, setup: 'Why dont skeletons fight each other?', punchline: 'They dont have the guts!', category: 'dad' },
  { id: 6, setup: 'What did the zero say to the eight?', punchline: 'Nice belt! Hehe.', category: 'pun' },
  { id: 7, setup: 'Why was the math book sad?', punchline: 'It had too many problems.', category: 'dad' },
  { id: 8, setup: 'A SQL query walks into a bar, walks up to two tables and asks...', punchline: 'Can I join you?', category: 'tech' },
  { id: 9, setup: 'What do you call a factory that makes okay products?', punchline: 'A satisfactory!', category: 'pun' },
  { id: 10, setup: 'Why did the bicycle fall over?', punchline: 'It was two-tired!', category: 'dad' },
  { id: 11, setup: 'Why did the developer go broke?', punchline: 'Because they used up all their cache.', category: 'tech' },
  { id: 12, setup: 'What do you call a sleeping dinosaur?', punchline: 'A dino-snore! Hehehe.', category: 'pun' },
];

const MISCHIEF_DARES = [
  'Try saying "bubbles" in the deepest, most terrifying villain voice you can muster.',
  'Compliment someone today exclusively on the choice of their left shoe.',
  'Next time someone sighs, look them dead in the eyes and whisper "The prophecy has begun."',
  'Send a friend a picture of a single potato with absolutely zero context.',
  'Nod thoughtfully at everything someone says for 2 minutes straight without blinking.',
  'Replace the word "yes" with "indeed, mortal" for the next hour.',
  'Offer someone a high five, but smoothly transition into adjusting your hair.',
];

export const MischiefPunBoxTab: React.FC = () => {
  const [jokeIndex, setJokeIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentDare, setCurrentDare] = useState<string>(MISCHIEF_DARES[0]);
  const [userRating, setUserRating] = useState<number | null>(null);

  const filteredJokes = selectedCategory === 'all'
    ? JOKES
    : JOKES.filter((j) => j.category === selectedCategory);

  const currentJoke = filteredJokes[jokeIndex % filteredJokes.length] || JOKES[0];

  const handleReveal = (e: React.MouseEvent) => {
    if (!isRevealed) {
      setIsRevealed(true);
      audioEngine.playBaDumTss();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 20, true);
    }
  };

  const handleNextJoke = () => {
    setIsRevealed(false);
    setUserRating(null);
    setJokeIndex((prev) => (prev + 1) % filteredJokes.length);
    audioEngine.playBlip(1.1);
  };

  const handleRollDare = () => {
    const nextDare = MISCHIEF_DARES[Math.floor(Math.random() * MISCHIEF_DARES.length)];
    setCurrentDare(nextDare);
    audioEngine.play('horn', 1.2);
    fireConfetti(window.innerWidth / 2, window.innerHeight * 0.75, 20, false);
  };

  const handleRate = (stars: number) => {
    setUserRating(stars);
    if (stars >= 4) {
      audioEngine.play('evil', 1.1, 1.2);
    } else {
      audioEngine.play('chuckle', 1.0);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Joke Card */}
      <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            {['all', 'pun', 'tech', 'dad'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setJokeIndex(0);
                  setIsRevealed(false);
                  setUserRating(null);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Laughs' : cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {jokeIndex + 1} of {filteredJokes.length}
          </div>
        </div>

        {/* Joke Setup */}
        <div className="py-6 min-h-[140px] flex flex-col justify-center text-center">
          <p className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            "{currentJoke.setup}"
          </p>

          {/* Punchline */}
          <div className="mt-6 min-h-[48px] flex items-center justify-center">
            {isRevealed ? (
              <p className="text-lg sm:text-xl font-bold text-amber-400 animate-wiggle">
                "{currentJoke.punchline}"
              </p>
            ) : (
              <button
                onClick={handleReveal}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                Reveal Punchline (Ba-Dum Tss!)
              </button>
            )}
          </div>
        </div>

        {/* Rating & Next Controls */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Funny rating:</span>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => handleRate(s)}
                className={`p-1 text-base transition-transform hover:scale-125 cursor-pointer ${
                  userRating !== null && userRating >= s ? 'opacity-100' : 'opacity-40 hover:opacity-80'
                }`}
              >
                😆
              </button>
            ))}
          </div>

          <button
            onClick={handleNextJoke}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Next Laugh</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Harmless Mischief Dare Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-800/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Dice5 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Mischief Dare Machine
              </h3>
              <p className="text-xs text-slate-400">Harmless silliness for your day</p>
            </div>
          </div>

          <button
            onClick={handleRollDare}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Roll New Dare
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-900/40 text-purple-200 text-sm italic">
          "{currentDare}"
        </div>
      </div>
    </div>
  );
};

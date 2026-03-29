import lionImg from '@/assets/avatars/lion.png';
import horseImg from '@/assets/avatars/horse.png';
import turtleImg from '@/assets/avatars/turtle.png';
import sharkImg from '@/assets/avatars/shark.png';
import eagleImg from '@/assets/avatars/eagle.png';

export const AVATARS = [
  { id: 'lion', label: 'Lion', image: lionImg },
  { id: 'horse', label: 'Horse', image: horseImg },
  { id: 'turtle', label: 'Turtle', image: turtleImg },
  { id: 'shark', label: 'Shark', image: sharkImg },
  { id: 'eagle', label: 'Eagle', image: eagleImg },
];

export function getAvatarImage(id: string): string | undefined {
  return AVATARS.find(a => a.id === id)?.image;
}

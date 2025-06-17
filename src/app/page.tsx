
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  // return null; // Or some loading state if redirect takes time, though usually instantaneous
}

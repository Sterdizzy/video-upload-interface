import { redirect } from 'next/navigation';

export default function Index() {
  // Redirect the root to the main app route to avoid 404 at /
  redirect('/app');
}

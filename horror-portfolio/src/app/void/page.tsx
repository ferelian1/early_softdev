import { redirect } from 'next/navigation';

export default function VoidPage() {
  redirect('/void/login');
}

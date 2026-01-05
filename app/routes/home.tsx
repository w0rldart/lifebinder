import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function meta() {
  return [
    { title: "Life Binder" },
    { name: "description", content: "Secure life planning and digital legacy management" },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return null;
}

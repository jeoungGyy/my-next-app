'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  // 메모 불러오기
  const fetchNotes = async () => {
    const res = await fetch('/api/notes');
	if (!res.ok) {
		// 에러 처리
		console.error('Fetch 실패:', res.status);
		return;
	}
    const data = await res.json();
    setNotes(data);
  };

  // 메모 추가
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    setText('');
    await fetchNotes();
    setLoading(false);
  };

  // 메모 삭제
  const handleDelete = async (id) => {
    await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
    await fetchNotes();
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>📝 메모장</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메모를 입력하세요"
          style={{ padding: '0.5rem', width: '300px' }}
        />
        <button type="submit" disabled={loading} style={{ marginLeft: '0.5rem' }}>
          추가
        </button>
      </form>

      <ul>
        {notes.map((note) => (
          <li key={note._id} style={{ marginBottom: '0.5rem' }}>
            {note.text}{' '}
            <button onClick={() => handleDelete(note._id)} style={{ marginLeft: '0.5rem' }}>
              삭제
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

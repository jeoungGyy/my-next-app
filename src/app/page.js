'use client';

import { useEffect, useState } from 'react';

const USERS = ['임정규', '박수민', '김무현'];

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [selectedUser, setSelectedUser] = useState('임정규');
  const [loading, setLoading] = useState(false);

  const [dates, setDates] = useState({});
  const [editMode, setEditMode] = useState({});

  const fetchNotes = async () => {
    const res = await fetch('/api/notes');
    if (!res.ok) {
      console.error('Fetch 실패:', res.status);
      return;
    }
    const data = await res.json();
    setNotes(data);

    const initialDates = {};
    const initialEditMode = {};
    data.forEach(note => {
      initialDates[note._id] = {
        startDate: note.startDate || '',
        endDate: note.endDate || '',
      };
      initialEditMode[note._id] = false;
    });
    setDates(initialDates);
    setEditMode(initialEditMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, user: selectedUser }),
    });
    setText('');
    await fetchNotes();
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
    await fetchNotes();
  };

  const handleDateChange = (id, field, value) => {
    setDates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleDateSave = async (id) => {
    const { startDate, endDate } = dates[id];
    if (!startDate || !endDate) return;

    await fetch(`/api/notes?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate }),
    });

    setEditMode(prev => ({ ...prev, [id]: false }));
    await fetchNotes();
  };

  const toggleEdit = (id) => {
    setEditMode(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [yyyy, mm, dd] = dateStr.split('-');
    return `${mm}.${dd}`;
  };

  // 추가: 상태별 메모 수 계산 함수
	const getStatusCounts = (user) => {
	const userNotes = getNotesByUser(user);
	const inProgress = userNotes.filter(n => n.status === 'in-progress').length;
	const done = userNotes.filter(n => n.status === 'done').length;
	return { inProgress, done };
	};

	// 상태 업데이트 요청
	const updateStatus = async (id, status) => {
  await fetch(`/api/notes?id=${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  await fetchNotes();
};

  useEffect(() => {
    fetchNotes();
  }, []);

  // 사용자별 메모 필터링
  const getNotesByUser = (user) => {
    return notes.filter(note => note.user === user);
  };

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      {/* 업무등록 폼 */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: '1px solid #ccc',
        padding: '1rem',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '600px',
        flexWrap: 'wrap',
        marginBottom: '2rem'
      }}>
        <label>업무등록</label>
        {USERS.map(user => (
          <label key={user} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <input
              type="radio"
              name="user"
              value={user}
              checked={selectedUser === user}
              onChange={() => setSelectedUser(user)}
            />
            {user}
          </label>
        ))}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="내용 입력"
          style={{ flex: 1, minWidth: '150px', padding: '0.5rem' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
          저장
        </button>
      </form>

      {/* 사용자별 메모 목록 3칸 */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {USERS.map(user => (
          <div key={user} style={{
            flex: 1,
            border: '1px solid #ccc',
            borderRadius: '8px',
            minHeight: '300px',
            padding: '1rem'
          }}>
           <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
  {user}
  <span style={{ fontSize: '0.9rem', color: '#888' }}>
    {' '}
    ({getStatusCounts(user).inProgress} 진행중 / {getStatusCounts(user).done} 완료)
  </span>
</h3>
            {getNotesByUser(user).length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666' }}>
                목록이 없습니다.
              </div>
            ) : (
              getNotesByUser(user).map(note => (
                <div key={note._id} style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  position: 'relative'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
  <span>{note.text}</span>
  {note.status === 'in-progress' && (
    <span style={{ fontSize: '0.8rem', color: '#007bff' }}>[진행중]</span>
  )}
  {note.status === 'done' && (
    <span style={{ fontSize: '0.8rem', color: 'green' }}>[완료]</span>
  )}
</div>

                  {editMode[note._id] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="date"
                        value={dates[note._id]?.startDate || ''}
                        onChange={(e) => handleDateChange(note._id, 'startDate', e.target.value)}
                      />
                      <span>~</span>
                      <input
                        type="date"
                        value={dates[note._id]?.endDate || ''}
                        onChange={(e) => handleDateChange(note._id, 'endDate', e.target.value)}
                      />
                      <button onClick={() => handleDateSave(note._id)}>저장</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#555' }}>
                        {note.startDate && note.endDate
                          ? `${formatDate(note.startDate)} ~ ${formatDate(note.endDate)}`
                          : '날짜 미지정'}
                      </span>
                      <button
                        onClick={() => toggleEdit(note._id)}
                        style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        수정
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
  <button
    onClick={() => handleDelete(note._id)}
    style={{
      fontSize: '0.8rem',
      color: '#c00',
      border: 'none',
      background: 'none',
      cursor: 'pointer'
    }}
  >
    삭제
  </button>

  <button
    onClick={() => updateStatus(note._id, 'in-progress')}
    style={{
      fontSize: '0.8rem',
      color: '#0066cc',
      border: 'none',
      background: 'none',
      cursor: 'pointer'
    }}
  >
    진행중
  </button>

  <button
    onClick={() => updateStatus(note._id, 'done')}
    style={{
      fontSize: '0.8rem',
      color: 'green',
      border: 'none',
      background: 'none',
      cursor: 'pointer'
    }}
  >
    완료
  </button>
</div>

				  
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

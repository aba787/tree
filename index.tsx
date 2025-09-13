
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

interface Person {
  id: string;
  name: string;
  birth_date?: string;
  death_date?: string;
}

interface Transmission {
  id: string;
  teacher_id: string;
  student_id: string;
  ijaza_id?: string;
}

interface Ijaza {
  id: string;
  title?: string;
  issued_at?: string;
  notes?: string;
}

export default function Home() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [ijazas, setIjazas] = useState<Ijaza[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [path, setPath] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: '', birth_date: '', death_date: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [personsRes, transmissionsRes, ijazasRes] = await Promise.all([
        fetch('/api/persons'),
        fetch('/api/transmissions'),
        fetch('/api/ijazas')
      ]);

      if (personsRes.ok) setPersons(await personsRes.json());
      if (transmissionsRes.ok) setTransmissions(await transmissionsRes.json());
      if (ijazasRes.ok) setIjazas(await ijazasRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const findPath = async () => {
    if (!from || !to) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/shortest?from=${from}&to=${to}`);
      if (res.ok) {
        const json = await res.json();
        setPath(json.path);
      } else {
        setPath(null);
        const errorData = await res.json().catch(() => null);
        alert(errorData?.error || errorData?.message || 'لم يتم العثور على سلسلة إسناد بين هذين العالمين');
      }
    } catch (error) {
      console.error('Error finding path:', error);
      alert('حدث خطأ أثناء البحث عن السلسلة');
    }
    setLoading(false);
  };

  const addPerson = async () => {
    if (!newPerson.name.trim()) return;
    
    try {
      const res = await fetch('/api/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPerson)
      });
      
      if (res.ok) {
        setNewPerson({ name: '', birth_date: '', death_date: '' });
        setShowAddForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error adding person:', error);
    }
  };

  const getPersonName = (id: string) => {
    return persons.find(p => p.id === id)?.name || id;
  };

  const getPersonsByGeneration = () => {
    const adj = new Map<string, string[]>();
    transmissions.forEach(t => {
      if (!adj.has(t.teacher_id)) adj.set(t.teacher_id, []);
      adj.get(t.teacher_id)!.push(t.student_id);
    });

    const generations: string[][] = [];
    const visited = new Set<string>();
    
    // Find root nodes (no incoming edges)
    const hasIncoming = new Set(transmissions.map(t => t.student_id));
    const roots = persons.filter(p => !hasIncoming.has(p.id)).map(p => p.id);
    
    if (roots.length === 0 && persons.length > 0) {
      roots.push(persons[0].id);
    }

    const queue = roots.map(id => ({ id, level: 0 }));
    
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      
      if (visited.has(id)) continue;
      visited.add(id);
      
      if (!generations[level]) generations[level] = [];
      generations[level].push(id);
      
      const children = adj.get(id) || [];
      children.forEach(childId => {
        if (!visited.has(childId)) {
          queue.push({ id: childId, level: level + 1 });
        }
      });
    }
    
    return generations;
  };

  const generations = getPersonsByGeneration();

  return (
    <div className={styles.container}>
      <Head>
        <title>متتبع أسانيد القرآن الكريم</title>
        <meta name="description" content="تتبع أسانيد القرآن الكريم والإجازات القرآنية" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <main className={styles.main} dir="rtl">
        <div className={styles.header}>
          <div className={styles.bismillah}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
          <h1 className={styles.title}>
            متتبع أسانيد القرآن الكريم
          </h1>
          <p className={styles.subtitle}>
            شجرة الأسانيد والإجازات القرآنية المباركة
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchSection}>
            <h2>🔍 البحث في شجرة الأسانيد</h2>
            <div className={styles.searchForm}>
              <div className={styles.selectGroup}>
                <label>من الشيخ:</label>
                <select value={from} onChange={e => setFrom(e.target.value)}>
                  <option value="">اختر الشيخ المصدر</option>
                  {persons.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.birth_date && `(${p.birth_date})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styles.selectGroup}>
                <label>إلى الطالب:</label>
                <select value={to} onChange={e => setTo(e.target.value)}>
                  <option value="">اختر الطالب المستهدف</option>
                  {persons.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.birth_date && `(${p.birth_date})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={findPath} 
                disabled={!from || !to || loading}
                className={styles.searchButton}
              >
                {loading ? 'جاري البحث...' : '🔍 البحث عن السند'}
              </button>
            </div>
          </div>

          <div className={styles.addSection}>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className={styles.addButton}
            >
              ➕ إضافة عالم جديد
            </button>
            
            {showAddForm && (
              <div className={styles.addForm}>
                <input
                  type="text"
                  placeholder="اسم العالم"
                  value={newPerson.name}
                  onChange={e => setNewPerson({...newPerson, name: e.target.value})}
                />
                <input
                  type="date"
                  placeholder="تاريخ الميلاد"
                  value={newPerson.birth_date}
                  onChange={e => setNewPerson({...newPerson, birth_date: e.target.value})}
                />
                <input
                  type="date"
                  placeholder="تاريخ الوفاة"
                  value={newPerson.death_date}
                  onChange={e => setNewPerson({...newPerson, death_date: e.target.value})}
                />
                <div className={styles.formButtons}>
                  <button onClick={addPerson} className={styles.saveButton}>حفظ</button>
                  <button onClick={() => setShowAddForm(false)} className={styles.cancelButton}>إلغاء</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {path && (
          <div className={styles.pathResult}>
            <h3>🌟 السند المبارك ({path.length} رواة):</h3>
            <div className={styles.pathChain}>
              {path.map((id, index) => (
                <div key={id} className={styles.pathNode}>
                  <div className={styles.narrator}>
                    <strong>{getPersonName(id)}</strong>
                  </div>
                  {index < path.length - 1 && (
                    <div className={styles.transmission}>↓ أجاز</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.treeContainer}>
          <h2>🌳 شجرة الأسانيد المباركة</h2>
          <div className={styles.tree}>
            {generations.map((generation, genIndex) => (
              <div key={genIndex} className={styles.generation}>
                <div className={styles.generationLabel}>
                  الجيل {genIndex + 1}
                </div>
                <div className={styles.scholars}>
                  {generation.map(personId => {
                    const person = persons.find(p => p.id === personId);
                    if (!person) return null;
                    
                    return (
                      <div key={personId} className={styles.scholar}>
                        <div className={styles.scholarName}>{person.name}</div>
                        <div className={styles.scholarDates}>
                          {person.birth_date && <span>و: {person.birth_date}</span>}
                          {person.death_date && <span>ت: {person.death_date}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {genIndex < generations.length - 1 && (
                  <div className={styles.connectionLines}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{persons.length}</div>
            <div className={styles.statLabel}>علماء وقراء</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{transmissions.length}</div>
            <div className={styles.statLabel}>إجازات ونقولات</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{generations.length}</div>
            <div className={styles.statLabel}>أجيال الأسانيد</div>
          </div>
        </div>
      </main>
    </div>
  );
}

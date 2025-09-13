
// models.ts
export type UUID = string;

export class Person {
  id: UUID;
  name: string;
  birthDate?: string | null;
  deathDate?: string | null;

  constructor(id: UUID, name: string, birthDate?: string|null, deathDate?: string|null){
    this.id = id;
    this.name = name;
    this.birthDate = birthDate ?? null;
    this.deathDate = deathDate ?? null;
  }
}

export class Ijaza {
  id: UUID;
  title?: string;
  issuedAt?: string|null;
  notes?: string|null;

  constructor(id: UUID, title?: string, issuedAt?: string|null, notes?: string|null){
    this.id = id;
    this.title = title;
    this.issuedAt = issuedAt ?? null;
    this.notes = notes ?? null;
  }
}

export class Transmission {
  id: UUID;
  teacherId: UUID;
  studentId: UUID;
  ijazaId?: UUID|null;

  constructor(id: UUID, teacherId: UUID, studentId: UUID, ijazaId?: UUID|null){
    this.id = id;
    this.teacherId = teacherId;
    this.studentId = studentId;
    this.ijazaId = ijazaId ?? null;
  }
}

import Database from 'better-sqlite3';

const db = new Database('./database.sqlite', { fileMustExist: true });

export type DatabasePerson = {
  id: string
  name: string
  position: number
  state: string
  bio: string
  language: string
  version: number
  createdDate: string
}

export function getPersons(page: number = 1, pageSize: number = 10): { data: DatabasePerson[], total: number } {
  const offset = (page - 1) * pageSize;
  
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const { count } = countStmt.get() as { count: number };
  
  const stmt = db.prepare(`
    SELECT * 
    FROM users 
    ORDER BY position 
    LIMIT ? OFFSET ?
  `);
  
  const data = stmt.all(pageSize, offset) as DatabasePerson[];
  
  return {
    data,
    total: count
  };
}

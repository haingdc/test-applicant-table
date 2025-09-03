// @ts-ignore
import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync('./database.sqlite');

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
  console.log('getPersons called with page:', page, 'pageSize:', pageSize);
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
  const transformedData = data.map((d) => { // avoid unserialized data pass to Client Components
    return {
      id: d.id,
      name: d.name,
      position: d.position,
      state: d.state,
      bio: d.bio,
      language: d.language,
      version: d.version,
      createdDate: d.createdDate
    }
  })
  
  return {
    data: transformedData,
    total: count
  };
}

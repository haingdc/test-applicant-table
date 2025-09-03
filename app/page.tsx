
import styles from './page.module.css'
import DataTable from './DataTable'
import { columns, type Person } from './DataTable/columns'
import { getPersons } from '@/lib/db'

async function getData(pageSize: number = 50): Promise<{ data: Person[], pageCount: number }> {
  const { data, total } = getPersons(1, pageSize)
  
  return {
    data: data,
    pageCount: Math.ceil(total / pageSize)
  }
}

export default async function Home() {
  const { data, pageCount } = await getData()

  return (
      <DataTable 
        columns={columns} 
        initialData={data}
        pageCount={pageCount}
      />
  )
}

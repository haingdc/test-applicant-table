/// <reference lib="dom" />
'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  useInfiniteQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useEffect, useRef, useState } from 'react'

interface FetchResponse<T> {
  data: T[]
  total: number
  pageCount: number
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  initialData: TData[]
  pageCount: number
}

async function fetchUsers<T>({ pageParam = 1 }): Promise<FetchResponse<T>> {
  const response = await fetch(`/api/users?page=${pageParam}&pageSize=50`)
  return response.json()
}

// Create a client
const queryClient = new QueryClient()

function DataTableContent<TData, TValue>({
  columns,
  initialData,
  pageCount: initialPageCount,
}: DataTableProps<TData, TValue>) {
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)
  const windowSizeX = isClient ? document.documentElement.clientWidth : 600
 
  useEffect(() => {
    setIsClient(true)
  }, [])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    isFetching,
  } = useInfiniteQuery<FetchResponse<TData>>({
    queryKey: ['users'],
    queryFn: async ({ pageParam }) => {
      return fetchUsers<TData>({ pageParam: pageParam as number })
    },
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1
      return nextPage <= lastPage.pageCount ? nextPage : undefined
    },
    initialData: {
      pages: [
        {
          data: initialData,
          pageCount: initialPageCount,
          total: initialPageCount * 50,
        },
      ],
      pageParams: [1],
    },
    initialPageParam: 1,
  })

  const flatData = data?.pages.flatMap((page) => page.data) ?? []
  const totalDBRowCount = data?.pages?.[0]?.total ?? 0
  const totalFetched = flatData.length

  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 33, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  })

  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement
        //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage()
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  )

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current)
  }, [fetchMoreOnBottomReached])

  if (isPending) return <div>Loading...</div>
  if (isError) return <div>Error fetching data</div>

  return (
    <div className='rounded-md border'>
      <div
        ref={tableContainerRef}
        className='container'
        onScroll={(e) => {
          return fetchMoreOnBottomReached(e.currentTarget)
        }}
        style={{
          overflow: 'auto', //our scrollable table container
          position: 'relative', //needed for sticky header
          height: '600px', //should be a fixed height
          width: `${windowSizeX}px`,
          maxWidth: 'none'
        }}
      >
        <Table style={{ display: 'grid' }}>
          <TableHeader
            style={{
              display: 'grid',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                style={{ display: 'flex', width: '100%' }}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        display: 'flex',
                        width: header.getSize(),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            style={{
              display: 'grid',
              height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
              position: 'relative', //needed for absolute positioning of rows
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              return row ? (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  style={{
                    display: 'flex',
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                    position: 'absolute',
                    width: '100%',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      id={JSON.stringify(cell)}
                      style={{
                        display: 'flex',
                        width: cell.column.getSize(),
                        overflow: 'hidden'
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ) : null
            })}
          </TableBody>
        </Table>
      </div>
      {isFetchingNextPage && (
        <div className='text-center py-4'>Loading more...</div>
      )}
    </div>
  )
}

function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  return (
    <QueryClientProvider client={queryClient}>
      <DataTableContent {...props} />
    </QueryClientProvider>
  )
}

export default DataTable

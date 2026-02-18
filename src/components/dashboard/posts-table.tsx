'use client';

import * as React from 'react';
import { useTransition } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, FileText } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getPostsAction } from '@/app/actions/posts';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Post } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStore } from '@/store/dashboard-store';

export const columns: ColumnDef<Post>[] = [
  {
    accessorKey: 'thumbnail_url',
    header: 'Thumbnail',
    cell: ({ row }) => (
      <div className="w-16 h-16 bg-muted rounded overflow-hidden">
        {row.original.thumbnail_url ? (
          <img
            src={row.original.thumbnail_url}
            alt="Thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            No Image
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'caption',
    header: 'Caption',
    cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue('caption')}</div>,
  },
  {
    accessorKey: 'platform',
    header: 'Platform',
    cell: ({ row }) => <div className="capitalize">{row.getValue('platform')}</div>,
  },
  {
    accessorKey: 'likes',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Likes
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-center">{row.getValue('likes')}</div>,
  },
  {
    accessorKey: 'comments',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Comments
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-center">{row.getValue('comments')}</div>,
  },
  {
    accessorKey: 'shares',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Shares
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-center">{row.getValue('shares')}</div>,
  },
  {
    accessorKey: 'engagement_rate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Eng. Rate
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-center">{row.getValue('engagement_rate')}%</div>,
  },
  {
    accessorKey: 'posted_at',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Posted At
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('posted_at'));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
];

interface PostsTableProps {
  data: Post[];
  page: number;
  limit: number;
  totalPages: number;
  isLoading?: boolean;
}

export default function PostsTable({
  data: initialData,
  page,
  limit,
  totalPages: initialTotalPages,
  isLoading: initialLoading = false,
}: PostsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setSelectedPost, setIsModalOpen } = useDashboardStore();
  const [isPending, startTransition] = useTransition();
  const tableRef = React.useRef<HTMLDivElement>(null);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  // Get initial state from URL
  const sortBy = searchParams.get('sortBy') || 'posted_at';
  const sortOrder = searchParams.get('sortOrder') || 'asc';
  const platform = searchParams.get('platform') || 'all';
  const search = searchParams.get('search') || '';

  // Use React Query for data fetching
  const { data: queryData, isLoading: isQueryLoading, isFetching } = useQuery({
    queryKey: ['posts', page, limit, search, sortBy, sortOrder, platform],
    queryFn: () => getPostsAction({ 
      page, 
      limit, 
      search, 
      sortBy, 
      sortOrder: sortOrder as 'asc' | 'desc', 
      platform 
    }),
    initialData: { 
      data: initialData, 
      page, 
      limit, 
      total: 0, // Not used in table rendering directly
      totalPages: initialTotalPages 
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const tableData = queryData?.data || [];
  const totalPages = queryData?.totalPages || 0;
  const isLoading = initialLoading || (isQueryLoading && !queryData);
  
  // Show loading skeleton when fetching new data if we don't have placeholder data
  const showSkeleton = isLoading || (isFetching && !tableData.length);

  // Loading toast
  React.useEffect(() => {
    if ((isFetching || isPending) && !showSkeleton) {
      const toastId = toast.loading('Updating data...');
      return () => {
        toast.dismiss(toastId);
      };
    }
  }, [isFetching, isPending, showSkeleton]);

  // Local state for search input to avoid debounce lag
  const [searchValue, setSearchValue] = React.useState(search);

  // Sync searchValue with URL search param
  React.useEffect(() => {
    setSearchValue(search);
  }, [search]);

  const updateUrl = React.useCallback((updates: Record<string, string | number | undefined | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      
      // If page is changing, scroll to table top
      if (updates.page) {
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, [router, pathname, searchParams]);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== search) {
        updateUrl({ search: searchValue, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, search, updateUrl]);

  const sorting: SortingState = [{ id: sortBy, desc: sortOrder === 'desc' }];

  const table = useReactTable({
    data: tableData,
    columns,
    pageCount: totalPages,
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      const firstSort = newSorting[0];
      updateUrl({
        sortBy: firstSort?.id || 'posted_at',
        sortOrder: firstSort?.desc ? 'desc' : 'asc',
      });
    },
    getCoreRowModel: getCoreRowModel(),
  });

  if (showSkeleton) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="border rounded-md p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" ref={tableRef}>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
        <Input
          placeholder="Filter posts..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="max-w-sm"
        />
        <Select
          value={platform}
          onValueChange={(value) => updateUrl({ platform: value, page: 1 })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border overflow-x-auto relative min-h-[400px]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handlePostClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                    <div className="bg-muted rounded-full p-4">
                      <FileText className="h-8 w-8 opacity-50" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">No posts found</p>
                      <p className="text-sm mt-1">
                        Try adjusting your filters or search query.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateUrl({ page: page - 1 })}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateUrl({ page: page + 1 })}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

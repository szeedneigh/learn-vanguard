import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, List, LayoutGrid, AlertCircle } from "lucide-react";

// Mock data
const mockArchivedItems = [
  { id: 1, name: 'Project Deadline', completionDate: '2025-03-24', remainingDays: 30 },
  { id: 2, name: 'Team Meeting', completionDate: '2025-02-14', remainingDays: 28 },
  { id: 3, name: 'Complete project for CT', completionDate: '2025-03-14', remainingDays: 25 },
  { id: 4, name: 'Review Design Mockups', completionDate: '2025-01-10', remainingDays: 15 },
];

// Helper function to format date strings
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};


const Archive = () => {
  const [archivedItems, setArchivedItems] = useState(mockArchivedItems);
  const [sortBy, setSortBy] = useState('completionDateDesc'); // 'completionDateAsc', 'completionDateDesc', 'nameAsc', 'nameDesc'
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid' - Only list implemented for now

  const sortedItems = useMemo(() => {
    let items = [...archivedItems];
    switch (sortBy) {
      case 'completionDateAsc':
        items.sort((a, b) => new Date(a.completionDate) - new Date(b.completionDate));
        break;
      case 'completionDateDesc':
        items.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
        break;
      case 'nameAsc':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        items.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return items;
  }, [archivedItems, sortBy]);

  const getSortLabel = () => {
    switch (sortBy) {
      case 'completionDateAsc': return 'Oldest First';
      case 'completionDateDesc': return 'Newest First';
      case 'nameAsc': return 'Name (A-Z)';
      case 'nameDesc': return 'Name (Z-A)';
      default: return 'Sort by date';
    }
  };

  // Placeholder functions for actions
  const handleRestore = (id) => {
    console.log(`Restore item ${id}`);
    // Implement restore logic here (e.g., API call, update state)
  };

  const handleDeletePermanently = (id) => {
    console.log(`Delete permanently item ${id}`);
    // Implement permanent delete logic here (e.g., API call, update state)
    setArchivedItems(prevItems => prevItems.filter(item => item.id !== id));
  };


  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-2xl font-semibold">Archive</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{getSortLabel()}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setSortBy('completionDateDesc')}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSortBy('completionDateAsc')}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSortBy('nameAsc')}>
                Name (A-Z)
              </DropdownMenuItem>
               <DropdownMenuItem onSelect={() => setSortBy('nameDesc')}>
                Name (Z-A)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* View Toggle Buttons - Only List view implemented */}
           <div className="flex items-center border rounded-md">
             <Button
               variant={viewMode === 'list' ? 'secondary' : 'ghost'}
               size="icon"
               onClick={() => setViewMode('list')}
               className="rounded-r-none"
             >
               <List className="h-4 w-4" />
             </Button>
             <Button
               variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
               size="icon"
               onClick={() => setViewMode('grid')}
               className="rounded-l-none border-l"
               // disabled // Grid view not implemented - Enabling it now
             >
               <LayoutGrid className="h-4 w-4" />
             </Button>
           </div>
        </div>
      </div>

      <Alert className="bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
         <AlertCircle className="h-4 w-4 !text-blue-800 dark:!text-blue-300" />
        <AlertDescription>
          Items in the archive will be deleted forever after 30 days.
        </AlertDescription>
      </Alert>

      {viewMode === 'list' && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead className="text-right">Remaining Days until Deletion</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.length > 0 ? (
                sortedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{formatDate(item.completionDate)}</TableCell>
                    <TableCell className="text-right">{item.remainingDays} days</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleRestore(item.id)}>
                            Restore
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => handleDeletePermanently(item.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-100/50"
                          >
                            Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No archived items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Grid View Implementation */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedItems.length > 0 ? (
            sortedItems.map((item) => (
              <Card key={item.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium truncate">{item.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleRestore(item.id)}>
                        Restore
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleDeletePermanently(item.id)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-100/50"
                      >
                        Delete Permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>
                    Completed: {formatDate(item.completionDate)}
                  </CardDescription>
                  <div className="text-xs text-muted-foreground pt-1">
                    Deletes in {item.remainingDays} days
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center p-10 border rounded-md">
              No archived items found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Archive;

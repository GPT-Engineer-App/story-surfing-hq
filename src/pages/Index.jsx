import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Search, ChevronLeft, ChevronRight, RefreshCcw, MessageSquare, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

const fetchTopStories = async () => {
  const response = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=100');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('points');
  const itemsPerPage = 9;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['topStories'],
    queryFn: fetchTopStories,
  });

  const filteredAndSortedStories = (data?.hits || [])
    .filter(story => story.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'points') return b.points - a.points;
      if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at);
      return a.title.localeCompare(b.title);
    });

  const totalPages = Math.ceil(filteredAndSortedStories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStories = filteredAndSortedStories.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto p-4 bg-gradient-to-b from-blue-50 to-green-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-blue-800 text-center">Top 100 Hacker News Stories</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="points">Points</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <RefreshCcw className="animate-spin text-blue-500" size={48} />
        </div>
      )}
      {error && (
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error.message}</p>
          <Button onClick={() => refetch()} className="bg-blue-500 hover:bg-blue-600">
            Retry
          </Button>
        </div>
      )}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentStories.map((story) => (
              <Card key={story.objectID} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700 line-clamp-2">{story.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <User className="mr-1 h-4 w-4" /> {story.author}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="mr-1 h-4 w-4" /> {format(new Date(story.created_at), 'PPP')}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MessageSquare className="mr-1 h-4 w-4" /> {story.num_comments} comments
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-blue-500">{story.points} points</span>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    asChild
                  >
                    <a href={story.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                      Read More <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;

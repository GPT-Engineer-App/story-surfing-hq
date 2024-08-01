import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Search } from 'lucide-react';

const fetchTopStories = async () => {
  const response = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=100');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['topStories'],
    queryFn: fetchTopStories,
  });

  const filteredStories = data?.hits.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto p-4 bg-green-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-green-800 text-center">Top 100 Hacker News Stories</h1>
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Search stories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border-green-300 focus:border-green-500 focus:ring-green-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" size={20} />
      </div>
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, index) => (
            <Card key={index} className="animate-pulse bg-white shadow-lg">
              <CardHeader>
                <div className="h-6 bg-green-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-green-100 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-green-100 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {error && <p className="text-red-500 text-center">Error: {error.message}</p>}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <Card key={story.objectID} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-green-700">{story.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-500 mb-4">Upvotes: {story.points}</p>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  asChild
                >
                  <a href={story.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                    Read More <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;

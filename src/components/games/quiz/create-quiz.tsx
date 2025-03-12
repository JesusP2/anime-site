import * as React from "react";
import { QuizLayout } from "./layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  MagnifyingGlass, 
  Plus, 
  MinusCircle, 
  Share,
  Globe
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export function CreateQuiz() {
  const [songs, setSongs] = React.useState<Array<{id: string, animeId: number, title: string, animeTitle: string}>>([
    { id: '1', animeId: 1, title: "Cruel Angel's Thesis", animeTitle: "Neon Genesis Evangelion" }
  ]);
  
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  
  // Mock search function
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // Simulating API call
    setTimeout(() => {
      setSearchResults([
        { id: 101, title: "Tank!", animeTitle: "Cowboy Bebop" },
        { id: 102, title: "Unravel", animeTitle: "Tokyo Ghoul" },
        { id: 103, title: "Again", animeTitle: "Fullmetal Alchemist: Brotherhood" },
      ]);
      setIsSearching(false);
    }, 1000);
  };
  
  const addSong = (song: any) => {
    setSongs([...songs, { 
      id: Date.now().toString(),
      animeId: song.id,
      title: song.title,
      animeTitle: song.animeTitle
    }]);
    setSearchResults([]);
  };
  
  const removeSong = (id: string) => {
    setSongs(songs.filter(song => song.id !== id));
  };
  
  return (
    <QuizLayout title="Create a Quiz">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
            <CardDescription>
              Set up your quiz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input id="title" placeholder="Enter a catchy title for your quiz" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe your quiz (optional)" 
                className="min-h-[100px]" 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <RadioGroup defaultValue="medium" className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="easy" id="easy" />
                  <Label htmlFor="easy">Easy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hard" id="hard" />
                  <Label htmlFor="hard">Hard</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="public" />
              <Label htmlFor="public" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Make quiz public
              </Label>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Anime Themes</CardTitle>
            <CardDescription>
              Add at least 5 openings to your quiz (maximum 20)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    type="search" 
                    placeholder="Search for anime openings..."
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </form>
            
            {searchResults.length > 0 && (
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Search Results</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ul className="divide-y">
                    {searchResults.map(result => (
                      <li key={result.id} className="py-2 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{result.title}</p>
                          <p className="text-sm text-gray-500">{result.animeTitle}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => addSong(result)}
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            
            <div>
              <h3 className="text-sm font-medium mb-2">Selected Themes ({songs.length}/20)</h3>
              <ul className="space-y-2">
                {songs.map((song, index) => (
                  <li key={song.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{song.title}</span>
                      </div>
                      <p className="text-sm text-gray-500">{song.animeTitle}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeSong(song.id)}
                    >
                      <MinusCircle className="w-5 h-5 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button disabled={songs.length < 5}>
              <Share className="mr-2 w-4 h-4" />
              Create Quiz
            </Button>
          </CardFooter>
        </Card>
      </div>
    </QuizLayout>
  );
} 

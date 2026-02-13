import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResourceStore, useFilteredResources, useAllSubtopics, Question } from "@/store/useResourceStore";

export function ResourcesPage() {
  const searchQuery = useResourceStore((state) => state.searchQuery);
  const setSearchQuery = useResourceStore((state) => state.setSearchQuery);
  const sortBy = useResourceStore((state) => state.sortBy);
  const setSortBy = useResourceStore((state) => state.setSortBy);
  const selectedSubtopics = useResourceStore((state) => state.selectedSubtopics);
  const setSelectedSubtopics = useResourceStore((state) => state.setSelectedSubtopics);
  const allSubtopics = useAllSubtopics();
  const filteredCompanies = useFilteredResources();
  const [topicSearchQuery, setTopicSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 9; // Number of questions per page

  // Calculate total number of questions
  const totalQuestions = filteredCompanies.reduce((acc, [_, questions]) => acc + questions.length, 0);
  const totalPages = Math.ceil(totalQuestions / itemsPerPage);

  // Get current page questions
  const getCurrentPageQuestions = () => {
    let count = 0;
    const result: [string, Question[]][] = [];
    
    for (const [company, questions] of filteredCompanies) {
      const remainingQuestions = questions.slice(
        Math.max(0, (currentPage - 1) * itemsPerPage - count),
        Math.max(0, currentPage * itemsPerPage - count)
      );
      
      if (remainingQuestions.length > 0) {
        result.push([company, remainingQuestions]);
      }
      
      count += questions.length;
      if (count >= currentPage * itemsPerPage) break;
    }
    
    return result;
  };

  const currentPageQuestions = getCurrentPageQuestions();

  const toggleSubtopic = (topic: string) => {
    if (selectedSubtopics.includes(topic)) {
      setSelectedSubtopics(selectedSubtopics.filter(t => t !== topic));
    } else {
      setSelectedSubtopics([...selectedSubtopics, topic]);
    }
  };

  const filteredTopics = allSubtopics.filter(topic => 
    topic.toLowerCase().includes(topicSearchQuery.toLowerCase())
  );

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, selectedSubtopics]);

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DSA Question Bank</h1>
        <p className="text-muted-foreground">
          Search questions by company name or problem name
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-8">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies or problems..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className="w-64 space-y-6 sticky top-8 h-fit">
          {/* Difficulty Filter */}
          <div className="space-y-2">
            <h3 className="font-medium">Difficulty</h3>
            <Select value={sortBy || 'none'} onValueChange={(value) => setSortBy(value === 'none' ? null : value as 'difficulty' | 'question_no' | 'easy' | 'medium' | 'hard')}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Difficulties</SelectItem>
                <SelectItem value="easy">Only Easy</SelectItem>
                <SelectItem value="medium">Only Medium</SelectItem>
                <SelectItem value="hard">Only Hard</SelectItem>
                <SelectItem value="difficulty">Sort by Difficulty</SelectItem>
                <SelectItem value="question_no">Sort by Question Number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Topics Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Topics</h3>
              {selectedSubtopics.length > 0 && (
                <button
                  onClick={() => setSelectedSubtopics([])}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                value={topicSearchQuery}
                onChange={(e) => setTopicSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-2 border rounded-md">
              {filteredTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleSubtopic(topic)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    selectedSubtopics.includes(topic)
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'border-input hover:bg-accent hover:border-accent-foreground'
                  }`}
                >
                  {topic}
                  {selectedSubtopics.includes(topic) && (
                    <span className="ml-1.5">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {currentPageQuestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No questions found matching your criteria
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-8">
                {currentPageQuestions.map(([company, questions]) => (
                  <div key={company}>
                    <h2 className="text-xl font-semibold mb-4 capitalize">
                      {company}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {questions.map((question) => (
                        <QuestionCard key={question.question_no} question={question} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ question }: { question: Question }) {
  const difficultyColors: Record<string, string> = {
    Easy: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Hard: "bg-red-100 text-red-800",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            #{question.question_no}. {question.question_name}
          </CardTitle>
          <Badge className={difficultyColors[question.difficulty]}>
            {question.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-4">
          {question.subtopics.map((topic: string) => (
            <Badge variant="outline" key={topic}>
              {topic}
            </Badge>
          ))}
        </div>
        <a
          href={question.question_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          View on LeetCode →
        </a>
      </CardContent>
    </Card>
  );
}

export default ResourcesPage;

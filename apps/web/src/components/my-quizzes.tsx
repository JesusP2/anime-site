import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/pagination";
import { actions } from "astro:actions";
import type { getQuizzes } from "@/lib/games/quiz/queries";
import { useRef } from "react";
import type { FormEvent } from "react";
import { PlusCircle, ArrowUp, ArrowDown, XCircle } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GetReturnType } from "@/lib/types";
import { navigate } from "astro:transitions/client";
import { safeStartViewTransition } from "@/lib/safe-start-view-transition";

type QuizzItems = GetReturnType<typeof getQuizzes>;

type MyQuizzesComponentProps = {
  quizzes: QuizzItems;
  currentPage: number;
  pageSize: number;
  url: string;
};

export function MyQuizzes({
  quizzes,
  pageSize,
  url,
}: MyQuizzesComponentProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const currentUrl = new URL(url);
  const currentGlobalSearch = currentUrl.searchParams.get("q") || "";
  const currentDifficultyFilter = currentUrl.searchParams.get("difficulty") || "all";
  const currentVisibilityFilter = currentUrl.searchParams.get("visibility") || "all";
  const currentSortColumn = currentUrl.searchParams.get("sort");
  const currentSortDirection = currentUrl.searchParams.get("order") as "asc" | "desc" | null;
  const actualCurrentPage = parseInt(currentUrl.searchParams.get("page") || "1", 10);

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newUrl = new URL(currentUrl.pathname, currentUrl.origin);

    const params = new URLSearchParams();
    const q = formData.get("q") as string || "";
    const difficulty = formData.get("difficulty") as string || "all";
    const visibility = formData.get("visibility") as string || "all";
    const sort = formData.get("sort") as string || "";
    const order = formData.get("order") as string || "";
    const page = formData.get("page") as string || "1";

    if (q) params.set("q", q);
    if (difficulty && difficulty !== "all") params.set("difficulty", difficulty);
    if (visibility && visibility !== "all") params.set("visibility", visibility);
    if (sort) {
      params.set("sort", sort);
      if (order) params.set("order", order);
    }
    if (page && page !== "1") params.set("page", page);

    newUrl.search = params.toString();
    safeStartViewTransition(() => navigate(newUrl.toString()));
  };

  const handleSort = (columnName: string) => {
    if (formRef.current) {
      const sortInput = formRef.current.elements.namedItem("sort") as HTMLInputElement;
      const orderInput = formRef.current.elements.namedItem("order") as HTMLInputElement;
      const pageInput = formRef.current.elements.namedItem("page") as HTMLInputElement;

      let newDirection: "asc" | "desc" = "asc";
      if (currentSortColumn === columnName && currentSortDirection === "asc") {
        newDirection = "desc";
      }

      if (sortInput) sortInput.value = columnName;
      if (orderInput) orderInput.value = newDirection;
      if (pageInput) pageInput.value = "1";

      formRef.current.requestSubmit();
    }
  };

  async function handleDelete(
    e: React.FormEvent<HTMLFormElement>,
    quizId: string,
    quizName: string,
  ) {
    e.preventDefault();
    if (!quizId) return;
    if (!window.confirm(`Are you sure you want to delete "${quizName}"?`)) {
      return;
    }
    try {
      const res = await actions.quizzes.deleteQuiz({ quizId });
      if (res.error) {
        console.error(res.error);
        alert(`Error deleting quiz: ${res.error.message}`);
        return;
      }
      window.location.reload();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("An unexpected error occurred while deleting the quiz.");
    }
  }

  const getDifficultyBadgeVariant = (
    difficulty: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "default";
      case "medium":
        return "secondary";
      case "hard":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleFilterChange = () => {
    if (formRef.current) {
      const pageInput = formRef.current.elements.namedItem("page") as HTMLInputElement;
      if (pageInput) pageInput.value = "1";
      formRef.current.requestSubmit();
    }
  };

  const handleClearFilters = () => {
    if (formRef.current) {
      const qInput = formRef.current.elements.namedItem("q") as HTMLInputElement;
      const difficultyInput = formRef.current.elements.namedItem("difficulty") as HTMLInputElement;
      const visibilityInput = formRef.current.elements.namedItem("visibility") as HTMLInputElement;
      const sortInput = formRef.current.elements.namedItem("sort") as HTMLInputElement;
      const orderInput = formRef.current.elements.namedItem("order") as HTMLInputElement;
      const pageInput = formRef.current.elements.namedItem("page") as HTMLInputElement;

      if (qInput) qInput.value = "";
      if (difficultyInput) difficultyInput.value = "all";
      if (visibilityInput) visibilityInput.value = "all";
      if (sortInput) sortInput.value = "";
      if (orderInput) orderInput.value = "";
      if (pageInput) pageInput.value = "1";
      formRef.current.requestSubmit();
    }
  };

  const lastVisiblePage = Math.ceil((quizzes.count || 1) / pageSize);
  console.log(quizzes.count, pageSize, quizzes.data)

  const renderSortIcon = (columnName: string) => {
    if (currentSortColumn === columnName) {
      return currentSortDirection === "asc" ? (
        <ArrowUp className="inline ml-1 h-4 w-4" />
      ) : (
        <ArrowDown className="inline ml-1 h-4 w-4" />
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <a
          className={buttonVariants({ variant: "outline" })}
          href="/games/guess-the-anime-theme/create"
        >
          <PlusCircle className="mr-2 w-5 h-5" />
          Create New Quiz
        </a>
      </div>

      <form ref={formRef} onSubmit={handleFormSubmit}>
        <input type="hidden" name="page" defaultValue={String(actualCurrentPage)} />
        <input type="hidden" name="sort" defaultValue={currentSortColumn || ""} />
        <input type="hidden" name="order" defaultValue={currentSortDirection || ""} />

        <div className="mb-6 p-4 border rounded-lg bg-card">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2 lg:col-span-1">
              <label htmlFor="globalSearch" className="block text-sm font-medium text-muted-foreground mb-1">Search by Name</label>
              <Input
                id="globalSearch"
                name="q"
                type="text"
                placeholder="Enter quiz name..."
                defaultValue={currentGlobalSearch}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="difficultyFilter" className="block text-sm font-medium text-muted-foreground mb-1">Difficulty</label>
              <Select name="difficulty" defaultValue={currentDifficultyFilter} onValueChange={handleFilterChange}>
                <SelectTrigger id="difficultyFilter" className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="visibilityFilter" className="block text-sm font-medium text-muted-foreground mb-1">Visibility</label>
              <Select name="visibility" defaultValue={currentVisibilityFilter} onValueChange={handleFilterChange}>
                <SelectTrigger id="visibilityFilter" className="w-full">
                  <SelectValue defaultValue={currentVisibilityFilter} placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visibilities</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="button" onClick={handleClearFilters} variant="outline" className="self-end">
              <XCircle className="mr-2 h-4 w-4" /> Clear Filters
            </Button>
          </div>
        </div>
      </form>

      {!quizzes.data.length && quizzes.count === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-10">
          You haven't created any quizzes yet.
        </p>
      ) : !quizzes.data.length && quizzes.count > 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-10">
          No quizzes found for the current filters/page.
        </p>
      ) : (
        <>
          <div className="px-4 border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("title")}
                  >
                    Name{renderSortIcon("title")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("difficulty")}
                  >
                    Difficulty{renderSortIcon("difficulty")}
                  </TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("createdAt")}
                  >
                    Created{renderSortIcon("createdAt")}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.data.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell style={{ viewTransitionName: `record-name-${quiz.id}` }}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="truncate max-w-xs">
                              {quiz.title}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{quiz.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell style={{ viewTransitionName: `record-difficulty-${quiz.id}` }}>
                      <Badge
                        variant={getDifficultyBadgeVariant(quiz.difficulty)}
                        className="capitalize w-18"
                      >
                        {quiz.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ viewTransitionName: `record-visibility-${quiz.id}` }}>
                      <Badge variant={quiz.public ? "default" : "outline"} className="w-18">
                        {quiz.public ? "Public" : "Private"}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ viewTransitionName: `record-createdAt-${quiz.id}` }}>
                      {quiz.createdAt &&
                        new Date(quiz.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex space-x-2 justify-end">
                        <form
                          method="POST"
                          onSubmit={(e) =>
                            handleDelete(e, quiz.id, quiz.title)
                          }
                          className="inline-block"
                        >
                          <Button type="submit" variant="destructive" size="sm">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-6">
            <Pagination
              currentPage={actualCurrentPage}
              url={currentUrl}
              lastVisiblePage={lastVisiblePage}
            />
          </div>
        </>
      )}
    </div>
  );
}

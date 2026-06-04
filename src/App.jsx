import { useState, useEffect } from "react";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

function UserProfile({ userData }) {
  return (
    <div className="flex gap-6 items-start border rounded-lg p-6 mt-6">
      <img
        src={userData.avatar_url}
        alt={userData.login}
        className="h-32 w-32 rounded-full"
      />

      <div className="space-y-2">
        <a
          href={userData.html_url}
          target="_blank"
          rel="noreferrer"
          className="text-3xl font-bold hover:underline"
        >
          {userData.login}
        </a>

        <p>{userData.bio || "No bio available."}</p>
        <p className="text-sm text-muted-foreground">
          Joined{" "}
          {new Date(userData.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <div className="flex gap-6">
          <p>Followers: {userData.followers.toLocaleString()}</p>
          <p>Following: {userData.following.toLocaleString()}</p>
          <p>Repos: {userData.public_repos.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function RepositoryList({
  repos,
  totalRepos,
  sortBy,
  setSortBy,
  page,
  setPage,
  totalPages,
  repoSearch,
  setRepoSearch,
  userData,
  topRepo,
}) {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          Showing latest {totalRepos} of{" "}
          {userData.public_repos.toLocaleString()} repositories
        </p>

        <Input
          value={repoSearch}
          onChange={(e) => setRepoSearch(e.target.value)}
          placeholder="Search repositories..."
          className="w-64"
        />

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort repositories" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="updated">Recently Updated</SelectItem>

            <SelectItem value="stars">Most Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-96 rounded-md border p-4">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors my-2"
          >
            <div className="flex justify-between items-center">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold hover:underline"
              >
                {repo.name}
              </a>

              <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                <span>Updated {formatDate(repo.updated_at)}</span>

                <span>⭐ {repo.stargazers_count.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {repo.language ?? "Unknown"}
            </p>

            {repo.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {repo.description}
              </p>
            )}
          </div>
        ))}

        {repos.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No repositories matched your search.
          </div>
        )}
      </ScrollArea>

      <div className="flex justify-between items-center mt-4">
        <Button
          variant="ghost"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="ghost"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function UserSkeleton() {
  return (
    <div className="mt-6 space-y-6">
      <div className="flex gap-6">
        <Skeleton className="h-32 w-32 rounded-full" />

        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <span className="text-2xl">{theme === "dark" ? "☀️" : "🌙"}</span>
    </Button>
  );
}

function App() {
  const [text, setText] = useState("");
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("updated");
  const [page, setPage] = useState(1);
  const [repoSearch, setRepoSearch] = useState("");

  const reposPerPage = 20;

  const startIndex = (page - 1) * reposPerPage;
  const endIndex = startIndex + reposPerPage;

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(repoSearch.toLowerCase()),
  );

  const sortedRepos = [...filteredRepos].sort((a, b) => {
    if (sortBy === "stars") {
      return b.stargazers_count - a.stargazers_count;
    }

    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  const currentPageRepos = sortedRepos.slice(startIndex, endIndex);

  const totalPages = Math.max(1, Math.ceil(sortedRepos.length / reposPerPage));

  const topRepo = [...repos].sort(
    (a, b) => b.stargazers_count - a.stargazers_count,
  )[0];

  async function getUserData(user) {
    setError(null);
    setUserData(null);
    setRepos([]);

    const response = await fetch(`https://api.github.com/users/${user}`);

    if (!response.ok) {
      throw new Error(`Couldn't find a GitHub user named "${user}".`);
    }

    const data = await response.json();

    setUserData(data);

    const reposResponse = await fetch(
      `${data.repos_url}?sort=updated&per_page=100`,
    );

    const reposData = await reposResponse.json();

    setRepos(reposData);
    setRepoSearch("");
    setPage(1);
  }

  useEffect(() => {
    if (!text.trim()) {
      setUserData(null);
      setRepos([]);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        await getUserData(text);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    setPage(1);
  }, [repoSearch]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-6xl mx-auto p-8">
        <Field>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <FaGithub className="h-10 w-10" />

              <FieldLabel className="text-2xl font-bold">
                Search GitHub Profile
              </FieldLabel>
            </div>

            <ThemeToggle />
          </div>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter username"
            aria-invalid={!!error}
          />
          {error && <FieldError>{error}</FieldError>}
          {!loading && !userData && !error && (
            <div className="mt-16 text-center text-muted-foreground">
              <p>Search for any public GitHub profile.</p>
            </div>
          )}
        </Field>

        <div className="mt-6">
          {loading ? (
            <UserSkeleton />
          ) : userData ? (
            <>
              <UserProfile userData={userData} />
              <RepositoryList
                repos={currentPageRepos}
                totalRepos={repos.length}
                sortBy={sortBy}
                setSortBy={setSortBy}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                repoSearch={repoSearch}
                setRepoSearch={setRepoSearch}
                userData={userData}
                topRepo={topRepo}
              />
            </>
          ) : null}
        </div>
      </main>

      <footer className="border-t pt-5 pb-5 text-center text-sm text-muted-foreground">
        <p>GitHub User Search | Created by John</p>

        <div className="flex justify-center gap-6 mt-2">
          <a
            href="https://github.com/ChanggU27"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <FaGithub className="h-4 w-4" />
            GitHub
          </a>

          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <FaLinkedin className="h-4 w-4" />
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;

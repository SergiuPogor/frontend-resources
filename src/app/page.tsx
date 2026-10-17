import App from "./components/App";

const REPO = "codesandtags/frontend-resources";

// Server-side + cached: avoids the 60 req/h/IP unauthenticated GitHub limit
// every visitor used to hit from the browser.
export const revalidate = 3600;

async function getGithubStars(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate },
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "stargazers_count" in data &&
      typeof data.stargazers_count === "number"
    ) {
      return data.stargazers_count;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const githubStars = await getGithubStars();
  return <App githubStars={githubStars} repo={REPO} />;
}

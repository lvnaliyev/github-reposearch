import React, { useRef, useState, useEffect } from "react";
import {
  Pagination,
  CircularProgress,
  Box,
  TextField,
  List,
  ListItem,
} from "@mui/material";

interface RepoTypes {
  incomplete_results: boolean;
  total_count: number;
  items: Items[];
}

interface Items {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
}

const App = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [repos, setRepos] = useState<RepoTypes>({
    incomplete_results: false,
    total_count: 0,
    items: [],
  });

  const [page, setPage] = useState(1);
  const [reposPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const handlePagination = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    console.log(page);
  };

  const throttle = useRef(false);

  useEffect(() => {
    handleSearch();
  }, [page]);

  const handleSearch = () => {
    if (throttle.current) {
      return;
    }
    if (!inputRef.current?.value.trim()) {
      setRepos({
        incomplete_results: false,
        total_count: 0,
        items: [],
      });
      return;
    }
    throttle.current = true;
    setTimeout(() => {
      throttle.current = false;
      setIsLoading(true);
      fetch(
        `https://api.github.com/search/repositories?q=${inputRef.current?.value}&page=${page}&per_page=${reposPerPage}`,
        {
          method: "GET",
          headers: {
            Accept: "application/vnd.github+json",
          },
        }
      )
        .then(async (response) => {
          if (!response.ok) {
            console.log("err");
          } else {
            const data = await response.json();
            setRepos(data);
            console.log(data);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }, 600);
  };

  return (
    <Box sx={{ m: 2 }}>
      <TextField
        id="outlined-basic"
        label="Search for Github repositories"
        variant="outlined"
        inputRef={inputRef}
        onChange={handleSearch}
      />

      {isLoading && inputRef.current?.value ? (
        <Box sx={{ display: "flex", m: 6 }}>
          <CircularProgress />
        </Box>
      ) : inputRef.current?.value && repos.items.length > 0 ? (
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        >
          {" "}
          {repos.items.map((repo: Items) => {
            return <ListItem key={repo.id}>{repo.name}</ListItem>;
          })}
        </List>
      ) : (
        <p>No repositories </p>
      )}

      <Pagination
        count={10}
        color="primary"
        onChange={handlePagination}
        page={page}
      />
    </Box>
  );
};

export default App;

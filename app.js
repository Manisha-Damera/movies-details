const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const express = require("express");
const app = express();

app.use(express.json());

let db = null;
const initializeDbANdServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Error is ${e.message}`);
    process.exit(1);
  }
};

initializeDbANdServer();

const convertSnakeCaseToCamelCase = (mvi) => {
  return {
    movieId: mvi.movie_id,
    directorId: mvi.director_id,
    movieName: mvi.movie_name,
    leadActor: mvi.lead_actor,
  };
};

//API 1

app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
        SELECT movie_name
        FROM movie
    `;

  const initialMovieNamesArray = await db.all(getMovieNamesQuery);

  const movieNamesArray = initialMovieNamesArray.map((eachMovie) => ({
    movieName: eachMovie.movie_name,
  }));

  response.send(movieNamesArray);
});

//API 2

app.post("/movies/", async (request, response) => {
  const newMovieDetails = request.body;
  const { directorId, movieName, leadActor } = newMovieDetails;

  const postNewMovieQuery = `
    INSERT INTO 
        movie
    (director_id,movie_name, lead_actor)
    VALUES
        (${directorId}, '${movieName}', '${leadActor}');
  `;

  await db.run(postNewMovieQuery);

  response.send("Movie Successfully Added");
});

module.exports = app;

// API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieDetailsQuery = `
        SELECT *
        FROM movie
        WHERE movie_id=${movieId};
    `;

  const initialMovieDetails = await db.get(getMovieDetailsQuery);
  const movieDetailsArray = convertSnakeCaseToCamelCase(initialMovieDetails);

  response.send(movieDetailsArray);
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const putMovieQuery = `
    UPDATE movie
    SET
        director_id = ${directorId}, movie_name = '${movieName}', lead_actor ='${leadActor}'
    WHERE 
        movie_id = ${movieId};
  `;

  await db.run(putMovieQuery);

  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `
            DELETE FROM 
                movie
            WHERE movie_id = ${movieId};
    `;

  await db.run(deleteMovieQuery);

  response.send("Movie Removed");
});

//API 6

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT *
        FROM director;
    `;

  const initialDirectorsArray = await db.all(getDirectorsQuery);

  const directorsArray = initialDirectorsArray.map((eachMovie) => ({
    directorId: eachMovie.director_id,
    directorName: eachMovie.director_name,
  }));

  response.send(directorsArray);
});

//API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getDirectorMoviesQuery = `
        SELECT *
        FROM movie
        WHERE director_id = ${directorId};
    `;

  const initialMovieArray = await db.all(getDirectorMoviesQuery);

  const movieArray = initialMovieArray.map((eachMovie) => ({
    movieName: eachMovie.movie_name,
  }));

  response.send(movieArray);
});

module.exports = app;

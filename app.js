const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_id,
    leadActor: dbObject.lead_actor,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT * FROM movie;`;

  const movieArray = await db.all(getMovieQuery);
  response.send(
    movieArray.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

//API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postUpdateQuery = `
    INSERT INTO
    movie(director_id,movie_name,lead_actor)
    VALUES('${directorId}','${movieName}','${leadActor}');`;
  const movieData = await db.run(postUpdateQuery);
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieIdQuery = `
    SELECT * FROM movie
    WHERE 
    movie_id=${movieId};`;
  const movieArrayData = await db.get(getMovieIdQuery);
  response.send(convertDbObjectToResponseObject(movieArrayData));
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateDetailsMovie = `
    UPDATE
    movie
    SET
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE
    movie_id=${movieId};`;
  const movieUpdate = await db.run(updateDetailsMovie);
  const latestMovieId = movieUpdate.lastID;
  response.send("Movies Details Updated");
});

//API6
app.get("/directors/", async (request, response) => {
  //const { directorId } = request.params;
  const getDirectorQuery = `
    SELECT * FROM director;`;

  const directorArray = await db.all(getDirectorQuery);
  response.send(convertDbObjectToResponseObject(directorArray));
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovies = `
    SELECT movie_name FROM movie
    WHERE
    director_id=${directorId};`;

  const directorArrays = await db.get(getDirectorMovies);
  response.send(convertDbObjectToResponseObject(directorArrays));
});
//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM movie
    WHERE
    movie_id=${movieId};`;
  await db.run(deletePlayerQuery);
  response.send("Movie Removed");
});

module.exports = app;

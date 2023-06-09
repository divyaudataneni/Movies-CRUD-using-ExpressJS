const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

module.exports = app;

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbobject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//GET API 1

app.get("/movies/", async (request, response) => {
  const getMovieslist = `
    SELECT movie_name
    FROM movie;`;
  const movieName = await db.all(getMovieslist);
  response.send(movieName.map((each) => ({ movieName: each.movie_name })));
});

//POST API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO 
    movie (director_id,movie_name,lead_actor)
    VALUES ('${directorId}','${movieName}','${leadActor}');
    `;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//GET API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getmovieQuery = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId};`;
  const movieName = await db.get(getmovieQuery);
  response.send(convertDbObjectToResponseObject(movieName));
});

//PUT API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE movie
    SET  
   
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
         movie_id = ${movieId};
    `;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};
    `;

  const dbresponse = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET DIRECTORS API 6

app.get("/directors/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `
    SELECT *
    FROM director;
    `;

  const directorArray = await db.all(getDirectorQuery);
  response.send(directorArray.map((each) => convertDbobject(each)));
});

//GET DIRECTOR ID API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectormovieQuery = `
    SELECT movie.movie_name
    FROM movie INNER JOIN director ON movie.director_id = director.director_id
    WHERE director_id = ${directorId};
    `;

  const directedMovie = await db.all(getDirectormovieQuery);
  reponse.send(directedMovie.map((each) => ({ movieName: each.movie_name })));
});

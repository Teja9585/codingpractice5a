const express = require('express')
const {open} = require('sqlite') 
const sqlite3 = require('sqlite3')
const path = require('path')

const dbPath = path.join(__dirname,'moviesData.db')
const app = express();
app.use(express.json())
let db = null;
const initializeDbAndServer = async() => {
try {
   db =  await  open({
    filename:dbPath,
    driver:sqlite3.Database,
});
      
      app.listen(3000, () => 
          console.log('Server is Running at http://localhost:3000/')
      );
}
    catch (e) {
        console.log(`Db Error :${e.message}`)
        process.exit(1)

    }

};
initializeDbAndServer()

const convertMovieDbObjectToResponseObject = (dbObject) => {
    return {
         
    movieId: dbObject.movie_id,	
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor : dbObject.lead_actor,
    };

}
const convertDirectorDbObjectToResponseObject = (dbObject) => {
 return {
      directorId : dbObject.director_id,
      directorName : dbObject.director_name,
 };
};
// API-1 Returns a list of all movie names in the movie table:
app.get('/movies/', async(request,response) => {
    const getMoviesQuery = ` 
    SELECT movie_name 
    FROM 
    movie;`;

    const moviesArray = await db.all(getMoviesQuery);
    response.send(
        moviesArray.map((eachMovie)=>({
        movieName: eachMovie.movie_name
    })));
})
// API -2 Creates a new movie in the movie table. `movie_id` is auto-incremented 

app.post('/movies/', async(request, response) => {
    const {directorId,movieName,leadActor} = request.body;
    const postMovieQuery = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES 
    (${directorId}, '${movieName}', '${leadActor}');`;
    await db.run(postMovieQuery)
    response.send('Movie Successfully Added')
});


// API -3 Returns a movie based on the movie ID
app.get("/movies/:movieId/", async(request, response) => {
    const {movieId} = request.params 
    const getMovieQuery = `SELECT * FROM movie 
    WHERE movie_id = ${movieId};`;
    const movie = await db.get(getMovieQuery)
    response.send(convertMovieDbObjectToResponseObject(movie))
})

// API-4 Updates the details of a movie in the movie table based on the movie ID
app.put("/movies/:movieId/",async(request, response) => {
    const {directorId,movieName,leadActor} = request.body 
    const {movieId} =  request.params
    const updateMovieQuery = `
    UPDATE movie
    SET 
    director_id = ${directorId},
    movie_name = ${movieName},
    lead_actor = ${leadActor}
    WHERE 
    movie_id = ${movieId};
    `; 
    await db.run(updateMovieQuery) 
    response.send("Movie Details Updated")

    
})
// API-5 Deletes a movie from the movie table based on the movie ID 
app.delete("/movies/:movieId/",async(request,response) =>{
    const {movieId} = request.params
    const deleteMovieQuery = `
    DELETE FROM movie 
    WHERE movie_id = ${movieId};
    `;
    await db.run(deleteMovieQuery) 
    response.send("Movie Removed")

})
//API-6 Returns a list of all directors in the director table

app.get('/directors/',async(request,response)=> {
    const getDirectorsQuery = `
    SELECT * FROM director;
    `;
const directorsArray = await db.all(getDirectorsQuery)
response.send(
    directorsArray.map((eachDirector)=>
    convertDirectorDbObjectToResponseObject(eachDirector)))

});
//API-7 Returns a list of all movie names directed by a specific directors
app.get('/directors/:directorId/movies/',async(request,response)=>{
    const {directorId} = request.params;

    const getDirectorMoviesQuery = 
    `SELECT movie_name FROM movie 
    WHERE director_id = ${directorId};`;
    const moviesArray = await db.get(getDirectorMoviesQuery)
    response.send(moviesArray.map((eachMovie)=>({movieName:eachMovie.movie_name})))


});
module.exports = app;
const imdb = require("imdb-api");
const csvToJson = require("convert-csv-to-json");
const fs = require("fs");

const fileInputName = "./data/joined_data.csv";

(async () => {
  const data = csvToJson.fieldDelimiter("\\").getJsonFromCsv(fileInputName);
  let count = 0;
  for (csvTitle of data) {
    try {
      count++;
      if (
        csvTitle["series or movie"] === "TV Show" ||
        csvTitle["type"] === "TV Show"
      )
        continue;

      // const date = csvTitle.releasedate ? csvTitle.releasedate : "";
      // const search = `${csvTitle.csvTitle} ${
      //   date !== "" ? new Date(date).getFullYear() : ""
      // }`;

      const result = await imdb.get(
        { name: csvTitle.title },
        { apiKey: "45046bf9", timeout: 30000 }
      );

      if (result.type === "series") continue;

      const {
        title,
        imdburl,
        rated,
        genres,
        languages,
        type,
        director,
        actors,
        rating,
        boxoffice,
        released,
        votes,
        runtime,
      } = result;

      const movie = {
        title,
        imdburl,
        rated,
        genres,
        languages,
        type,
        director,
        actors,
        rating,
        boxoffice,
        released,
        votes,
        runtime,
      };

      const row = Object.values(movie).join("\\");

      fs.appendFileSync("data/imdb_api_movies.csv", row + "\n");

      console.log(count);
    } catch (error) {
      console.log(error);
    }
  }

  // const result = await imdb.get(
  //   { name: "the walking dead" },
  //   { apiKey: "246e4ec2", timeout: 30000 }
  // );

  // console.log(result);
})();

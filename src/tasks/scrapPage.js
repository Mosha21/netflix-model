const fs = require("fs");

const scrapPage = async ({ page, data: url }) => {
  console.log(url);
  try {
    await page.goto(url);

    const ratings = await page.$$eval("div.sc-94726ce4-3>ul>li", (result) =>
      result.map((elem) => elem.innerText)
    );
    const rating = ratings[0] === "TV Series" ? ratings[2] : ratings[1];

    if (ratings[0] === "TV Series") return;

    const type = "Movie";

    const title = await page.$eval(
      "h1.sc-b73cd867-0",
      (elem) => elem.innerText
    );

    const genre = await page.$$eval(
      "div.ipc-chip-list>a.sc-16ede01-3",
      (result) => result.map((elem) => elem.innerText).join(",")
    );

    const languages = await page.$$eval(
      "li[data-testid='title-details-languages']>div>ul>li>a",
      (result) => result.map((elem) => elem.innerText).join(",")
    );

    const director = await page.$$eval(
      "div.ipc-metadata-list-item__content-container > ul > li > a",
      (result) => result.map((elem) => elem.innerText)[0]
    );

    const cast = await page.$$eval(
      "a[data-testid='title-cast-item__actor']",
      (result) => result.map((elem) => elem.innerText).join(",")
    );

    const score = await page.$$eval("span.sc-7ab21ed2-1", (result) =>
      parseFloat(result.map((elem) => elem.innerText)[0])
    );

    const boxOffice = await page.$$eval(
      "li.ipc-metadata-list__item",
      (result) => {
        let revenue = result
          .map((elem) => elem.textContent)
          .filter((elem) => elem.includes("Gross worldwide"))[0];

        if (revenue)
          revenue = parseInt(revenue.split("$")[1].replaceAll(",", ""));

        return revenue;
      }
    );

    const releaseDate = await page.$$eval(
      `div.ipc-metadata-list-item__content-container > ul.ipc-inline-list > li > a.ipc-metadata-list-item__list-content-item`,
      (result) => {
        let date = result
          .map((elem) => elem.textContent)
          .filter((elem) => elem.includes("(United States)"))[0];

        if (date) date = date.split("(")[0].trimRight();

        return date;
      }
    );

    const votes = await page.$eval(
      "div.sc-7ab21ed2-3",
      (result) => result.innerText
    );

    const duration = await page.$$eval(
      "div.sc-94726ce4-3 > ul.ipc-inline-list > li.ipc-inline-list__item",
      (result) => result.map((elem) => elem.innerText)[2]
    );

    const movie = {
      title,
      url,
      rating,
      genre,
      languages,
      type,
      director,
      cast,
      score,
      boxOffice,
      releaseDate,
      votes,
      duration,
    };

    const row = Object.values(movie).join("\\");

    fs.appendFileSync("data/imdb_movies.csv", row + "\n");

    return movie;
  } catch (error) {
    console.log(error);
  }
};

module.exports = scrapPage;

const { Cluster } = require("puppeteer-cluster");
const csvToJson = require("convert-csv-to-json");
const scrapPage = require("./tasks/scrapPage");

(async () => {
  let fileInputName = "./data/joined_data.csv";

  const data = csvToJson.fieldDelimiter("\\").getJsonFromCsv(fileInputName);

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 10,
  });

  await cluster.task(async ({ page, data: url }) => {
    try {
      await page.goto(url);
      const link = await page.$$eval(
        "table.findList>tbody>tr.findResult>td.result_text>a",
        (result) => result.map((value) => value.href)
      );

      cluster.queue(link[0], scrapPage);
    } catch (error) {
      console.log(error);
    }
  });

  let counter = 0;
  for (title of data) {
    counter++;
    const date = title.releasedate ? title.releasedate : "";
    if (!title.imdblink) {
      cluster.queue(
        `https://www.imdb.com/find?q=${title.title} ${
          date !== "" ? new Date(date).getFullYear() : ""
        }`
      );
    } else {
      cluster.queue(title.imdblink, scrapPage);
    }

    if (counter % 3 === 0) break;
  }

  await cluster.idle();
  await cluster.close();
})();

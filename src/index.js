const { Cluster } = require("puppeteer-cluster");
const csvToJson = require("convert-csv-to-json");
const scrapPage = require("./tasks/scrapPage");

let counter = 0;

(async () => {
  process.env.LANG = "en-US";
  let fileInputName = "./data/joined_data.csv";

  const data = csvToJson.fieldDelimiter("\\").getJsonFromCsv(fileInputName);

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 1,
    puppeteerOptions: { headless: false, timeout: 60000 },
  });

  await cluster.task(async ({ page, data: url }) => {
    counter++;

    try {
      await page.goto(url);
      const link = await page.$$eval(
        "table.findList>tbody>tr.findResult>td.result_text>a",
        (result) => result.map((value) => value.href)
      );

      console.log("------------------------------------------------");
      console.log(counter);
    } catch (error) {
      console.log("ERROR");
      console.log(error);
    }
  });

  for (title of data) {
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
  }

  await cluster.idle();
  await cluster.close();
})();
